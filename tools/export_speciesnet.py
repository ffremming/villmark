"""Eksporterer SpeciesNet 4.0.3b til ONNX for nettleseren.

    python tools/export_speciesnet.py --kalibrering bilder/

Modellen er helbilde-klassifikatoren, saa MegaDetector trengs ikke.
Inndata er NHWC float32 i [0,1] ved 480x480 - ingen mean/std-normalisering.
Det er ikke en antagelse: se SpeciesNetClassifier.batch_predict i
google/cameratrapai, som gjor `img.arr / 255` og mater HWC rett inn.

Merk et bevisst avvik: SpeciesNet beskjaerer topp og bunn av bildet for aa
unngaa aa laere tidsstempelbanner fra viltkameraer. Et mobilbilde har ikke
slike banner, og beskjaeringen ville kuttet motivet. Spillet bruker derfor
senterkvadrat. Kalibreringen under gjor det samme, slik at int8-skalaene
passer bildene modellen faktisk faar.
"""

from __future__ import annotations

import argparse
import pathlib

import numpy as np
import torch
from PIL import Image

import felles

NAVN = "speciesnet"
STORRELSE = 480
MODELL_ID = "kaggle:google/speciesnet/pyTorch/v4.0.3b"


def forbehandle(sti: pathlib.Path) -> np.ndarray:
    """Senterkvadrat, skalert til 480x480, NHWC i [0,1]."""
    bilde = Image.open(sti).convert("RGB")
    side = min(bilde.size)
    venstre = (bilde.width - side) // 2
    topp = (bilde.height - side) // 2
    bilde = bilde.crop((venstre, topp, venstre + side, topp + side))
    bilde = bilde.resize((STORRELSE, STORRELSE), Image.BILINEAR)
    arr = np.asarray(bilde, dtype=np.float32) / 255.0
    return arr[None, ...]


class NHWCInnpakning(torch.nn.Module):
    """Modellen tar NHWC allerede, men vi pakker den for aa laase signaturen."""

    def __init__(self, indre):
        super().__init__()
        self.indre = indre

    def forward(self, x):
        return self.indre(x)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--kalibrering",
        type=pathlib.Path,
        help="mappe med 30-60 bilder tatt med mobilkamera. Uten denne skrives fp16 (~110 MB) i stedet for int8 (~55 MB).",
    )
    ap.add_argument("--modell", default=MODELL_ID)
    ap.add_argument("--metode", default="percentile", choices=["percentile", "minmax", "entropy"],
                    help="kalibreringsmetode for int8")
    ap.add_argument("--maks-bilder", type=int, default=48, dest="maks_bilder",
                    help="hvor mange kalibreringsbilder som brukes. Percentile holder "
                         "histogrammer for hver aktivering i minnet, saa store "
                         "inndataformater krever faerre bilder.")
    args = ap.parse_args()

    from speciesnet.classifier import SpeciesNetClassifier

    print(f"laster {args.modell} ...")
    klass = SpeciesNetClassifier(args.modell, device="cpu")
    labels = [klass.labels[i] for i in range(len(klass.labels))]
    print(f"  {len(labels)} labels")

    felles.UT.mkdir(parents=True, exist_ok=True)
    fp32 = felles.UT / f"{NAVN}.fp32.onnx"
    eksempel = torch.zeros(1, STORRELSE, STORRELSE, 3, dtype=torch.float32)
    felles.eksporter_onnx(NHWCInnpakning(klass.model), eksempel, fp32)

    ut = felles.UT / f"{NAVN}.onnx"
    if args.kalibrering:
        leser = felles.Kalibrering(args.kalibrering, forbehandle, "bilde", args.maks_bilder)
        felles.kvantiser_int8(fp32, ut, leser, args.metode)
        presisjon = "int8"
    else:
        print("  ingen kalibreringsbilder - skriver fp16 i stedet")
        felles.konverter_fp16(fp32, ut)
        presisjon = "fp16"

    felles.skriv_meta(
        NAVN,
        {
            "kilde": args.modell,
            "presisjon": presisjon,
            "input": [STORRELSE, STORRELSE],
            "layout": "NHWC",
            "scale": 1 / 255,
            "mean": [0.0, 0.0, 0.0],
            "std": [1.0, 1.0, 1.0],
            "softmax": True,
            "labelformat": "speciesnet",
        },
        labels,
    )
    print("ferdig. Last opp modeller/ til Hugging Face.")


if __name__ == "__main__":
    main()
