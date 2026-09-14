/* VILLMARK - real species recognition in the browser
   birder resnet_v2_50_inat21 first, SpeciesNet 4.0.3b as the specialist on
   camera-trap mammals. Both as int8 ONNX through onnxruntime-web.

   Runs on GitHub Pages without COOP/COEP, so:
     - numThreads = 1 (SharedArrayBuffer is not available)
     - proxy = true, so inference sits in a worker and the 3D scene keeps
       animating while the phone computes

   The models are not in the repo. Point MODEL_BASE at your own HF repo.
   The files that must live there, per model:
     <name>.onnx  <name>.meta.json  <name>.labels.json */

const CLASSIFIER = (() => {
'use strict';

const ORT_VERSION = '1.29.0';
const ORT_BASE    = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@' + ORT_VERSION + '/dist/';
const CACHE_NAME  = 'villmark-models-v1';

/* Swap in your own HF repo once the export scripts have run. */
let MODEL_BASE = 'https://huggingface.co/YOUR-USERNAME/villmark-modeller/resolve/main/';

/* inat21 loads first and covers everything, so it is called SPECIES MODEL.
   SpeciesNet is the add-on, fetched only when the first one is not certain.
   mb is an estimate used only if the HEAD call does not answer. */
const MODELS = {
  inat21:     { name:'inat21',     title:'SPECIES MODEL', mb:45 },
  speciesnet: { name:'speciesnet', title:'ANIMAL MODEL',  mb:112 },
};

/* An exact species hit above this confidence ends the scan. Below it we also
   run the other model, and the best hit wins. */
const EXACT_THRESHOLD = 0.45;

/* If SpeciesNet says "blank" with at least this confidence, there is no animal
   in the picture, and a weak guess from iNat21 is discarded. */
const BLANK_VETO = 0.60;

const sessions = new Map();   // name -> {session, meta, labels}
const loading  = new Map();   // name -> Promise, prevents a double download
const missing  = new Set();   // models that do not exist, remembered for the session
const wasmOnly = new Set();   // models where WebGPU is no good, remembered for the session
let ortLoaded = null;

/* Phones with little memory keep only one model alive at a time. */
const LOW_MEMORY = (navigator.deviceMemory || 4) <= 4;

/* --- error types app.js tells apart -------------------------------------- */
class DownloadRequiredError extends Error {
  constructor(info){ super('download required'); this.name = 'DownloadRequired'; this.info = info; }
}
class ModelUnavailableError extends Error {
  constructor(reason){ super(reason); this.name = 'ModelUnavailable'; }
}

/* --- onnxruntime-web ------------------------------------------------------ */
function loadOrt(){
  if(ortLoaded) return ortLoaded;
  ortLoaded = new Promise((ok, fail) => {
    if(window.ort) return ok(window.ort);
    const s = document.createElement('script');
    s.src = ORT_BASE + 'ort.min.js';
    s.onload = () => ok(window.ort);
    s.onerror = () => fail(new ModelUnavailableError('could not load onnxruntime-web'));
    document.head.appendChild(s);
  }).then(ort => {
    ort.env.wasm.wasmPaths  = ORT_BASE;
    ort.env.wasm.numThreads = 1;      /* no cross-origin isolation on Pages */
    ort.env.wasm.proxy      = true;   /* keep the main thread free on mobile */
    ort.env.logLevel        = 'error';
    return ort;
  });
  return ortLoaded;
}

/* --- download with progress and a lasting cache --------------------------- */
async function fetchWithProgress(url, onProgress){
  let cache = null;
  try { cache = await caches.open(CACHE_NAME); } catch(_){ /* private mode */ }

  if(cache){
    const hit = await cache.match(url);
    if(hit){ onProgress && onProgress(1); return hit.arrayBuffer(); }
  }

  const response = await fetch(url);
  if(!response.ok) throw new ModelUnavailableError('HTTP ' + response.status + ' for ' + url);

  const total = Number(response.headers.get('content-length')) || 0;
  if(!response.body || !total){
    const buf = await response.arrayBuffer();
    if(cache) try { await cache.put(url, new Response(buf)); } catch(_){}
    onProgress && onProgress(1);
    return buf;
  }

  const chunks = [];
  let read = 0;
  const reader = response.body.getReader();
  for(;;){
    const { done, value } = await reader.read();
    if(done) break;
    chunks.push(value);
    read += value.length;
    onProgress && onProgress(read / total);
  }
  const buf = new Uint8Array(read);
  let ptr = 0;
  for(const b of chunks){ buf.set(b, ptr); ptr += b.length; }
  if(cache) try { await cache.put(url, new Response(buf.slice().buffer)); } catch(_){}
  return buf.buffer;
}

async function fetchJson(url){
  const response = await fetch(url);
  if(!response.ok) throw new ModelUnavailableError('HTTP ' + response.status + ' for ' + url);
  return response.json();
}

/* --- loading one model ---------------------------------------------------- */
async function loadModel(name, opt){
  opt = opt || {};
  if(sessions.has(name)) return sessions.get(name);
  if(loading.has(name))  return loading.get(name);

  const spec = MODELS[name];
  if(!spec) throw new ModelUnavailableError('unknown model: ' + name);

  /* If the files were missing once, they are missing for the rest of the
     session too. Without this, every single scan knocks on three 404s that
     are never going to answer. */
  if(missing.has(name)) throw new ModelUnavailableError(name + ' does not exist at ' + MODEL_BASE);

  /* The model is never loaded without the player saying yes. Phones on mobile
     data should not lose 55 MB because someone pressed SCAN.
     The size is fetched with HEAD, so the dialog shows the actual file and not
     an estimate - fp16 and int8 are twice the size of each other. */
  const cached = await isCached(name);
  if(!cached && !opt.approved){
    const mb = await fileSizeMb(name);
    throw new DownloadRequiredError({ ...spec, mb: mb || spec.mb });
  }

  const job = (async () => {
    const ort  = await loadOrt();
    const base = MODEL_BASE + name;
    const [meta, labels] = await Promise.all([
      fetchJson(base + '.meta.json'),
      fetchJson(base + '.labels.json'),
    ]);
    const buf = await fetchWithProgress(base + '.onnx', opt.onProgress);

    if(LOW_MEMORY) releaseOthers(name);

    /* The WebGPU backend in onnxruntime-web 1.29 cannot handle per-channel
       quantized DequantizeLinear nodes: it requires scale and zero_point to
       have the same rank, while per-channel gives a 1-D scale and a scalar
       zero_point. It then fails with "scale and zero-point inputs must have
       the same rank" - but only at run time, not at creation, so a try/catch
       here catches nothing. int8 models therefore go straight to wasm. */
    const webgpuOk = navigator.gpu && meta.precision !== 'int8' && !wasmOnly.has(name);
    let session, ep;

    /* ort.env.wasm.proxy = true transfers the model buffer to the worker, and
       the transfer detaches it. A second attempt on that same buffer then dies
       with "buffer already detached" instead of the real error. The spare copy
       is therefore made before the first attempt, and only when a second
       attempt actually exists - int8 goes straight to wasm, and there is
       nothing to fall back to there. */
    if(!webgpuOk){
      ep = ['wasm'];
      session = await ort.InferenceSession.create(buf, { executionProviders: ep, graphOptimizationLevel:'all' });
    } else {
      const spare = buf.slice(0);
      try {
        ep = ['webgpu', 'wasm'];
        session = await ort.InferenceSession.create(buf, { executionProviders: ep, graphOptimizationLevel:'all' });
      } catch(e){
        /* WebGPU also fails silently on a number of Android GPUs. */
        console.warn('CLASSIFIER: WebGPU is no good for', name, '-', e.message);
        wasmOnly.add(name);
        ep = ['wasm'];
        session = await ort.InferenceSession.create(spare, { executionProviders: ep, graphOptimizationLevel:'all' });
      }
    }
    const entry = { session, meta, labels, name, ep };
    sessions.set(name, entry);
    loading.delete(name);
    return entry;
  })();

  loading.set(name, job);
  job.catch(e => {
    loading.delete(name);
    if(e && e.name === 'ModelUnavailable') missing.add(name);
  });
  return job;
}

/* HEAD against the model file. Zero if it does not answer - then the estimate is used. */
async function fileSizeMb(name){
  try {
    const response = await fetch(MODEL_BASE + name + '.onnx', { method:'HEAD' });
    if(!response.ok) return 0;
    const n = Number(response.headers.get('content-length'));
    return n ? Math.round(n / 1e6) : 0;
  } catch(_){ return 0; }
}

async function isCached(name){
  try {
    const cache = await caches.open(CACHE_NAME);
    return !!(await cache.match(MODEL_BASE + name + '.onnx'));
  } catch(_){ return false; }
}

function release(name){
  const entry = sessions.get(name);
  if(!entry) return;
  try { entry.session.release(); } catch(_){}
  sessions.delete(name);
}

function releaseOthers(keep){
  for(const [name, entry] of sessions){
    if(name === keep) continue;
    try { entry.session.release(); } catch(_){}
    sessions.delete(name);
  }
}

/* --- image handling ------------------------------------------------------- */
const workCanvas = document.createElement('canvas');
const workCtx    = workCanvas.getContext('2d', { willReadFrequently:true });

/* Center crop to a square, then scale. The models are trained on square crops;
   stretching 9:16 straight down into 480x480 makes everything wrong. */
function toTensor(source, meta, ort){
  const h = meta.input[0], w = meta.input[1];
  const sw = source.videoWidth  || source.naturalWidth  || source.width;
  const sh = source.videoHeight || source.naturalHeight || source.height;
  if(!sw || !sh) throw new Error('empty camera frame');

  const side = Math.min(sw, sh);
  workCanvas.width = w; workCanvas.height = h;
  workCtx.drawImage(source, (sw - side) / 2, (sh - side) / 2, side, side, 0, 0, w, h);
  const data = workCtx.getImageData(0, 0, w, h).data;

  const mean  = meta.mean  || [0, 0, 0];
  const std   = meta.std   || [1, 1, 1];
  const scale = meta.scale != null ? meta.scale : 1 / 255;
  const out   = new Float32Array(3 * h * w);
  const plane = h * w;

  /* SpeciesNet takes NHWC and plain [0,1] values, the iNat21 model takes NCHW
     with ImageNet normalization. The shape is in meta.json from the export script. */
  if(meta.layout === 'NHWC'){
    for(let i = 0, px = 0; i < plane; i++, px += 4){
      out[i * 3]     = (data[px]     * scale - mean[0]) / std[0];
      out[i * 3 + 1] = (data[px + 1] * scale - mean[1]) / std[1];
      out[i * 3 + 2] = (data[px + 2] * scale - mean[2]) / std[2];
    }
    return new ort.Tensor('float32', out, [1, h, w, 3]);
  }

  for(let i = 0, px = 0; i < plane; i++, px += 4){
    out[i]             = (data[px]     * scale - mean[0]) / std[0];
    out[i + plane]     = (data[px + 1] * scale - mean[1]) / std[1];
    out[i + 2 * plane] = (data[px + 2] * scale - mean[2]) / std[2];
  }
  return new ort.Tensor('float32', out, [1, 3, h, w]);
}

/* How sure is SpeciesNet that the picture holds no animal?
   The label format is "uuid;class;order;family;genus;species;common name". */
function blankConfidence(predictions){
  for(const pred of predictions){
    const common = String(pred.label).split(';').pop().trim().toLowerCase();
    if(common === 'blank') return pred.p;
  }
  return 0;
}

function softmax(v){
  let max = -Infinity;
  for(const x of v) if(x > max) max = x;
  let sum = 0;
  const out = new Float64Array(v.length);
  for(let i = 0; i < v.length; i++){ out[i] = Math.exp(v[i] - max); sum += out[i]; }
  for(let i = 0; i < v.length; i++) out[i] /= sum;
  return out;
}

function topK(probs, labels, k){
  const idx = Array.from(probs.keys());
  idx.sort((a, b) => probs[b] - probs[a]);
  return idx.slice(0, k).map(i => ({ label: labels[i], p: probs[i] }));
}

/* Safety net for runtime errors we did not foresee. If the run breaks on a
   session using WebGPU, we rebuild it on wasm and try once more. The model is
   remembered as wasm-only for the rest of the session, so this happens once
   and not on every scan. */
async function runRobust(name, entry, source, ort){
  try {
    return await run(entry, source, ort);
  } catch(err){
    const usedGpu = entry.ep && entry.ep.indexOf('webgpu') !== -1;
    if(!usedGpu || wasmOnly.has(name)) throw err;
    /* The new session is built from a fresh buffer out of the cache. The old
       one lives in the worker and is detached. */
    console.warn('CLASSIFIER: WebGPU failed for', name, '- switching to wasm:', err.message);
    wasmOnly.add(name);
    release(name);
    const reloaded = await loadModel(name, { approved:true });
    return run(reloaded, source, ort);
  }
}

async function run(entry, source, ort){
  const tensor = toTensor(source, entry.meta, ort);
  const input = {};
  input[entry.session.inputNames[0]] = tensor;
  const out = await entry.session.run(input);
  const raw = out[entry.session.outputNames[0]].data;
  const p   = entry.meta.softmax === false ? raw : softmax(raw);
  return topK(p, entry.labels, 5);
}

/* --- the main entry point ------------------------------------------------- */
/* source: <video>, <canvas> or ImageBitmap
   opt.onPhase(phase, fraction) - 'loading' | 'computing'
   opt.confirmDownload(info) -> Promise<bool>
   Returns {id, level, levelText, latin, common, p, source} */
async function classify(source, opt){
  opt = opt || {};
  const ort = await loadOrt();

  /* Returns the model, or null when it does not exist or the player said no.
     Null matters: if you only uploaded one of the models, the other should be
     skipped in silence instead of taking the whole scan down with it. */
  const get = async (name) => {
    const progress = { onProgress: a => opt.onPhase && opt.onPhase('loading', a) };
    try {
      return await loadModel(name, progress);
    } catch(e){
      if(e.name === 'ModelUnavailable'){
        console.warn('CLASSIFIER: skipping', name, '-', e.message);
        return null;
      }
      if(e.name !== 'DownloadRequired') throw e;
      const yes = opt.confirmDownload ? await opt.confirmDownload(e.info) : false;
      if(!yes) return null;
      try {
        return await loadModel(name, { approved: true, ...progress });
      } catch(e2){
        if(e2.name === 'ModelUnavailable'){
          console.warn('CLASSIFIER: skipping', name, '-', e2.message);
          return null;
        }
        throw e2;
      }
    }
  };

  const mapOpt = { found: opt.found };

  /* 1. iNat21 first. It is the cheap model - 256x256 against SpeciesNet's
     480x480 - and hits 58 of the 72 species exactly, against SpeciesNet's 21.
     In the common case the scan is done here, and the heavy model is never
     downloaded. */
  let plantAnswer = null;
  const plant = await get('inat21');
  if(plant){
    opt.onPhase && opt.onPhase('computing', 0);
    plantAnswer = SPECIESMAPPING.best(await runRobust('inat21', plant, source, ort), 'inat21', mapOpt);
    opt.onPhase && opt.onPhase('computing', 0.5);

    if(plantAnswer.id && plantAnswer.level === 0 && plantAnswer.p >= EXACT_THRESHOLD){
      opt.onPhase && opt.onPhase('computing', 1);
      return plantAnswer;
    }
  }

  /* 2. SpeciesNet as the specialist. It knows Lepus timidus, Lynx lynx,
     Gulo gulo and Vulpes lagopus, which iNat21 only reaches at genus level. */
  let animalAnswer = null, blankP = 0;
  const animal = await get('speciesnet');
  if(animal){
    const animalPred = await runRobust('speciesnet', animal, source, ort);
    animalAnswer = SPECIESMAPPING.best(animalPred, 'speciesnet', mapOpt);
    blankP = blankConfidence(animalPred);
  }
  opt.onPhase && opt.onPhase('computing', 1);

  /* SpeciesNet has its own "blank" class for pictures without animals. If it
     says blank with weight, and iNat21 only has a guess at genus or family
     level, there is nothing there. Without this veto a picture of a desk
     turned into EAGLE OWL at 5%. An exact species hit survives - SpeciesNet
     says blank on every plant and fungus, which it does not know. */
  if(blankP >= BLANK_VETO && plantAnswer && plantAnswer.level > 0){
    return { id:null, level:3, levelText: SPECIESMAPPING.LEVEL_TEXT[3],
             latin: plantAnswer.latin, common: plantAnswer.common,
             p: plantAnswer.p, source:'speciesnet' };
  }

  /* No model came through. Then app.js should fall back to the simulated scan. */
  if(!animalAnswer && !plantAnswer){
    throw new ModelUnavailableError('none of the models could be loaded');
  }
  if(!plantAnswer) return animalAnswer;
  if(!animalAnswer) return plantAnswer;
  if(!animalAnswer.id) return plantAnswer;
  if(!plantAnswer.id) return animalAnswer;
  if(plantAnswer.level !== animalAnswer.level) return plantAnswer.level < animalAnswer.level ? plantAnswer : animalAnswer;
  return plantAnswer.p > animalAnswer.p ? plantAnswer : animalAnswer;
}

/* True when MODEL_BASE actually points at something. Used by app.js to choose
   between the real scan and the simulated one. */
function configured(){
  return !/YOUR-USERNAME/.test(MODEL_BASE);
}

async function status(){
  return {
    configured: configured(),
    base: MODEL_BASE,
    speciesnet: await isCached('speciesnet'),
    inat21: await isCached('inat21'),
    missing: [...missing],
    wasmOnly: [...wasmOnly],
  };
}

async function clearCache(){
  try { await caches.delete(CACHE_NAME); } catch(_){}
  releaseOthers(null);
  missing.clear();
  wasmOnly.clear();
}

return {
  classify, status, clearCache, configured, loadModel,
  get base(){ return MODEL_BASE; },
  set base(v){ MODEL_BASE = v.endsWith('/') ? v : v + '/'; },
  MODELS, EXACT_THRESHOLD,
};
})();

if(typeof window !== 'undefined') window.CLASSIFIER = CLASSIFIER;
