"""Exports birder resnet_v2_50_inat21 to ONNX for the browser.

    python tools/export_inat21.py --calibration images/

Covers 10 000 species from iNaturalist 2021, among them all seven plants and
both fungi in the library. The 256px variant is the default: 384px costs more
than twice the compute on a phone without giving the game anything it notices.

The labels are enriched with genus and family from the iNat21 taxonomy, so
speciesmapping.js can fall back on genus or family when the species is not in
the game.
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

import common

NAME = "inat21"
MODEL = "resnet_v2_50_inat21-256px"
INAT_CATEGORIES = "https://ml-inat-competition-datasets.s3.amazonaws.com/2021/val.json.tar.gz"


def fetch_taxonomy() -> dict:
    """Fetches the iNat21 categories and indexes them on folder name.

    birder names the classes with the iNat21 folder names, not the species
    name:
        "00000 Animalia Annelida Clitellata Haplotaxida Lumbricidae Lumbricus terrestris"
    That is index + kingdom + phylum + class + order + family + genus +
    species. `image_dir_name` in val.json is the same string with underscores,
    so we index on that and never have to guess.
    """
    print("fetching the iNat21 taxonomy ...")
    with urllib.request.urlopen(INAT_CATEGORIES, timeout=120) as answer:
        raw = answer.read()
    with tarfile.open(fileobj=io.BytesIO(raw), mode="r:gz") as tar:
        member = next(m for m in tar.getmembers() if m.name.endswith(".json"))
        data = json.load(tar.extractfile(member))
    table = {}
    for cat in data["categories"]:
        table[key(cat.get("image_dir_name", ""))] = {
            "name": cat["name"],
            "genus": cat.get("genus", ""),
            "family": cat.get("family", ""),
            # order, class and phylum are needed by the group bridge in
            # speciesmapping.js, which catches cod through Actinopterygii and
            # kelp through the algae
            "order": cat.get("order", ""),
            "class": cat.get("class", ""),
            "phylum": cat.get("phylum", ""),
            "kingdom": cat.get("kingdom", ""),
            "common_name": cat.get("common_name", ""),
        }
    print(f"  {len(table)} species in the taxonomy")
    return table


def key(s: str) -> str:
    """Folder name to comparable key: underscore and space are the same thing."""
    return " ".join(str(s).replace("_", " ").split()).lower()


def class_list(model_info) -> list[str]:
    """Reads the class names in the model's own index order."""
    mapping = getattr(model_info, "class_to_idx", None)
    if not mapping:
        raise SystemExit("birder gave no class_to_idx - cannot name the classes")
    out = [None] * len(mapping)
    for name, idx in mapping.items():
        out[idx] = name
    if any(n is None for n in out):
        raise SystemExit("holes in class_to_idx")
    return out


# The folder name is: index kingdom phylum class order family genus species
RANKS = ["kingdom", "phylum", "class", "order", "family", "genus", "species"]


def from_folder_name(name: str) -> dict:
    """Reads the taxonomy straight out of the folder name when val.json misses."""
    parts = key(name).split()
    if parts and parts[0].isdigit():
        parts = parts[1:]
    fields = {r: "" for r in RANKS}
    for rank, value in zip(RANKS, parts):
        fields[rank] = value.capitalize() if rank != "species" else value
    genus, species = fields.pop("genus"), fields.pop("species")
    return {
        "name": (genus + " " + species).strip(),
        "genus": genus,
        "family": fields["family"],
        "order": fields["order"],
        "class": fields["class"],
        "phylum": fields["phylum"],
        "kingdom": fields["kingdom"],
    }


def enrich(names: list[str], taxonomy: dict) -> list[dict]:
    """Ties every class to species name, genus, family, order, class and phylum."""
    out, matched = [], 0
    for name in names:
        cat = taxonomy.get(key(name))
        if cat:
            matched += 1
            out.append(cat)
        else:
            out.append(from_folder_name(name))
    print(f"  {matched}/{len(names)} classes matched against val.json, the rest read from the folder name")
    if matched == 0:
        print("  WARNING: no matches against val.json - check that the folder name format is unchanged")
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--calibration", type=pathlib.Path,
                    help="folder with 30-60 phone photos. Without it fp16 is written instead of int8.")
    ap.add_argument("--model", default=MODEL)
    ap.add_argument("--method", default="percentile", choices=["percentile", "minmax", "entropy"],
                    help="calibration method for int8")
    ap.add_argument("--max-images", type=int, default=48, dest="max_images",
                    help="how many calibration images are used. Percentile keeps a "
                         "histogram per activation in memory, so large input "
                         "shapes need fewer images.")
    args = ap.parse_args()

    import birder

    print(f"loading {args.model} ...")
    net, model_info = birder.load_pretrained_model(args.model, inference=True)
    size = birder.get_size_from_signature(model_info.signature)
    h, w = (size if isinstance(size, (list, tuple)) else (size, size))[:2]
    stats = model_info.rgb_stats
    mean = list(stats["mean"])
    std = list(stats["std"])
    print(f"  input {h}x{w}, mean {mean}, std {std}")

    names = class_list(model_info)
    labels = enrich(names, fetch_taxonomy())

    def preprocess(path: pathlib.Path) -> np.ndarray:
        image = Image.open(path).convert("RGB")
        side = min(image.size)
        left = (image.width - side) // 2
        top = (image.height - side) // 2
        image = image.crop((left, top, left + side, top + side)).resize((w, h), Image.BILINEAR)
        arr = np.asarray(image, dtype=np.float32) / 255.0
        arr = (arr - np.array(mean, dtype=np.float32)) / np.array(std, dtype=np.float32)
        return arr.transpose(2, 0, 1)[None, ...]

    common.OUT.mkdir(parents=True, exist_ok=True)
    fp32 = common.OUT / f"{NAME}.fp32.onnx"
    common.export_onnx(net, torch.zeros(1, 3, h, w, dtype=torch.float32), fp32)

    out = common.OUT / f"{NAME}.onnx"
    if args.calibration:
        common.quantize_int8(fp32, out, common.Calibration(args.calibration, preprocess, "image", args.max_images), args.method)
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
            "input": [h, w],
            "layout": "NCHW",
            "scale": 1 / 255,
            "mean": mean,
            "std": std,
            "softmax": True,
            "labelFormat": "inat21",
        },
        labels,
    )
    print("done. Upload models/ to Hugging Face.")


if __name__ == "__main__":
    main()
