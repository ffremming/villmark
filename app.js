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
  mynt: 500,             // startkapital - mynt tjener du bare paa dyster
  niva: 3,
  pynt: [],              // kjopte hageting: {uid, id, x, z, rotY}. x=null = ikke satt ut enda
  nestePyntUid: 1,
  eksemplarer: [],       // hvert skann gir ett eksemplar: {uid, art, niva, variant, x, z}
  nesteUid: 1,
  dekk: new Set(),       // uid-ene du har valgt inn i kortstokken
  dekkValgt: false,      // usant = ingen har rort dekket, saa alt paa plenen er med
  sistLagt: null,        // art som skal vokse fram paa plenen
  kartMal: null,        // art valgt fra kartet - overstyrer tilfeldig skann
  malArt: null,
  malVariant: null,
  malNiva: 0,           // sikkerhetsniva fra artsmapping: 0 sikker, 1 slektning, 2 usikker
  sesong: sesongFraDato(),
};

/* The lawn from last time, straight off this phone. Nothing is fetched from
   the network: what you built is yours and stays here. */
STORE.load(STATE);
const saveLawn = () => STORE.save(STATE);
addEventListener('pagehide', () => STORE.flush(STATE));
document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'hidden') STORE.flush(STATE);
});

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

/* ---------- eksemplarer og nivaa ----------
   Samme art kan staa flere ganger paa plenen. To eksemplarer av samme art
   paa samme nivaa kan dras sammen til ett eksemplar ett nivaa hoyere. */
/* NIVA_STEG staar i cards.js: kortet og dyret skal vokse i takt. */

function nyttEksemplar(art, variant){
  const e = { uid: STATE.nesteUid++, art, niva:1, variant: variant || null, x:null, z:null };
  STATE.eksemplarer.push(e);
  STATE.dekk.add(e.uid);          // nye funn blir med i dekket med en gang
  STATE.funnet.add(art);
  if(variant) STATE.varianter[art] = variant;
  return e;
}
function eksemplarerAv(art){ return STATE.eksemplarer.filter(e => e.art === art); }
function toppNiva(art){
  const liste = eksemplarerAv(art);
  return liste.length ? Math.max.apply(null, liste.map(e => e.niva)) : 1;
}
function statPaaNiva(sp, niva){
  const f = 1 + NIVA_STEG*(niva-1);
  return {
    hp:      Math.round(sp.hp * f),
    angrep:  Math.round(sp.angrep * f),
    forsvar: Math.round(sp.forsvar * f),
    fart:    Math.round(sp.fart * f),
  };
}
function visningsNavn(id){
  const v = variantAv(id);
  return v ? VARIANTER[v].navn + ' ' + SPECIES_BY_ID[id].navn : SPECIES_BY_ID[id].navn;
}

/* ---------- dekket ----------
   Kortstokken din er plenen: hvert eksemplar som staar ute er ett kort, paa
   sitt eget nivaa. Foer noen har rort dekkvelgeren er alt med, og da trengs
   ingen liste - derfor staar dekkValgt usant til det forste valget. Etterpa
   holder STATE.dekk uid-ene. Uid-er som forsvinner naar to eksemplarer dras
   sammen blir staaende i settet, men filtreres bort av byggDekkStokk. */
function dekkSett(){ return STATE.dekkValgt ? STATE.dekk : null; }
function dekkStokk(){ return byggDekkStokk(STATE.eksemplarer, dekkSett()); }
function dekkHar(uid){ return !STATE.dekkValgt || STATE.dekk.has(uid); }

function dekkVelg(uid, med){
  if(!STATE.dekkValgt){
    /* forste valget fryser dagens plen til en liste, saa fravalget har noe
       aa trekke fra */
    STATE.dekkValgt = true;
    STATE.dekk = new Set(dekkbareEksemplarer(STATE.eksemplarer).map(e => e.uid));
  }
  if(med) STATE.dekk.add(uid); else STATE.dekk.delete(uid);
  saveLawn();
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

function bakke(bredde, farger, kant, hull){
  const v = new Vox();
  const h = Math.floor(bredde/2);
  const groper = hull || [];
  for(let x=-h;x<h;x++) for(let z=-h;z<h;z++){
    const r = Math.hypot(x,z);
    if(kant && r > h-0.5) continue;
    /* er ruta inne i en dam? da ligger gressflata ett hakk lavere,
       med mudderbunn - ellers hadde vannspeilet havnet under graset */
    let iGrop = false;
    for(const g of groper) if(Math.hypot(x - g.x, z - g.z) <= g.r){ iGrop = true; break; }
    if(iGrop){
      v.set(x,-1,z, 0x6b5a3e);
      continue;
    }
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
    rev.position.set(Math.cos(a)*r, 1 + Math.abs(Math.sin(t0*5))*0.22, Math.sin(a)*r);
    rev.rotation.y = -a - Math.PI/2;   // modellen ser mot +X
    S.cam.position.y = 15 + Math.sin(t0*0.5)*0.9;
    S.cam.lookAt(0, 2.5, 0);
  };
  SCENES.splash = S;
})();

// ------------------------------------------------ PLENEN (FELT)
/* Plenen er stor. Du flytter deg ikke selv - du drar kameraet over graset
   med fingeren, kniper for aa zoome, og trykker paa en art for aa se kortet. */
const PLEN_R     = 62;      // halve plenen i voxelruter
const PLEN_SKALA = 1.55;    // artene staar litt storre enn kortformatet
const PROP_SKALA = 0.3;     // hageting er bygget i finere voxelrutenett
const DAM_R      = 6;       // radius paa en dam
const DAM_VANN   = 0.75;    // vannspeilet: gropa har bunn i y=0, graset ligger i y=1

