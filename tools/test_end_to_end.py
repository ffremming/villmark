"""Kjorer en eksportert ONNX-modell paa ekte bilder og viser hva spillet ville sagt.

    python tools/test_ende_til_ende.py --modell inat21 --bilder bilder/
    python tools/test_ende_til_ende.py --modell inat21 --last-ned

Forbehandlingen her er den samme som klassifiser.js gjor i nettleseren:
senterkvadrat, skalering til modellens storrelse, normalisering fra meta.json.
Slik fanger vi feil i layout, mean/std og labelrekkefolge for de dukker opp
paa telefonen.

--last-ned henter noen fritt lisensierte bilder fra Wikimedia Commons av
arter spillet har, saa testen kan kjores uten egne bilder.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import time
import urllib.request

import numpy as np
import onnxruntime as ort
from PIL import Image

import felles

# Bildene hentes fra Wikipedias REST-API, som gir en lovlig thumbnail-URL for
# artikkelens hovedbilde. Noekkelen er artsid-en i species.js, verdien er
# artikkelnavnet - det latinske navnet treffer nesten alltid.
PROVEARTER = {
    "gran": "Picea_abies",
    "fluesopp": "Amanita_muscaria",
    "kantarell": "Cantharellus_cibarius",
    "rev": "Vulpes_vulpes",
    "elg": "Alces_alces",
    "bjork": "Betula_pubescens",
    "rosslyng": "Calluna_vulgaris",
    "havorn": "Haliaeetus_albicilla",
    "torsk": "Gadus_morhua",
    "tare": "Laminaria_hyperborea",
}

# Motiver som IKKE er natur. Modellene har ingen "ingenting her"-utgang, saa
# de svarer alltid noe - jobben er at svaret skal bli for svakt til aa godtas.
# Prefikset _ikke_ betyr at testen krever UKJENT ART.
PROVE_IKKE_NATUR = {
    "_ikke_laptop": "Laptop",
    "_ikke_tastatur": "Computer_keyboard",
    "_ikke_skjerm": "Computer_monitor",
    "_ikke_skrivebord": "Desk",
    "_ikke_kontor": "Office",
    "_ikke_kaffekopp": "Coffee_cup",
    "_ikke_bil": "Car",
    "_ikke_murvegg": "Brickwork",
}

WIKI = "https://en.wikipedia.org/api/rest_v1/page/summary/"
HODER = {"User-Agent": "villmark-test/1.0 (artsmodell-verifisering)"}


def _hent(url: str, timeout: int = 60) -> bytes:
    req = urllib.request.Request(url, headers=HODER)
    with urllib.request.urlopen(req, timeout=timeout) as svar:
        return svar.read()


def last_ned(mappe: pathlib.Path) -> None:
    """Henter ett bilde per art. Arter uten bilde hoppes over, ikke krasj."""
    mappe.mkdir(parents=True, exist_ok=True)
    for artsid, artikkel in {**PROVEARTER, **PROVE_IKKE_NATUR}.items():
        sti = mappe / f"{artsid}.jpg"
        if sti.exists():
            continue
        try:
            data = json.loads(_hent(WIKI + artikkel))
            # thumbnail forst: Wikimedia svarer 429 paa fullstore originaler
            kilde = (data.get("thumbnail") or data.get("originalimage") or {}).get("source")
            if not kilde:
                print(f"  {artsid}: ingen bilde i artikkelen {artikkel}")
                continue
            sti.write_bytes(_hent(kilde))
            print(f"  hentet {sti.name}")
            time.sleep(1.0)   # Wikipedia svarer 429 om vi henter for fort
        except Exception as feil:  # nett er nett
            print(f"  {artsid}: {feil}")


def forbehandle(sti: pathlib.Path, meta: dict) -> np.ndarray:
    """Samme steg som tilTensor() i klassifiser.js."""
    h, w = meta["input"]
    bilde = Image.open(sti).convert("RGB")
    side = min(bilde.size)
    venstre = (bilde.width - side) // 2
    topp = (bilde.height - side) // 2
    bilde = bilde.crop((venstre, topp, venstre + side, topp + side)).resize((w, h), Image.BILINEAR)

    arr = np.asarray(bilde, dtype=np.float32) * float(meta.get("scale", 1 / 255))
    arr = (arr - np.array(meta.get("mean", [0, 0, 0]), dtype=np.float32)) / np.array(
        meta.get("std", [1, 1, 1]), dtype=np.float32
    )
    if meta.get("layout") == "NHWC":
        return arr[None, ...]
    return arr.transpose(2, 0, 1)[None, ...]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--modell", choices=["speciesnet", "inat21"], default="inat21")
    ap.add_argument("--bilder", type=pathlib.Path)
    ap.add_argument("--last-ned", action="store_true",
                    help="hent provebilder fra Wikipedia i stedet for egne")
    ap.add_argument("--ut", type=pathlib.Path,
                    help="skriv topp-5 til JSON, slik at mapping_av_predikasjoner.js kan lese den")
    args = ap.parse_args()

    mappe = args.bilder
    if args.last_ned or mappe is None:
        mappe = felles.UT.parent / "tools" / "provebilder"
        print(f"provebilder i {mappe}")
        last_ned(mappe)

    onnx_sti = felles.UT / f"{args.modell}.onnx"
    if not onnx_sti.exists():
        raise SystemExit(f"fant ikke {onnx_sti} - kjor eksportskriptet forst")
    meta = json.loads((felles.UT / f"{args.modell}.meta.json").read_text(encoding="utf-8"))
    labels = json.loads((felles.UT / f"{args.modell}.labels.json").read_text(encoding="utf-8"))
    print(f"{onnx_sti.name}  {onnx_sti.stat().st_size / 1e6:.1f} MB  "
          f"{meta['presisjon']}  {meta['layout']}  {meta['input']}")

    okt = ort.InferenceSession(str(onnx_sti), providers=["CPUExecutionProvider"])
    innavn = okt.get_inputs()[0].name

    filer = [p for p in sorted(mappe.rglob("*"))
             if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}]
    if not filer:
        raise SystemExit(f"fant ingen bilder i {mappe}")

    alle = {}
    for sti in filer:
        x = forbehandle(sti, meta)
        logits = okt.run(None, {innavn: x})[0][0]
        topp = felles.topp5(logits.astype(np.float64), labels)
        alle[sti.stem] = [{"label": label, "p": p} for label, p in topp]
        print(f"\n{sti.name}")
        for label, p in topp:
            navn = label["name"] if isinstance(label, dict) else label
            print(f"   {p * 100:5.1f} %  {navn}")

    if args.ut:
        args.ut.write_text(
            json.dumps({"kilde": meta["labelformat"], "bilder": alle}, ensure_ascii=False, indent=1),
            encoding="utf-8",
        )
        print(f"\nskrev {args.ut}")


if __name__ == "__main__":
    main()
