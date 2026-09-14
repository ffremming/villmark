"""Checks that the ONNX model answers the same as the PyTorch model.

    python tools/test_parity.py --model speciesnet --images images/

To pass: the same top-1 on every image, and a difference in probability that
stays within what the precision allows.

The limits follow what the number formats can actually do:
  fp32  1e-4   a clean export, only graph optimization differs
  fp16  1e-2   fp16 has about three digits, so 0.003 on a p=0.45 is normal
  int8  5e-2   quantization moves more, but top-1 must hold

A wrong top-1 is always a failure, whatever the precision. That is the one
that exposes a wrong layout, wrong mean/std or a wrong label order.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys

import numpy as np
import onnxruntime as ort

import common

IMAGE_TYPES = {".jpg", ".jpeg", ".png", ".webp"}


def name_of(label) -> str:
    """iNat21 labels are objects, SpeciesNet labels are strings."""
    return label["name"] if isinstance(label, dict) else str(label)


def load_torch(model_name: str):
    if model_name == "speciesnet":
        from speciesnet.classifier import SpeciesNetClassifier

        import export_speciesnet as exp

        classifier = SpeciesNetClassifier(exp.MODEL_ID, device="cpu")
        return classifier.model, exp.preprocess
    if model_name == "inat21":
        import birder

        import export_inat21 as exp

        net, model_info = birder.load_pretrained_model(exp.MODEL, inference=True)
        size = birder.get_size_from_signature(model_info.signature)
        h, w = (size if isinstance(size, (list, tuple)) else (size, size))[:2]
        stats = model_info.rgb_stats
        mean = np.array(list(stats["mean"]), dtype=np.float32)
        std = np.array(list(stats["std"]), dtype=np.float32)

        from PIL import Image

        def preprocess(path: pathlib.Path) -> np.ndarray:
            image = Image.open(path).convert("RGB")
            side = min(image.size)
            left = (image.width - side) // 2
            top = (image.height - side) // 2
            image = image.crop((left, top, left + side, top + side)).resize((w, h), Image.BILINEAR)
            arr = np.asarray(image, dtype=np.float32) / 255.0
            return ((arr - mean) / std).transpose(2, 0, 1)[None, ...]

        return net, preprocess
    raise SystemExit(f"unknown model: {model_name}")


def main() -> None:
    import torch

    ap = argparse.ArgumentParser()
    ap.add_argument("--model", choices=["speciesnet", "inat21"], required=True)
    ap.add_argument("--images", type=pathlib.Path, required=True)
    ap.add_argument("--count", type=int, default=20)
    args = ap.parse_args()

    onnx_path = common.OUT / f"{args.model}.onnx"
    meta_path = common.OUT / f"{args.model}.meta.json"
    if not onnx_path.exists():
        raise SystemExit(f"could not find {onnx_path} - run the export script first")
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    labels = json.loads((common.OUT / f"{args.model}.labels.json").read_text(encoding="utf-8"))
    limit = {"fp32": 1e-4, "fp16": 1e-2, "int8": 5e-2}.get(meta["precision"], 1e-2)

    net, preprocess = load_torch(args.model)
    net.eval()
    session = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
    input_name = session.get_inputs()[0].name

    files = [p for p in sorted(args.images.rglob("*")) if p.suffix.lower() in IMAGE_TYPES][: args.count]
    if not files:
        raise SystemExit(f"found no images in {args.images}")

    failures = 0
    for path in files:
        x = preprocess(path)
        with torch.no_grad():
            torch_logits = net(torch.from_numpy(x)).numpy()[0]
        onnx_logits = session.run(None, {input_name: x})[0][0]

        t_top = common.top5(torch_logits, labels)
        o_top = common.top5(onnx_logits, labels)
        t_name = name_of(t_top[0][0])
        o_name = name_of(o_top[0][0])
        same = t_name == o_name
        gap = abs(t_top[0][1] - o_top[0][1])

        if not same:
            failures += 1
            print(f"FAIL  {path.name}: torch said {t_name}, onnx said {o_name}")
        elif gap > limit:
            failures += 1
            print(f"DRIFT {path.name}: {t_name}  p {t_top[0][1]:.4f} against {o_top[0][1]:.4f}"
                  f"  (difference {gap:.4f} > {limit})")
        else:
            print(f"ok    {path.name}: {t_name}  ({t_top[0][1]:.3f}, difference {gap:.4f})")

    print(f"\n{len(files) - failures}/{len(files)} images within the limit "
          f"{limit} for {meta['precision']}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