const FELT = (() => {
  const S = nyScene(0x9ed0ef, 1, 56);
  S.scene.fog = new THREE.Fog(0x9ed0ef, 42, 104);
  standardLys(S.scene, {skygge:46});

  const rot = new THREE.Group();
  S.scene.add(rot);

  const arter = [];         // {grp, art, base, fase, r, plante, baseY, vokse}
  const plukkbare = [];
  const pynt = [];          // {grp, p, pynt:true, baseY}
  const pyntPlukkbare = [];
  const dammer = [];
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
    // mer ovenfra: hoyere kamera, kortere vannrett avstand (ca 51 grader)
    S.cam.position.set(kam.x + Math.sin(kam.vinkel)*d*0.78, d*0.96, kam.z + Math.cos(kam.vinkel)*d*0.78);
    S.cam.lookAt(kam.x, 1, kam.z);

    for(const o of arter){
      if(o.vokse < 1){
        o.vokse = Math.min(1, o.vokse + dt*1.7);
        const e = 1 - Math.pow(1-o.vokse, 3);
        o.grp.scale.setScalar(e * (1 + Math.sin(o.vokse*Math.PI)*0.14));
      }
      if(o.dras || o.plante) continue;
      o.fase += dt * (0.22 + SPECIES_BY_ID[o.art].fart/150);
      o.grp.position.x = o.base.x + Math.cos(o.fase)*o.r;
      o.grp.position.z = o.base.z + Math.sin(o.fase)*o.r;
      o.grp.rotation.y = -o.fase - Math.PI/2;   // modellen ser mot +X
      // hoppet gaar paa egen klokke, slik at trege arter ogsaa spretter synlig
      o.hopp += dt * (4.2 + SPECIES_BY_ID[o.art].fart/40);
      o.grp.position.y = o.baseY + Math.abs(Math.sin(o.hopp))*0.22;
    }
    for(const d of dammer) d.position.y = DAM_VANN + Math.sin(t0*1.2)*0.03;
  };

  SCENES.field = S;
  return {
    S, rot, arter, plukkbare, pynt, pyntPlukkbare, kam,
    settDam: liste => { dammer.length = 0; if(liste) dammer.push.apply(dammer, liste); },
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

/** demo- og testhjelp: still opp alt som ikke er satt ut for haand */
function stillOppAlle(){
  let i = 0;
  for(const ex of STATE.eksemplarer){
    if(ex.x !== null) { i++; continue; }
    const p = feltPlass(i++);
    ex.x = p.x; ex.z = p.z;
  }
}

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

/** staar punktet i en dam? da ligger arten lavere */
function iDammen(x, z){
  for(const p of STATE.pynt)
    if(p.id === 'dam' && p.x !== null && Math.hypot(x - p.x, z - p.z) < DAM_R - 0.8) return true;
  return false;
}
function artHoyde(id, x, z){
  if(!iDammen(x, z)) return 1;
  /* gropa har bunn i y=0 og vannspeil i DAM_VANN: arten staar paa bunnen
     med foettene under vann, tara stikker bare toppen opp */
  return id === 'tare' ? 0.15 : 0.4;
}

/** vannspeilet i en dam - egen flate, ikke voxel */
function damMesh(x, z, sesong){
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(DAM_R + 0.6, 44),   // litt bredere enn gropa saa kanten gjemmes under graset
    new THREE.MeshLambertMaterial({
      color: sesong==='vinter' ? 0x8fb6c8 : 0x2f86b4, transparent:true, opacity:0.82 }));
  m.rotation.x = -Math.PI/2;
  m.position.set(x, DAM_VANN, z);
  return m;
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

  // --------- selve plenen, med grop under hver dam
  const groper = STATE.pynt
    .filter(p => p.id === 'dam' && p.x !== null)
    .map(p => ({ x:p.x, z:p.z, r:DAM_R }));
  rot.add(bakke(PLEN_R*2, engPalett(sesong), true, groper));

  // --------- kjopte hageting: hver ting staar der du satte den
  FELT.pynt.length = 0; FELT.pyntPlukkbare.length = 0;
  const dammer = [];
  for(const p of STATE.pynt){
    if(p.x === null || p.z === null) continue;     // ikke satt ut enda
    const vare = BUTIKK_BY_ID[p.id];
    if(!vare) continue;

    if(p.id === 'dam'){
      const skive = damMesh(p.x, p.z, sesong);
      skive.userData.pyntUid = p.uid;
      rot.add(skive);
      dammer.push(skive);
      for(let i=0;i<22;i++){                       // steinkant
        const a = i/22*6.28;
        rot.add(propMesh('_helle', p.x + Math.cos(a)*(DAM_R+0.7),
                                   p.z + Math.sin(a)*(DAM_R+0.7), a, 0.7));
      }
      FELT.pynt.push({ grp:skive, p, pynt:true, baseY:0.96 });
      FELT.pyntPlukkbare.push(skive);
      continue;
    }

    const m = propMesh(vare.vox, p.x, p.z, p.rotY, vare.skala);
    m.userData.pyntUid = p.uid;
    rot.add(m);
    FELT.pynt.push({ grp:m, p, pynt:true, baseY:1 });
    FELT.pyntPlukkbare.push(m);
  }
  FELT.settDam(dammer);

  // --------- eksemplarene: lave innerst, hoye ytterst
  const sortert = STATE.eksemplarer.slice().sort((p, q) => {
    const hp = SPECIES_BY_ID[p.art].hoyde || 1.6;
    const hq = SPECIES_BY_ID[q.art].hoyde || 1.6;
    return hp - hq || p.uid - q.uid;
  });
  for(const ex of sortert){
    if(ex.x === null || ex.z === null) continue;   // venter paa aa bli satt ut for haand
    const sp = SPECIES_BY_ID[ex.art];
    const plante = sp.kind === 'plante';
    const grp = modellSkalert(ex.art,
      (sp.hoyde || 1.6) * PLEN_SKALA * (1 + 0.07*(ex.niva-1)),
      plante ? { sesong, variant:ex.variant } : { variant:ex.variant });

    let vandre = plante ? 0 : rnd(0.9, 2.1);
    const x = ex.x, z = ex.z;

    if(ex.art === 'tare') vandre = 0;
    if(iDammen(x, z) && vandre) vandre = Math.min(vandre, 0.7);
    const baseY = artHoyde(ex.art, x, z);
    const ny = STATE.sistLagt === ex.uid;

    grp.position.set(x, baseY, z);
    grp.rotation.y = rnd(0, 6.28);
    grp.scale.setScalar(ny ? 0.01 : 1);
    rot.add(grp);

    grp.userData.inner.userData.uid = ex.uid;
    grp.userData.inner.userData.art = ex.art;
    plukkbare.push(grp.userData.inner);
    arter.push({
      grp, ex, uid:ex.uid, art:ex.art, base:{x,z}, baseY, r:vandre, fase:rnd(0,6.28),
      hopp: rnd(0, 6.28),
      plante: plante || vandre === 0,
      vokse: ny ? 0 : 1,
    });
    if(ny) FELT.tilPunkt(x, z);   // panorer til det nye funnet
  }
  STATE.sistLagt = null;

  const himmel = SESONG_HIMMEL[sesong];
  SCENES.field.clear = himmel;
  if(SCENES.field.scene.fog) SCENES.field.scene.fog.color.setHex(himmel);

  $('#feltCount').textContent = funn.length;
  $('#feltTotal').textContent = SPECIES.length;
  $('#feltTom').hidden = funn.length > 0 || STATE.pynt.length > 0;
  const chip = $('#fieldSesong');
  if(chip) chip.textContent = SESONG_NAVN[sesong];
  if(valgtPynt){
    const uid = valgtPynt.p.uid;
    valgtPynt = FELT.pynt.find(o => o.p.uid === uid) || null;
    if(valgtPynt) visMarkor(valgtPynt.grp.position.x, valgtPynt.baseY + 0.06, valgtPynt.grp.position.z);
  }
  PLASS.synk();
  visVriPanel();
  saveLawn();
}

// ------------------------------------------------ VISITING ANOTHER LAWN
/* The lawn is drawn straight from STATE, so a visit parks our own lawn,
   drops the guest lawn into the same fields and builds as usual. Going
   back puts everything where it was.

   Two rules keep the visit harmless: STORE holds every write while a guest
   lawn sits in STATE, and the lawn is read-only - you pan, zoom and open
   cards, but nothing can be moved, turned, bought or merged. */
const VISIT = (() => {
  let parked = null;      // our own lawn while someone else's is on screen
  let host   = '';        // whose lawn we are standing on

  const FIELDS = ['funnet','varianter','pynt','eksemplarer','sesong','sistLagt'];

  /** what we hand to a player who asks to see our lawn.
      Ours, never the guest lawn we may be standing on. */
  function snapshot(){
    const S = parked || STATE;
    return {
      sesong:      S.sesong,
      funnet:      [...S.funnet],
      varianter:   S.varianter,
      /* things still waiting to be placed are nobody else's business */
      pynt:        S.pynt.filter(p => p.x !== null && p.z !== null),
      eksemplarer: S.eksemplarer.filter(e => e.x !== null && e.z !== null),
    };
  }

  function park(){
    const p = {};
    for(const k of FIELDS) p[k] = STATE[k];
    return p;
  }

  /** step onto someone else's lawn */
  function enter(navn, d){
    if(!d) return false;
    if(!parked) parked = park();
    STORE.hold(true);
    host = navn || 'EN SPILLER';

    STATE.funnet      = new Set(Array.isArray(d.funnet) ? d.funnet : []);
    STATE.varianter   = (d.varianter && typeof d.varianter === 'object') ? d.varianter : {};
    STATE.pynt        = Array.isArray(d.pynt) ? d.pynt.slice() : [];
    STATE.eksemplarer = Array.isArray(d.eksemplarer) ? d.eksemplarer.slice() : [];
    STATE.sesong      = SESONGER.includes(d.sesong) ? d.sesong : STATE.sesong;
    STATE.sistLagt    = null;

    velgPynt(null);
    $('#feltBesokNavn').textContent = 'PLENEN TIL ' + host;
    $('#feltBesok').hidden = false;
    document.body.classList.add('visiting');
    FELT.tilPunkt(0, 0);
    gaTil('field');
    settSesongKnapp();
    return true;
  }

  /** back to our own lawn */
  function leave(){
    if(!parked) return;
    for(const k of FIELDS) STATE[k] = parked[k];
    parked = null; host = '';
    STORE.hold(false);
    document.body.classList.remove('visiting');
    $('#feltBesok').hidden = true;
    velgPynt(null);
    FELT.tilPunkt(0, 0);
    byggFelt();
    settSesongKnapp();
  }

  return { enter, leave, snapshot, active: () => !!parked, get host(){ return host; } };
})();

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
  /* Ved ekte skanning vet vi ikke arten for modellen har svart. Da skal
     ingenting ligge i ruta og roepe fasiten. */
  S.tomArt = () => {
    if(grp) S.scene.remove(grp);
    grp = null; materialisering = 0;
  };
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
let forSkann = 'field';   // fanen skanneren ble aapnet fra, saa krysset gaar tilbake dit
/* A visit lives on the lawn and on the species card it opens. Leaving for
   any other screen ends the visit, so the tabs need no special handling. */
const VISIT_SCREENS = ['field','detail'];
function gaTil(navn){
  if(navn === 'scan' && aktiv !== 'scan' && aktiv !== 'splash') forSkann = aktiv;
  if(VISIT.active() && !VISIT_SCREENS.includes(navn)) VISIT.leave();
  /* Gaar vi ut av dysten mens en nettkamp loper, maa motparten faa beskjed. */
  if(aktiv === 'battle' && navn !== 'battle') KORTSPILL.forlat();
  const forrige = SCENES[aktiv];
  if(forrige && forrige.exit) forrige.exit();
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-'+navn));
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.go === navn));
  aktiv = navn;
  const S = SCENES[navn];
  canvas.style.opacity = S ? 1 : 0;
  $('#camLayer').hidden = navn !== 'scan';
  if(S && S.enter) S.enter();
  if(navn !== 'field') velgPynt(null);
  if(navn === 'field')      byggFelt();
  if(navn === 'shop')       byggButikk();
  if(navn === 'collection') byggSamling();
  if(navn === 'battle')     startDyst();
  if(navn === 'lobby')      LOBBY.aapne();
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
  let flyttet = 0, startAvstand = 0, holdUr = null, knip = false;
  let midt = { x:0, y:0 };

  function tofinger(){
    const p = [...pekere.values()];
    return Math.hypot(p[0].x-p[1].x, p[0].y-p[1].y);
  }
  function tofingerMidt(){
    const p = [...pekere.values()];
    return { x:(p[0].x+p[1].x)/2, y:(p[0].y+p[1].y)/2 };
  }
  function stoppHold(){ clearTimeout(holdUr); holdUr = null; }

  function ned(e){
    if(aktiv !== 'field') return;
    if(e.target && e.target.closest && e.target.closest('.tabbar, .topbar, .felt-vri')) return;
    pekere.set(e.pointerId, { x:e.clientX, y:e.clientY });
    flyttet = 0;
    if(pekere.size === 2){
      startAvstand = tofinger();
      midt = tofingerMidt();
      knip = true;
      stoppHold();
      slippFlytting();          // to fingre = zoom og panorering, ikke flytting
      return;
    }
    const px = e.clientX, py = e.clientY;
    stoppHold();
    if(VISIT.active()) return;  // guest lawn: only look, drag and zoom
    if(PLASS.aktiv()){          // ny ting ventes satt ut: fingeren styrer den
      PLASS.pek(px, py);
      return;
    }
    holdUr = setTimeout(() => {   // trykk og hold plukker opp tingen
      holdUr = null;
      const o = artUnder(px, py) || pyntUnder(px, py);
      if(o) startFlytting(o);
    }, 260);
  }
  function flytt(e){
    const p = pekere.get(e.pointerId);
    if(!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    flyttet += Math.abs(dx) + Math.abs(dy);
    if(holdUr && flyttet > 12) stoppHold();     // dette ble en panorering
    if(pekere.size === 2){
      const na = tofinger();
      FELT.zoom((startAvstand - na) * 0.06);
      startAvstand = na;
      const nm = tofingerMidt();
      FELT.panorer(nm.x - midt.x, nm.y - midt.y);   // to fingre panorerer ogsaa
      midt = nm;
      return;
    }
    if(dras){ flyttTil(e.clientX, e.clientY); return; }
    if(PLASS.aktiv()){ PLASS.pek(e.clientX, e.clientY); return; }
    FELT.panorer(dx, dy);
  }
  function opp(e){
    if(!pekere.has(e.pointerId)) return;
    pekere.delete(e.pointerId);
    stoppHold();
    if(pekere.size > 0) return;            // resten av knipet holder fortsatt
    if(knip){ knip = false; return; }
    if(dras){ slippFlytting(); return; }
    if(PLASS.aktiv()){ PLASS.slipp(); return; }
    if(flyttet < 9 && aktiv === 'field') plukkArt(e.clientX, e.clientY);
  }
  addEventListener('pointerdown', ned);
  addEventListener('pointermove', flytt);
  addEventListener('pointerup', opp);
  addEventListener('pointercancel', opp);
  /* Styreplate: to fingre panorerer, knip (ctrl+wheel) zoomer. Musehjul zoomer. */
  addEventListener('wheel', e => {
    if(aktiv !== 'field') return;
    if(e.ctrlKey){ FELT.zoom(e.deltaY*0.12); return; }   // knip paa styreplate
    if(e.deltaX !== 0 || e.deltaMode === 0){
      FELT.panorer(-e.deltaX, -e.deltaY);               // to fingre drar plenen
      return;
    }
    FELT.zoom(e.deltaY*0.02);                           // musehjul i hakk
  }, {passive:true});
})();

