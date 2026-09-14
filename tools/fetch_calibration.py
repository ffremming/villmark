"""Fetches calibration images automatically, one per species in species.js.

    python tools/fetch_calibration.py

Calibration is not training. The model's weights are never touched. The script
only measures which number ranges the activations actually use, so the int8
scales are set correctly. Without this the export has to guess, and the file
comes out twice the size (fp16) because we dare not quantize.

The images come from Wikipedia's REST API - the article's lead image for every
latin name in species.js, plus a few scenes with no species in them (ground,
sky, forest floor), because the player is going to point the camera there too.
"""

from __future__ import annotations

import json
import pathlib
import re
import time
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "tools" / "calibration"

WIKI = "https://en.wikipedia.org/api/rest_v1/page/summary/"
HEADERS = {"User-Agent": "villmark-calibration/1.0 (species model export)"}

# No subject: the scanner often points at nothing in particular, and the int8
# scales have to cope with those images too.
SCENES = [
    "Forest_floor", "Moss", "Tundra", "Bog", "Scree", "Seaweed",
    "Overcast", "Gravel", "Snow", "Tree_bark",
]


def species_from_species_js() -> list[str]:
    """Picks the sci fields out of species.js without running any JavaScript."""
    text = (ROOT / "species.js").read_text(encoding="utf-8")
    return re.findall(r"sci:\s*'([^']+)'", text)


def fetch(url: str, timeout: int = 60) -> bytes:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=timeout) as answer:
        return answer.read()


def fetch_one(name: str, article: str) -> bool:
    path = OUT / f"{name}.jpg"
    if path.exists():
        return True
    try:
        data = json.loads(fetch(WIKI + article.replace(" ", "_")))
        # thumbnail first: Wikimedia answers 429 on full-size originals
        source = (data.get("thumbnail") or data.get("originalimage") or {}).get("source")
        if not source:
            print(f"  {name}: no image in the article")
            return False
        path.write_bytes(fetch(source))
        return True
    except Exception as err:
        print(f"  {name}: {err}")
        return False


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    jobs = [(sci.replace(" ", "_"), sci) for sci in species_from_species_js()]
    jobs += [(s.lower(), s) for s in SCENES]

    print(f"fetching up to {len(jobs)} images into {OUT}")
    ok = 0
    for name, article in jobs:
        if fetch_one(name, article):
            ok += 1
        time.sleep(1.0)   # Wikipedia answers 429 if we fetch too fast

    count = len(list(OUT.glob("*.jpg")))
    print(f"\n{ok} fetched, {count} images sit in {OUT}")
    if count < 20:
        print("WARNING: fewer than 20 images gives poor int8 scales. Run it again.")


if __name__ == "__main__":
    main()
