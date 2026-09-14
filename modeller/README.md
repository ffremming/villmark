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

# Villmark — artsmodeller for nettleser

ONNX-versjoner av to eksisterende modeller, pakket for å kjøre i en nettleser
med `onnxruntime-web`. Brukt av [Villmark](https://github.com/ffremming), et
spill som lar deg skanne norske arter med mobilkameraet.

**Dette er ikke nye modeller.** Vektene er uendret fra kildene under; de er
konvertert til ONNX og redusert i presisjon. All treffsikkerhet tilhører de
opprinnelige forfatterne.

## Innhold

| fil | størrelse | kilde | endring |
|---|---|---|---|
| `inat21.onnx` | 44,7 MB | birder `resnet_v2_50_inat21-256px` | PyTorch → ONNX, int8 (percentile-kalibrering) |
| `inat21.labels.json` | 2,1 MB | iNaturalist 2021-taksonomi | klasseliste med slekt, familie, orden, klasse, rekke |
| `inat21.meta.json` | — | — | inndataform og normalisering |
| `speciesnet.onnx` | 112,2 MB | SpeciesNet 4.0.3b (helbilde-klassifikator) | PyTorch → ONNX, fp16 |
| `speciesnet.labels.json` | 263 kB | SpeciesNet | uendret labelliste, som JSON |
| `speciesnet.meta.json` | — | — | inndataform og normalisering |

## Kilder og lisenser

### SpeciesNet

Copyright 2024 Google LLC. Lisensiert under Apache License 2.0.

- Kode og modellkort: https://github.com/google/cameratrapai
- Vekter: https://www.kaggle.com/models/google/speciesnet (`pyTorch/v4.0.3b`)

Arkitektur: EfficientNet V2 M, trent på over 65 millioner viltkamerabilder,
2498 labels.

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

Lisensiert under Apache License 2.0.

- Modell: https://huggingface.co/birder-project/resnet_v2_50_inat21
- Prosjekt: https://gitlab.com/birder/birder

Arkitektur: ResNet v2 50, trent på iNaturalist 2021 med en tilpasset variant av
ResNet Strikes Back A2. 10 000 arter.

### iNaturalist 2021

Klasselisten i `inat21.labels.json` er taksonomien fra iNat2021-konkurransen —
artsnavn med slekt, familie, orden, klasse og rekke.

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

Ikke inkludert her. SpeciesNet-pakken fra Kaggle inneholder MegaDetector v5a,
men Villmark bruker helbilde-klassifikatoren `4.0.3b`, som ikke trenger en
detektor. MegaDetector-vektene er derfor ikke lastet opp.

## Endringer fra originalene

Apache-2.0 krever at endringer oppgis. Dette er gjort:

**Begge modellene**

1. Eksportert fra PyTorch til ONNX, opset 17, fast batchstørrelse 1.
2. Redusert presisjon (se under). Vekter og arkitektur er ellers uendret.
3. Labellistene er skrevet om til JSON. For iNat21 er hver klasse utvidet med
   slekt, familie, orden, klasse og rekke fra iNat2021-taksonomien, slik at en
   klient kan falle tilbake på høyere taksonomisk nivå.

**`inat21.onnx`** — statisk int8-kvantisering, QDQ-format, per kanal,
percentile-kalibrering (99,999) på 45 bilder. Målt mot fp32 på ti testbilder:
samme topp-1 på alle ti.

**`speciesnet.onnx`** — fp16. Int8 ble forsøkt og forkastet: modellen svarte
`blank` på nesten alt, også bilder den tar med 99,5 % i fp16. EfficientNetV2
med SE-blokker tåler ikke per-tensor int8-aktiveringer her.

**Forbehandling avviker bevisst for SpeciesNet.** Originalen beskjærer topp og
bunn av bildet for å unngå å lære tidsstempelbanner fra viltkameraer. Et
mobilbilde har ingen slike banner, og beskjæringen ville kuttet motivet.
Villmark bruker senterkvadrat i stedet. Vektene er uendret; det er kun
klientens forbehandling som er annerledes.

## Bruk

`meta.json` bærer alt en klient trenger:

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

SpeciesNet er **NHWC** i `[0,1]` uten mean/std. iNat21 er **NCHW** med
normalisering. Utdata er logits; kjør softmax selv.

## Ansvar

Modellene bommer. De er trent på viltkamerabilder og feltfotografier, ikke på
det mobilkameraet ditt peker på. Ikke bruk dem til å avgjøre om en sopp kan
spises.