/* ---------- plukke opp og flytte artene ---------- */
const _ray   = new THREE.Raycaster();
const _nd    = new THREE.Vector2();
const _plan  = new THREE.Plane(new THREE.Vector3(0,1,0), -1);
const _punkt = new THREE.Vector3();

function pekerTilRay(px, py){
  const boks = canvas.getBoundingClientRect();
  _nd.x =  ((px - boks.left) / boks.width)  * 2 - 1;
  _nd.y = -((py - boks.top)  / boks.height) * 2 + 1;
  _ray.setFromCamera(_nd, FELT.S.cam);
}

/** hvilken art ligger under fingeren? */
function artUnder(px, py){
  pekerTilRay(px, py);
  const treff = _ray.intersectObjects(FELT.plukkbare, false);
  if(!treff.length) return null;
  const uid = treff[0].object.userData.uid;
  return FELT.arter.find(o => o.uid === uid) || null;
}

/** hvor paa plenen peker fingeren? */
function bakkePunkt(px, py){
  pekerTilRay(px, py);
  if(!_ray.ray.intersectPlane(_plan, _punkt)) return null;
  return {
    x: clamp(_punkt.x, -PLEN_R+3, PLEN_R-3),
    z: clamp(_punkt.z, -PLEN_R+3, PLEN_R-3),
  };
}

