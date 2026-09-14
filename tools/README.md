# Species models — the build step

This is a one-off step that runs locally. The game never runs it. The result is
three small files per model, uploaded to Hugging Face and fetched from there by
the browser.

The game works without this step: leave `CLASSIFIER.base` untouched in
`index.html` and the SCAN screen uses the simulated scan exactly as before.

## Why two models

Measured against the 72 species in `species.js`, against the actual label lists
of the models:

| | exact | genus | family | none |
|---|---|---|---|---|
| SpeciesNet 4.0.3b | 21 | 2 | 6 | 43 |
| birder `resnet_v2_50_inat21` | 53 | 10 | 4 | 5 |
| **best of the two** | **58** | 6 | 3 | 5 |

SpeciesNet knows no plants, no fungi and no fish, but it is the strongest on
the camera-trap mammals. iNat21 covers the rest.

**iNat21 runs first.** It is both the cheapest — 256×256 against SpeciesNet's
480×480 — and the one with the widest coverage. An exact species hit above 45 %
ends the scan there, and the heavy model is never downloaded. SpeciesNet is
fetched only when iNat21 is unsure, and it is the specialist on `Lepus
timidus`, `Lynx lynx`, `Gulo gulo` and `Vulpes lagopus`, which iNat21 only
reaches at genus level.

Measured in headless Chromium, the same ten images: certain hits take
**475–724 ms**. With the order reversed the same images took ~2400 ms, because
every single scan paid for the 480×480 model first.

Run `node tools/coverage.js` after every extension of `species.js`. It fetches
both label lists and reports which species are uncatchable. The script exits
with an error code if a species is covered neither by a model nor by a group
bridge.

