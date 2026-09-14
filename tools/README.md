# Artsmodeller — byggesteg

Dette er et engangssteg som kjøres lokalt. Spillet kjører det aldri. Resultatet
er tre små filer per modell som lastes opp til Hugging Face og hentes derfra av
nettleseren.

Spillet fungerer uten dette steget: står `KLASSIFISER.base` urørt i `index.html`,
bruker SKANN-skjermen det simulerte skannet akkurat som før.

## Hvorfor to modeller

Målt mot de 72 artene i `species.js`, mot modellenes faktiske labellister:

| | eksakt | slekt | familie | ingen |
|---|---|---|---|---|
| SpeciesNet 4.0.3b | 21 | 2 | 6 | 43 |
| birder `resnet_v2_50_inat21` | 53 | 10 | 4 | 5 |
| **beste av de to** | **58** | 6 | 3 | 5 |

SpeciesNet kjenner ingen planter, ingen sopp og ingen fisk, men den er sterkest
på viltkamera-pattedyrene. iNat21 dekker resten. Derfor begge: SpeciesNet først,
iNat21 når den første ikke gir et eksakt artstreff.

Kjør `node tools/dekning.js` etter hver utvidelse av `species.js`. Den henter
begge labellistene og rapporterer hvilke arter som er ufangbare. Skriptet
avslutter med feilkode hvis en art hverken dekkes av en modell eller av en
gruppebro.

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

```bash
node tools/dekning.js
python tools/test_ende_til_ende.py --modell inat21 --last-ned --ut /tmp/pred.json
node tools/mapping_av_predikasjoner.js /tmp/pred.json
```

`test_parity.py` kjører PyTorch og ONNX på de samme bildene og krever samme
topp-1. For int8 tillates 0,05 avvik i sannsynlighet, for fp16 1e-3.

`test_artsmapping.js` dekker mappingen fra modellabel til art i biblioteket
(30 tester). `dekning.js` er beskrevet over.

`test_ende_til_ende.py` kjører den eksporterte ONNX-fila på ekte bilder med
nøyaktig samme forbehandling som `klassifiser.js` gjør i nettleseren —
senterkvadrat, skalering, normalisering fra `meta.json`. Den fanger feil i
layout, mean/std og labelrekkefølge før de dukker opp på telefonen. Med
`--last-ned` henter den ett bilde per art fra Wikipedias REST-API.
`mapping_av_predikasjoner.js` tar topp-5-lista videre gjennom den ekte
`artsmapping.js` og sier hvilken art spillet ville gitt deg.

Målt resultat for `inat21` fp16, 10 bilder fra Wikipedia:

```
ok   bjork       -> BJØRK       SIKKER      22.0 %   modellen sa: Betula pubescens
ok   elg         -> ELG         SIKKER      45.5 %   modellen sa: Alces alces
ok   fluesopp    -> FLUESOPP    SIKKER      98.7 %   modellen sa: Amanita muscaria
ok   gran        -> GRAN        SIKKER      30.2 %   modellen sa: Picea obovata
ok   havorn      -> HAVØRN      SIKKER      91.5 %   modellen sa: Haliaeetus albicilla
ok   kantarell   -> KANTARELL   SIKKER      98.2 %   modellen sa: Cantharellus cibarius
ok   rev         -> REV         SIKKER      94.3 %   modellen sa: Vulpes vulpes
ok   rosslyng    -> RØSSLYNG    SIKKER      92.9 %   modellen sa: Calluna vulgaris
FEIL tare        -> INGEN       UKJENT ART   8.2 %   modellen sa: Limulus polyphemus
ok*  torsk       -> SEI         USIKKER     58.9 %   modellen sa: Mullus surmuletus
```

`gran` viser hvorfor mappingen ser på hele topp-5: modellens førstevalg er
`Picea obovata`, men `Picea abies` ligger på plass to og vinner fordi et
eksakt artstreff slår en slektsgjetning.

`tare` er den ærlige svakheten. På et undervannsbilde av stortare svarte
modellen `Limulus polyphemus` — dolkhale — med 8,2 %. Ingen algeklasse i
topp-5, så gruppebroen fyrte ikke. Broen redder tangartene bare når modellen
i det minste ser at det er en alge. I praksis er `tare`, `sukkertare` og
`grisetang` fortsatt vanskelige å fange.

## Arter ingen modell kjenner

Fem arter har null dekning: `torsk`, `sei`, `tare`, `sukkertare` og
`grisetang`. SpeciesNet har ingen fisk overhodet, iNat21 har 183 fiskearter
men ingen Gadiformes, og brunalger finnes ingen steder.

`GRUPPEBRO` i `artsmapping.js` fanger dem på høyere taksonomisk nivå: alt som
er `Actinopterygii` og ikke allerede er plassert lander på en av gadidene, og
alt som er rød-, grønn- eller brunalge lander på en av tangartene. Resultatet
merkes alltid USIKKER, så spilleren ser at det var en gjetning. Broen sjekkes
etter slekt og familie, så en laks treffer `Salmo salar` eksakt og når aldri
broen.

## Uavgjort mellom flere arter

Når en slekt eller familie rommer flere av spillets arter — `Vulpes` har både
rev og fjellrev, `Ericaceae` har fire — velges først en art spilleren mangler,
deretter den minst sjeldne. Uten den første regelen ville fjellrev vært
umulig: ingen modell kjenner `Vulpes lagopus`, så fjellrev nås bare på
slektsnivå, og der ville rev alltid vunnet.

## XP etter sikkerhet

`NIVA_XP` i `app.js` skalerer utbyttet: sikkert artstreff 1,0, nærmeste
slektning 0,6, usikker 0,35. Det simulerte skannet har ikke noe nivå og gir
full uttelling som før.

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