/** hvilken hageting ligger under fingeren? */
function pyntUnder(px, py){
  pekerTilRay(px, py);
  const treff = _ray.intersectObjects(FELT.pyntPlukkbare, false);
  if(!treff.length) return null;
  const uid = treff[0].object.userData.pyntUid;
  return FELT.pynt.find(o => o.p.uid === uid) || null;
}

function plukkArt(px, py){
  const o = artUnder(px, py);
  if(o){
    velgPynt(null);
    LYD.klikk(); dirr(12);
    visDetalj(o.art, o.ex);
    return;
  }
  if(VISIT.active()) return;      // nothing on a guest lawn can be turned
  velgPynt(pyntUnder(px, py));   // trykk paa hageting = vri den, trykk paa graset = velg bort
}

/* ---------- vriing ----------
   Hageting kan snus etter at den er satt ut: trykk paa den, bruk pilene.
   Samme knapper vrir forhaandsvisningen mens du plasserer noe nytt. */
let valgtPynt = null;

function velgPynt(o){
  valgtPynt = o || null;
  if(valgtPynt){
    visMarkor(valgtPynt.grp.position.x, valgtPynt.baseY + 0.06, valgtPynt.grp.position.z);
    LYD.klikk(); dirr(10);
  } else if(!dras && !PLASS.aktiv()){
    skjulMarkor();
  }
  visVriPanel();
}

/** panelet vises naar noe kan vris: en valgt ting eller en forhaandsvisning */
function visVriPanel(){
  const panel = $('#feltVri');
  if(!panel) return;
  if(VISIT.active()){ panel.hidden = true; return; }
  /* dammen er rund - den har ingenting aa vri */
  const id = PLASS.aktiv() ? PLASS.varenId() : valgtPynt ? valgtPynt.p.id : null;
  const navn = id && id !== 'dam'
             ? (PLASS.aktiv() ? PLASS.navn() : BUTIKK_BY_ID[id].navn)
             : null;
  panel.hidden = !navn;
  if(navn) $('#feltVriNavn').textContent = navn;
}

/** vri det som er aktivt: forhaandsvisning foerst, ellers valgt ting */
function vriAktiv(retning){
  if(PLASS.aktiv()){ PLASS.vri(retning * VRI_STEG); LYD.klikk(); dirr(8); return; }
  if(!valgtPynt) return;
  valgtPynt.p.rotY = (valgtPynt.p.rotY || 0) + retning * VRI_STEG;
  valgtPynt.grp.rotation.y = valgtPynt.p.rotY;
  LYD.klikk(); dirr(8);
}

$('#feltVri').addEventListener('click', e => {
  const k = e.target.closest('[data-vri]');
  if(!k) return;
  e.stopPropagation();
  vriAktiv(parseInt(k.dataset.vri, 10));
});

const VRI_STEG = Math.PI/12;   // 15 grader per trykk

/** vinkel som vender tingen mot midten av plenen */
function vriMot(vare, x, z){
  return vare.vri === 'senter' ? Math.atan2(-x, -z) : rnd(0, 6.28);
}

// ---------- draing ----------
let dras = null, markor = null;

/** den gule ringen som viser hvor tingen havner */
function visMarkor(x, y, z){
  if(!markor){
    markor = new THREE.Mesh(
      new THREE.RingGeometry(0.75, 1.05, 28),
      new THREE.MeshBasicMaterial({ color:0xe8b93c, transparent:true, opacity:0.85,
                                    side:THREE.DoubleSide }));
    markor.rotation.x = -Math.PI/2;
  }
  markor.position.set(x, y, z);
  if(markor.parent !== FELT.rot) FELT.rot.add(markor);
}
function skjulMarkor(){
  if(markor && markor.parent) markor.parent.remove(markor);
}

/** hoyden en ting hviler i - arter synker i dammen, dammen ligger i graset */
function hvileHoyde(o){
  if(!o.pynt) return artHoyde(o.art, o.grp.position.x, o.grp.position.z);
  return o.p.id === 'dam' ? DAM_VANN : 1;
}

function startFlytting(o){
  if(o.pynt) velgPynt(null);
  dras = o;
  o.dras = true;
  o.baseSkala = o.grp.scale.x;
  o.grp.scale.setScalar(o.baseSkala * 1.1);
  visMarkor(o.grp.position.x, 1.06, o.grp.position.z);
  $('#feltFlytt').textContent = 'FLYTTER ' +
    (o.pynt ? BUTIKK_BY_ID[o.p.id].navn : visningsNavn(o.art));
  $('#feltFlytt').hidden = false;
  LYD.naer(); dirr(20);
}

function flyttTil(px, py){
  if(!dras) return;
  const p = bakkePunkt(px, py);
  if(!p) return;
  const y = dras.pynt ? (dras.p.id === 'dam' ? DAM_VANN : 1)
                      : artHoyde(dras.art, p.x, p.z);
  dras.grp.position.set(p.x, y + 1.1, p.z);
  visMarkor(p.x, y + 0.06, p.z);
}

/** finnes et eksemplar av samme art og samme nivaa rett under dette? */
function finnMakker(o){
  return FELT.arter.find(t =>
    t !== o && t.art === o.art && t.ex.niva === o.ex.niva && !t.dras &&
    Math.hypot(t.grp.position.x - o.grp.position.x,
               t.grp.position.z - o.grp.position.z) < 2.4) || null;
}

