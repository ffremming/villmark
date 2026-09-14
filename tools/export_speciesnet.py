"""Exports SpeciesNet 4.0.3b to ONNX for the browser.

    python tools/export_speciesnet.py --calibration images/

The model is the whole-image classifier, so MegaDetector is not needed.
The input is NHWC float32 in [0,1] at 480x480 - no mean/std normalization.
That is not an assumption: see SpeciesNetClassifier.batch_predict in
google/cameratrapai, which does `img.arr / 255` and feeds HWC straight in.

Note one deliberate difference: SpeciesNet crops the top and the bottom of the
image to avoid learning the timestamp banners of camera traps. A phone photo
has no such banners, and the crop would cut the subject. The game therefore
uses the centre square. The calibration below does the same, so the int8
scales fit the images the model actually gets.
"""

from __future__ import annotations

import argparse
import pathlib

import numpy as np
import torch
from PIL import Image

import common

NAME = "speciesnet"
SIZE = 480
MODEL_ID = "kaggle:google/speciesnet/pyTorch/v4.0.3b"


def preprocess(path: pathlib.Path) -> np.ndarray:
    """Centre square, scaled to 480x480, NHWC in [0,1]."""
    image = Image.open(path).convert("RGB")
    side = min(image.size)
    left = (image.width - side) // 2
    top = (image.height - side) // 2
    image = image.crop((left, top, left + side, top + side))
    image = image.resize((SIZE, SIZE), Image.BILINEAR)
    arr = np.asarray(image, dtype=np.float32) / 255.0
    return arr[None, ...]


class NHWCWrapper(torch.nn.Module):
    """The model already takes NHWC; we wrap it only to pin the signature."""

    def __init__(self, inner):
        super().__init__()
        self.inner = inner

    def forward(self, x):
        return self.inner(x)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--calibration",
        type=pathlib.Path,
        help="folder with 30-60 photos taken on a phone camera. Without it fp16 (~110 MB) is written instead of int8 (~55 MB).",
    )
    ap.add_argument("--model", default=MODEL_ID)
    ap.add_argument("--method", default="percentile", choices=["percentile", "minmax", "entropy"],
                    help="calibration method for int8")
    ap.add_argument("--max-images", type=int, default=48, dest="max_images",
                    help="how many calibration images are used. Percentile keeps a "
                         "histogram per activation in memory, so large input "
                         "shapes need fewer images.")
    args = ap.parse_args()

    from speciesnet.classifier import SpeciesNetClassifier

    print(f"loading {args.model} ...")
    classifier = SpeciesNetClassifier(args.model, device="cpu")
    labels = [classifier.labels[i] for i in range(len(classifier.labels))]
    print(f"  {len(labels)} labels")

    common.OUT.mkdir(parents=True, exist_ok=True)
    fp32 = common.OUT / f"{NAME}.fp32.onnx"
    sample = torch.zeros(1, SIZE, SIZE, 3, dtype=torch.float32)
    common.export_onnx(NHWCWrapper(classifier.model), sample, fp32)

    out = common.OUT / f"{NAME}.onnx"
    if args.calibration:
        reader = common.Calibration(args.calibration, preprocess, "image", args.max_images)
        common.quantize_int8(fp32, out, reader, args.method)
        precision = "int8"
    else:
        print("  no calibration images - writing fp16 instead")
        common.convert_fp16(fp32, out)
        precision = "fp16"

    common.write_meta(
        NAME,
        {
            "source": args.model,
            "precision": precision,
            "input": [SIZE, SIZE],
            "layout": "NHWC",
            "scale": 1 / 255,
            "mean": [0.0, 0.0, 0.0],
            "std": [1.0, 1.0, 1.0],
            "softmax": True,
            "labelFormat": "speciesnet",
        },
        labels,
    )
    print("done. Upload models/ to Hugging Face.")


if __name__ == "__main__":
    main()