## Setup

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r tools/requirements.txt
```

The SpeciesNet weights come from Kaggle and need one sign-in:

```bash
pip install kagglehub
python -c "import kagglehub; kagglehub.login()"
```

## Calibration images

Static int8 quantization needs real images to find the right number ranges. It
is not training — the model's weights are never touched, the script only
measures which values the activations actually use, so the int8 scales are set
correctly.

The images are fetched automatically:

```bash
python tools/fetch_calibration.py
```

It fetches one image per species in `species.js` from Wikipedia's REST API,
plus ten scenes with no species in them — forest floor, moss, scree, snow,
bark, overcast sky — because the scanner often points at nothing in particular.
The images land in `tools/calibration/` and are gitignored.

If you have your own phone photos, they are better: they have the same optics
and lighting as what the model meets in use. Point `--calibration` at that
folder instead.

Without `--calibration` the scripts write fp16. That works, but the file comes
out roughly twice the size.

### The calibration method decides the quality

`--method percentile` is the default, and that is not a detail. MinMax sets the
scale from the largest value it saw, so a single outlier stretches the whole
number range and squeezes all the ordinary values together. Measured on the ten
test images:

| method | size | right species |
|---|---|---|
| fp16 (no calibration) | 88.1 MB | 9/10 |
| int8 minmax | 44.7 MB | 8/10 — `birch` turned into `ASPEN` |
| int8 percentile | 44.7 MB | **9/10** |

Percentile gives fp16 quality at half the size. `entropy` is available as well,
but it is slower and gave nothing here.

### SpeciesNet must not be quantized

This applies to iNat21 only. SpeciesNet is EfficientNetV2 with SE blocks and
swish, and it does not survive per-tensor int8 activations: the model answered
`blank` to everything, including a picture of a red fox that the fp16 version
takes at 99.5 %. Measured 8/10 → 5/10.

So run `export_speciesnet.py` **without** `--calibration`. 112 MB of fp16 is
the price, and it is paid rarely — the model is downloaded only when iNat21 is
unsure.

An attempt with 48 calibration images was killed by the kernel (`exit=137`,
memory): percentile keeps a histogram per activation, and at 480×480 they grow
too large. `--max-images` exists to control that, but it does not solve the
loss of quality.

Note: the browser test does not catch this. It still showed 10/10 with a dead
SpeciesNet, because iNat21 runs first and carries all ten images on its own.
Test the models separately with `test_end_to_end.py` when you change the
export.

## Running

```bash
python tools/fetch_calibration.py
python tools/export_speciesnet.py --calibration tools/calibration/
python tools/export_inat21.py     --calibration tools/calibration/
```

Out into `models/`:

```
speciesnet.onnx    speciesnet.meta.json    speciesnet.labels.json
inat21.onnx        inat21.meta.json        inat21.labels.json
```

The precision is recorded in `meta.json`, not in the file name — the same file
is called the same thing whether it is int8 or fp16, so `classify.js` does not
have to guess. `<name>.fp32.onnx` is an intermediate file needed only by
`test_parity.py`; it can be deleted afterwards.

`meta.json` carries the input shape, the layout and the normalization, so
`classify.js` does not have to guess. SpeciesNet is **NHWC** in `[0,1]` without
mean/std; iNat21 is **NCHW** with ImageNet normalization.

## Verification

```bash
python tools/test_parity.py --model speciesnet --images images/
python tools/test_parity.py --model inat21     --images images/
node tools/test_speciesmapping.js
```

```bash
node tools/coverage.js
python tools/test_end_to_end.py --model inat21 --download --out /tmp/pred.json
node tools/prediction_mapping.js /tmp/pred.json
python tools/test_browser.py
```

`test_parity.py` runs PyTorch and ONNX on the same images and demands the same
top-1. The tolerance follows the precision: fp32 1e-4, fp16 1e-2, int8 5e-2. A
wrong top-1 is always a failure. Measured for `inat21` fp16: **10/10**, largest
difference 0.0027 — plain fp16 rounding.

`test_speciesmapping.js` covers the mapping from model label to a species in
the library (30 tests). `coverage.js` is described above.

`test_end_to_end.py` runs the exported ONNX file on real images with exactly
the same preprocessing `classify.js` does in the browser — centre square,
scaling, normalization from `meta.json`. It catches errors in layout, mean/std
and label order before they show up on the phone. With `--download` it fetches
one image per species from Wikipedia's REST API. `prediction_mapping.js` takes
the top-5 list on through the real `speciesmapping.js` and says which species
the game would have given you.

`test_browser.py` is the only test that tries what the code actually does on a
phone: loads onnxruntime-web from the CDN, runs the model in a worker with
`numThreads = 1`, draws the image into a canvas and reads the pixels back out.
It serves the repo on `127.0.0.1` — a secure context, so the Cache API behaves
the way it does on GitHub Pages — and calls the real `CLASSIFIER.classify()`.
Finally it clicks its way through SCAN without a camera and demands that the
game lands on the reveal screen, that is, that the fallback holds.

Needs playwright, which is not in `requirements.txt` because it pulls in a
Chromium of a couple of hundred MB:

```bash
pip install playwright && playwright install chromium
python tools/test_browser.py
```

Measured in headless Chromium on an M-series Mac, wasm on one thread: **10/10
correct**, the first scan 2.8 s including model loading, then 526–725 ms. A
phone is slower, reckon on a few seconds per scan.

Measured result for `inat21` fp16, 10 images from Wikipedia:

```
ok   birch       -> BIRCH       CERTAIN         22.0 %   the model said: Betula pubescens
ok   chanterelle -> CHANTERELLE CERTAIN         98.2 %   the model said: Cantharellus cibarius
FAIL kelp        -> NONE        UNKNOWN SPECIES  8.2 %   the model said: Limulus polyphemus
ok   flyagaric   -> FLY AGARIC  CERTAIN         98.7 %   the model said: Amanita muscaria
ok   fox         -> FOX         CERTAIN         94.3 %   the model said: Vulpes vulpes
ok   heather     -> HEATHER     CERTAIN         92.9 %   the model said: Calluna vulgaris
ok   moose       -> MOOSE       CERTAIN         45.5 %   the model said: Alces alces
ok   seaeagle    -> SEA EAGLE   CERTAIN         91.5 %   the model said: Haliaeetus albicilla
ok   spruce      -> SPRUCE      CERTAIN         30.2 %   the model said: Picea obovata
ok*  cod         -> SAITHE      UNCERTAIN       58.9 %   the model said: Mullus surmuletus
```

`spruce` shows why the mapping looks at the whole top 5: the model's first
choice is `Picea obovata`, but `Picea abies` sits in second place and wins,
because an exact species hit beats a guess at genus level.

`kelp` is the honest weakness. On an underwater photo of oarweed the model
answered `Limulus polyphemus` — horseshoe crab — at 8.2 %. No algal class in
the top 5, so the group bridge never fired. The bridge saves the seaweeds only
when the model at least sees that it is an alga. In practice `kelp`,
`sugarkelp` and `knottedwrack` are still hard to catch.

## WebGPU and int8

The WebGPU backend of `onnxruntime-web` 1.29 cannot handle per-channel
quantized `DequantizeLinear` nodes. It requires `scale` and `zero_point` to
have the same rank, while per-channel gives a 1-D `scale` and a scalar
`zero_point`:

```
[WebGPU] Kernel "[DequantizeLinear] body.stage1.0.block1.0.bias_DequantizeLinear"
failed. Error: scale and zero-point inputs must have the same rank.
```

The error comes at **run time**, not when the session is created, so a
try/catch around `InferenceSession.create` catches nothing.

`classify.js` handles it in two layers: int8 models go straight to wasm, and
`runRobust()` catches kernel errors during the run, rebuilds the session on
wasm and tries once more. The model is remembered as wasm-only for the rest of
the session.

**The test must be run with the GPU switched on.** Headless Chromium normally
gets no GPU adapter and falls back to wasm in silence — which is why this bug
slipped through every earlier run and first hit on a real Chrome:

```bash
VILLMARK_WEBGPU=1 python tools/test_browser.py
```

Measured with the GPU on: 18/18 correct, and the images that need both models
fell from ~2500 ms to ~500 ms, because SpeciesNet is fp16 and runs fine on
WebGPU.

## When the model should not answer

Neither model has a "this is not an organism" output. iNat21 always spreads
probability across its 10 000 species, including when you point the camera at a
laptop. Without a floor, a picture of a desk became `EAGLE OWL` at 5.1 %, a car
became `WOLF` at 6.4 % and a keyboard became `SAITHE` at 5.6 %.

Two mechanisms stop that:

**A floor per level** — `MIN_P_LEVEL` in `speciesmapping.js` is
`[0.10, 0.25, 0.40]`. Weaker evidence demands higher confidence: an exact
species name at 12 % is worth more than a family guess at 12 %. The numbers
were chosen against measurements — real finds sit at 46–99 %, with `birch` as
the exception at 12.5 %, while every false one was below 17 %.

**The blank veto** — `BLANK_VETO` in `classify.js`. SpeciesNet has its own
`blank` class for pictures without animals. If it says blank with at least 60 %
confidence, and iNat21 only has a guess at genus or family level, the guess is
discarded. An exact species hit survives, since SpeciesNet says blank on every
plant and fungus.

The regression test covers this: the images called `_not_*` in `sample_images/`
are a laptop, a keyboard, a monitor, a desk, an office, a coffee cup, a car and
a brick wall, and the test demands `UNKNOWN SPECIES` for every one of them.
Measured: 18/18 correct, where the eight false ones give 1.8–16.7 % and are
rejected.

## Species no model knows

Five species have zero coverage: `cod`, `saithe`, `kelp`, `sugarkelp` and
`knottedwrack`. SpeciesNet has no fish at all, iNat21 has 183 fish species but
no Gadiformes, and brown algae exist nowhere.

`GROUP_BRIDGE` in `speciesmapping.js` catches them at a higher taxonomic level:
anything that is `Actinopterygii` and is not already placed lands on one of the
gadids, and anything that is a red, green or brown alga lands on one of the
seaweeds. The result is always marked UNCERTAIN, so the player sees that it was
a guess. The bridge is checked after genus and family, so a salmon hits
`Salmo salar` exactly and never reaches the bridge.

`GROUP_BRIDGE` also holds bridges for the other direction: groups the library
has no family or order for at all. Whales and dolphins go to the porpoise
(iNaturalist keeps `Cetacea` inside `Artiodactyla`, so without it a dolphin
would come out as a roe deer), eared seals and the walrus to the true seals,
horses, camels, pigs and elephants to the big deer, ducks, herons and grebes to
the water birds, and falcons and vultures to the birds of prey. Each bridge
names the level it answers at.

## The wide net: order, class and kingdom

Below family the ladder keeps going, so a label the library shares no family
with still lands on something:

| Level | Text | Reached by |
|---|---|---|
| 0 | CERTAIN | exact binomial |
| 1 | NEAREST RELATIVE | same genus |
| 2 | UNCERTAIN | same family, and the two coverage bridges |
| 3 | DISTANT RELATIVE | same order, and the seal and whale bridges |
| 4 | SIMILAR SPECIES | same class, and the remaining bridges |
| 5 | SAME GROUP ONLY | same kingdom |
| 6 | UNKNOWN SPECIES | nothing |

`MIN_P_LEVEL` climbs with the level — `0.10 0.25 0.40 0.50 0.60 0.72` — so the
wide net only fires when the model is close to certain about the little it did
see. Every junk picture measured on the models landed between 1.4 % and 16.7 %,
far below the floors for levels 3–5, so furniture still comes out as UNKNOWN
SPECIES.

Whenever the level is worse than CERTAIN the screen prints `MAPPED FROM <the
name the model gave>` — on the scan frame, on the find screen and on the card
in the collection — so a find never pretends the model named that species.
`lookup()` returns that name in the `from` field, and `app.js` keeps it on the
specimen as `origin`, which `store.js` saves with the lawn.

## Ties between several species

When a genus or a family holds several of the game's species — `Vulpes` has
both fox and arctic fox, `Ericaceae` has four — a species the player is missing
is chosen first, then the least rare one. Without the first rule the arctic fox
would be impossible: no model knows `Vulpes lagopus`, so the arctic fox is only
reached at genus level, and there the fox would always win.

## XP by confidence

`LEVEL_XP` in `app.js` scales the reward: a certain species hit 1.0, nearest
relative 0.6, uncertain 0.35, distant relative 0.22, similar species 0.14, same
group only 0.08. The simulated scan has no level and pays out in full as before.

## Publishing

```bash
huggingface-cli upload YOUR-USERNAME/villmark-modeller models/ .
```

Then set the address in `index.html`:

```js
CLASSIFIER.base = 'https://huggingface.co/YOUR-USERNAME/villmark-modeller/resolve/main/';
```

The models must **not** be committed to this repo. GitHub Pages cannot take
100 MB binaries, and every new version would stay in the git history forever.
Hugging Face sends `Access-Control-Allow-Origin: *`, so the browser can fetch
them directly.

## Difference from the original preprocessing

SpeciesNet crops the top and the bottom of the image before classifying. That
is done for camera traps, which put timestamp banners there, and the model must
not learn the camera brand instead of the species. A phone photo has no such
banners, and the crop would cut the subject. The game uses the centre square
instead, and the calibration does the same, so the int8 scales fit the images
the model actually gets.

## Mobile

The game runs on GitHub Pages, which cannot set COOP/COEP headers. Then
`SharedArrayBuffer` does not exist, and onnxruntime-web has to run on one
thread. `classify.js` therefore sets `numThreads = 1` and `proxy = true`, so
the inference sits in a worker and the 3D scene keeps animating while the phone
computes. WebGPU is used when `navigator.gpu` exists, with wasm as the fallback
— also when WebGPU fails during session setup, which happens on a number of
Android GPUs.

The models are never loaded without the player pressing YES in the dialog, and
only when they are needed: the animal model on the first real scan, the plant
model only when the animal model finds nothing. Both are cached in the Cache
API and fetched once per device. Phones with 4 GB of memory or less keep only
one model alive at a time.
