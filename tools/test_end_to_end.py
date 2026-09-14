"""Runs an exported ONNX model on real images and shows what the game would say.

    python tools/test_end_to_end.py --model inat21 --images images/
    python tools/test_end_to_end.py --model inat21 --download

The preprocessing here is the same one classify.js does in the browser: centre
square, scaled to the model's size, normalized from meta.json. That way we
catch errors in layout, mean/std and label order before they show up on the
phone.

--download fetches a few freely licensed images from Wikimedia Commons of
species the game has, so the test can run without your own images.
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

import common

# The images come from Wikipedia's REST API, which hands out a legal thumbnail
# URL for the article's lead image. The key is the species id from species.js,
# the value is the article name - the latin name almost always hits.
SAMPLE_SPECIES = {
    "spruce": "Picea_abies",
    "flyagaric": "Amanita_muscaria",
    "chanterelle": "Cantharellus_cibarius",
    "fox": "Vulpes_vulpes",
    "moose": "Alces_alces",
    "birch": "Betula_pubescens",
    "heather": "Calluna_vulgaris",
    "seaeagle": "Haliaeetus_albicilla",
    "cod": "Gadus_morhua",
    "kelp": "Laminaria_hyperborea",
}

# Subjects that are NOT nature. The models have no "nothing here" output, so
# they always answer something - the job is for the answer to come out too
# weak to be accepted. The prefix _not_ means the test demands UNKNOWN SPECIES.
SAMPLE_NOT_NATURE = {
    "_not_laptop": "Laptop",
    "_not_keyboard": "Computer_keyboard",
    "_not_monitor": "Computer_monitor",
    "_not_desk": "Desk",
    "_not_office": "Office",
    "_not_coffeecup": "Coffee_cup",
    "_not_car": "Car",
    "_not_brickwall": "Brickwork",
}

WIKI = "https://en.wikipedia.org/api/rest_v1/page/summary/"
HEADERS = {"User-Agent": "villmark-test/1.0 (species model verification)"}


def _fetch(url: str, timeout: int = 60) -> bytes:
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=timeout) as answer:
        return answer.read()


def download(folder: pathlib.Path) -> None:
    """Fetches one image per species. Species without an image are skipped, not fatal."""
    folder.mkdir(parents=True, exist_ok=True)
    for species_id, article in {**SAMPLE_SPECIES, **SAMPLE_NOT_NATURE}.items():
        path = folder / f"{species_id}.jpg"
        if path.exists():
            continue
        try:
            data = json.loads(_fetch(WIKI + article))
            # thumbnail first: Wikimedia answers 429 on full-size originals
            source = (data.get("thumbnail") or data.get("originalimage") or {}).get("source")
            if not source:
                print(f"  {species_id}: no image in the article {article}")
                continue
            path.write_bytes(_fetch(source))
            print(f"  fetched {path.name}")
            time.sleep(1.0)   # Wikipedia answers 429 if we fetch too fast
        except Exception as err:  # the network is the network
            print(f"  {species_id}: {err}")


def preprocess(path: pathlib.Path, meta: dict) -> np.ndarray:
    """The same steps as toTensor() in classify.js."""
    h, w = meta["input"]
    image = Image.open(path).convert("RGB")
    side = min(image.size)
    left = (image.width - side) // 2
    top = (image.height - side) // 2
    image = image.crop((left, top, left + side, top + side)).resize((w, h), Image.BILINEAR)

    arr = np.asarray(image, dtype=np.float32) * float(meta.get("scale", 1 / 255))
    arr = (arr - np.array(meta.get("mean", [0, 0, 0]), dtype=np.float32)) / np.array(
        meta.get("std", [1, 1, 1]), dtype=np.float32
    )
    if meta.get("layout") == "NHWC":
        return arr[None, ...]
    return arr.transpose(2, 0, 1)[None, ...]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", choices=["speciesnet", "inat21"], default="inat21")
    ap.add_argument("--images", type=pathlib.Path)
    ap.add_argument("--download", action="store_true",
                    help="fetch sample images from Wikipedia instead of using your own")
    ap.add_argument("--out", type=pathlib.Path,
                    help="write the top 5 to JSON, so prediction_mapping.js can read it")
    args = ap.parse_args()

    folder = args.images
    if args.download or folder is None:
        folder = common.ROOT / "tools" / "sample_images"
        print(f"sample images in {folder}")
        download(folder)

    onnx_path = common.OUT / f"{args.model}.onnx"
    if not onnx_path.exists():
        raise SystemExit(f"could not find {onnx_path} - run the export script first")
    meta = json.loads((common.OUT / f"{args.model}.meta.json").read_text(encoding="utf-8"))
    labels = json.loads((common.OUT / f"{args.model}.labels.json").read_text(encoding="utf-8"))
    print(f"{onnx_path.name}  {onnx_path.stat().st_size / 1e6:.1f} MB  "
          f"{meta['precision']}  {meta['layout']}  {meta['input']}")

    session = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
    input_name = session.get_inputs()[0].name

    files = [p for p in sorted(folder.rglob("*"))
             if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}]
    if not files:
        raise SystemExit(f"found no images in {folder}")

    everything = {}
    for path in files:
        x = preprocess(path, meta)
        logits = session.run(None, {input_name: x})[0][0]
        top = common.top5(logits.astype(np.float64), labels)
        everything[path.stem] = [{"label": label, "p": p} for label, p in top]
        print(f"\n{path.name}")
        for label, p in top:
            name = label["name"] if isinstance(label, dict) else label
            print(f"   {p * 100:5.1f} %  {name}")

    if args.out:
        args.out.write_text(
            json.dumps({"source": meta["labelFormat"], "images": everything},
                       ensure_ascii=False, indent=1),
            encoding="utf-8",
        )
        print(f"\nwrote {args.out}")


if __name__ == "__main__":
    main()
