/* VILLMARK - app-logikk og 3D-scener */
(() => {
'use strict';

// ============================================================ oppsett
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
/* uten tonekartlegging klippes lyse flater (sand, snoe) til rent hvitt */
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

let W=0, H=0;
/* Telefoner er hoye og smale. Med fast vertikal fov blir horisontal fov
   saa smal at alt havner utenfor bildet. Vi laaser derfor HORISONTAL fov
   og regner den vertikale ut fra sideforholdet. */
function settFov(cam){
  const hfov = cam.userData.hfov;
  if(!hfov) return;
  const halvH = Math.atan(Math.tan(hfov*Math.PI/360) / cam.aspect);
  cam.fov = halvH*360/Math.PI;
}
function resize(){
  /* paa brede skjermer holder CSS lerretet i telefonformat.
     Bruk maalt storrelse, ellers blir bildet strukket og etikettene
     havner utenfor rammen. */
  const boks = canvas.getBoundingClientRect();
  W = Math.round(boks.width)  || innerWidth;
  H = Math.round(boks.height) || innerHeight;
  renderer.setSize(W,H,false);
  for(const s of Object.values(SCENES)) if(s && s.cam){
    s.cam.aspect = W/H;
    settFov(s.cam);
    s.cam.updateProjectionMatrix();
  }
}
addEventListener('resize', resize);

const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const rnd  = (a,b) => a + Math.random()*(b-a);
const rndi = (a,b) => Math.floor(rnd(a,b+1));
const pick = arr => arr[rndi(0,arr.length-1)];
const clamp = (v,a,b) => Math.max(a, Math.min(b,v));

// ============================================================ tilstand
function sesongFraDato(d = new Date()){
  const m = d.getMonth();
  if(m <= 1 || m === 11) return 'vinter';
  if(m <= 4) return 'vaar';
  if(m <= 7) return 'sommer';
  return 'host';
}

const STATE = {
  funnet: new Set(),
  varianter: {},          // artsid -> variantnoekkel
  mynt: 120,
  niva: 3,
  kjopt: new Set(),      // hageting fra butikken
  sistLagt: null,        // art som skal vokse fram paa plenen
  malArt: null,
  malVariant: null,
  sesong: sesongFraDato(),
};

/** trekk variant ved skanning - de fleste funn er vanlige */
function trekkVariant(){
  let r = Math.random();
  for(const k in VARIANTER){
    if(r < VARIANTER[k].sjanse) return k;
    r -= VARIANTER[k].sjanse;
  }
  return null;
}
function variantAv(id){ return STATE.varianter[id] || null; }
function visningsNavn(id){
  const v = variantAv(id);
  return v ? VARIANTER[v].navn + ' ' + SPECIES_BY_ID[id].navn : SPECIES_BY_ID[id].navn;
}

// ============================================================ lyd
const LYD = (() => {
  let ctx = null;
  let av = false;
  function c(){
    if(av) return null;
    if(!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if(ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(f1, f2, dur, type, vol){
    const a = c(); if(!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f1, a.currentTime);
    if(f2 && f2 !== f1) o.frequency.exponentialRampToValueAtTime(f2, a.currentTime + dur);
    g.gain.setValueAtTime(vol ?? 0.05, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.connect(g); g.connect(a.destination);
    o.start(); o.stop(a.currentTime + dur + 0.02);
  }
  function akkord(noter, dur, vol){
    noter.forEach((f,i) => setTimeout(() => tone(f, f, dur, 'triangle', vol ?? 0.05), i*70));
  }
  return {
    klikk:  () => tone(620, 480, 0.05, 'square', 0.035),
    steg:   () => tone(180, 140, 0.04, 'sine', 0.02),
    naer:   () => tone(880, 1180, 0.07, 'sine', 0.03),
    skann:  () => tone(300, 1400, 0.5, 'sawtooth', 0.025),
    funn:   () => akkord([523, 659, 784, 1046], 0.22, 0.05),
    sjelden:() => akkord([659, 880, 1174, 1568, 2093], 0.3, 0.055),
    treff:  () => tone(220, 90, 0.16, 'square', 0.06),
    skade:  () => tone(160, 70, 0.2, 'sawtooth', 0.05),
    seier:  () => akkord([523, 659, 784, 1046, 1318], 0.26, 0.055),
    tap:    () => akkord([392, 330, 262], 0.34, 0.05),
    av:     () => av,
    demp:   () => { av = !av; return av; },
  };
})();

function dirr(m){ if(navigator.vibrate) { try { navigator.vibrate(m); } catch(e){} } }

// ============================================================ posisjon
let GEO = null;
function startGeo(){
  if(!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    p => { GEO = { lat:p.coords.latitude, lon:p.coords.longitude }; },
    () => {}, { timeout:5000, maximumAge:600000 });
}
function geoTekst(){
  const drift = (Math.random()-0.5)*0.0009;
  const lat = (GEO ? GEO.lat : 63.4305) + drift;
  const lon = (GEO ? GEO.lon : 10.3951) + drift;
  return `N ${lat.toFixed(4)}\u00b0 \u00b7 \u00d8 ${lon.toFixed(4)}\u00b0`;
}

// ============================================================ lys
function standardLys(scene, opt={}){
  scene.add(new THREE.HemisphereLight(opt.sky ?? 0xbdd8ff, opt.ground ?? 0x3a4a32, 0.85));
  const sun = new THREE.DirectionalLight(0xfff3d6, 1.05);
  sun.position.set(14, 26, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024,1024);
  const d = opt.skygge ?? 22;
  sun.shadow.camera.left=-d; sun.shadow.camera.right=d;
  sun.shadow.camera.top=d;   sun.shadow.camera.bottom=-d;
  sun.shadow.camera.far = 90;
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xffffff, 0.22));
  return sun;
}

function sesongPalett(farger){
  const fx = SESONG_FX[STATE.sesong];
  return fx ? farger.map(fx) : farger;
}

function bakke(bredde, farger, kant){
  const v = new Vox();
  const h = Math.floor(bredde/2);
  for(let x=-h;x<h;x++) for(let z=-h;z<h;z++){
    const r = Math.hypot(x,z);
    if(kant && r > h-0.5) continue;
    v.set(x,0,z, pick(farger));
    if(kant && r > h-2.5) v.set(x,-1,z, 0x5a4a34);
  }
  const m = voxMesh(v, {noise:0.09});
  // kantlaget (y=-1) skyver hele meshen opp; trekk den ned igjen
  // slik at bakkeflata alltid ligger i y=1, der figurene staar
  if(kant) m.position.y = -1;
  m.receiveShadow = true; m.castShadow = false;
  return m;
}

// ============================================================ scener
const SCENES = {};
function nyScene(clear, alpha=1, hfov=55){
  const sc = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(46, 1, 0.1, 320);
  cam.userData.hfov = hfov;
  return { scene:sc, cam, clear, alpha, update:null, enter:null, exit:null };
}

// ------------------------------------------------ SPLASH
(() => {
  const S = nyScene(0x8fc4e8, 1, 52);
  S.scene.fog = new THREE.Fog(0x8fc4e8, 40, 86);
  standardLys(S.scene, {skygge:18});
  S.cam.position.set(0, 15, 30);

  const oy = new THREE.Group();
  oy.add(bakke(22, sesongPalett([0x3f7a3f,0x468644,0x376f39,0x4c8f49]), true));
  S.scene.add(oy);

  // trær + sopp
  for(let i=0;i<11;i++){
    const t = modellSkalert('gran', rnd(3.4,4.8), {sesong:STATE.sesong});
    const a = rnd(0,Math.PI*2), r = rnd(4.5,9.5);
    t.position.set(Math.cos(a)*r, 1, Math.sin(a)*r);
    t.rotation.y = rnd(0,6.28);
    oy.add(t);
  }
  for(let i=0;i<6;i++){
    const s = modellSkalert(pick(['fluesopp','blaveis','tyttebaer','kantarell','molte']), rnd(0.8,1.2), {sesong:STATE.sesong});
    const a = rnd(0,Math.PI*2), r = rnd(2.5,8);
    s.position.set(Math.cos(a)*r, 1, Math.sin(a)*r);
    s.rotation.y = rnd(0,6.28);
    oy.add(s);
  }
  // rev som går i ring
  const rev = modellSkalert('rev', 1.5);
  oy.add(rev);
  let t0 = 0;
  S.update = (dt) => {
    t0 += dt;
    oy.rotation.y += dt*0.12;
    const a = t0*0.55, r = 5.2;
    rev.position.set(Math.cos(a)*r, 1 + Math.abs(Math.sin(t0*6))*0.12, Math.sin(a)*r);
    rev.rotation.y = -a + Math.PI/2;
    S.cam.position.y = 15 + Math.sin(t0*0.5)*0.9;
    S.cam.lookAt(0, 2.5, 0);
  };
  SCENES.splash = S;
})();

// ------------------------------------------------ PLENEN (FELT)
/* Plenen er stor. Du flytter deg ikke selv - du drar kameraet over graset
   med fingeren, kniper for aa zoome, og trykker paa en art for aa se kortet. */
const PLEN_R     = 48;      // halve plenen i voxelruter
const PLEN_SKALA = 1.55;    // artene staar litt storre enn kortformatet
const PROP_SKALA = 0.3;     // hageting er bygget i finere voxelrutenett
const DAM_MIDT   = { x:-13, z:9, r:6 };
const AKVATISK   = { torsk:1, tare:1, steinkobbe:1, oter:1 };

const FELT = (() => {
  const S = nyScene(0x9ed0ef, 1, 56);
  S.scene.fog = new THREE.Fog(0x9ed0ef, 60, 150);
  standardLys(S.scene, {skygge:46});

  const rot = new THREE.Group();
  S.scene.add(rot);

  const arter = [];         // {grp, art, base, fase, r, plante, baseY, vokse}
  const plukkbare = [];
  let dam = null;
  const kam = { x:0, z:0, avstand:26, vinkel:0.62 };
  const mal = { x:0, z:0, avstand:26 };
  let t0 = 0;

  S.update = dt => {
    t0 += dt;
    const k = Math.min(1, dt*9);
    kam.x       += (mal.x - kam.x) * k;
    kam.z       += (mal.z - kam.z) * k;
    kam.avstand += (mal.avstand - kam.avstand) * k;
    const d = kam.avstand;
    S.cam.position.set(kam.x + Math.sin(kam.vinkel)*d, d*0.62, kam.z + Math.cos(kam.vinkel)*d);
    S.cam.lookAt(kam.x, 1, kam.z);

    for(const o of arter){
      if(o.vokse < 1){
        o.vokse = Math.min(1, o.vokse + dt*1.7);
        const e = 1 - Math.pow(1-o.vokse, 3);
        o.grp.scale.setScalar(e * (1 + Math.sin(o.vokse*Math.PI)*0.14));
      }
      if(o.plante) continue;
      o.fase += dt * (0.22 + SPECIES_BY_ID[o.art].fart/150);
      o.grp.position.x = o.base.x + Math.cos(o.fase)*o.r;
      o.grp.position.z = o.base.z + Math.sin(o.fase)*o.r;
      o.grp.rotation.y = -o.fase + Math.PI/2;
      o.grp.position.y = o.baseY + Math.abs(Math.sin(o.fase*6))*0.12;
    }
    if(dam) dam.position.y = 0.96 + Math.sin(t0*1.2)*0.035;
  };

  SCENES.field = S;
  return {
    S, rot, arter, plukkbare, kam,
    settDam: m => dam = m,
    /** dra: flytt kameraet langs bakken i skjermens retning */
    panorer: (dx, dy) => {
      const f = kam.avstand * 0.0023;
      const hx = Math.cos(kam.vinkel), hz = -Math.sin(kam.vinkel);   // skjerm hoyre
      const fx = -Math.sin(kam.vinkel), fz = -Math.cos(kam.vinkel);  // inn i skjermen
      mal.x = clamp(mal.x - hx*dx*f + fx*dy*f, -PLEN_R+8, PLEN_R-8);
      mal.z = clamp(mal.z - hz*dx*f + fz*dy*f, -PLEN_R+8, PLEN_R-8);
    },
    zoom: dz => { mal.avstand = clamp(mal.avstand + dz, 11, 60); },
    tilPunkt: (x, z) => { mal.x = clamp(x, -PLEN_R+8, PLEN_R-8); mal.z = clamp(z, -PLEN_R+8, PLEN_R-8); },
  };
})();

/** gylden vinkel: artene brer seg utover plenen etter hvert som du samler */
function feltPlass(i){
  const a = i * 2.39996;
  const r = 7.5 + 3.3*Math.sqrt(i);
  return { x: Math.cos(a)*r, z: Math.sin(a)*r, r };
}

/** enga er stelt: om hoesten faar bare annenhver rute hoestfarge */
function engPalett(sesong){
  const gress = [0x4a8c46,0x56994f,0x3f7f3f,0x62a556];
  const fx = SESONG_FX[sesong];
  if(!fx) return gress;
  if(sesong === 'vinter') return gress.map(fx);
  return gress.map((c,i) => i % 2 ? fx(c) : c);
}

function propMesh(id, x, z, rotY, skala){
  const m = modell(id);
  m.scale.setScalar((skala || 1) * PROP_SKALA);
  m.position.set(x, 1, z);
  m.rotation.y = rotY || 0;
  return m;
}

function byggFelt(){
  const { rot, arter, plukkbare } = FELT;
  while(rot.children.length) rot.remove(rot.children[0]);
  arter.length = 0; plukkbare.length = 0;
  FELT.settDam(null);

  const sesong = STATE.sesong;
  const funn = SPECIES.filter(s => STATE.funnet.has(s.id));
  const har = id => STATE.kjopt.has(id);

  // --------- selve plenen
  rot.add(bakke(PLEN_R*2, engPalett(sesong), true));

  // --------- kjopte hageting
  const ytre = funn.length ? feltPlass(funn.length-1).r : 9;

  if(har('dam')){
    const skive = new THREE.Mesh(
      new THREE.CircleGeometry(DAM_MIDT.r, 44),
      new THREE.MeshLambertMaterial({
        color: sesong==='vinter' ? 0x8fb6c8 : 0x2f86b4, transparent:true, opacity:0.82 }));
    skive.rotation.x = -Math.PI/2;
    skive.position.set(DAM_MIDT.x, 0.96, DAM_MIDT.z);
    rot.add(skive);
    FELT.settDam(skive);
    for(let i=0;i<22;i++){                       // steinkant
      const a = i/22*6.28;
      rot.add(propMesh('_helle', DAM_MIDT.x + Math.cos(a)*(DAM_MIDT.r+0.7),
                                 DAM_MIDT.z + Math.sin(a)*(DAM_MIDT.r+0.7), a, 0.7));
    }
  }

  if(har('sti')){
    for(let i=-14;i<=14;i++){
      rot.add(propMesh('_helle', i*1.5, 0, 0));
      if(i % 2 === 0) rot.add(propMesh('_helle', i*1.5, 1.4, 0, 0.8));
    }
  }

  if(har('benk')){
    rot.add(propMesh('_benk', 4.5, 3.4, Math.PI, 1));
    rot.add(propMesh('_benk', -6.5, -3.2, 0, 1));
  }

  if(har('lykt')){
    for(let i=0;i<6;i++){
      const x = (i-2.5)*7;
      rot.add(propMesh('_lykt', x, i%2 ? 3.2 : -3.2, 0));
    }
  }

  if(har('bed')){
    const r = ytre*0.55 + 3;
    for(let i=0;i<18;i++){
      const a = i/18*6.28;
      rot.add(propMesh('_blomst', Math.cos(a)*r, Math.sin(a)*r, a));
    }
  }

  if(har('gjerde')){
    const r = ytre + 6;
    const fag = Math.max(16, Math.round(2*Math.PI*r / 2.4));
    for(let i=0;i<fag;i++){
      const a = i/fag*6.28;
      rot.add(propMesh('_gjerde', Math.cos(a)*r, Math.sin(a)*r, -a + Math.PI/2));
    }
  }

  // --------- artene: lave innerst, hoye ytterst
  const sortert = funn.slice().sort((x,y) => (x.hoyde||1.6) - (y.hoyde||1.6));
  let i = 0;
  for(const sp of sortert){
    const vari = variantAv(sp.id);
    const plante = sp.kind === 'plante';
    const grp = modellSkalert(sp.id, (sp.hoyde || 1.6) * PLEN_SKALA,
      plante ? { sesong, variant:vari } : { variant:vari });

    let x, z, baseY = 1, vandre = 0;
    if(har('dam') && AKVATISK[sp.id]){
      const a = rnd(0, 6.28), r = rnd(1, DAM_MIDT.r - 1.6);
      x = DAM_MIDT.x + Math.cos(a)*r;
      z = DAM_MIDT.z + Math.sin(a)*r;
      baseY = sp.id==='tare' ? 0.35 : 0.62;
      vandre = sp.id==='tare' ? 0 : 0.7;
    } else {
      const p = feltPlass(i++);
      x = p.x; z = p.z;
      vandre = plante ? 0 : rnd(0.9, 2.1);
    }

    grp.position.set(x, baseY, z);
    grp.rotation.y = rnd(0, 6.28);
    grp.scale.setScalar(STATE.sistLagt === sp.id ? 0.01 : 1);
    rot.add(grp);

    grp.userData.inner.userData.art = sp.id;
    plukkbare.push(grp.userData.inner);
    arter.push({
      grp, art:sp.id, base:{x,z}, baseY, r:vandre, fase:rnd(0,6.28),
      plante: plante || vandre === 0,
      vokse: STATE.sistLagt === sp.id ? 0 : 1,
    });
    if(STATE.sistLagt === sp.id) FELT.tilPunkt(x, z);   // panorer til det nye funnet
  }
  STATE.sistLagt = null;

  const himmel = SESONG_HIMMEL[sesong];
  SCENES.field.clear = himmel;
  if(SCENES.field.scene.fog) SCENES.field.scene.fog.color.setHex(himmel);

  $('#feltCount').textContent = funn.length;
  $('#feltTotal').textContent = SPECIES.length;
  $('#feltTom').hidden = funn.length > 0;
  const chip = $('#fieldSesong');
  if(chip) chip.textContent = SESONG_NAVN[sesong];
}

// ------------------------------------------------ SKANN (3D over kamera)
const SKANN = (() => {
  const S = nyScene(0x000000, 0, 40);
  S.scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.0));
  const d = new THREE.DirectionalLight(0xffffff, 0.9); d.position.set(5,10,8);
  S.scene.add(d);
  S.cam.position.set(0, 0.4, 9);
  S.cam.lookAt(0,0,0);
  let grp = null, t0=0, materialisering = 0;

  S.update = (dt) => {
    t0 += dt;
    if(!grp) return;
    grp.rotation.y += dt*0.8;
    grp.position.y = Math.sin(t0*1.6)*0.18 - 1.1;
    grp.scale.setScalar(0.3 + materialisering*0.7);
    grp.userData.inner.material.opacity = materialisering;
  };
  S.setArt = (id, opt) => {
    if(grp) S.scene.remove(grp);
    grp = modellSkalert(id, 2.6, opt);
    const mat = VOX_MAT.clone();
    mat.transparent = true; mat.opacity = 0;
    grp.userData.inner.material = mat;
    S.scene.add(grp);
    materialisering = 0;
  };
  S.setProgresjon = p => { materialisering = p; };
  SCENES.scan = S;
  return S;
})();

// ------------------------------------------------ FUNN / DETALJ (delt modellvisning)
function lagVisningsScene(bakgrunn, alpha){
  const S = nyScene(bakgrunn, alpha);
  S.scene.add(new THREE.HemisphereLight(0xd8e8ff, 0x3a3a4a, 1.0));
  const key = new THREE.DirectionalLight(0xfff4e0, 1.1); key.position.set(6,9,7);
  const rim = new THREE.DirectionalLight(0x88bbff, 0.55); rim.position.set(-7,4,-6);
  S.scene.add(key, rim, new THREE.AmbientLight(0xffffff,0.25));
  S.cam.position.set(0,0,7.2);
  let grp=null, t0=0;
  S.update = dt => {
    t0+=dt;
    if(!grp) return;
    grp.rotation.y += dt*0.7;
    grp.position.y = Math.sin(t0*1.5)*0.12 + S.baseY;
  };
  S.baseY = -1.4;
  S.setArt = (id, hoyde=3.1, opt) => {
    if(grp) S.scene.remove(grp);
    grp = modellSkalert(id, hoyde, opt);
    grp.position.y = S.baseY;
    S.scene.add(grp);
  };
  S.setKamera = (y, z) => { S.cam.position.set(0,y,z); S.cam.lookAt(0,0,0); };
  return S;
}
SCENES.reveal = lagVisningsScene(0x111d16, 1);
SCENES.detail = lagVisningsScene(0x0d1712, 1);

// ------------------------------------------------ DYST
/* Dysten er et kortspill i rent HTML. Se battle.js og cards.js. */
SCENES.battle = null;

SCENES.collection = null;   // ren HTML

// ============================================================ ruting
let aktiv = 'splash';
function gaTil(navn){
  const forrige = SCENES[aktiv];
  if(forrige && forrige.exit) forrige.exit();
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-'+navn));
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.go === navn));
  aktiv = navn;
  const S = SCENES[navn];
  canvas.style.opacity = S ? 1 : 0;
  $('#camLayer').hidden = navn !== 'scan';
  if(S && S.enter) S.enter();
  if(navn === 'field')      byggFelt();
  if(navn === 'shop')       byggButikk();
  if(navn === 'collection') byggSamling();
  if(navn === 'battle')     startDyst();
  if(navn === 'scan')       startSkann();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-go]');
  if(b) { e.preventDefault(); LYD.klikk(); dirr(12); gaTil(b.dataset.go); }
});