function slippFlytting(){
  if(!dras) return;
  const o = dras;
  const x = o.grp.position.x, z = o.grp.position.z;
  o.grp.scale.setScalar(o.baseSkala || 1);
  o.dras = false;
  skjulMarkor();
  $('#feltFlytt').hidden = true;
  dras = null;

  if(o.pynt){                       // hageting: lagre og bygg plenen paa nytt
    o.p.x = x; o.p.z = z;             // vinkelen beholdes - den vrir du med knappene
    LYD.steg(); dirr(28);
    byggFelt();
    return;
  }

  o.base = { x, z };
  o.baseY = artHoyde(o.art, x, z);
  o.grp.position.set(x, o.baseY, z);
  if(iDammen(x, z) && o.r > 0.7) o.r = 0.7;
  o.ex.x = x; o.ex.z = z;

  const makker = finnMakker(o);
  if(makker) visNivaDialog(o, makker);
  else { LYD.steg(); dirr(28); saveLawn(); }
}

// ---------- plassering for haand ----------
/* Alt du kjoper eller skanner ligger med x=null til du setter det ut selv.
   Bare en ting venter om gangen - butikken er laast til den staar paa plenen. */
function venterPlassering(){
  const p = STATE.pynt.find(p => p.x === null);
  if(p) return { slag:'pynt', o:p };
  const e = STATE.eksemplarer.find(e => e.x === null);
  if(e) return { slag:'art', o:e };
  return null;
}

const PLASS = (() => {
  let na = null;          // {slag, o, grp, x, z, rotY}

  function lagGrp(slag, o){
    if(slag === 'pynt'){
      const vare = BUTIKK_BY_ID[o.id];
      return vare.id === 'dam' ? damMesh(0, 0, STATE.sesong)
                               : propMesh(vare.vox, 0, 0, 0, vare.skala);
    }
    const sp = SPECIES_BY_ID[o.art];
    return modellSkalert(o.art, (sp.hoyde || 1.6) * PLEN_SKALA,
      sp.kind === 'plante' ? { sesong:STATE.sesong, variant:o.variant }
                           : { variant:o.variant });
  }

  function navn(){
    return na.slag === 'pynt' ? BUTIKK_BY_ID[na.o.id].navn : visningsNavn(na.o.art);
  }

  /** flytt forhaandsvisningen til et punkt paa plenen */
  function sett(x, z){
    if(!na) return;
    x = clamp(x, -PLEN_R+3, PLEN_R-3);
    z = clamp(z, -PLEN_R+3, PLEN_R-3);
    na.x = x; na.z = z;
    const y = na.slag === 'pynt' ? (na.o.id === 'dam' ? DAM_VANN : 1)
                                 : artHoyde(na.o.art, x, z);
    const loft = na.o.id === 'dam' ? 0.35 : 0.9;   // dammen har ingen grop foer den er satt: vis den over graset
    /* 'senter'-ting foelger midten av plenen til du vrir dem selv */
    if(na.slag === 'pynt' && !na.vridd && BUTIKK_BY_ID[na.o.id].vri === 'senter')
      na.rotY = vriMot(BUTIKK_BY_ID[na.o.id], x, z);
    na.grp.rotation.y = na.rotY || 0;
    na.grp.position.set(x, y + loft, z);
    visMarkor(x, y + 0.06, z);
  }

  function pek(px, py){
    const p = bakkePunkt(px, py);
    if(p) sett(p.x, p.z);
  }

  /** vri forhaandsvisningen - da slutter den aa snu seg selv */
  function vri(d){
    if(!na) return;
    na.vridd = true;
    na.rotY = (na.rotY || 0) + d;
    na.grp.rotation.y = na.rotY;
  }

  /** sett tingen ned for godt */
  function slipp(){
    if(!na || na.x == null) return;
    const { slag, o, x, z } = na;
    if(slag === 'pynt'){
      o.x = x; o.z = z; o.rotY = na.rotY || 0;
      LYD.funn(); dirr([20,40,20]);
      toast(BUTIKK_BY_ID[o.id].navn + ' satt ut p\u00e5 plenen');
      rydd();
      byggFelt();
      return;
    }
    o.x = x; o.z = z;
    STATE.sistLagt = o.uid;
    rydd();
    byggFelt();
    byggSamling();
    const ny = FELT.arter.find(a => a.uid === o.uid);
    const makker = ny && finnMakker(ny);
    if(makker) visNivaDialog(ny, makker);
    else { LYD.steg(); dirr(28); }
  }

  function rydd(){
    if(na && na.grp && na.grp.parent) na.grp.parent.remove(na.grp);
    na = null;
    if(!dras && !valgtPynt) skjulMarkor();
    $('#feltPlasser').hidden = true;
    visVriPanel();
  }

  /** kalles hver gang plenen bygges - plenen tommes, saa visningen maa settes opp igjen */
  function synk(){
    const vent = venterPlassering();
    if(!vent){ rydd(); return; }
    const forrige = na && na.o === vent.o ? { x:na.x, z:na.z, rotY:na.rotY, vridd:na.vridd } : null;
    if(na && na.grp && na.grp.parent) na.grp.parent.remove(na.grp);
    const grp = lagGrp(vent.slag, vent.o);
    na = { slag:vent.slag, o:vent.o, grp, x:null, z:null, rotY:0, vridd:false };
    /* tilfeldig vinkel trekkes en gang, ellers ville tingen snurret
       hver gang du flyttet fingeren */
    if(vent.slag === 'pynt' && BUTIKK_BY_ID[vent.o.id].vri !== 'senter') na.rotY = rnd(0, 6.28);
    FELT.rot.add(grp);
    if(forrige && forrige.x != null){
      na.rotY = forrige.rotY; na.vridd = forrige.vridd;
      sett(forrige.x, forrige.z);
    } else sett(FELT.kam.x, FELT.kam.z);
    $('#feltPlasser').textContent = 'TRYKK P\u00c5 PLENEN FOR \u00c5 SETTE ' + navn();
    $('#feltPlasser').hidden = false;
    visVriPanel();
  }

  return { synk, pek, slipp, vri, navn, aktiv: () => !!na,
           varenId: () => na && na.slag === 'pynt' ? na.o.id : null };
})();

// ---------- sammenslaaing til hoyere nivaa ----------
let venterMerge = null;

function visNivaDialog(fra, til){
  const sp = SPECIES_BY_ID[til.art];
  const gammelt = til.ex.niva, nytt = gammelt + 1;
  const f = statPaaNiva(sp, gammelt), n = statPaaNiva(sp, nytt);
  venterMerge = { fra, til };

  $('#mergeArt').textContent = visningsNavn(til.art);
  $('#mergeFra').textContent = 'Nv ' + gammelt;
  $('#mergeTil').textContent = 'Nv ' + nytt;
  $('#mergeStats').innerHTML = [
    ['HP', f.hp, n.hp], ['ANGREP', f.angrep, n.angrep],
    ['FORSVAR', f.forsvar, n.forsvar], ['FART', f.fart, n.fart],
  ].map(rad => `<div class="merge-rad">
      <span class="merge-n">${rad[0]}</span>
      <span class="merge-fra">${rad[1]}</span>
      <span class="merge-pil">&#8594;</span>
      <span class="merge-til">${rad[2]}</span>
      <span class="merge-delta">+${rad[2]-rad[1]}</span>
    </div>`).join('');
  $('#mergeBoks').hidden = false;
  LYD.naer(); dirr(30);
}

