# Artsmodeller — byggesteg

Dette er et engangssteg som kjøres lokalt. Spillet kjører det aldri. Resultatet
er tre små filer per modell som lastes opp til Hugging Face og hentes derfra av
nettleseren.

Spillet fungerer uten dette steget: står `KLASSIFISER.base` urørt i `index.html`,
bruker SKANN-skjermen det simulerte skannet akkurat som før.

## Hvorfor to modeller

| | dyr (16) | planter (7) | sopp (2) |
|---|---|---|---|
| SpeciesNet 4.0.3b | 16 | 0 | 0 |
| birder `resnet_v2_50_inat21` | 11 | 7 | 2 |

iNat21 mangler `Lepus timidus`, `Lynx lynx`, `Gulo gulo`, `Vulpes lagopus` og
`Gadus morhua`. SpeciesNet mangler alt som ikke er dyr. Derfor begge, med
SpeciesNet først og iNat21 som oppfølger når den første er usikker.

`Laminaria hyperborea` (stortare) finnes i ingen av modellene. Den arten kan
bare treffes gjennom simulert skann.

## Oppsett

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r tools/requirements.txt
```

SpeciesNet-vektene hentes fra Kaggle og krever innlogging én gang:

```bash
pip install kagglehub
python -c "import kagglehub; kagglehub.login()"
```

## Kalibreringsbilder

Statisk int8-kvantisering trenger ekte bilder for å finne riktige skalaer.
Legg 30–60 bilder i en mappe — tatt med mobilkamera, på de motivene spillet
faktisk brukes på: dyr, trær, lyng, sopp, bakken, himmelen.

Uten `--kalibrering` skriver skriptene fp16 i stedet. Det virker, men filen
blir omtrent dobbelt så stor (110 MB mot 55 MB for SpeciesNet).

## Kjøring

```bash
python tools/export_speciesnet.py --kalibrering bilder/
python tools/export_inat21.py     --kalibrering bilder/
```

Ut i `modeller/`:

```
speciesnet.int8.onnx    speciesnet.meta.json    speciesnet.labels.json
inat21.int8.onnx        inat21.meta.json        inat21.labels.json
```

`meta.json` bærer inndataform, layout og normalisering, slik at
`klassifiser.js` slipper å gjette. SpeciesNet er **NHWC** i `[0,1]` uten
mean/std; iNat21 er **NCHW** med ImageNet-normalisering.

## Verifisering

```bash
python tools/test_parity.py --modell speciesnet --bilder bilder/
python tools/test_parity.py --modell inat21     --bilder bilder/
node tools/test_artsmapping.js
```

`test_parity.py` kjører PyTorch og ONNX på de samme bildene og krever samme
topp-1. For int8 tillates 0,05 avvik i sannsynlighet, for fp16 1e-3.
`test_artsmapping.js` dekker mappingen fra modellabel til art i biblioteket.

## Publisering

```bash
huggingface-cli upload DITT-BRUKERNAVN/villmark-modeller modeller/ .
```

Sett så adressen i `index.html`:

```js
KLASSIFISER.base = 'https://huggingface.co/DITT-BRUKERNAVN/villmark-modeller/resolve/main/';
```

Modellene skal **ikke** committes til dette repoet. GitHub Pages tåler ikke
100 MB binærfiler, og hver ny versjon ville ligget igjen i git-historikken for
alltid. Hugging Face sender `Access-Control-Allow-Origin: *`, så nettleseren
får hente dem direkte.

## Avvik fra originalt forbehandlingssteg

SpeciesNet beskjærer topp og bunn av bildet før klassifisering. Det er gjort
for viltkameraer, som legger tidsstempelbanner der, og modellen skal ikke lære
seg kameramerke i stedet for art. Et mobilbilde har ingen slike banner, og
beskjæringen ville kuttet motivet. Spillet bruker senterkvadrat i stedet, og
kalibreringen gjør det samme, slik at int8-skalaene passer bildene modellen
faktisk får.

## Mobil

Spillet kjører på GitHub Pages, som ikke kan sette COOP/COEP-hoder. Da finnes
ikke `SharedArrayBuffer`, og onnxruntime-web må kjøre på én tråd. `klassifiser.js`
setter derfor `numThreads = 1` og `proxy = true`, slik at inferensen ligger i en
worker og 3D-scenen fortsetter å animere mens telefonen regner. WebGPU brukes
når `navigator.gpu` finnes, med wasm som fallback — også når WebGPU feiler
under sesjonsoppsett, som skjer på en del Android-GPUer.

Modellene lastes aldri uten at spilleren har trykket JA i dialogen, og bare når
de trengs: dyremodellen ved første ekte skann, plantemodellen først når
dyremodellen ikke finner noe. Begge caches i Cache API og hentes én gang per
enhet. Telefoner med 4 GB minne eller mindre holder bare én modell i live om
gangen.
