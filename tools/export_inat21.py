"""Eksporterer birder resnet_v2_50_inat21 til ONNX for nettleseren.

    python tools/export_inat21.py --kalibrering bilder/

Dekker 10 000 arter fra iNaturalist 2021, deriblant alle sju plantene og
begge soppene i biblioteket. 256px-varianten er standard: 384px koster over
dobbelt saa mye regnetid paa telefon uten aa gi noe spillet merker.

Labels beriges med slekt og familie fra iNat21-taksonomien, slik at
artsmapping.js kan falle tilbake paa slekt eller familie naar arten ikke
finnes i spillet.
"""

from __future__ import annotations

import argparse
import io
import json
import pathlib
import tarfile
import urllib.request

import numpy as np
import torch
from PIL import Image

import felles

NAVN = "inat21"
MODELL = "resnet_v2_50_inat21-256px"
INAT_KATEGORIER = "https://ml-inat-competition-datasets.s3.amazonaws.com/2021/val.json.tar.gz"


def hent_taksonomi() -> dict:
    """Henter iNat21-kategoriene og indekserer dem paa mappenavn.

    Birder navngir klassene med iNat21s mappenavn, ikke artsnavnet:
        "00000 Animalia Annelida Clitellata Haplotaxida Lumbricidae Lumbricus terrestris"
    Det er indeks + rike + rekke + klasse + orden + familie + slekt + art.
    `image_dir_name` i val.json er den samme strengen med understrek, saa vi
    indekserer paa den og slipper aa gjette.
    """
    print("henter iNat21-taksonomi ...")
    with urllib.request.urlopen(INAT_KATEGORIER, timeout=120) as svar:
        raa = svar.read()
    with tarfile.open(fileobj=io.BytesIO(raa), mode="r:gz") as tar:
        medlem = next(m for m in tar.getmembers() if m.name.endswith(".json"))
        data = json.load(tar.extractfile(medlem))
    tab = {}
    for kat in data["categories"]:
        tab[nokkel(kat.get("image_dir_name", ""))] = {
            "name": kat["name"],
            "genus": kat.get("genus", ""),
            "family": kat.get("family", ""),
            # orden, klasse og rekke trengs av gruppebroen i artsmapping.js,
            # som fanger torsk gjennom Actinopterygii og tare gjennom algene
            "order": kat.get("order", ""),
            "class": kat.get("class", ""),
            "phylum": kat.get("phylum", ""),
            "kingdom": kat.get("kingdom", ""),
            "common_name": kat.get("common_name", ""),
        }
    print(f"  {len(tab)} arter i taksonomien")
    return tab


def nokkel(s: str) -> str:
    """Mappenavn til sammenlignbar noekkel: understrek og mellomrom er samme ting."""
    return " ".join(str(s).replace("_", " ").split()).lower()


def klasseliste(model_info) -> list[str]:
    """Henter klassenavnene i modellens egen indeksrekkefolge."""
    kart = getattr(model_info, "class_to_idx", None)
    if not kart:
        raise SystemExit("birder ga ingen class_to_idx - kan ikke navngi klassene")
    ut = [None] * len(kart)
    for navn, idx in kart.items():
        ut[idx] = navn
    if any(n is None for n in ut):
        raise SystemExit("hull i class_to_idx")
    return ut


# Mappenavnet er: indeks rike rekke klasse orden familie slekt art
RANGER = ["kingdom", "phylum", "class", "order", "family", "genus", "art"]


def fra_mappenavn(navn: str) -> dict:
    """Leser taksonomien rett ut av mappenavnet naar val.json ikke har treff."""
    deler = nokkel(navn).split()
    if deler and deler[0].isdigit():
        deler = deler[1:]
    felt = {r: "" for r in RANGER}
    for rang, verdi in zip(RANGER, deler):
        felt[rang] = verdi.capitalize() if rang != "art" else verdi
    slekt, art = felt.pop("genus"), felt.pop("art")
    return {
        "name": (slekt + " " + art).strip(),
        "genus": slekt,
        "family": felt["family"],
        "order": felt["order"],
        "class": felt["class"],
        "phylum": felt["phylum"],
        "kingdom": felt["kingdom"],
    }


def berik(navn_liste: list[str], taksonomi: dict) -> list[dict]:
    """Kobler hver klasse til artsnavn, slekt, familie, orden, klasse og rekke."""
    ut, truffet = [], 0
    for navn in navn_liste:
        kat = taksonomi.get(nokkel(navn))
        if kat:
            truffet += 1
            ut.append(kat)
        else:
            ut.append(fra_mappenavn(navn))
    print(f"  {truffet}/{len(navn_liste)} klasser koblet mot val.json, resten lest fra mappenavnet")
    if truffet == 0:
        print("  ADVARSEL: ingen treff mot val.json - sjekk at mappenavnformatet er uendret")
    return ut


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--kalibrering", type=pathlib.Path,
                    help="mappe med 30-60 mobilbilder. Uten denne skrives fp16 i stedet for int8.")
    ap.add_argument("--modell", default=MODELL)
    args = ap.parse_args()

    import birder

    print(f"laster {args.modell} ...")
    net, model_info = birder.load_pretrained_model(args.modell, inference=True)
    storrelse = birder.get_size_from_signature(model_info.signature)
    h, w = (storrelse if isinstance(storrelse, (list, tuple)) else (storrelse, storrelse))[:2]
    stats = model_info.rgb_stats
    mean = list(stats["mean"])
    std = list(stats["std"])
    print(f"  input {h}x{w}, mean {mean}, std {std}")

    navn_liste = klasseliste(model_info)
    labels = berik(navn_liste, hent_taksonomi())

    def forbehandle(sti: pathlib.Path) -> np.ndarray:
        bilde = Image.open(sti).convert("RGB")
        side = min(bilde.size)
        venstre = (bilde.width - side) // 2
        topp = (bilde.height - side) // 2
        bilde = bilde.crop((venstre, topp, venstre + side, topp + side)).resize((w, h), Image.BILINEAR)
        arr = np.asarray(bilde, dtype=np.float32) / 255.0
        arr = (arr - np.array(mean, dtype=np.float32)) / np.array(std, dtype=np.float32)
        return arr.transpose(2, 0, 1)[None, ...]

    felles.UT.mkdir(parents=True, exist_ok=True)
    fp32 = felles.UT / f"{NAVN}.fp32.onnx"
    felles.eksporter_onnx(net, torch.zeros(1, 3, h, w, dtype=torch.float32), fp32)

    ut = felles.UT / f"{NAVN}.int8.onnx"
    if args.kalibrering:
        felles.kvantiser_int8(fp32, ut, felles.Kalibrering(args.kalibrering, forbehandle, "bilde"))
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
            "input": [h, w],
            "layout": "NCHW",
            "scale": 1 / 255,
            "mean": mean,
            "std": std,
            "softmax": True,
            "labelformat": "inat21",
        },
        labels,
    )
    print("ferdig. Last opp modeller/ til Hugging Face.")


if __name__ == "__main__":
    main()
