---
license: apache-2.0
base_model:
  - google/speciesnet
  - birder-project/resnet_v2_50_inat21
tags:
  - onnx
  - image-classification
  - biology
  - wildlife
  - onnxruntime-web
library_name: onnx
---

# Villmark — species models for the browser

ONNX versions of two existing models, packaged to run in a browser with
`onnxruntime-web`. Used by [Villmark](https://github.com/ffremming), a game
that lets you scan the species of Norway with a phone camera.

**These are not new models.** The weights are unchanged from the sources below;
they have been converted to ONNX and reduced in precision. All the accuracy
belongs to the original authors.

## Contents

| file | size | source | change |
|---|---|---|---|
| `inat21.onnx` | 44.7 MB | birder `resnet_v2_50_inat21-256px` | PyTorch → ONNX, int8 (percentile calibration) |
| `inat21.labels.json` | 2.1 MB | iNaturalist 2021 taxonomy | class list with genus, family, order, class, phylum |
| `inat21.meta.json` | — | — | input shape and normalization |
| `speciesnet.onnx` | 112.2 MB | SpeciesNet 4.0.3b (whole-image classifier) | PyTorch → ONNX, fp16 |
| `speciesnet.labels.json` | 263 kB | SpeciesNet | unchanged label list, as JSON |
| `speciesnet.meta.json` | — | — | input shape and normalization |

## Sources and licences

### SpeciesNet

Copyright 2024 Google LLC. Licensed under the Apache License 2.0.

- Code and model card: https://github.com/google/cameratrapai
- Weights: https://www.kaggle.com/models/google/speciesnet (`pyTorch/v4.0.3b`)

Architecture: EfficientNet V2 M, trained on more than 65 million camera-trap
images, 2498 labels.

```bibtex
@article{gadot2024crop,
  title={To crop or not to crop: Comparing whole-image and cropped classification on a large dataset of camera trap images},
  author={Gadot, Tomer and Istrate, {\c{S}}tefan and Kim, Hyungwon and Morris, Dan and Beery, Sara and Birch, Tanya and Ahumada, Jorge},
  journal={IET Computer Vision},
  year={2024},
  publisher={Wiley Online Library}
}
```

### birder resnet_v2_50_inat21

Licensed under the Apache License 2.0.

- Model: https://huggingface.co/birder-project/resnet_v2_50_inat21
- Project: https://gitlab.com/birder/birder

Architecture: ResNet v2 50, trained on iNaturalist 2021 with an adapted variant
of ResNet Strikes Back A2. 10 000 species.

### iNaturalist 2021

The class list in `inat21.labels.json` is the taxonomy from the iNat2021
competition — species names with genus, family, order, class and phylum.

- https://github.com/visipedia/inat_comp/tree/master/2021

```bibtex
@misc{inaturalist2021,
  title={iNaturalist 2021 Competition Dataset},
  author={Van Horn, Grant and Cole, Elijah and Beery, Sara and Wilber, Kimberly and Belongie, Serge and Mac Aodha, Oisin},
  year={2021},
  publisher={Visipedia}
}
```

### MegaDetector

Not included here. The SpeciesNet package from Kaggle contains MegaDetector
v5a, but Villmark uses the whole-image classifier `4.0.3b`, which needs no
detector. The MegaDetector weights have therefore not been uploaded.

## Changes from the originals

Apache-2.0 requires that changes be stated. This is what was done:

**Both models**

1. Exported from PyTorch to ONNX, opset 17, fixed batch size 1.
2. Reduced precision (see below). Weights and architecture are otherwise
   unchanged.
3. The label lists were rewritten as JSON. For iNat21 every class was extended
   with genus, family, order, class and phylum from the iNat2021 taxonomy, so
   a client can fall back on a higher taxonomic level.

**`inat21.onnx`** — static int8 quantization, QDQ format, per channel,
percentile calibration (99.999) on 45 images. Measured against fp32 on ten test
images: the same top-1 on all ten.

**`speciesnet.onnx`** — fp16. int8 was attempted and rejected: the model
answered `blank` to almost everything, including images it takes at 99.5 % in
fp16. EfficientNetV2 with SE blocks does not survive per-tensor int8
activations here.

**The preprocessing differs deliberately for SpeciesNet.** The original crops
the top and the bottom of the image to avoid learning the timestamp banners of
camera traps. A phone photo has no such banners, and the crop would cut the
subject. Villmark uses the centre square instead. The weights are unchanged; it
is only the client's preprocessing that differs.

## Use

`meta.json` carries everything a client needs:

```json
{
  "input": [256, 256],
  "layout": "NCHW",
  "scale": 0.00392156862745098,
  "mean": [0.5191, 0.5306, 0.4877],
  "std": [0.2316, 0.2304, 0.2588],
  "softmax": true
}
```

SpeciesNet is **NHWC** in `[0,1]` without mean/std. iNat21 is **NCHW** with
normalization. The output is logits; run softmax yourself.

## Responsibility

The models get it wrong. They were trained on camera-trap images and field
photographs, not on whatever your phone camera is pointed at. Do not use them
to decide whether a mushroom can be eaten.