function lukkNivaDialog(){
  $('#mergeBoks').hidden = true;
  venterMerge = null;
}

function godtaNiva(){
  if(!venterMerge) return;
  const { fra, til } = venterMerge;
  til.ex.niva += 1;
  STATE.eksemplarer = STATE.eksemplarer.filter(e => e.uid !== fra.ex.uid);
  STATE.sistLagt = til.ex.uid;
  lukkNivaDialog();
  byggFelt();
  byggSamling();
  LYD.sjelden(); dirr([30,60,30,60,90]);
  toast(SPECIES_BY_ID[til.art].navn + ' er n\u00e5 niv\u00e5 ' + til.ex.niva);
}

function avbrytNiva(){
  if(!venterMerge) return;
  const { fra } = venterMerge;
  const p = fra.forrige;
  if(p){                         // legg den tilbake der den stod
    fra.base = { x:p.x, z:p.z };
    fra.baseY = artHoyde(fra.art, p.x, p.z);
    fra.grp.position.set(p.x, fra.baseY, p.z);
    fra.ex.x = p.x; fra.ex.z = p.z;
  }
  lukkNivaDialog();
  LYD.klikk();
}

$('#scanLukk').addEventListener('click', () => { LYD.klikk(); dirr(12); gaTil(forSkann); });

/* Leaving a guest lawn goes back to the list you came from. */
$('#feltBesokUt').addEventListener('click', () => {
  LYD.klikk(); dirr(12);
  VISIT.leave();
  gaTil('lobby');
});

$('#mergeJa').addEventListener('click', godtaNiva);
$('#mergeNei').addEventListener('click', avbrytNiva);

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

/** setter arten skanneruta skal materialisere, med variant etter vanlige regler */
function settMal(art){
  STATE.malArt = art;
  STATE.malVariant = STATE.funnet.has(art) ? variantAv(art) : trekkVariant();
  SKANN.setArt(art, { variant: STATE.malVariant });
}

/* Ekte skann krever tre ting: modellene er konfigurert, kameraet gir bilde,
   og det er ikke et oppsatt mote fra kartet. Ellers kjorer det simulerte,
   som er akkurat slik spillet oppforte seg for. */
let ekteSkann = false;

async function startSkann(){
  /* typeof-sjekken gjor at et feilslaatt klassifiser.js ikke tar skanneren
     med seg i fallet - da kjorer spillet bare simulert som for. */
  ekteSkann = typeof KLASSIFISER !== 'undefined' && KLASSIFISER.konfigurert() && !STATE.kartMal;
  STATE.malNiva = 0;
  if(ekteSkann){
    STATE.malArt = null;
    STATE.malVariant = null;
    SKANN.tomArt();
  } else {
    const art = STATE.kartMal || tilfeldigArt();
    STATE.kartMal = null;
    settMal(art);
  }
  $('#scanCoords').textContent = geoTekst();
  SKANN.setProgresjon(0);
  $('#scanReadout').textContent = 'RETT KAMERAET MOT ARTEN';
  $('#scanReadout').classList.remove('treff','bom');
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
      ekteSkann = false;   /* uten kamera finnes det ikke noe aa klassifisere */
    }
  }
}
function stoppSkann(){
  if(kamStrom){ kamStrom.getTracks().forEach(t => t.stop()); kamStrom = null; }
  $('#camFeed').srcObject = null;
}
SCENES.scan.exit = stoppSkann;

/* ---------- simulert skann: uendret oppforsel, brukes naar modellene
   ikke er tilgjengelige, naar kartet har satt opp et mote, og som
   fallback hvis noe ryker underveis ---------- */
function simulertSkann(){
  STATE.malNiva = 0;   /* simulert skann er alltid et sikkert treff */
  if(!STATE.malArt) settMal(tilfeldigArt());
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
}

/* ---------- ekte skann ---------- */

/** materialiserer voxelmodellen fra 0 til 1 og kaller ferdig() etterpaa */
function materialiser(ferdig){
  const t0 = performance.now(), varighet = 520;
  const steg = () => {
    const a = Math.min(1, (performance.now() - t0) / varighet);
    SKANN.setProgresjon(a);
    if(a < 1) requestAnimationFrame(steg); else ferdig();
  };
  requestAnimationFrame(steg);
}

/** ja/nei-dialog for nedlasting av en modell. Returnerer Promise<bool>. */
let nektetModell = new Set();
function sporOmNedlasting(info){
  if(nektetModell.has(info.navn)) return Promise.resolve(false);
  return new Promise(ok => {
    const boks  = $('#modellDialog');
    const tekst = $('#modellDialogTxt');
    tekst.innerHTML = info.tittel + ' MÅ LASTES NED<br><b>CA. ' + info.mb +
      ' MB</b> · ÉN GANG PER ENHET<br>LAGRES OFFLINE ETTERPÅ';
    boks.hidden = false;
    const svar = ja => {
      boks.hidden = true;
      $('#modellJa').onclick = null;
      $('#modellNei').onclick = null;
      if(!ja) nektetModell.add(info.navn);
      ok(ja);
    };
    $('#modellJa').onclick  = () => { LYD.klikk(); svar(true); };
    $('#modellNei').onclick = () => { LYD.klikk(); svar(false); };
  });
}

function visSkannResultat(svar){
  const prosent = Math.round((svar.p || 0) * 100);
  const raa = (svar.latin || svar.felles || 'INGEN MATCH').toUpperCase();

  STATE.malNiva = svar.niva;

  if(!svar.id){
    $('#scanReadout').textContent = 'UKJENT ART · ' + raa + ' ' + prosent + ' %';
    $('#scanReadout').classList.add('bom');
    $('#scanMeterFill').style.width = '100%';
    LYD.klikk(); dirr(12);
    $('#scanGo').disabled = false;
    $('#scanBeam').classList.remove('kjor');
    return;
  }

  settMal(svar.id);
  const sp = SPECIES_BY_ID[svar.id];
  const vari = STATE.malVariant;
  $('#scanReadout').textContent = raa + ' ' + prosent + ' % → ' +
    (vari ? VARIANTER[vari].navn + ' ' : '') + sp.navn +
    (vari ? ' — AVVIKENDE FARGE!' : ' — ' + svar.nivaTekst);
  $('#scanReadout').classList.add('treff');
  $('#scanMeterFill').style.width = '100%';

  materialiser(() => {
    blitz();
    if(vari){ LYD.sjelden(); dirr([30,60,30,60,90]); }
    else    { LYD.funn();    dirr(60); }
    setTimeout(() => visFunn(svar.id), 460);
  });
}