// ============================================================ hovedløkke
let sist = performance.now();
function loop(now){
  const dt = Math.min(0.05, (now - sist)/1000);
  sist = now;
  const S = SCENES[aktiv];
  if(S){
    if(S.update) S.update(dt);
    renderer.setClearColor(S.clear, S.alpha);
    renderer.render(S.scene, S.cam);
  }
  requestAnimationFrame(loop);
}

// ============================================================ plen-styring
/* En finger drar plenen, to fingre kniper for zoom, kort trykk aapner kortet. */
(() => {
  const pekere = new Map();
  let flyttet = 0, startAvstand = 0;

  function tofinger(){
    const p = [...pekere.values()];
    return Math.hypot(p[0].x-p[1].x, p[0].y-p[1].y);
  }
  function ned(e){
    if(aktiv !== 'field') return;
    if(e.target.closest('.tabbar, .topbar, .scan-fab')) return;
    pekere.set(e.pointerId, { x:e.clientX, y:e.clientY });
    flyttet = 0;
    if(pekere.size === 2) startAvstand = tofinger();
  }
  function flytt(e){
    const p = pekere.get(e.pointerId);
    if(!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    flyttet += Math.abs(dx) + Math.abs(dy);
    if(pekere.size === 2){
      const na = tofinger();
      FELT.zoom((startAvstand - na) * 0.06);
      startAvstand = na;
    } else {
      FELT.panorer(dx, dy);
    }
  }
  function opp(e){
    if(!pekere.has(e.pointerId)) return;
    pekere.delete(e.pointerId);
    if(flyttet < 9 && aktiv === 'field') plukkArt(e.clientX, e.clientY);
  }
  addEventListener('pointerdown', ned);
  addEventListener('pointermove', flytt);
  addEventListener('pointerup', opp);
  addEventListener('pointercancel', opp);
  addEventListener('wheel', e => { if(aktiv === 'field') FELT.zoom(e.deltaY*0.02); }, {passive:true});
})();

/** trykk paa en modell paa plenen -> aapne kortet */
const _ray = new THREE.Raycaster();
const _nd  = new THREE.Vector2();
function plukkArt(px, py){
  const boks = canvas.getBoundingClientRect();
  _nd.x =  ((px - boks.left) / boks.width)  * 2 - 1;
  _nd.y = -((py - boks.top)  / boks.height) * 2 + 1;
  _ray.setFromCamera(_nd, FELT.S.cam);
  const treff = _ray.intersectObjects(FELT.plukkbare, false);
  if(!treff.length) return;
  LYD.klikk(); dirr(12);
  visDetalj(treff[0].object.userData.art);
}

$('#scanFab').addEventListener('click', () => gaTil('scan'));

// ============================================================ skanning
let kamStrom = null;
/** mock-skanner: trekker en art, vektet slik at sjeldne arter dukker sjeldnere opp */
function tilfeldigArt(){
  let basseng = SPECIES.slice();
  const nye = basseng.filter(s => !STATE.funnet.has(s.id));
  if(nye.length && Math.random() < 0.85) basseng = nye;
  const vekter = basseng.map(s => 1/(s.sjelden*s.sjelden));
  const sum = vekter.reduce((x,y) => x+y, 0);
  let r = Math.random()*sum;
  for(let i=0;i<basseng.length;i++){ r -= vekter[i]; if(r <= 0) return basseng[i].id; }
  return basseng[basseng.length-1].id;
}

async function startSkann(){
  const art = tilfeldigArt();
  STATE.malArt = art;
  STATE.malVariant = STATE.funnet.has(art) ? variantAv(art) : trekkVariant();
  SKANN.setArt(art, { variant: STATE.malVariant });
  $('#scanCoords').textContent = geoTekst();
  SKANN.setProgresjon(0);
  $('#scanReadout').textContent = 'RETT KAMERAET MOT ARTEN';
  $('#scanReadout').classList.remove('treff');
  $('#scanMeterFill').style.width = '0%';
  $('#scanGo').disabled = false;
  $('#scanBeam').classList.remove('kjor');

  const video = $('#camFeed');
  if(!kamStrom){
    try {
      kamStrom = await navigator.mediaDevices.getUserMedia({
        video:{ facingMode:{ ideal:'environment' } }, audio:false });
      video.srcObject = kamStrom;
      $('#camFallback').style.display = 'none';
    } catch(err){
      $('#camFallback').style.display = 'block';
      video.style.display = 'none';
    }
  }
}
function stoppSkann(){
  if(kamStrom){ kamStrom.getTracks().forEach(t => t.stop()); kamStrom = null; }
  $('#camFeed').srcObject = null;
}
SCENES.scan.exit = stoppSkann;

$('#scanGo').addEventListener('click', () => {
  const knapp = $('#scanGo');
  if(knapp.disabled) return;
  knapp.disabled = true;
  LYD.skann(); dirr(25);
  $('#scanBeam').classList.add('kjor');
  const linjer = ['ANALYSERER FORM…','SAMMENLIGNER MED ARTSBANK…','MÅLER FARGEPROFIL…','BEKREFTER ART…'];
  let p = 0, i = 0;
  const id = setInterval(() => {
    p += 0.028 + Math.random()*0.02;
    SKANN.setProgresjon(Math.min(1, p));
    $('#scanMeterFill').style.width = Math.min(100, p*100) + '%';
    const ni = Math.min(linjer.length-1, Math.floor(p*linjer.length));
    if(ni !== i){ i = ni; $('#scanReadout').textContent = linjer[i]; }
    if(p >= 1){
      clearInterval(id);
      const sp = SPECIES_BY_ID[STATE.malArt];
      const vari = STATE.malVariant;
      $('#scanReadout').textContent = (vari ? VARIANTER[vari].navn + ' ' : '') + sp.navn +
        (vari ? ' — AVVIKENDE FARGE!' : ' — 98 % SIKKER');
      $('#scanReadout').classList.add('treff');
      blitz();
      if(vari){ LYD.sjelden(); dirr([30,60,30,60,90]); }
      else    { LYD.funn();    dirr(60); }
      setTimeout(() => visFunn(STATE.malArt), 460);
    }
  }, 55);
});

// ============================================================ funn
function visFunn(id, variant){
  const sp = SPECIES_BY_ID[id];
  const ny = !STATE.funnet.has(id);
  variant = variant !== undefined ? variant : STATE.malVariant;
  const mult = variant ? VARIANTER[variant].bonus : 1;
  $('#revealKicker').textContent = variant
    ? VARIANTER[variant].navn + ' VARIANT!'
    : (ny ? 'NY ART REGISTRERT' : 'ALLEREDE I SAMLINGA');
  $('#revealKicker').classList.toggle('variant', !!variant);
  const xp   = Math.round((ny ? 60 + sp.sjelden*25 : 10) * mult);
  const mynt = Math.round((ny ? 25 + sp.sjelden*15 : 5) * mult);
  $('#revealXp').textContent   = xp;
  $('#revealCoin').textContent = mynt;
  $('#revealCard').innerHTML = kortRamme(sp, true, variant);
  SCENES.reveal.setArt(id, 3.0, {variant});
  SCENES.reveal.baseY = -0.9;
  gaTil('reveal');
  $('#revealOk').textContent = ny ? 'PLANT I SLETTA' : 'TILBAKE TIL SLETTA';
  $('#revealOk').onclick = () => {
    if(ny) STATE.sistLagt = id;
    STATE.funnet.add(id);
    if(variant) STATE.varianter[id] = variant;
    STATE.mynt += mynt;
    oppdaterHud();
    toast(ny ? visningsNavn(id) + ' plantet p\u00e5 plenen' : 'XP mottatt');
    gaTil('field');   // bygger plenen og lar den nye arten vokse fram
  };
}

// ============================================================ kort
function sjeldenNavn(n){
  return ['','VANLIG','NOKSÅ VANLIG','UVANLIG','SJELDEN','SVÆRT SJELDEN'][n] || '';
}
function kortRamme(sp, stort, variant){
  const stjerner = '★'.repeat(sp.sjelden) + '☆'.repeat(5-sp.sjelden);
  const merke = variant ? `<div class="kort-variant">${VARIANTER[variant].navn}</div>` : '';
  return `<article class="kort r${sp.sjelden}${stort?' kort-stor':''}${variant?' kort-var':''}">
    ${merke}
    <div class="kort-topp">
      <span class="kort-navn">${sp.navn}</span>
      <span class="kort-sjelden">${stjerner}</span>
    </div>
    <div class="kort-vindu"></div>
    <div class="kort-sci">${sp.sci}</div>
    <div class="kort-stats">
      <span><b>${sp.hp}</b>HP</span>
      <span><b>${sp.angrep}</b>ANG</span>
      <span><b>${sp.forsvar}</b>FOR</span>
      <span><b>${sp.fart}</b>FART</span>
    </div>
    <div class="kort-baand">${sjeldenNavn(sp.sjelden)}</div>
  </article>`;
}

// miniatyrbilder til samlingsrutenettet - lages ved behov
const MINI = {};
const lagMini = (() => {
  let rt = null, sc = null, cam = null;
  function oppsett(){
    rt = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    rt.setPixelRatio(2); rt.setSize(150,150,false);
    sc = new THREE.Scene();
    sc.add(new THREE.HemisphereLight(0xdce8ff, 0x404050, 1.0));
    const k = new THREE.DirectionalLight(0xfff4e0, 1.15); k.position.set(5,8,6);
    const r2 = new THREE.DirectionalLight(0x88bbff, 0.5); r2.position.set(-6,3,-5);
    sc.add(k, r2, new THREE.AmbientLight(0xffffff,0.3));
    cam = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
    cam.position.set(3.6, 2.9, 5.2); cam.lookAt(0, 0.55, 0);
    rt.setClearColor(0x000000, 0);
  }
  return (id, variant) => {
    const nokkel = id + '|' + (variant||'');
    if(MINI[nokkel]) return MINI[nokkel];
    if(!rt) oppsett();
    const g = modellSkalert(id, 2.1, {variant});
    g.rotation.y = -0.5;
    sc.add(g);
    rt.render(sc, cam);
    MINI[nokkel] = rt.domElement.toDataURL('image/png');
    sc.remove(g);
    return MINI[nokkel];
  };
})();

function byggSamling(){
  const filter = $('.pill.active')?.dataset.filter || 'alle';
  const liste = SPECIES.filter(s => filter==='alle' || s.kind===filter);
  $('#colCount').textContent = STATE.funnet.size;
  $('#colTotal').textContent = SPECIES.length;
  $('#cardGrid').innerHTML = liste.map(sp => {
    const har = STATE.funnet.has(sp.id);
    const vari = variantAv(sp.id);
    return `<button class="mini r${sp.sjelden}${har?'':' laast'}${vari?' mini-var':''}" data-art="${sp.id}">
      ${vari ? `<span class="mini-merke">${VARIANTER[vari].navn[0]}</span>` : ''}
      <div class="mini-bilde">${har
        ? `<img src="${lagMini(sp.id, vari)}" alt="${sp.navn}">`
        : `<span class="mini-q">?</span>`}</div>
      <span class="mini-navn">${har ? sp.navn : '— — —'}</span>
      <span class="mini-sjelden">${'★'.repeat(sp.sjelden)}</span>
    </button>`;
  }).join('');
}
$('.col-filters').addEventListener('click', e => {
  const p = e.target.closest('.pill');
  if(!p) return;
  $$('.pill').forEach(x => x.classList.toggle('active', x===p));
  byggSamling();
});
$('#cardGrid').addEventListener('click', e => {
  const b = e.target.closest('.mini');
  if(!b || b.classList.contains('laast')) return;
  visDetalj(b.dataset.art);
});

function visDetalj(id){
  const sp = SPECIES_BY_ID[id];
  const vari = variantAv(id);
  $('.detail-close').dataset.go = (aktiv === 'field') ? 'field' : 'collection';
  $('#detailName').textContent = visningsNavn(id);
  $('#detailSci').textContent  = sp.sci;
  $('#detailFact').textContent = sp.fakta;
  $('#detailStats').innerHTML = [
    ['HP',sp.hp,110],['ANGREP',sp.angrep,40],['FORSVAR',sp.forsvar,40],['FART',sp.fart,40]
  ].map(([n,v,m]) =>
    `<div class="stat"><span class="stat-n">${n}</span>
      <div class="stat-bar"><i style="width:${Math.min(100,v/m*100)}%"></i></div>
      <span class="stat-v">${v}</span></div>`).join('');
  SCENES.detail.setArt(id, 3.2, {variant:vari});
  SCENES.detail.baseY = 2.1;
  gaTil('detail');
}

// ============================================================ butikk
function byggButikk(){
  $('#shopCoins').textContent = STATE.mynt;
  $('#shopGrid').innerHTML = BUTIKK.map(b => {
    const eid = STATE.kjopt.has(b.id);
    const raad = STATE.mynt >= b.pris;
    return `<article class="vare${eid?' eid':''}">
      <span class="vare-ikon">${b.ikon}</span>
      <div class="vare-tekst">
        <span class="vare-navn">${b.navn}</span>
        <span class="vare-desc">${b.desc}</span>
      </div>
      <button class="vare-kjop${eid?' ferdig':''}" data-vare="${b.id}"
        ${eid || !raad ? 'disabled' : ''}>${eid ? 'KJ&Oslash;PT' : b.pris + ' &#9679;'}</button>
    </article>`;
  }).join('');
}
$('#shopGrid').addEventListener('click', e => {
  const k = e.target.closest('.vare-kjop');
  if(!k || k.disabled) return;
  const vare = BUTIKK_BY_ID[k.dataset.vare];
  if(STATE.mynt < vare.pris) return;
  STATE.mynt -= vare.pris;
  STATE.kjopt.add(vare.id);
  LYD.funn(); dirr([20,40,20]);
  oppdaterHud();
  byggButikk();
  byggFelt();
  toast(vare.navn + ' satt ut p\u00e5 plenen');
});

// ============================================================ dyst
/* Hele kortspillet ligger i battle.js. Her er bare inngangen og broen. */
function startDyst(){ KORTSPILL.start(); }

// ============================================================ småting
function oppdaterHud(){
  $$('.hud-mynt').forEach(el => el.textContent = STATE.mynt);
  $$('.hud-niva').forEach(el => el.textContent = STATE.niva);
}
let toastId;
function toast(txt){
  const t = $('#toast');
  t.textContent = txt; t.classList.add('vis');
  clearTimeout(toastId);
  toastId = setTimeout(() => t.classList.remove('vis'), 2200);
}
function blitz(){
  const f = $('#flash');
  f.classList.remove('kjor'); void f.offsetWidth; f.classList.add('kjor');
}

// ============================================================ oppstart
// demo-lenker: #skjerm=field&omrade=vidda&sesong=vinter&alle=1
(function demoLenke(){
  const q = new URLSearchParams(location.hash.slice(1));
  if(SESONGER.includes(q.get('sesong'))) STATE.sesong = q.get('sesong');
  if(q.get('alle')) SPECIES.forEach(s => STATE.funnet.add(s.id));
  const antall = parseInt(q.get('n'), 10);
  if(antall > 0) SPECIES.slice(0, antall).forEach(s => STATE.funnet.add(s.id));
  if(q.get('variant')) SPECIES.forEach((s,i) => { if(i%4===0) STATE.varianter[s.id] = Object.keys(VARIANTER)[i%3]; });
  const skjerm = q.get('skjerm');
  const art = q.get('art');
  if(q.get('auto')){
    setTimeout(() => { gaTil('scan'); setTimeout(() => $('#scanGo').click(), 500); }, 300);
    if(q.get('auto') === 'plant') setTimeout(() => $('#revealOk').click(), 4200);
    return;
  }
  setTimeout(() => {
    if(skjerm === 'reveal') visFunn(art || tilfeldigArt(), q.get('var') || null);
    else if(skjerm === 'detail' && art){ STATE.funnet.add(art); byggFelt(); visDetalj(art); }
    else if(skjerm) gaTil(skjerm);
  }, 60);
})();

resize();
byggFelt();
oppdaterHud();
startGeo();
settSesongKnapp();
requestAnimationFrame(loop);
setTimeout(() => $('#boot').classList.add('ferdig'), 420);

// ---------- sesong ----------
function settSesongKnapp(){
  const b = $('#fieldSesong');
  if(!b) return;
  b.textContent = SESONG_NAVN[STATE.sesong];
  b.onclick = () => byttSesong();
}
function byttSesong(){
  const i = SESONGER.indexOf(STATE.sesong);
  STATE.sesong = SESONGER[(i+1) % SESONGER.length];
  byggFelt();
  settSesongKnapp();
  LYD.klikk();
  toast('Sesong: ' + SESONG_NAVN[STATE.sesong]);
}

// ---------- lyd av/på ----------
const lydKnapp = $('#lydBtn');
if(lydKnapp) lydKnapp.onclick = () => {
  const av = LYD.demp();
  lydKnapp.textContent = av ? '\u266b\u0338' : '\u266b';
  lydKnapp.classList.toggle('av', av);
  toast(av ? 'Lyd av' : 'Lyd på');
};

// demo-snarveier under filming: tastene 1-8
addEventListener('keydown', e => {
  const kart = { '1':'splash','2':'shop','3':'field','4':'scan','5':'reveal','6':'collection','7':'battle' };
  if(kart[e.key]){
    if(e.key==='5') visFunn(tilfeldigArt(), trekkVariant());
    else gaTil(kart[e.key]);
  }
  if(e.key==='a'){ SPECIES.forEach(s => STATE.funnet.add(s.id)); byggFelt(); byggSamling(); toast('Alle arter låst opp'); }
  if(e.key==='s'){ byttSesong(); }
  if(e.key==='v'){ const id = pick(SPECIES).id; STATE.varianter[id] = pick(Object.keys(VARIANTER)); STATE.funnet.add(id); byggFelt(); byggSamling(); toast(visningsNavn(id)); }
  if(e.key==='t'){ STATE.funnet.clear(); STATE.varianter = {}; STATE.kjopt.clear(); byggFelt(); toast('Plenen tømt'); }
  if(e.key==='k'){ STATE.mynt += 500; oppdaterHud(); byggButikk(); toast('+500 mynt'); }
});

// ============================================================ bro til battle.js
/* Kortspillet ligger i sin egen fil og trenger noen faa ting herfra. */
window.VM = { STATE, LYD, dirr, toast, lagMini, oppdaterHud, gaTil, visningsNavn };

})();
