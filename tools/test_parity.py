"""Sjekker at ONNX-modellen svarer likt som PyTorch-modellen.

    python tools/test_parity.py --modell speciesnet --bilder bilder/

Krav for godkjent: samme topp-1 paa hvert bilde, og maks 1e-3 avvik mellom
sannsynlighetene. Kvantisering flytter alltid litt paa tallene, saa for int8
loser vi kravet til topp-1 pluss maks 0.05 avvik - da fanger vi ekte
eksportfeil uten aa felle modellen for normal kvantiseringsstoy.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys

import numpy as np
import onnxruntime as ort

import felles

BILDETYPER = {".jpg", ".jpeg", ".png", ".webp"}


def last_torch(modellnavn: str):
    if modellnavn == "speciesnet":
        from speciesnet.classifier import SpeciesNetClassifier

        import export_speciesnet as eks

        klass = SpeciesNetClassifier(eks.MODELL_ID, device="cpu")
        return klass.model, eks.forbehandle
    if modellnavn == "inat21":
        import birder

        import export_inat21 as eks

        net, model_info = birder.load_pretrained_model(eks.MODELL, inference=True)
        storrelse = birder.get_size_from_signature(model_info.signature)
        h, w = (storrelse if isinstance(storrelse, (list, tuple)) else (storrelse, storrelse))[:2]
        stats = model_info.rgb_stats
        mean = np.array(list(stats["mean"]), dtype=np.float32)
        std = np.array(list(stats["std"]), dtype=np.float32)

        from PIL import Image

        def forbehandle(sti: pathlib.Path) -> np.ndarray:
            bilde = Image.open(sti).convert("RGB")
            side = min(bilde.size)
            v = (bilde.width - side) // 2
            t = (bilde.height - side) // 2
            bilde = bilde.crop((v, t, v + side, t + side)).resize((w, h), Image.BILINEAR)
            arr = np.asarray(bilde, dtype=np.float32) / 255.0
            return ((arr - mean) / std).transpose(2, 0, 1)[None, ...]

        return net, forbehandle
    raise SystemExit(f"ukjent modell: {modellnavn}")


def main() -> None:
    import torch

    ap = argparse.ArgumentParser()
    ap.add_argument("--modell", choices=["speciesnet", "inat21"], required=True)
    ap.add_argument("--bilder", type=pathlib.Path, required=True)
    ap.add_argument("--antall", type=int, default=20)
    args = ap.parse_args()

    onnx_sti = felles.UT / f"{args.modell}.int8.onnx"
    meta_sti = felles.UT / f"{args.modell}.meta.json"
    if not onnx_sti.exists():
        raise SystemExit(f"fant ikke {onnx_sti} - kjor eksportskriptet forst")
    meta = json.loads(meta_sti.read_text(encoding="utf-8"))
    labels = json.loads((felles.UT / f"{args.modell}.labels.json").read_text(encoding="utf-8"))
    grense = 0.05 if meta["presisjon"] == "int8" else 1e-3

    net, forbehandle = last_torch(args.modell)
    net.eval()
    okt = ort.InferenceSession(str(onnx_sti), providers=["CPUExecutionProvider"])
    innavn = okt.get_inputs()[0].name

    filer = [p for p in sorted(args.bilder.rglob("*")) if p.suffix.lower() in BILDETYPER][: args.antall]
    if not filer:
        raise SystemExit(f"fant ingen bilder i {args.bilder}")

    feil = 0
    for sti in filer:
        x = forbehandle(sti)
        with torch.no_grad():
            torch_logits = net(torch.from_numpy(x)).numpy()[0]
        onnx_logits = okt.run(None, {innavn: x})[0][0]

        t_topp = felles.topp5(torch_logits, labels)
        o_topp = felles.topp5(onnx_logits, labels)
        samme = str(t_topp[0][0]) == str(o_topp[0][0])
        avvik = abs(t_topp[0][1] - o_topp[0][1])

        if not samme or avvik > grense:
            feil += 1
            print(f"AVVIK {sti.name}: torch={t_topp[0]}  onnx={o_topp[0]}")
        else:
            print(f"ok    {sti.name}: {t_topp[0][0]}  ({t_topp[0][1]:.3f}, avvik {avvik:.4f})")

    print(f"\n{len(filer) - feil}/{len(filer)} bilder innenfor grensen {grense}")
    sys.exit(1 if feil else 0)


if __name__ == "__main__":
    main()
