/* VILLMARK - ekte artsgjenkjenning i nettleseren
   SpeciesNet 4.0.3b for dyr, birder resnet_v2_50_inat21 for planter og sopp.
   Begge som int8 ONNX gjennom onnxruntime-web.

   Kjorer paa GitHub Pages uten COOP/COEP, saa:
     - numThreads = 1 (SharedArrayBuffer er ikke tilgjengelig)
     - proxy = true, slik at inferensen ligger i en worker og 3D-scenen
       fortsetter aa animere mens telefonen regner

   Modellene ligger ikke i repoet. Sett MODELL_BASE til HF-repoet ditt. */

const KLASSIFISER = (() => {
'use strict';

const ORT_VERSJON = '1.29.0';
const ORT_BASE    = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@' + ORT_VERSJON + '/dist/';
const CACHE_NAVN  = 'villmark-modeller-v1';

/* Byttes ut med ditt eget HF-repo naar eksportskriptene har kjort.
   Filene som maa ligge der: <navn>.int8.onnx, <navn>.meta.json, <navn>.labels.json */
let MODELL_BASE = 'https://huggingface.co/DITT-BRUKERNAVN/villmark-modeller/resolve/main/';

const MODELLER = {
  speciesnet: { navn:'speciesnet', tittel:'DYREMODELL',  mb:55 },
  inat21:     { navn:'inat21',     tittel:'PLANTEMODELL', mb:45 },
};

/* Over denne sikkerheten stoler vi paa dyremodellen og hopper over plantemodellen.
   Under den provers plantemodellen ogsaa, og beste treff vinner. */
const TERSKEL_DYR = 0.45;

const sesjoner = new Map();   // navn -> {session, meta, labels}
const laster   = new Map();   // navn -> Promise, hindrer dobbel nedlasting
let ortLastet = null;

/* Telefoner med lite minne holder bare en modell i live om gangen. */
const SMALT_MINNE = (navigator.deviceMemory || 4) <= 4;

/* --- feiltyper som app.js skiller paa ------------------------------------ */
class NedlastingKrevesFeil extends Error {
  constructor(info){ super('nedlasting kreves'); this.navn = 'NedlastingKreves'; this.info = info; }
}
class ModellUtilgjengeligFeil extends Error {
  constructor(aarsak){ super(aarsak); this.navn = 'ModellUtilgjengelig'; }
}

/* --- onnxruntime-web ------------------------------------------------------ */
function lastOrt(){
  if(ortLastet) return ortLastet;
  ortLastet = new Promise((ok, feil) => {
    if(window.ort) return ok(window.ort);
    const s = document.createElement('script');
    s.src = ORT_BASE + 'ort.min.js';
    s.onload = () => ok(window.ort);
    s.onerror = () => feil(new ModellUtilgjengeligFeil('fikk ikke lastet onnxruntime-web'));
    document.head.appendChild(s);
  }).then(ort => {
    ort.env.wasm.wasmPaths  = ORT_BASE;
    ort.env.wasm.numThreads = 1;      /* ingen cross-origin isolation paa Pages */
    ort.env.wasm.proxy      = true;   /* hold hovedtraaden fri paa mobil */
    ort.env.logLevel        = 'error';
    return ort;
  });
  return ortLastet;
}

/* --- nedlasting med fremdrift og varig cache ------------------------------ */
async function hentMedFremdrift(url, onFremdrift){
  let cache = null;
  try { cache = await caches.open(CACHE_NAVN); } catch(_){ /* privat modus */ }

  if(cache){
    const truffet = await cache.match(url);
    if(truffet){ onFremdrift && onFremdrift(1); return truffet.arrayBuffer(); }
  }

  const svar = await fetch(url);
  if(!svar.ok) throw new ModellUtilgjengeligFeil('HTTP ' + svar.status + ' for ' + url);

  const total = Number(svar.headers.get('content-length')) || 0;
  if(!svar.body || !total){
    const buf = await svar.arrayBuffer();
    if(cache) try { await cache.put(url, new Response(buf)); } catch(_){}
    onFremdrift && onFremdrift(1);
    return buf;
  }

  const biter = [];
  let lest = 0;
  const leser = svar.body.getReader();
  for(;;){
    const { done, value } = await leser.read();
    if(done) break;
    biter.push(value);
    lest += value.length;
    onFremdrift && onFremdrift(lest / total);
  }
  const buf = new Uint8Array(lest);
  let pek = 0;
  for(const b of biter){ buf.set(b, pek); pek += b.length; }
  if(cache) try { await cache.put(url, new Response(buf.slice().buffer)); } catch(_){}
  return buf.buffer;
}

async function hentJson(url){
  const svar = await fetch(url);
  if(!svar.ok) throw new ModellUtilgjengeligFeil('HTTP ' + svar.status + ' for ' + url);
  return svar.json();
}

/* --- lasting av en modell ------------------------------------------------- */
async function lastModell(navn, opt){
  opt = opt || {};
  if(sesjoner.has(navn)) return sesjoner.get(navn);
  if(laster.has(navn))   return laster.get(navn);

  const spec = MODELLER[navn];
  if(!spec) throw new ModellUtilgjengeligFeil('ukjent modell: ' + navn);

  /* Modellen lastes aldri uten at spilleren har sagt ja. Telefoner paa
     mobildata skal ikke tape 55 MB fordi noen trykket SKANN. */
  const iCache = await erCachet(navn);
  if(!iCache && !opt.godkjent) throw new NedlastingKrevesFeil({ ...spec });

  const jobb = (async () => {
    const ort  = await lastOrt();
    const base = MODELL_BASE + navn;
    const [meta, labels] = await Promise.all([
      hentJson(base + '.meta.json'),
      hentJson(base + '.labels.json'),
    ]);
    const buf = await hentMedFremdrift(base + '.int8.onnx', opt.onFremdrift);

    if(SMALT_MINNE) frigjorAndre(navn);

    const ep = (navigator.gpu ? ['webgpu', 'wasm'] : ['wasm']);
    let session;
    try {
      session = await ort.InferenceSession.create(buf, { executionProviders: ep, graphOptimizationLevel:'all' });
    } catch(e){
      /* WebGPU feiler stille paa en del Android-GPUer. Fall tilbake til wasm. */
      session = await ort.InferenceSession.create(buf, { executionProviders:['wasm'], graphOptimizationLevel:'all' });
    }
    const oppf = { session, meta, labels, navn };
    sesjoner.set(navn, oppf);
    laster.delete(navn);
    return oppf;
  })();

  laster.set(navn, jobb);
  jobb.catch(() => laster.delete(navn));
  return jobb;
}

async function erCachet(navn){
  try {
    const cache = await caches.open(CACHE_NAVN);
    return !!(await cache.match(MODELL_BASE + navn + '.int8.onnx'));
  } catch(_){ return false; }
}

function frigjorAndre(behold){
  for(const [navn, oppf] of sesjoner){
    if(navn === behold) continue;
    try { oppf.session.release(); } catch(_){}
    sesjoner.delete(navn);
  }
}

/* --- bildebehandling ------------------------------------------------------ */
const arbeidsLerret = document.createElement('canvas');
const arbeidsCtx    = arbeidsLerret.getContext('2d', { willReadFrequently:true });

/* Senterbeskjaering til kvadrat, saa skalering. Modellene er trent paa
   kvadratiske utsnitt; strekker vi 9:16 rett ned i 480x480 blir alt feil. */
function tilTensor(kilde, meta, ort){
  const h = meta.input[0], w = meta.input[1];
  const kw = kilde.videoWidth  || kilde.naturalWidth  || kilde.width;
  const kh = kilde.videoHeight || kilde.naturalHeight || kilde.height;
  if(!kw || !kh) throw new Error('tomt kamerabilde');

  const side = Math.min(kw, kh);
  arbeidsLerret.width = w; arbeidsLerret.height = h;
  arbeidsCtx.drawImage(kilde, (kw - side) / 2, (kh - side) / 2, side, side, 0, 0, w, h);
  const data = arbeidsCtx.getImageData(0, 0, w, h).data;

  const mean  = meta.mean  || [0, 0, 0];
  const std   = meta.std   || [1, 1, 1];
  const skala = meta.scale != null ? meta.scale : 1 / 255;
  const ut    = new Float32Array(3 * h * w);
  const plan  = h * w;

  /* SpeciesNet tar NHWC og rene [0,1]-verdier, iNat21-modellen tar NCHW med
     ImageNet-normalisering. Formen staar i meta.json fra eksportskriptet. */
  if(meta.layout === 'NHWC'){
    for(let i = 0, px = 0; i < plan; i++, px += 4){
      ut[i * 3]     = (data[px]     * skala - mean[0]) / std[0];
      ut[i * 3 + 1] = (data[px + 1] * skala - mean[1]) / std[1];
      ut[i * 3 + 2] = (data[px + 2] * skala - mean[2]) / std[2];
    }
    return new ort.Tensor('float32', ut, [1, h, w, 3]);
  }

  for(let i = 0, px = 0; i < plan; i++, px += 4){
    ut[i]            = (data[px]     * skala - mean[0]) / std[0];
    ut[i + plan]     = (data[px + 1] * skala - mean[1]) / std[1];
    ut[i + 2 * plan] = (data[px + 2] * skala - mean[2]) / std[2];
  }
  return new ort.Tensor('float32', ut, [1, 3, h, w]);
}

function softmax(v){
  let maks = -Infinity;
  for(const x of v) if(x > maks) maks = x;
  let sum = 0;
  const ut = new Float64Array(v.length);
  for(let i = 0; i < v.length; i++){ ut[i] = Math.exp(v[i] - maks); sum += ut[i]; }
  for(let i = 0; i < v.length; i++) ut[i] /= sum;
  return ut;
}

function toppK(sannsyn, labels, k){
  const idx = Array.from(sannsyn.keys());
  idx.sort((a, b) => sannsyn[b] - sannsyn[a]);
  return idx.slice(0, k).map(i => ({ label: labels[i], p: sannsyn[i] }));
}

async function kjor(oppf, kilde, ort){
  const tensor = tilTensor(kilde, oppf.meta, ort);
  const inn = {};
  inn[oppf.session.inputNames[0]] = tensor;
  const ut  = await oppf.session.run(inn);
  const raa = ut[oppf.session.outputNames[0]].data;
  const p   = oppf.meta.softmax === false ? raa : softmax(raa);
  return toppK(p, oppf.labels, 5);
}

/* --- hovedinngangen ------------------------------------------------------- */
/* kilde: <video>, <canvas> eller ImageBitmap
   opt.onFase(fase, andel) - 'laster' | 'regner'
   opt.bekreftNedlasting(info) -> Promise<bool>
   Returnerer {id, niva, nivaTekst, latin, felles, p, kilde} */
async function klassifiser(kilde, opt){
  opt = opt || {};
  const ort = await lastOrt();

  const hent = async (navn) => {
    try {
      return await lastModell(navn, {
        onFremdrift: a => opt.onFase && opt.onFase('laster', a),
      });
    } catch(e){
      if(e.navn !== 'NedlastingKreves') throw e;
      const ja = opt.bekreftNedlasting ? await opt.bekreftNedlasting(e.info) : false;
      if(!ja) throw e;
      return lastModell(navn, {
        godkjent: true,
        onFremdrift: a => opt.onFase && opt.onFase('laster', a),
      });
    }
  };

  /* 1. Dyremodellen forst. Den dekker alle 16 dyrene i biblioteket. */
  const dyr = await hent('speciesnet');
  opt.onFase && opt.onFase('regner', 0);
  const dyrePred = await kjor(dyr, kilde, ort);
  const dyreSvar = ARTSMAPPING.beste(dyrePred, 'speciesnet');
  opt.onFase && opt.onFase('regner', 0.5);

  if(dyreSvar.id && dyreSvar.niva <= 1 && dyreSvar.p >= TERSKEL_DYR){
    opt.onFase && opt.onFase('regner', 1);
    return dyreSvar;
  }

  /* 2. Ellers plantemodellen, som ogsaa dekker sopp. */
  let planteSvar = null;
  try {
    const plante = await hent('inat21');
    const pred = await kjor(plante, kilde, ort);
    planteSvar = ARTSMAPPING.beste(pred, 'inat21');
  } catch(e){
    if(e.navn !== 'NedlastingKreves') throw e;
    /* Spilleren sa nei til plantemodellen. Da faar dyresvaret staa. */
  }
  opt.onFase && opt.onFase('regner', 1);

  if(!planteSvar) return dyreSvar;
  if(!dyreSvar.id) return planteSvar;
  if(!planteSvar.id) return dyreSvar;
  if(planteSvar.niva !== dyreSvar.niva) return planteSvar.niva < dyreSvar.niva ? planteSvar : dyreSvar;
  return planteSvar.p > dyreSvar.p ? planteSvar : dyreSvar;
}

/* Sann naar MODELL_BASE faktisk peker paa noe. Brukes av app.js til aa
   velge mellom ekte skann og det simulerte. */
function konfigurert(){
  return !/DITT-BRUKERNAVN/.test(MODELL_BASE);
}

async function status(){
  return {
    konfigurert: konfigurert(),
    base: MODELL_BASE,
    speciesnet: await erCachet('speciesnet'),
    inat21: await erCachet('inat21'),
  };
}

async function tomCache(){
  try { await caches.delete(CACHE_NAVN); } catch(_){}
  frigjorAndre(null);
}

return {
  klassifiser, status, tomCache, konfigurert, lastModell,
  get base(){ return MODELL_BASE; },
  set base(v){ MODELL_BASE = v.endsWith('/') ? v : v + '/'; },
  MODELLER, TERSKEL_DYR,
};
})();

if(typeof window !== 'undefined') window.KLASSIFISER = KLASSIFISER;
