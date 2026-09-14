"""Delte hjelpefunksjoner for de to eksportskriptene.

Kjores lokalt, aldri av spillet. Skriver tre filer per modell:
    <navn>.int8.onnx     kvantisert modell
    <navn>.meta.json     inndataform, normalisering, layout
    <navn>.labels.json   klasseliste i modellens egen rekkefolge
"""

from __future__ import annotations

import json
import pathlib
import shutil

import numpy as np
import onnx
import torch

UT = pathlib.Path(__file__).resolve().parent.parent / "modeller"


def eksporter_onnx(modell, eksempel_input, sti: pathlib.Path, opset: int = 17) -> None:
    """Skriver en fp32 ONNX-fil. Fast batch 1 - nettleseren kjorer ett bilde."""
    modell.eval()
    sti.parent.mkdir(parents=True, exist_ok=True)
    with torch.no_grad():
        torch.onnx.export(
            modell,
            eksempel_input,
            str(sti),
            input_names=["bilde"],
            output_names=["logits"],
            opset_version=opset,
            do_constant_folding=True,
            dynamo=False,
        )
    onnx.checker.check_model(onnx.load(str(sti)))
    print(f"  fp32 ONNX: {sti.name}  {sti.stat().st_size / 1e6:.1f} MB")


class Kalibrering:
    """Leser bilder fra en mappe og mater dem inn som kalibreringsdata.

    Statisk kvantisering krever ekte bilder. Uten dem blir int8-vektene
    skalert paa gjetning og modellen taper mye mer enn de ~1 % som er
    normalt. Derfor krever skriptene en kalibreringsmappe for int8.
    """

    def __init__(self, mappe: pathlib.Path, forbehandle, inputnavn: str, maks: int = 64):
        from onnxruntime.quantization import CalibrationDataReader  # noqa: F401

        filer = [
            p
            for p in sorted(mappe.rglob("*"))
            if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
        ][:maks]
        if not filer:
            raise SystemExit(f"fant ingen bilder i {mappe}")
        print(f"  kalibrerer paa {len(filer)} bilder")
        self._data = ({inputnavn: forbehandle(p)} for p in filer)

    def get_next(self):
        return next(self._data, None)

    def rewind(self):
        pass


def kvantiser_int8(fp32: pathlib.Path, ut: pathlib.Path, leser) -> None:
    from onnxruntime.quantization import QuantFormat, QuantType, quantize_static
    from onnxruntime.quantization.shape_inference import quant_pre_process

    forbehandlet = fp32.with_suffix(".prep.onnx")
    quant_pre_process(str(fp32), str(forbehandlet), skip_symbolic_shape=True)
    quantize_static(
        str(forbehandlet),
        str(ut),
        leser,
        quant_format=QuantFormat.QDQ,
        activation_type=QuantType.QUInt8,
        weight_type=QuantType.QInt8,
        per_channel=True,
    )
    forbehandlet.unlink(missing_ok=True)
    print(f"  int8 ONNX: {ut.name}  {ut.stat().st_size / 1e6:.1f} MB")


def konverter_fp16(fp32: pathlib.Path, ut: pathlib.Path) -> None:
    """Halv presisjon. Dobbelt saa stor som int8, men krever ingen bilder."""
    from onnxconverter_common import float16

    modell = float16.convert_float_to_float16(
        onnx.load(str(fp32)), keep_io_types=True, disable_shape_infer=True
    )
    onnx.save(modell, str(ut))
    print(f"  fp16 ONNX: {ut.name}  {ut.stat().st_size / 1e6:.1f} MB")


def skriv_meta(navn: str, meta: dict, labels: list) -> None:
    UT.mkdir(parents=True, exist_ok=True)
    (UT / f"{navn}.meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    (UT / f"{navn}.labels.json").write_text(
        json.dumps(labels, ensure_ascii=False), encoding="utf-8"
    )
    print(f"  meta + {len(labels)} labels skrevet")


def kopier_som(kilde: pathlib.Path, navn: str) -> pathlib.Path:
    """Gir modellen navnet klassifiser.js forventer: <navn>.int8.onnx."""
    maal = UT / f"{navn}.int8.onnx"
    if kilde.resolve() != maal.resolve():
        shutil.copy2(kilde, maal)
    return maal


def topp5(logits: np.ndarray, labels: list) -> list:
    p = np.exp(logits - logits.max())
    p /= p.sum()
    idx = np.argsort(p)[::-1][:5]
    return [(labels[i], float(p[i])) for i in idx]