function skannFase(fase, andel){
  if(fase === 'laster'){
    $('#scanReadout').textContent = 'LASTER ARTSMODELL ' + Math.round(andel*100) + ' %';
    $('#scanMeterFill').style.width = Math.round(andel*100) + '%';
  } else {
    $('#scanReadout').textContent = andel < 0.5 ? 'ANALYSERER BILDE…' : 'SAMMENLIGNER MED ARTSBANK…';
    $('#scanMeterFill').style.width = Math.round(50 + andel*50) + '%';
  }
}

$('#scanGo').addEventListener('click', async () => {
  const knapp = $('#scanGo');
  if(knapp.disabled) return;
  knapp.disabled = true;
  LYD.skann(); dirr(25);
  $('#scanBeam').classList.add('kjor');
  $('#scanReadout').classList.remove('treff','bom');

  const video = $('#camFeed');
  const harBilde = !!kamStrom && video.readyState >= 2 && video.videoWidth > 0;
  if(!ekteSkann || !harBilde){ simulertSkann(); return; }

  try {
    const svar = await KLASSIFISER.klassifiser(video, {
      onFase: skannFase,
      bekreftNedlasting: sporOmNedlasting,
      /* samlingen bryter uavgjort paa slekt og familie: en art du mangler
         slaar en du alt har, ellers ville fjellrev aldri vunnet over rev */
      funnet: STATE.funnet,
    });
    visSkannResultat(svar);
  } catch(err){
    /* Modeller som mangler hoppes over inne i klassifiser.js. Kommer vi hit,
       kom ingen av dem gjennom, eller spilleren sa nei til begge. */
    if(err.navn === 'ModellUtilgjengelig' || err.navn === 'NedlastingKreves'){
      toast('SKANNER UTEN MODELL');
    } else {
      /* Meldingen maa fram paa skjermen. Paa telefon finnes ingen konsoll,
         og "MODELLEN SVIKTET" alene sier ingenting om hvorfor. */
      console.warn('skann feilet:', err);
      const grunn = String(err && (err.message || err.name) || err).slice(0, 80);
      toast('MODELLEN SVIKTET: ' + grunn.toUpperCase());
      $('#scanReadout').textContent = 'FEIL: ' + grunn;
      $('#scanReadout').classList.add('bom');
    }
    ekteSkann = false;
    simulertSkann();
  }
});

// ============================================================ funn
/* Et sikkert artstreff er verdt mer enn en gjetning paa slekt eller familie.
   Indeks foelger nivaaene i artsmapping.js: 0 sikker, 1 slektning, 2 usikker.
   Det simulerte skannet har ikke noe niva og faar full uttelling. */
const NIVA_XP = [1, 0.6, 0.35];

function visFunn(id, variant){
  const sp = SPECIES_BY_ID[id];
  const ny = !STATE.funnet.has(id);
  variant = variant !== undefined ? variant : STATE.malVariant;
  const niva = STATE.malNiva || 0;
  const mult = (variant ? VARIANTER[variant].bonus : 1) * (NIVA_XP[niva] != null ? NIVA_XP[niva] : 1);
  $('#revealKicker').textContent = variant
    ? VARIANTER[variant].navn + ' VARIANT!'
    : niva > 0
      ? ARTSMAPPING.NIVA_TEKST[niva] + ' · ' + (ny ? 'NY ART' : 'DUPLIKAT')
      : (ny ? 'NY ART REGISTRERT' : 'DUPLIKAT REGISTRERT');
  $('#revealKicker').classList.toggle('variant', !!variant);
  const xp = Math.round((ny ? 60 + sp.sjelden*25 : 10) * mult);
  $('#revealXp').textContent = xp;
  $('#revealCard').innerHTML = kortRamme(sp, true, variant);
  SCENES.reveal.setArt(id, 3.0, {variant});
  SCENES.reveal.baseY = -0.9;
  gaTil('reveal');
  $('#revealOk').textContent = ny ? 'PLANT P\u00c5 PLENEN' : 'SETT UT P\u00c5 PLENEN';
  $('#revealOk').onclick = () => {
    nyttEksemplar(id, variant);   // duplikater er meningen: to like kan slaas sammen
    toast('TRYKK P\u00c5 PLENEN FOR \u00c5 SETTE ' + visningsNavn(id));
    gaTil('field');   // plenen aapner i plasseringsmodus - du velger plassen selv
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
  /* malHoyde fyller ruta: over 2.7 gaar de breie modellene ut av bildet */
  return (id, variant, malHoyde) => {
    const h = malHoyde || 2.1;
    const nokkel = id + '|' + (variant||'') + '|' + h;
    if(MINI[nokkel]) return MINI[nokkel];
    if(!rt) oppsett();
    const g = modellSkalert(id, h, {variant});
    g.rotation.y = -0.5;
    sc.add(g);
    rt.render(sc, cam);
    MINI[nokkel] = rt.domElement.toDataURL('image/png');
    sc.remove(g);
    return MINI[nokkel];
  };
})();

// ============================================================ bro til battle.js
/* Kortspillet ligger i sin egen fil og trenger noen faa ting herfra. */
window.VM = { STATE, LYD, dirr, toast, lagMini, oppdaterHud, gaTil, visningsNavn,
  fieldSnapshot: () => VISIT.snapshot(),
  visitField: (navn, felt) => VISIT.enter(navn, felt),
  dekkStokk, dekkHar, dekkVelg,
};


/** "Nv 2 x3" under miniatyren */
function nivaMerke(art){
  const liste = eksemplarerAv(art);
  if(!liste.length) return '';
  const niva = toppNiva(art);
  return (niva > 1 ? 'Nv ' + niva : '\u2605'.repeat(SPECIES_BY_ID[art].sjelden)) +
         (liste.length > 1 ? '  \u00d7' + liste.length : '');
}

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
      <span class="mini-sjelden">${har ? nivaMerke(sp.id) : '★'.repeat(sp.sjelden)}</span>
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

function visDetalj(id, ex){
  const sp = SPECIES_BY_ID[id];
  const vari = ex ? ex.variant : variantAv(id);
  const niva = ex ? ex.niva : toppNiva(id);
  const st = statPaaNiva(sp, niva);
  $('.detail-close').dataset.go = (aktiv === 'field') ? 'field' : 'collection';
  $('#detailName').textContent = visningsNavn(id);
  $('#detailSci').textContent  = sp.sci;
  $('#detailFact').textContent = sp.fakta;
  $('#detailName').textContent += niva > 1 ? '  Nv ' + niva : '';
  /* LES MER: knappen barer artsId, og skjules for arter uten artikkel */
  const mer = $('#detailMer');
  if(mer){
    mer.dataset.mer = id;
    mer.hidden = !(window.ARTIKKEL && ARTIKKEL.har(id));
  }
  $('#detailStats').innerHTML = [
    ['HP',st.hp,140],['ANGREP',st.angrep,50],['FORSVAR',st.forsvar,50],['FART',st.fart,50]
  ].map(([n,v,m]) =>
    `<div class="stat"><span class="stat-n">${n}</span>
      <div class="stat-bar"><i style="width:${Math.min(100,v/m*100)}%"></i></div>
      <span class="stat-v">${v}</span></div>`).join('');
  SCENES.detail.setArt(id, 3.2, {variant:vari});
  SCENES.detail.baseY = 2.1;
  gaTil('detail');
}

