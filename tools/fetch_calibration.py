"""Henter kalibreringsbilder automatisk, ett per art i species.js.

    python tools/hent_kalibrering.py

Kalibrering er ikke trening. Modellens vekter rores ikke. Skriptet maaler
bare hvilke tallomraader aktiveringene faktisk bruker, slik at int8-skalaene
settes riktig. Uten dette maa eksporten gjette, og da blir fila dobbelt saa
stor (fp16) fordi vi ikke toer aa kvantisere.

Bildene kommer fra Wikipedias REST-API - artikkelens hovedbilde for hvert
latinske navn i species.js, pluss noen scener uten art i seg (bakke, himmel,
skogbunn), fordi spilleren kommer til aa peke kameraet dit ogsaa.
"""

from __future__ import annotations

import json
import pathlib
import re
import time
import urllib.request

ROT = pathlib.Path(__file__).resolve().parent.parent
UT = ROT / "tools" / "kalibrering"

WIKI = "https://en.wikipedia.org/api/rest_v1/page/summary/"
HODER = {"User-Agent": "villmark-kalibrering/1.0 (artsmodell-eksport)"}

# Uten motiv: skanneren peker ofte paa ingenting saerlig, og int8-skalaene
# maa taale de bildene ogsaa.
SCENER = [
    "Forest_floor", "Moss", "Tundra", "Bog", "Scree", "Seaweed",
    "Overcast", "Gravel", "Snow", "Tree_bark",
]


def arter_fra_species_js() -> list[str]:
    """Plukker sci-feltene ut av species.js uten aa kjore JavaScript."""
    tekst = (ROT / "species.js").read_text(encoding="utf-8")
    return re.findall(r"sci:\s*'([^']+)'", tekst)


def hent(url: str, timeout: int = 60) -> bytes:
    req = urllib.request.Request(url, headers=HODER)
    with urllib.request.urlopen(req, timeout=timeout) as svar:
        return svar.read()


def hent_ett(navn: str, artikkel: str) -> bool:
    sti = UT / f"{navn}.jpg"
    if sti.exists():
        return True
    try:
        data = json.loads(hent(WIKI + artikkel.replace(" ", "_")))
        # thumbnail forst: Wikimedia svarer 429 paa fullstore originaler
        kilde = (data.get("thumbnail") or data.get("originalimage") or {}).get("source")
        if not kilde:
            print(f"  {navn}: ingen bilde i artikkelen")
            return False
        sti.write_bytes(hent(kilde))
        return True
    except Exception as feil:
        print(f"  {navn}: {feil}")
        return False


def main() -> None:
    UT.mkdir(parents=True, exist_ok=True)
    oppgaver = [(sci.replace(" ", "_"), sci) for sci in arter_fra_species_js()]
    oppgaver += [(s.lower(), s) for s in SCENER]

    print(f"henter opptil {len(oppgaver)} bilder til {UT}")
    ok = 0
    for navn, artikkel in oppgaver:
        if hent_ett(navn, artikkel):
            ok += 1
        time.sleep(1.0)   # Wikipedia svarer 429 om vi henter for fort

    antall = len(list(UT.glob("*.jpg")))
    print(f"\n{ok} hentet, {antall} bilder ligger i {UT}")
    if antall < 20:
        print("ADVARSEL: under 20 bilder gir daarlige int8-skalaer. Kjor paa nytt.")


if __name__ == "__main__":
    main()
