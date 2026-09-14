"""Shared helpers for the two export scripts.

Run locally, never by the game. Writes three files per model:
    <name>.int8.onnx     quantized model
    <name>.meta.json     input shape, normalization, layout
    <name>.labels.json   class list in the model's own order
"""

from __future__ import annotations

import json
import os
import pathlib
import shutil

import numpy as np
import onnx
import torch

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "models"

# birder caches its downloaded weights in MODELS_DIR, which defaults to
# "models" next to the working directory. That is where the exported species
# models live, so the cache is pushed into its own folder to keep the two
# apart. Must be set before birder is imported.
os.environ.setdefault("MODELS_DIR", str(ROOT / "birder-cache"))


def export_onnx(model, sample_input, path: pathlib.Path, opset: int = 17) -> None:
    """Writes an fp32 ONNX file. Fixed batch 1 - the browser runs one image."""
    model.eval()
    path.parent.mkdir(parents=True, exist_ok=True)
    with torch.no_grad():
        torch.onnx.export(
            model,
            sample_input,
            str(path),
            input_names=["image"],
            output_names=["logits"],
            opset_version=opset,
            do_constant_folding=True,
            dynamo=False,
        )
    onnx.checker.check_model(onnx.load(str(path)))
    print(f"  fp32 ONNX: {path.name}  {path.stat().st_size / 1e6:.1f} MB")


class Calibration:
    """Reads images from a folder and feeds them in as calibration data.

    Static quantization needs real images. Without them the int8 weights are
    scaled on guesswork and the model loses far more than the ~1 % that is
    normal. That is why the scripts require a calibration folder for int8.
    """

    def __init__(self, folder: pathlib.Path, preprocess, input_name: str, limit: int = 64):
        self.files = [
            p
            for p in sorted(folder.rglob("*"))
            if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
        ][:limit]
        if not self.files:
            raise SystemExit(f"found no images in {folder}")
        print(f"  calibrating on {len(self.files)} images")
        self.preprocess = preprocess
        self.input_name = input_name
        self.rewind()

    def get_next(self):
        return next(self._data, None)

    def rewind(self):
        """Percentile and Entropy read the data set twice. Without a real
        rewind the second pass would get zero images, and the scales would be
        set on nothing."""
        self._data = ({self.input_name: self.preprocess(p)} for p in self.files)


def quantize_int8(fp32: pathlib.Path, out: pathlib.Path, reader, method: str = "percentile") -> None:
    """Static int8 quantization.

    The calibration method matters a lot. MinMax sets the scale from the
    largest value it saw, so a single outlier stretches the whole range and
    squeezes all the ordinary values together. Percentile clips the tail and
    is usually more accurate on CNNs.
    """
    from onnxruntime.quantization import CalibrationMethod, QuantFormat, QuantType, quantize_static
    from onnxruntime.quantization.shape_inference import quant_pre_process

    methods = {
        "minmax": (CalibrationMethod.MinMax, {}),
        "percentile": (CalibrationMethod.Percentile, {"CalibPercentile": 99.999}),
        "entropy": (CalibrationMethod.Entropy, {}),
    }
    if method not in methods:
        raise SystemExit(f"unknown calibration method: {method}")
    calib, extra = methods[method]
    print(f"  calibration method: {method}")

    prepared = fp32.with_suffix(".prep.onnx")
    quant_pre_process(str(fp32), str(prepared), skip_symbolic_shape=True)
    quantize_static(
        str(prepared),
        str(out),
        reader,
        quant_format=QuantFormat.QDQ,
        activation_type=QuantType.QUInt8,
        weight_type=QuantType.QInt8,
        per_channel=True,
        calibrate_method=calib,
        extra_options=extra,
    )
    prepared.unlink(missing_ok=True)
    print(f"  int8 ONNX: {out.name}  {out.stat().st_size / 1e6:.1f} MB")


def convert_fp16(fp32: pathlib.Path, out: pathlib.Path) -> None:
    """Half precision. Twice the size of int8, but it needs no images."""
    from onnxconverter_common import float16

    model = float16.convert_float_to_float16(
        onnx.load(str(fp32)), keep_io_types=True, disable_shape_infer=True
    )
    onnx.save(model, str(out))
    print(f"  fp16 ONNX: {out.name}  {out.stat().st_size / 1e6:.1f} MB")


def write_meta(name: str, meta: dict, labels: list) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / f"{name}.meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    (OUT / f"{name}.labels.json").write_text(
        json.dumps(labels, ensure_ascii=False), encoding="utf-8"
    )
    print(f"  meta + {len(labels)} labels written")


def copy_as(source: pathlib.Path, name: str) -> pathlib.Path:
    """Gives the model the name classify.js expects: <name>.int8.onnx."""
    target = OUT / f"{name}.onnx"
    if source.resolve() != target.resolve():
        shutil.copy2(source, target)
    return target


def top5(logits: np.ndarray, labels: list) -> list:
    p = np.exp(logits - logits.max())
    p /= p.sum()
    idx = np.argsort(p)[::-1][:5]
    return [(labels[i], float(p[i])) for i in idx]