// ============================================================ butikk
/* Ikonet er tingen selv: samme voxelmodell som havner paa plenen, rendret en
   gang og gjemt i MINI. Tegnet staar igjen om WebGL sier nei. */
function vareIkon(b){
  const id = b.vox || b.ikonVox;
  if(!id) return b.ikon;
  try { return `<img class="vare-bilde" src="${lagMini(id, null, 2.6)}" alt="">`; }
  catch { return b.ikon; }
}

function byggButikk(){
  $('#shopCoins').textContent = STATE.mynt;
  const venter = !!venterPlassering();
  const intro = $('.shop-intro');
  if(intro) intro.textContent = venter
    ? 'SETT UT DET DU ALLEREDE HAR KJ\u00d8PT F\u00d8R DU KJ\u00d8PER MER.'
    : 'EN TING OM GANGEN. DU SETTER DEN UT SELV. MYNT F\u00c5R DU AV \u00c5 VINNE DYSTER.';
  $('#shopGrid').innerHTML = BUTIKK.map(b => {
    const antall = STATE.pynt.filter(p => p.id === b.id).length;
    const raad = STATE.mynt >= b.pris;
    return `<article class="vare${antall?' eid':''}">
      <span class="vare-ikon">${vareIkon(b)}</span>
      <div class="vare-tekst">
        <span class="vare-navn">${b.navn}${antall ? ` <i class="vare-ant">&times;${antall}</i>` : ''}</span>
        <span class="vare-desc">${b.desc}</span>
      </div>
      <button class="vare-kjop" data-vare="${b.id}"
        ${!raad || venter ? 'disabled' : ''}>${b.pris} &#9679;</button>
    </article>`;
  }).join('');
}
$('#shopGrid').addEventListener('click', e => {
  const k = e.target.closest('.vare-kjop');
  if(!k || k.disabled) return;
  const vare = BUTIKK_BY_ID[k.dataset.vare];
  if(STATE.mynt < vare.pris || venterPlassering()) return;
  STATE.mynt -= vare.pris;
  STATE.pynt.push({ uid: STATE.nestePyntUid++, id:vare.id, x:null, z:null, rotY:0 });
  LYD.funn(); dirr([20,40,20]);
  oppdaterHud();
  gaTil('field');                 // plenen aapner i plasseringsmodus
  toast('TRYKK P\u00c5 PLENEN FOR \u00c5 SETTE ' + vare.navn);
});

// ============================================================ dyst
/* Hele kortspillet ligger i battle.js. Her er bare inngangen og broen. */
/* En nettkamp er allerede satt opp av lobbyen naar vi kommer hit.
   Ellers er det maskinen vi skal spille mot. */
function startDyst(){ if(!KORTSPILL.KS.nett) KORTSPILL.start(); }

// ============================================================ småting
function oppdaterHud(){
  $$('.hud-mynt').forEach(el => el.textContent = STATE.mynt);
  $$('.hud-niva').forEach(el => el.textContent = STATE.niva);
  saveLawn();
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
  if(q.get('alle')) SPECIES.forEach(s => nyttEksemplar(s.id));
  stillOppAlle();
  const dupl = parseInt(q.get('dupl'), 10);
  if(dupl > 0) SPECIES.slice(0, dupl).forEach(s => nyttEksemplar(s.id));
  stillOppAlle();
  if(q.get('kjop')) BUTIKK.forEach((b, i) => {
    const p = feltPlass(i + 3);
    STATE.pynt.push({ uid: STATE.nestePyntUid++, id:b.id, x:p.x, z:p.z, rotY:vriMot(b, p.x, p.z) });
  });
  if(q.get('mynt')) STATE.mynt = parseInt(q.get('mynt'), 10) || STATE.mynt;
  const antall = parseInt(q.get('n'), 10);
  if(antall > 0) SPECIES.slice(0, antall).forEach(s => nyttEksemplar(s.id));
  stillOppAlle();
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
    else if(skjerm === 'detail' && art){ nyttEksemplar(art); stillOppAlle(); byggFelt(); visDetalj(art); }
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
const LYD_IKON = {
  paa:'<svg class="ico ico-s" viewBox="0 0 9 9" aria-hidden="true"><rect x="1" y="3" width="2" height="3"/><rect x="3" y="2" width="1" height="5"/><rect x="4" y="1" width="1" height="7"/><rect x="6" y="3" width="1" height="3"/><rect x="8" y="2" width="1" height="5"/></svg>',
  av:'<svg class="ico ico-s" viewBox="0 0 9 9" aria-hidden="true"><rect x="1" y="3" width="2" height="3"/><rect x="3" y="2" width="1" height="5"/><rect x="4" y="1" width="1" height="7"/><rect x="6" y="2" width="1" height="1"/><rect x="7" y="3" width="1" height="1"/><rect x="8" y="4" width="1" height="1"/><rect x="8" y="2" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/></svg>'
};
const lydKnapp = $('#lydBtn');
if(lydKnapp) lydKnapp.onclick = () => {
  const av = LYD.demp();
  lydKnapp.innerHTML = av ? LYD_IKON.av : LYD_IKON.paa;
  lydKnapp.classList.toggle('av', av);
  toast(av ? 'Lyd av' : 'Lyd på');
};

// demo-snarveier under filming: tastene 1-8
addEventListener('keydown', e => {
  const kart = { '1':'splash','2':'shop','3':'field','4':'scan','5':'reveal','6':'collection','7':'lobby','8':'battle' };
  if(kart[e.key]){
    if(e.key==='5') visFunn(tilfeldigArt(), trekkVariant());
    else gaTil(kart[e.key]);
  }
  if(e.key==='a'){ SPECIES.forEach(s => nyttEksemplar(s.id)); stillOppAlle(); byggFelt(); byggSamling(); toast('Alle arter låst opp'); }
  if(e.key==='s'){ byttSesong(); }
  if(e.key==='v'){ const id = pick(SPECIES).id; nyttEksemplar(id, pick(Object.keys(VARIANTER))); stillOppAlle(); byggFelt(); byggSamling(); toast(visningsNavn(id)); }
  if(e.key==='d'){ const id = pick([...STATE.funnet]); if(id){ nyttEksemplar(id); stillOppAlle(); byggFelt(); toast('Duplikat: ' + SPECIES_BY_ID[id].navn); } }
  if(e.key==='t'){ STATE.funnet.clear(); STATE.varianter = {}; STATE.pynt = []; STATE.eksemplarer = []; byggFelt(); toast('Plenen tømt'); }
  if(e.key==='r'){ STATE.eksemplarer.forEach((ex, i) => { const p = feltPlass(i); ex.x = p.x; ex.z = p.z; }); byggFelt(); toast('Artene stilt opp i spiral'); }
  if(e.key==='k'){ STATE.mynt += 500; oppdaterHud(); byggButikk(); toast('+500 mynt'); }
  if(aktiv === 'field' && (e.key === 'ArrowLeft'  || e.key === 'q')) vriAktiv(-1);
  if(aktiv === 'field' && (e.key === 'ArrowRight' || e.key === 'e')) vriAktiv(1);
});

})();
