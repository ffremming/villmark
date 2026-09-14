/* VILLMARK - app logic and 3D scenes */
(() => {
'use strict';

// ============================================================ setup
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
/* without tone mapping, bright surfaces (sand, snow) clip to pure white */
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

let W=0, H=0;
/* Phones are tall and narrow. With a fixed vertical fov the horizontal fov
   gets so narrow that everything ends up outside the frame. So we lock the
   HORIZONTAL fov and work the vertical one out from the aspect ratio. */
function setFov(cam){
  const hfov = cam.userData.hfov;
  if(!hfov) return;
  const halfH = Math.atan(Math.tan(hfov*Math.PI/360) / cam.aspect);
  cam.fov = halfH*360/Math.PI;
}
function resize(){
  /* on wide screens the CSS keeps the canvas in phone format.
     Use the measured size, otherwise the picture is stretched and the labels
     end up outside the frame. */
  const box = canvas.getBoundingClientRect();
  W = Math.round(box.width)  || innerWidth;
  H = Math.round(box.height) || innerHeight;
  renderer.setSize(W,H,false);
  for(const s of Object.values(SCENES)) if(s && s.cam){
    s.cam.aspect = W/H;
    setFov(s.cam);
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

// ============================================================ state
function seasonFromDate(d = new Date()){
  const m = d.getMonth();
  if(m <= 1 || m === 11) return 'winter';
  if(m <= 4) return 'spring';
  if(m <= 7) return 'summer';
  return 'autumn';
}

const STATE = {
  found: new Set(),
  variants: {},          // species id -> variant key
  coins: 500,            // starting purse - coins are earned in duels only
  level: 3,
  props: [],             // bought garden things: {uid, id, x, z, rotY}. x=null = not placed yet
  nextPropUid: 1,
  specimens: [],         // every scan gives one specimen: {uid, species, level, variant, x, z}
  nextUid: 1,
  deck: new Set(),       // the uids you have picked into the deck
  deckChosen: false,     // false = nobody has touched the deck, so the whole lawn is in
  lastPlaced: null,      // species that should grow in on the lawn
  mapTarget: null,       // species chosen from the map - overrides a random scan
  targetSpecies: null,
  targetVariant: null,
  targetLevel: 0,        // confidence level from speciesmapping: 0 certain, 1 relative, 2 uncertain
  season: seasonFromDate(),
};

/* The lawn from last time, straight off this phone. Nothing is fetched from
   the network: what you built is yours and stays here. */
STORE.load(STATE);
const saveLawn = () => STORE.save(STATE);
addEventListener('pagehide', () => STORE.flush(STATE));
document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'hidden') STORE.flush(STATE);
});

/** roll a variant on a scan - most finds are ordinary */
function rollVariant(){
  let r = Math.random();
  for(const k in VARIANTS){
    if(r < VARIANTS[k].chance) return k;
    r -= VARIANTS[k].chance;
  }
  return null;
}
function variantOf(id){ return STATE.variants[id] || null; }

/* ---------- specimens and levels ----------
   The same species can stand on the lawn several times. Two specimens of the
   same species at the same level can be dragged together into one specimen
   one level higher. */
/* LEVEL_STEP lives in cards.js: the card and the animal grow in step. */

function newSpecimen(species, variant){
  const e = { uid: STATE.nextUid++, species, level:1, variant: variant || null, x:null, z:null };
  STATE.specimens.push(e);
  STATE.deck.add(e.uid);          // new finds join the deck right away
  STATE.found.add(species);
  if(variant) STATE.variants[species] = variant;
  return e;
}
function specimensOf(species){ return STATE.specimens.filter(e => e.species === species); }
function topLevel(species){
  const list = specimensOf(species);
  return list.length ? Math.max.apply(null, list.map(e => e.level)) : 1;
}
function statsAtLevel(sp, level){
  const f = 1 + LEVEL_STEP*(level-1);
  return {
    hp:      Math.round(sp.hp * f),
    attack:  Math.round(sp.attack * f),
    defense: Math.round(sp.defense * f),
    speed:   Math.round(sp.speed * f),
  };
}
function displayName(id){
  const v = variantOf(id);
  return v ? VARIANTS[v].name + ' ' + SPECIES_BY_ID[id].name : SPECIES_BY_ID[id].name;
}

/* ---------- the deck ----------
   Your deck is the lawn: every specimen standing outside is one card, at its
   own level. Before anybody has touched the deck editor everything is in, and
   then no list is needed - which is why deckChosen stays false until the first
   choice. After that STATE.deck holds the uids. Uids that disappear when two
   specimens are dragged together stay in the set, but are filtered out by
   buildDeckFromLawn. */
function deckSet(){ return STATE.deckChosen ? STATE.deck : null; }
function deckCards(){ return buildDeckFromLawn(STATE.specimens, deckSet()); }
function deckHas(uid){ return !STATE.deckChosen || STATE.deck.has(uid); }

function deckChoose(uid, inDeck){
  if(!STATE.deckChosen){
    /* the first choice freezes today's lawn into a list, so deselecting has
       something to subtract from */
    STATE.deckChosen = true;
    STATE.deck = new Set(deckableSpecimens(STATE.specimens).map(e => e.uid));
  }
  if(inDeck) STATE.deck.add(uid); else STATE.deck.delete(uid);
  saveLawn();
}

// ============================================================ sound
const SOUND = (() => {
  let ctx = null;
  let off = false;
  function c(){
    if(off) return null;
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
  function chord(notes, dur, vol){
    notes.forEach((f,i) => setTimeout(() => tone(f, f, dur, 'triangle', vol ?? 0.05), i*70));
  }
  return {
    click:  () => tone(620, 480, 0.05, 'square', 0.035),
    step:   () => tone(180, 140, 0.04, 'sine', 0.02),
    near:   () => tone(880, 1180, 0.07, 'sine', 0.03),
    scan:   () => tone(300, 1400, 0.5, 'sawtooth', 0.025),
    find:   () => chord([523, 659, 784, 1046], 0.22, 0.05),
    rare:   () => chord([659, 880, 1174, 1568, 2093], 0.3, 0.055),
    hit:    () => tone(220, 90, 0.16, 'square', 0.06),
    damage: () => tone(160, 70, 0.2, 'sawtooth', 0.05),
    win:    () => chord([523, 659, 784, 1046, 1318], 0.26, 0.055),
    lose:   () => chord([392, 330, 262], 0.34, 0.05),
    muted:  () => off,
    mute:   () => { off = !off; return off; },
  };
})();

function vibrate(m){ if(navigator.vibrate) { try { navigator.vibrate(m); } catch(e){} } }

// ============================================================ position
let GEO = null;
function startGeo(){
  if(!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    p => { GEO = { lat:p.coords.latitude, lon:p.coords.longitude }; },
    () => {}, { timeout:5000, maximumAge:600000 });
}
function geoText(){
  const drift = (Math.random()-0.5)*0.0009;
  const lat = (GEO ? GEO.lat : 63.4305) + drift;
  const lon = (GEO ? GEO.lon : 10.3951) + drift;
  return `N ${lat.toFixed(4)}° · E ${lon.toFixed(4)}°`;
}

// ============================================================ light
function standardLights(scene, opt={}){
  scene.add(new THREE.HemisphereLight(opt.sky ?? 0xbdd8ff, opt.ground ?? 0x3a4a32, 0.85));
  const sun = new THREE.DirectionalLight(0xfff3d6, 1.05);
  sun.position.set(14, 26, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024,1024);
  const d = opt.shadow ?? 22;
  sun.shadow.camera.left=-d; sun.shadow.camera.right=d;
  sun.shadow.camera.top=d;   sun.shadow.camera.bottom=-d;
  sun.shadow.camera.far = 90;
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0xffffff, 0.22));
  return sun;
}

function seasonPalette(colors){
  const fx = SEASON_FX[STATE.season];
  return fx ? colors.map(fx) : colors;
}

function ground(width, colors, edge, holes){
  const v = new Vox();
  const h = Math.floor(width/2);
  const pits = holes || [];
  for(let x=-h;x<h;x++) for(let z=-h;z<h;z++){
    const r = Math.hypot(x,z);
    if(edge && r > h-0.5) continue;
    /* is the square inside a pond? then the grass surface sits one notch
       lower, with a muddy bottom - otherwise the water mirror would end up
       below the grass */
    let inPit = false;
    for(const g of pits) if(Math.hypot(x - g.x, z - g.z) <= g.r){ inPit = true; break; }
    if(inPit){
      v.set(x,-1,z, 0x6b5a3e);
      continue;
    }
    v.set(x,0,z, pick(colors));
    if(edge && r > h-2.5) v.set(x,-1,z, 0x5a4a34);
  }
  const m = voxMesh(v, {noise:0.09});
  // the edge layer (y=-1) pushes the whole mesh up; pull it back down
  // so the ground surface always sits at y=1, where the figures stand
  if(edge) m.position.y = -1;
  m.receiveShadow = true; m.castShadow = false;
  return m;
}

// ============================================================ scenes
const SCENES = {};
function newScene(clear, alpha=1, hfov=55){
  const sc = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(46, 1, 0.1, 320);
  cam.userData.hfov = hfov;
  return { scene:sc, cam, clear, alpha, update:null, enter:null, exit:null };
}

// ------------------------------------------------ SPLASH
(() => {
  const S = newScene(0x8fc4e8, 1, 52);
  S.scene.fog = new THREE.Fog(0x8fc4e8, 40, 86);
  standardLights(S.scene, {shadow:18});
  S.cam.position.set(0, 15, 30);

  const isle = new THREE.Group();
  isle.add(ground(22, seasonPalette([0x3f7a3f,0x468644,0x376f39,0x4c8f49]), true));
  S.scene.add(isle);

  // trees + mushrooms
  for(let i=0;i<11;i++){
    const t = modelScaled('spruce', rnd(3.4,4.8), {season:STATE.season});
    const a = rnd(0,Math.PI*2), r = rnd(4.5,9.5);
    t.position.set(Math.cos(a)*r, 1, Math.sin(a)*r);
    t.rotation.y = rnd(0,6.28);
    isle.add(t);
  }
  for(let i=0;i<6;i++){
    const s = modelScaled(pick(['flyagaric','hepatica','lingonberry','chanterelle','cloudberry']), rnd(0.8,1.2), {season:STATE.season});
    const a = rnd(0,Math.PI*2), r = rnd(2.5,8);
    s.position.set(Math.cos(a)*r, 1, Math.sin(a)*r);
    s.rotation.y = rnd(0,6.28);
    isle.add(s);
  }
  // fox trotting in a circle
  const fox = modelScaled('fox', 1.5);
  isle.add(fox);
  let t0 = 0;
  S.update = (dt) => {
    t0 += dt;
    isle.rotation.y += dt*0.12;
    const a = t0*0.55, r = 5.2;
    fox.position.set(Math.cos(a)*r, 1 + Math.abs(Math.sin(t0*5))*0.22, Math.sin(a)*r);
    fox.rotation.y = -a - Math.PI/2;   // the model faces +X
    S.cam.position.y = 15 + Math.sin(t0*0.5)*0.9;
    S.cam.lookAt(0, 2.5, 0);
  };
  SCENES.splash = S;
})();

// ------------------------------------------------ THE LAWN (FIELD)
/* The lawn is big. You do not move yourself - you drag the camera across the
   grass with a finger, pinch to zoom, and tap a species to see its card. */
const LAWN_R     = 62;      // half the lawn in voxel squares
const LAWN_SCALE = 1.55;    // species stand a little larger than card format
const PROP_SCALE = 0.3;     // garden things are built on a finer voxel grid
const POND_R     = 6;       // radius of a pond
const POND_WATER = 0.75;    // the water mirror: the pit bottoms out at y=0, the grass sits at y=1

const FIELD = (() => {
  const S = newScene(0x9ed0ef, 1, 56);
  S.scene.fog = new THREE.Fog(0x9ed0ef, 42, 104);
  standardLights(S.scene, {shadow:46});

  const rot = new THREE.Group();
  S.scene.add(rot);

  const species = [];       // {grp, species, base, phase, r, plant, baseY, grow}
  const pickable = [];
  const props = [];         // {grp, p, prop:true, baseY}
  const propPickable = [];
  const ponds = [];
  const view = { x:0, z:0, dist:26, angle:0.62 };
  const target = { x:0, z:0, dist:26 };
  let t0 = 0;

  S.update = dt => {
    t0 += dt;
    const k = Math.min(1, dt*9);
    view.x    += (target.x - view.x) * k;
    view.z    += (target.z - view.z) * k;
    view.dist += (target.dist - view.dist) * k;
    const d = view.dist;
    // more from above: higher camera, shorter horizontal distance (about 51 degrees)
    S.cam.position.set(view.x + Math.sin(view.angle)*d*0.78, d*0.96, view.z + Math.cos(view.angle)*d*0.78);
    S.cam.lookAt(view.x, 1, view.z);

    for(const o of species){
      if(o.grow < 1){
        o.grow = Math.min(1, o.grow + dt*1.7);
        const e = 1 - Math.pow(1-o.grow, 3);
        o.grp.scale.setScalar(e * (1 + Math.sin(o.grow*Math.PI)*0.14));
      }
      if(o.dragging || o.plant) continue;
      o.phase += dt * (0.22 + SPECIES_BY_ID[o.species].speed/150);
      o.grp.position.x = o.base.x + Math.cos(o.phase)*o.r;
      o.grp.position.z = o.base.z + Math.sin(o.phase)*o.r;
      o.grp.rotation.y = -o.phase - Math.PI/2;   // the model faces +X
      // the hop runs on its own clock, so slow species bounce visibly too
      o.hop += dt * (4.2 + SPECIES_BY_ID[o.species].speed/40);
      o.grp.position.y = o.baseY + Math.abs(Math.sin(o.hop))*0.22;
    }
    for(const d of ponds) d.position.y = POND_WATER + Math.sin(t0*1.2)*0.03;
  };

  SCENES.field = S;
  return {
    S, rot, species, pickable, props, propPickable, view,
    setPonds: list => { ponds.length = 0; if(list) ponds.push.apply(ponds, list); },
    /** drag: move the camera along the ground in screen directions */
    pan: (dx, dy) => {
      const f = view.dist * 0.0023;
      const hx = Math.cos(view.angle), hz = -Math.sin(view.angle);   // screen right
      const fx = -Math.sin(view.angle), fz = -Math.cos(view.angle);  // into the screen
      target.x = clamp(target.x - hx*dx*f + fx*dy*f, -LAWN_R+8, LAWN_R-8);
      target.z = clamp(target.z - hz*dx*f + fz*dy*f, -LAWN_R+8, LAWN_R-8);
    },
    zoom: dz => { target.dist = clamp(target.dist + dz, 11, 60); },
    toPoint: (x, z) => { target.x = clamp(x, -LAWN_R+8, LAWN_R-8); target.z = clamp(z, -LAWN_R+8, LAWN_R-8); },
  };
})();

/** demo and test helper: line up everything that has not been placed by hand */
function layOutAll(){
  let i = 0;
  for(const ex of STATE.specimens){
    if(ex.x !== null) { i++; continue; }
    const p = fieldSpot(i++);
    ex.x = p.x; ex.z = p.z;
  }
}

/** golden angle: the species spread out over the lawn as you collect */
function fieldSpot(i){
  const a = i * 2.39996;
  const r = 7.5 + 3.3*Math.sqrt(i);
  return { x: Math.cos(a)*r, z: Math.sin(a)*r, r };
}

/** the meadow is tended: in autumn only every other square turns colour */
function meadowPalette(season){
  const grass = [0x4a8c46,0x56994f,0x3f7f3f,0x62a556];
  const fx = SEASON_FX[season];
  if(!fx) return grass;
  if(season === 'winter') return grass.map(fx);
  return grass.map((c,i) => i % 2 ? fx(c) : c);
}

/** is the point inside a pond? then the species stands lower */
function inPond(x, z){
  for(const p of STATE.props)
    if(p.id === 'pond' && p.x !== null && Math.hypot(x - p.x, z - p.z) < POND_R - 0.8) return true;
  return false;
}
function speciesHeight(id, x, z){
  if(!inPond(x, z)) return 1;
  /* the pit bottoms out at y=0 with the water mirror at POND_WATER: the
     species stands on the bottom with its feet under water, the kelp shows
     only its top */
  return id === 'kelp' ? 0.15 : 0.4;
}

/** the water mirror in a pond - a surface of its own, not voxels */
function pondMesh(x, z, season){
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(POND_R + 0.6, 44),   // a bit wider than the pit so the rim hides under the grass
    new THREE.MeshLambertMaterial({
      color: season==='winter' ? 0x8fb6c8 : 0x2f86b4, transparent:true, opacity:0.82 }));
  m.rotation.x = -Math.PI/2;
  m.position.set(x, POND_WATER, z);
  return m;
}

function propMesh(id, x, z, rotY, scale){
  const m = model(id);
  m.scale.setScalar((scale || 1) * PROP_SCALE);
  m.position.set(x, 1, z);
  m.rotation.y = rotY || 0;
  return m;
}

function buildField(){
  const { rot, species, pickable } = FIELD;
  while(rot.children.length) rot.remove(rot.children[0]);
  species.length = 0; pickable.length = 0;
  FIELD.setPonds(null);

  const season = STATE.season;
  const found = SPECIES.filter(s => STATE.found.has(s.id));

  // --------- the lawn itself, with a pit under every pond
  const pits = STATE.props
    .filter(p => p.id === 'pond' && p.x !== null)
    .map(p => ({ x:p.x, z:p.z, r:POND_R }));
  rot.add(ground(LAWN_R*2, meadowPalette(season), true, pits));

  // --------- bought garden things: every item stands where you put it
  FIELD.props.length = 0; FIELD.propPickable.length = 0;
  const ponds = [];
  for(const p of STATE.props){
    if(p.x === null || p.z === null) continue;     // not placed yet
    const item = SHOP_BY_ID[p.id];
    if(!item) continue;

    if(p.id === 'pond'){
      const disc = pondMesh(p.x, p.z, season);
      disc.userData.propUid = p.uid;
      rot.add(disc);
      ponds.push(disc);
      for(let i=0;i<22;i++){                       // stone rim
        const a = i/22*6.28;
        rot.add(propMesh('_slab', p.x + Math.cos(a)*(POND_R+0.7),
                                  p.z + Math.sin(a)*(POND_R+0.7), a, 0.7));
      }
      FIELD.props.push({ grp:disc, p, prop:true, baseY:0.96 });
      FIELD.propPickable.push(disc);
      continue;
    }

    const m = propMesh(item.vox, p.x, p.z, p.rotY, item.scale);
    m.userData.propUid = p.uid;
    rot.add(m);
    FIELD.props.push({ grp:m, p, prop:true, baseY:1 });
    FIELD.propPickable.push(m);
  }
  FIELD.setPonds(ponds);

  // --------- the specimens: low ones innermost, tall ones outermost
  const sorted = STATE.specimens.slice().sort((p, q) => {
    const hp = SPECIES_BY_ID[p.species].height || 1.6;
    const hq = SPECIES_BY_ID[q.species].height || 1.6;
    return hp - hq || p.uid - q.uid;
  });
  for(const ex of sorted){
    if(ex.x === null || ex.z === null) continue;   // waiting to be placed by hand
    const sp = SPECIES_BY_ID[ex.species];
    const plant = sp.kind === 'plant';
    const grp = modelScaled(ex.species,
      (sp.height || 1.6) * LAWN_SCALE * (1 + 0.07*(ex.level-1)),
      plant ? { season, variant:ex.variant } : { variant:ex.variant });

    let roam = plant ? 0 : rnd(0.9, 2.1);
    const x = ex.x, z = ex.z;

    if(ex.species === 'kelp') roam = 0;
    if(inPond(x, z) && roam) roam = Math.min(roam, 0.7);
    const baseY = speciesHeight(ex.species, x, z);
    const isNew = STATE.lastPlaced === ex.uid;

    grp.position.set(x, baseY, z);
    grp.rotation.y = rnd(0, 6.28);
    grp.scale.setScalar(isNew ? 0.01 : 1);
    rot.add(grp);

    grp.userData.inner.userData.uid = ex.uid;
    grp.userData.inner.userData.species = ex.species;
    pickable.push(grp.userData.inner);
    species.push({
      grp, ex, uid:ex.uid, species:ex.species, base:{x,z}, baseY, r:roam, phase:rnd(0,6.28),
      hop: rnd(0, 6.28),
      plant: plant || roam === 0,
      grow: isNew ? 0 : 1,
    });
    if(isNew) FIELD.toPoint(x, z);   // pan to the new find
  }
  STATE.lastPlaced = null;

  const sky = SEASON_SKY[season];
  SCENES.field.clear = sky;
  if(SCENES.field.scene.fog) SCENES.field.scene.fog.color.setHex(sky);

  $('#fieldCount').textContent = found.length;
  $('#fieldTotal').textContent = SPECIES.length;
  $('#fieldEmpty').hidden = found.length > 0 || STATE.props.length > 0;
  const chip = $('#fieldSeason');
  if(chip) chip.textContent = SEASON_NAMES[season];
  if(selectedProp){
    const uid = selectedProp.p.uid;
    selectedProp = FIELD.props.find(o => o.p.uid === uid) || null;
    if(selectedProp) showMarker(selectedProp.grp.position.x, selectedProp.baseY + 0.06, selectedProp.grp.position.z);
  }
  PLACE.sync();
  showTurnPanel();
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

  const FIELDS = ['found','variants','props','specimens','season','lastPlaced'];

  /** what we hand to a player who asks to see our lawn.
      Ours, never the guest lawn we may be standing on. */
  function snapshot(){
    const S = parked || STATE;
    return {
      season:    S.season,
      found:     [...S.found],
      variants:  S.variants,
      /* things still waiting to be placed are nobody else's business */
      props:     S.props.filter(p => p.x !== null && p.z !== null),
      specimens: S.specimens.filter(e => e.x !== null && e.z !== null),
    };
  }

  function park(){
    const p = {};
    for(const k of FIELDS) p[k] = STATE[k];
    return p;
  }

  /** step onto someone else's lawn */
  function enter(name, d){
    if(!d) return false;
    if(!parked) parked = park();
    STORE.hold(true);
    host = name || 'A PLAYER';

    STATE.found      = new Set(Array.isArray(d.found) ? d.found : []);
    STATE.variants   = (d.variants && typeof d.variants === 'object') ? d.variants : {};
    STATE.props      = Array.isArray(d.props) ? d.props.slice() : [];
    STATE.specimens  = Array.isArray(d.specimens) ? d.specimens.slice() : [];
    STATE.season     = SEASONS.includes(d.season) ? d.season : STATE.season;
    STATE.lastPlaced = null;

    selectProp(null);
    $('#fieldVisitName').textContent = 'LAWN OF ' + host;
    $('#fieldVisit').hidden = false;
    document.body.classList.add('visiting');
    FIELD.toPoint(0, 0);
    goTo('field');
    setSeasonButton();
    return true;
  }

  /** back to our own lawn */
  function leave(){
    if(!parked) return;
    for(const k of FIELDS) STATE[k] = parked[k];
    parked = null; host = '';
    STORE.hold(false);
    document.body.classList.remove('visiting');
    $('#fieldVisit').hidden = true;
    selectProp(null);
    FIELD.toPoint(0, 0);
    buildField();
    setSeasonButton();
  }

  return { enter, leave, snapshot, active: () => !!parked, get host(){ return host; } };
})();

// ------------------------------------------------ SCAN (3D over the camera)
const SCAN = (() => {
  const S = newScene(0x000000, 0, 40);
  S.scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.0));
  const d = new THREE.DirectionalLight(0xffffff, 0.9); d.position.set(5,10,8);
  S.scene.add(d);
  S.cam.position.set(0, 0.4, 9);
  S.cam.lookAt(0,0,0);
  let grp = null, t0=0, materializing = 0;

  S.update = (dt) => {
    t0 += dt;
    if(!grp) return;
    grp.rotation.y += dt*0.8;
    grp.position.y = Math.sin(t0*1.6)*0.18 - 1.1;
    grp.scale.setScalar(0.3 + materializing*0.7);
    grp.userData.inner.material.opacity = materializing;
  };
  S.setSpecies = (id, opt) => {
    if(grp) S.scene.remove(grp);
    grp = modelScaled(id, 2.6, opt);
    const mat = VOX_MAT.clone();
    mat.transparent = true; mat.opacity = 0;
    grp.userData.inner.material = mat;
    S.scene.add(grp);
    materializing = 0;
  };
  S.setProgress = p => { materializing = p; };
  /* On a real scan we do not know the species until the model has answered.
     Until then nothing should sit in the frame giving the answer away. */
  S.clearSpecies = () => {
    if(grp) S.scene.remove(grp);
    grp = null; materializing = 0;
  };
  SCENES.scan = S;
  return S;
})();

// ------------------------------------------------ REVEAL / DETAIL (shared model view)
function makeDisplayScene(background, alpha){
  const S = newScene(background, alpha);
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
  S.setSpecies = (id, height=3.1, opt) => {
    if(grp) S.scene.remove(grp);
    grp = modelScaled(id, height, opt);
    grp.position.y = S.baseY;
    S.scene.add(grp);
  };
  S.setCamera = (y, z) => { S.cam.position.set(0,y,z); S.cam.lookAt(0,0,0); };
  return S;
}
SCENES.reveal = makeDisplayScene(0x111d16, 1);
SCENES.detail = makeDisplayScene(0x0d1712, 1);

// ------------------------------------------------ DUEL
/* The duel is a card game in plain HTML. See battle.js and cards.js. */
SCENES.battle = null;

SCENES.collection = null;   // plain HTML

// ============================================================ routing
let current = 'splash';
let beforeScan = 'field';   // the tab the scanner was opened from, so the cross goes back there
/* A visit lives on the lawn and on the species card it opens. Leaving for
   any other screen ends the visit, so the tabs need no special handling. */
const VISIT_SCREENS = ['field','detail'];
function goTo(name){
  TRACE.mark('goto', name);
  if(name === 'scan' && current !== 'scan' && current !== 'splash') beforeScan = current;
  if(VISIT.active() && !VISIT_SCREENS.includes(name)) VISIT.leave();
  /* If we leave the duel while a network battle is running, the opponent has
     to be told. */
  if(current === 'battle' && name !== 'battle') CARDGAME.leave();
  const previous = SCENES[current];
  if(previous && previous.exit) previous.exit();
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-'+name));
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.go === name));
  current = name;
  const S = SCENES[name];
  canvas.style.opacity = S ? 1 : 0;
  $('#camLayer').hidden = name !== 'scan';
  if(S && S.enter) S.enter();
  if(name !== 'field') selectProp(null);
  if(name === 'field')      buildField();
  if(name === 'shop')       buildShop();
  if(name === 'collection') buildCollection();
  if(name === 'battle')     startDuel();
  if(name === 'lobby')      LOBBY.open();
  if(name === 'scan')       startScan();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-go]');
  if(b) { e.preventDefault(); SOUND.click(); vibrate(12); goTo(b.dataset.go); }
});

// ============================================================ main loop
let last = performance.now();
function loop(now){
  const dt = Math.min(0.05, (now - last)/1000);
  last = now;
  const S = SCENES[current];
  if(S){
    if(S.update) S.update(dt);
    renderer.setClearColor(S.clear, S.alpha);
    renderer.render(S.scene, S.cam);
  }
  requestAnimationFrame(loop);
}

// ============================================================ lawn controls
/* One finger drags the lawn, two fingers pinch to zoom, a short tap opens the card. */
(() => {
  const pointers = new Map();
  let moved = 0, startDist = 0, holdTimer = null, pinch = false;
  let mid = { x:0, y:0 };

  function twoFinger(){
    const p = [...pointers.values()];
    return Math.hypot(p[0].x-p[1].x, p[0].y-p[1].y);
  }
  function twoFingerMid(){
    const p = [...pointers.values()];
    return { x:(p[0].x+p[1].x)/2, y:(p[0].y+p[1].y)/2 };
  }
  function stopHold(){ clearTimeout(holdTimer); holdTimer = null; }

  function down(e){
    if(current !== 'field') return;
    if(e.target && e.target.closest && e.target.closest('.tabbar, .topbar, .field-turn')) return;
    pointers.set(e.pointerId, { x:e.clientX, y:e.clientY });
    moved = 0;
    if(pointers.size === 2){
      startDist = twoFinger();
      mid = twoFingerMid();
      pinch = true;
      stopHold();
      dropDrag();               // two fingers = zoom and pan, not a move
      return;
    }
    const px = e.clientX, py = e.clientY;
    stopHold();
    if(VISIT.active()) return;  // guest lawn: only look, drag and zoom
    if(PLACE.active()){         // something new is waiting to be placed: the finger steers it
      PLACE.point(px, py);
      return;
    }
    holdTimer = setTimeout(() => {   // press and hold picks the thing up
      holdTimer = null;
      const o = speciesUnder(px, py) || propUnder(px, py);
      if(o) startDrag(o);
    }, 260);
  }
  function move(e){
    const p = pointers.get(e.pointerId);
    if(!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    if(holdTimer && moved > 12) stopHold();     // this turned into a pan
    if(pointers.size === 2){
      const nd = twoFinger();
      FIELD.zoom((startDist - nd) * 0.06);
      startDist = nd;
      const nm = twoFingerMid();
      FIELD.pan(nm.x - mid.x, nm.y - mid.y);   // two fingers pan as well
      mid = nm;
      return;
    }
    if(dragging){ dragTo(e.clientX, e.clientY); return; }
    if(PLACE.active()){ PLACE.point(e.clientX, e.clientY); return; }
    FIELD.pan(dx, dy);
  }
  function up(e){
    if(!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    stopHold();
    if(pointers.size > 0) return;          // the rest of the pinch is still down
    if(pinch){ pinch = false; return; }
    if(dragging){ dropDrag(); return; }
    if(PLACE.active()){ PLACE.drop(); return; }
    if(moved < 9 && current === 'field') tapSpecies(e.clientX, e.clientY);
  }
  addEventListener('pointerdown', down);
  addEventListener('pointermove', move);
  addEventListener('pointerup', up);
  addEventListener('pointercancel', up);
  /* Trackpad: two fingers pan, pinch (ctrl+wheel) zooms. Mouse wheel zooms. */
  addEventListener('wheel', e => {
    if(current !== 'field') return;
    if(e.ctrlKey){ FIELD.zoom(e.deltaY*0.12); return; }   // pinch on a trackpad
    if(e.deltaX !== 0 || e.deltaMode === 0){
      FIELD.pan(-e.deltaX, -e.deltaY);                    // two fingers drag the lawn
      return;
    }
    FIELD.zoom(e.deltaY*0.02);                            // mouse wheel in notches
  }, {passive:true});
})();

/* ---------- picking up and moving the species ---------- */
const _ray   = new THREE.Raycaster();
const _nd    = new THREE.Vector2();
const _plane = new THREE.Plane(new THREE.Vector3(0,1,0), -1);
const _point = new THREE.Vector3();

function pointerToRay(px, py){
  const box = canvas.getBoundingClientRect();
  _nd.x =  ((px - box.left) / box.width)  * 2 - 1;
  _nd.y = -((py - box.top)  / box.height) * 2 + 1;
  _ray.setFromCamera(_nd, FIELD.S.cam);
}

/** which species is under the finger? */
function speciesUnder(px, py){
  pointerToRay(px, py);
  const hits = _ray.intersectObjects(FIELD.pickable, false);
  if(!hits.length) return null;
  const uid = hits[0].object.userData.uid;
  return FIELD.species.find(o => o.uid === uid) || null;
}

/** where on the lawn is the finger pointing? */
function groundPoint(px, py){
  pointerToRay(px, py);
  if(!_ray.ray.intersectPlane(_plane, _point)) return null;
  return {
    x: clamp(_point.x, -LAWN_R+3, LAWN_R-3),
    z: clamp(_point.z, -LAWN_R+3, LAWN_R-3),
  };
}

/** which garden thing is under the finger? */
function propUnder(px, py){
  pointerToRay(px, py);
  const hits = _ray.intersectObjects(FIELD.propPickable, false);
  if(!hits.length) return null;
  const uid = hits[0].object.userData.propUid;
  return FIELD.props.find(o => o.p.uid === uid) || null;
}

function tapSpecies(px, py){
  const o = speciesUnder(px, py);
  if(o){
    selectProp(null);
    SOUND.click(); vibrate(12);
    showDetail(o.species, o.ex);
    return;
  }
  if(VISIT.active()) return;      // nothing on a guest lawn can be turned
  selectProp(propUnder(px, py));  // tap a garden thing = turn it, tap the grass = deselect
}

/* ---------- turning ----------
   Garden things can be turned once they are out: tap one, use the arrows.
   The same buttons turn the preview while you are placing something new. */
let selectedProp = null;

function selectProp(o){
  selectedProp = o || null;
  if(selectedProp){
    showMarker(selectedProp.grp.position.x, selectedProp.baseY + 0.06, selectedProp.grp.position.z);
    SOUND.click(); vibrate(10);
  } else if(!dragging && !PLACE.active()){
    hideMarker();
  }
  showTurnPanel();
}

/** the panel shows when something can be turned: a selected thing or a preview */
function showTurnPanel(){
  const panel = $('#fieldTurn');
  if(!panel) return;
  if(VISIT.active()){ panel.hidden = true; return; }
  /* the pond is round - it has nothing to turn */
  const id = PLACE.active() ? PLACE.itemId() : selectedProp ? selectedProp.p.id : null;
  const name = id && id !== 'pond'
             ? (PLACE.active() ? PLACE.name() : SHOP_BY_ID[id].name)
             : null;
  panel.hidden = !name;
  if(name) $('#fieldTurnName').textContent = name;
}

/** turn whatever is active: the preview first, otherwise the selected thing */
function turnActive(direction){
  if(PLACE.active()){ PLACE.turn(direction * TURN_STEP); SOUND.click(); vibrate(8); return; }
  if(!selectedProp) return;
  selectedProp.p.rotY = (selectedProp.p.rotY || 0) + direction * TURN_STEP;
  selectedProp.grp.rotation.y = selectedProp.p.rotY;
  SOUND.click(); vibrate(8);
}

$('#fieldTurn').addEventListener('click', e => {
  const b = e.target.closest('[data-turn]');
  if(!b) return;
  e.stopPropagation();
  turnActive(parseInt(b.dataset.turn, 10));
});

const TURN_STEP = Math.PI/12;   // 15 degrees per tap

/** the angle that faces a thing towards the middle of the lawn */
function turnToward(item, x, z){
  return item.turn === 'center' ? Math.atan2(-x, -z) : rnd(0, 6.28);
}

// ---------- dragging ----------
let dragging = null, marker = null;

/** the yellow ring that shows where the thing lands */
function showMarker(x, y, z){
  if(!marker){
    marker = new THREE.Mesh(
      new THREE.RingGeometry(0.75, 1.05, 28),
      new THREE.MeshBasicMaterial({ color:0xe8b93c, transparent:true, opacity:0.85,
                                    side:THREE.DoubleSide }));
    marker.rotation.x = -Math.PI/2;
  }
  marker.position.set(x, y, z);
  if(marker.parent !== FIELD.rot) FIELD.rot.add(marker);
}
function hideMarker(){
  if(marker && marker.parent) marker.parent.remove(marker);
}

/** the height a thing rests at - species sink into the pond, the pond sits in the grass */
function restHeight(o){
  if(!o.prop) return speciesHeight(o.species, o.grp.position.x, o.grp.position.z);
  return o.p.id === 'pond' ? POND_WATER : 1;
}

function startDrag(o){
  if(o.prop) selectProp(null);
  dragging = o;
  o.dragging = true;
  o.baseScale = o.grp.scale.x;
  o.grp.scale.setScalar(o.baseScale * 1.1);
  showMarker(o.grp.position.x, 1.06, o.grp.position.z);
  $('#fieldMove').textContent = 'MOVING ' +
    (o.prop ? SHOP_BY_ID[o.p.id].name : displayName(o.species));
  $('#fieldMove').hidden = false;
  SOUND.near(); vibrate(20);
}

function dragTo(px, py){
  if(!dragging) return;
  const p = groundPoint(px, py);
  if(!p) return;
  const y = dragging.prop ? (dragging.p.id === 'pond' ? POND_WATER : 1)
                          : speciesHeight(dragging.species, p.x, p.z);
  dragging.grp.position.set(p.x, y + 1.1, p.z);
  showMarker(p.x, y + 0.06, p.z);
}

/** is there a specimen of the same species and level right under this one? */
function findMatch(o){
  return FIELD.species.find(t =>
    t !== o && t.species === o.species && t.ex.level === o.ex.level && !t.dragging &&
    Math.hypot(t.grp.position.x - o.grp.position.x,
               t.grp.position.z - o.grp.position.z) < 2.4) || null;
}

function dropDrag(){
  if(!dragging) return;
  const o = dragging;
  const x = o.grp.position.x, z = o.grp.position.z;
  o.grp.scale.setScalar(o.baseScale || 1);
  o.dragging = false;
  hideMarker();
  $('#fieldMove').hidden = true;
  dragging = null;

  if(o.prop){                         // garden thing: save and rebuild the lawn
    o.p.x = x; o.p.z = z;             // the angle is kept - you turn that with the buttons
    SOUND.step(); vibrate(28);
    buildField();
    return;
  }

  o.base = { x, z };
  o.baseY = speciesHeight(o.species, x, z);
  o.grp.position.set(x, o.baseY, z);
  if(inPond(x, z) && o.r > 0.7) o.r = 0.7;
  o.ex.x = x; o.ex.z = z;

  const match = findMatch(o);
  if(match) showLevelDialog(o, match);
  else { SOUND.step(); vibrate(28); saveLawn(); }
}

// ---------- placing by hand ----------
/* Everything you buy or scan sits with x=null until you place it yourself.
   Only one thing waits at a time - the shop is locked until it is on the lawn. */
function pendingPlacement(){
  const p = STATE.props.find(p => p.x === null);
  if(p) return { kind:'prop', o:p };
  const e = STATE.specimens.find(e => e.x === null);
  if(e) return { kind:'species', o:e };
  return null;
}

const PLACE = (() => {
  let cur = null;          // {kind, o, grp, x, z, rotY}

  function makeGroup(kind, o){
    if(kind === 'prop'){
      const item = SHOP_BY_ID[o.id];
      return item.id === 'pond' ? pondMesh(0, 0, STATE.season)
                                : propMesh(item.vox, 0, 0, 0, item.scale);
    }
    const sp = SPECIES_BY_ID[o.species];
    return modelScaled(o.species, (sp.height || 1.6) * LAWN_SCALE,
      sp.kind === 'plant' ? { season:STATE.season, variant:o.variant }
                          : { variant:o.variant });
  }

  function name(){
    return cur.kind === 'prop' ? SHOP_BY_ID[cur.o.id].name : displayName(cur.o.species);
  }

  /** move the preview to a point on the lawn */
  function place(x, z){
    if(!cur) return;
    x = clamp(x, -LAWN_R+3, LAWN_R-3);
    z = clamp(z, -LAWN_R+3, LAWN_R-3);
    cur.x = x; cur.z = z;
    const y = cur.kind === 'prop' ? (cur.o.id === 'pond' ? POND_WATER : 1)
                                  : speciesHeight(cur.o.species, x, z);
    const lift = cur.o.id === 'pond' ? 0.35 : 0.9;   // the pond has no pit before it is placed: show it above the grass
    /* 'center' things follow the middle of the lawn until you turn them yourself */
    if(cur.kind === 'prop' && !cur.turned && SHOP_BY_ID[cur.o.id].turn === 'center')
      cur.rotY = turnToward(SHOP_BY_ID[cur.o.id], x, z);
    cur.grp.rotation.y = cur.rotY || 0;
    cur.grp.position.set(x, y + lift, z);
    showMarker(x, y + 0.06, z);
  }

  function point(px, py){
    const p = groundPoint(px, py);
    if(p) place(p.x, p.z);
  }

  /** turn the preview - then it stops turning itself */
  function turn(d){
    if(!cur) return;
    cur.turned = true;
    cur.rotY = (cur.rotY || 0) + d;
    cur.grp.rotation.y = cur.rotY;
  }

  /** put the thing down for good */
  function drop(){
    if(!cur || cur.x == null) return;
    const { kind, o, x, z } = cur;
    if(kind === 'prop'){
      o.x = x; o.z = z; o.rotY = cur.rotY || 0;
      SOUND.find(); vibrate([20,40,20]);
      toast(SHOP_BY_ID[o.id].name + ' placed on the lawn');
      clear();
      buildField();
      return;
    }
    o.x = x; o.z = z;
    STATE.lastPlaced = o.uid;
    clear();
    buildField();
    buildCollection();
    const fresh = FIELD.species.find(a => a.uid === o.uid);
    const match = fresh && findMatch(fresh);
    if(match) showLevelDialog(fresh, match);
    else { SOUND.step(); vibrate(28); }
  }

  function clear(){
    if(cur && cur.grp && cur.grp.parent) cur.grp.parent.remove(cur.grp);
    cur = null;
    if(!dragging && !selectedProp) hideMarker();
    $('#fieldPlace').hidden = true;
    showTurnPanel();
  }

  /** called every time the lawn is built - the lawn is emptied, so the preview has to be set up again */
  function sync(){
    const pending = pendingPlacement();
    if(!pending){ clear(); return; }
    const previous = cur && cur.o === pending.o ? { x:cur.x, z:cur.z, rotY:cur.rotY, turned:cur.turned } : null;
    if(cur && cur.grp && cur.grp.parent) cur.grp.parent.remove(cur.grp);
    const grp = makeGroup(pending.kind, pending.o);
    cur = { kind:pending.kind, o:pending.o, grp, x:null, z:null, rotY:0, turned:false };
    /* the random angle is drawn once, otherwise the thing would spin every
       time you moved your finger */
    if(pending.kind === 'prop' && SHOP_BY_ID[pending.o.id].turn !== 'center') cur.rotY = rnd(0, 6.28);
    FIELD.rot.add(grp);
    if(previous && previous.x != null){
      cur.rotY = previous.rotY; cur.turned = previous.turned;
      place(previous.x, previous.z);
    } else place(FIELD.view.x, FIELD.view.z);
    $('#fieldPlace').textContent = 'TAP THE LAWN TO PLACE ' + name();
    $('#fieldPlace').hidden = false;
    showTurnPanel();
  }

  return { sync, point, drop, turn, name, active: () => !!cur,
           itemId: () => cur && cur.kind === 'prop' ? cur.o.id : null };
})();

// ---------- merging into a higher level ----------
let pendingMerge = null;

function showLevelDialog(from, to){
  const sp = SPECIES_BY_ID[to.species];
  const oldLevel = to.ex.level, newLevel = oldLevel + 1;
  const f = statsAtLevel(sp, oldLevel), n = statsAtLevel(sp, newLevel);
  pendingMerge = { from, to };

  $('#mergeSpecies').textContent = displayName(to.species);
  $('#mergeFrom').textContent = 'Lv ' + oldLevel;
  $('#mergeTo').textContent = 'Lv ' + newLevel;
  $('#mergeStats').innerHTML = [
    ['HP', f.hp, n.hp], ['ATTACK', f.attack, n.attack],
    ['DEFENSE', f.defense, n.defense], ['SPEED', f.speed, n.speed],
  ].map(row => `<div class="merge-row">
      <span class="merge-n">${row[0]}</span>
      <span class="merge-from">${row[1]}</span>
      <span class="merge-arrow">&#8594;</span>
      <span class="merge-to">${row[2]}</span>
      <span class="merge-delta">+${row[2]-row[1]}</span>
    </div>`).join('');
  $('#mergeBox').hidden = false;
  SOUND.near(); vibrate(30);
}

function closeLevelDialog(){
  $('#mergeBox').hidden = true;
  pendingMerge = null;
}

function acceptLevel(){
  if(!pendingMerge) return;
  const { from, to } = pendingMerge;
  to.ex.level += 1;
  STATE.specimens = STATE.specimens.filter(e => e.uid !== from.ex.uid);
  STATE.lastPlaced = to.ex.uid;
  closeLevelDialog();
  buildField();
  buildCollection();
  SOUND.rare(); vibrate([30,60,30,60,90]);
  toast(SPECIES_BY_ID[to.species].name + ' is now level ' + to.ex.level);
}

function cancelLevel(){
  if(!pendingMerge) return;
  const { from } = pendingMerge;
  const p = from.previous;
  if(p){                         // put it back where it stood
    from.base = { x:p.x, z:p.z };
    from.baseY = speciesHeight(from.species, p.x, p.z);
    from.grp.position.set(p.x, from.baseY, p.z);
    from.ex.x = p.x; from.ex.z = p.z;
  }
  closeLevelDialog();
  SOUND.click();
}

$('#scanClose').addEventListener('click', () => { SOUND.click(); vibrate(12); goTo(beforeScan); });

/* Leaving a guest lawn goes back to the list you came from. */
$('#fieldVisitOut').addEventListener('click', () => {
  SOUND.click(); vibrate(12);
  VISIT.leave();
  goTo('lobby');
});

$('#mergeYes').addEventListener('click', acceptLevel);
$('#mergeNo').addEventListener('click', cancelLevel);

// ============================================================ scanning
let camStream = null;
/** mock scanner: draws a species, weighted so rare ones turn up rarely */
function randomSpecies(){
  let pool = SPECIES.slice();
  const unseen = pool.filter(s => !STATE.found.has(s.id));
  if(unseen.length && Math.random() < 0.85) pool = unseen;
  const weights = pool.map(s => 1/(s.rarity*s.rarity));
  const sum = weights.reduce((x,y) => x+y, 0);
  let r = Math.random()*sum;
  for(let i=0;i<pool.length;i++){ r -= weights[i]; if(r <= 0) return pool[i].id; }
  return pool[pool.length-1].id;
}

/** sets the species the scan frame should materialize, with a variant by the usual rules */
function setTarget(species){
  STATE.targetSpecies = species;
  STATE.targetVariant = STATE.found.has(species) ? variantOf(species) : rollVariant();
  SCAN.setSpecies(species, { variant: STATE.targetVariant });
}

/* The scanner never guesses. Either one of the models answers a real camera
   image, or the frame says what is missing and offers SCAN AGAIN. If you want
   a species without scanning, GIVE ME A RANDOM ONE is there - and it says
   itself that it is a draw. Before, the scan fell back quietly to the draw and
   wrote "98 % CERTAIN" on it, which was a plain lie. */
let mapEncounter = null;   // species set up from the map - a scripted encounter, not a scan

function modelReady(){
  /* the typeof check keeps a broken classify.js from taking the scanner down
     with it - then only the random button is left */
  return typeof CLASSIFIER !== 'undefined' && CLASSIFIER.configured();
}
function cameraReady(){
  const video = $('#camFeed');
  return !!camStream && video.readyState >= 2 && video.videoWidth > 0;
}

/* Three states: ready, running, done. The buttons follow the state.
   'done' always shows SCAN AGAIN, even when the hit is good - an answer you
   do not believe should be throwable. */
function scanButtons(state, opt){
  opt = opt || {};
  const go = $('#scanGo'), accept = $('#scanAccept'), again = $('#scanRetry'), rnd = $('#scanRandom');
  go.hidden     = state !== 'ready';
  go.disabled   = state !== 'ready';
  accept.hidden = state !== 'done' || !opt.hit;
  again.hidden  = state !== 'done';
  rnd.hidden    = state === 'running';
  rnd.disabled  = state === 'running';
}

function readyText(){
  if(!modelReady()) return 'NO SPECIES MODEL · USE RANDOM';
  if(!camStream)    return 'NO CAMERA · USE RANDOM';
  return 'POINT THE CAMERA AT THE SPECIES';
}

/** back to the starting point - used by SCAN AGAIN and by startScan */
function resetScan(){
  STATE.targetSpecies = null;
  STATE.targetVariant = null;
  STATE.targetLevel = 0;
  SCAN.clearSpecies();
  SCAN.setProgress(0);
  $('#scanMeterFill').style.width = '0%';
  $('#scanReadout').textContent = readyText();
  $('#scanReadout').classList.remove('hit','miss');
  $('#scanBeam').classList.remove('run');
  $('#scanAccept').onclick = null;
  scanButtons('ready');
}

async function startScan(){
  mapEncounter = STATE.mapTarget || null;
  STATE.mapTarget = null;
  $('#scanCoords').textContent = geoText();
  resetScan();
  if(mapEncounter) $('#scanReadout').textContent = 'ENCOUNTER ON THE MAP · TAP SCAN';

  $('#camStill').hidden = true;
  await startCamera();
  if(!mapEncounter) $('#scanReadout').textContent = readyText();
}

let camStarting = null;
async function startCamera(){
  const video = $('#camFeed');
  if(camStream) return;
  /* getUserMedia twice at once gives two streams and two permission prompts */
  if(camStarting) return camStarting;
  camStarting = (async () => {
  try {
    camStream = await navigator.mediaDevices.getUserMedia({
      video:{ facingMode:{ ideal:'environment' } }, audio:false });
    video.srcObject = camStream;
    video.style.display = '';
    $('#camFallback').style.display = 'none';
  } catch(err){
    $('#camFallback').style.display = 'block';
    video.style.display = 'none';
  }
  })().finally(() => { camStarting = null; });
  return camStarting;
}
function stopScan(){
  if(camStream){ camStream.getTracks().forEach(t => t.stop()); camStream = null; }
  $('#camFeed').srcObject = null;
}

/* The camera holds decode buffers for as long as it runs, and the models need
   every megabyte the phone has. So the frame is copied once, at the size the
   models actually use, and the camera is shut off for the rest of the scan.
   The still stands in the frame so the viewfinder does not go black. */
function grabFrame(){
  const v = $('#camFeed');
  const still = $('#camStill');
  const side = Math.min(v.videoWidth, v.videoHeight);
  /* 512 on the short side: the biggest model crops a square and scales it to
     480, so more pixels than this are thrown away anyway. */
  const k = Math.min(1, 512 / side);
  still.width  = Math.round(v.videoWidth  * k);
  still.height = Math.round(v.videoHeight * k);
  still.getContext('2d').drawImage(v, 0, 0, still.width, still.height);
  still.hidden = false;
  return still;
}

/** back to a live viewfinder - the camera is only on when it is needed */
async function resumeCamera(){
  $('#camStill').hidden = true;
  if(current === 'scan' && !camStream) await startCamera();
}
SCENES.scan.exit = stopScan;

/* ---------- shared ending ---------- */

/** the hit is on screen, and the player decides whether to accept it */
function finishHit(id, vari){
  TRACE.mark('finish-hit', id);
  $('#scanBeam').classList.remove('run');
  flashScreen();
  if(vari){ SOUND.rare(); vibrate([30,60,30,60,90]); }
  else    { SOUND.find(); vibrate(60); }
  scanButtons('done', { hit:true });
  TRACE.mark('scan-idle');
  $('#scanAccept').onclick = () => { TRACE.mark('accept-tap', id); SOUND.click(); showFind(id); };
}

/** no species came out. The frame says why, and SCAN AGAIN stands ready. */
function showScanError(text){
  SCAN.clearSpecies();
  $('#scanReadout').textContent = text;
  $('#scanReadout').classList.remove('hit');
  $('#scanReadout').classList.add('miss');
  $('#scanMeterFill').style.width = '100%';
  $('#scanBeam').classList.remove('run');
  SOUND.click(); vibrate(12);
  scanButtons('done', { hit:false });
}

/* ---------- the draw: GIVE ME A RANDOM ONE and encounters from the map ----------
   This is not recognition, so the frame never shows a percentage here. */
function drawScan(species, label, done){
  STATE.targetLevel = 0;
  setTarget(species);
  const lines = ['DRAWING FROM THE SPECIES BANK…','PICKING SPECIMEN…','BUILDING MODEL…'];
  let p = 0, i = -1;
  const id = setInterval(() => {
    p += 0.035 + Math.random()*0.025;
    SCAN.setProgress(Math.min(1, p));
    $('#scanMeterFill').style.width = Math.min(100, p*100) + '%';
    const ni = Math.min(lines.length-1, Math.floor(p*lines.length));
    if(ni !== i){ i = ni; $('#scanReadout').textContent = lines[i]; }
    if(p >= 1){
      clearInterval(id);
      const sp = SPECIES_BY_ID[STATE.targetSpecies];
      const vari = STATE.targetVariant;
      $('#scanReadout').textContent = (vari ? VARIANTS[vari].name + ' ' : '') + sp.name +
        (vari ? ' — ODD COLOUR!' : '') + ' — ' + label;
      $('#scanReadout').classList.add('hit');
      done();
    }
  }, 55);
}

/* ---------- real scan ---------- */

/** materializes the voxel model from 0 to 1 and calls done() afterwards */
function materialize(done){
  const t0 = performance.now(), duration = 520;
  const step = () => {
    const a = Math.min(1, (performance.now() - t0) / duration);
    SCAN.setProgress(a);
    if(a < 1) requestAnimationFrame(step); else done();
  };
  requestAnimationFrame(step);
}

/** yes/no dialog for downloading a model. Returns Promise<bool>. */
let declinedModels = new Set();
function askForDownload(info){
  if(declinedModels.has(info.name)) return Promise.resolve(false);
  return new Promise(ok => {
    const box  = $('#modelDialog');
    const text = $('#modelDialogTxt');
    text.innerHTML = info.title + ' MUST BE DOWNLOADED<br><b>ABOUT ' + info.mb +
      ' MB</b> · ONCE PER DEVICE<br>KEPT OFFLINE AFTERWARDS';
    box.hidden = false;
    const answer = yes => {
      box.hidden = true;
      $('#modelYes').onclick = null;
      $('#modelNo').onclick = null;
      if(!yes) declinedModels.add(info.name);
      ok(yes);
    };
    $('#modelYes').onclick = () => { SOUND.click(); answer(true); };
    $('#modelNo').onclick  = () => { SOUND.click(); answer(false); };
  });
}

function showScanResult(res){
  TRACE.mark('result-in', res.id || 'no-id');
  const percent = Math.round((res.p || 0) * 100);
  const raw = (res.latin || res.common || 'NO MATCH').toUpperCase();

  STATE.targetLevel = res.level;

  if(!res.id){
    showScanError('UNKNOWN SPECIES · ' + raw + ' ' + percent + ' %');
    return;
  }

  setTarget(res.id);
  TRACE.mark('voxel-built', res.id);
  const sp = SPECIES_BY_ID[res.id];
  const vari = STATE.targetVariant;
  $('#scanReadout').textContent = raw + ' ' + percent + ' % → ' +
    (vari ? VARIANTS[vari].name + ' ' : '') + sp.name +
    (vari ? ' — ODD COLOUR!' : ' — ' + res.levelText);
  $('#scanReadout').classList.add('hit');
  $('#scanMeterFill').style.width = '100%';
  TRACE.mark('result-on-screen');

  materialize(() => { TRACE.mark('materialize-done'); finishHit(res.id, vari); });
}

function scanPhase(phase, fraction){
  if(phase === 'loading'){
    $('#scanReadout').textContent = 'LOADING SPECIES MODEL ' + Math.round(fraction*100) + ' %';
    $('#scanMeterFill').style.width = Math.round(fraction*100) + '%';
  } else {
    $('#scanReadout').textContent = fraction < 0.5 ? 'ANALYSING IMAGE…' : 'COMPARING WITH THE SPECIES BANK…';
    $('#scanMeterFill').style.width = Math.round(50 + fraction*50) + '%';
  }
}

$('#scanRetry').addEventListener('click', () => {
  SOUND.click(); vibrate(12);
  resetScan();
  /* the camera was shut off for the scan, so SCAN AGAIN has to bring it back */
  resumeCamera().then(() => { $('#scanReadout').textContent = readyText(); });
});

$('#scanRandom').addEventListener('click', () => {
  const button = $('#scanRandom');
  if(button.disabled) return;
  mapEncounter = null;
  SOUND.scan(); vibrate(25);
  scanButtons('running');
  $('#scanBeam').classList.add('run');
  $('#scanReadout').classList.remove('hit','miss');
  const species = randomSpecies();
  drawScan(species, 'RANDOM DRAW', () => finishHit(species, STATE.targetVariant));
});

$('#scanGo').addEventListener('click', async () => {
  const button = $('#scanGo');
  if(button.disabled) return;
  TRACE.mark('scan-tap');
  SOUND.scan(); vibrate(25);
  scanButtons('running');
  $('#scanBeam').classList.add('run');
  $('#scanReadout').classList.remove('hit','miss');

  /* An encounter set up from the map is no classification: the species is
     already chosen, so the frame plays it out without claiming any certainty. */
  if(mapEncounter){
    const species = mapEncounter;
    mapEncounter = null;
    drawScan(species, 'ENCOUNTER ON THE MAP', () => {
      $('#scanBeam').classList.remove('run');
      flashScreen();
      if(STATE.targetVariant){ SOUND.rare(); vibrate([30,60,30,60,90]); }
      else                   { SOUND.find(); vibrate(60); }
      setTimeout(() => showFind(species), 460);
    });
    return;
  }

  if(!modelReady()){  showScanError('NO SPECIES MODEL · TRY AGAIN OR DRAW'); return; }
  if(!cameraReady()){ showScanError('NO CAMERA · TRY AGAIN OR DRAW');        return; }

  /* The frame is taken here, and the camera is shut off before the models get
     the machine. On an iPhone the live camera plus two ONNX sessions plus the
     3D scene was over the limit, and WebKit killed the tab right after the
     answer came up. */
  const frame = grabFrame();
  stopScan();
  TRACE.mark('frame-grabbed', frame.width + 'x' + frame.height);

  try {
    const res = await CLASSIFIER.classify(frame, {
      onPhase: scanPhase,
      confirmDownload: askForDownload,
      /* the collection breaks ties on genus and family: a species you are
         missing beats one you already have, otherwise the arctic fox would
         never win over the fox */
      found: STATE.found,
    });
    showScanResult(res);
  } catch(err){
    /* No fallback to the draw here. The scanner should say that it got no
       answer, not invent a species and a confidence. */
    if(err.name === 'DownloadRequired'){
      showScanError('THE MODEL IS NOT DOWNLOADED');
    } else if(err.name === 'ModelUnavailable'){
      showScanError('THE MODEL IS NOT AVAILABLE');
    } else {
      /* The message has to reach the screen. On a phone there is no console,
         and "THE MODEL FAILED" on its own says nothing about why. */
      console.warn('scan failed:', err);
      const reason = String(err && (err.message || err.name) || err).slice(0, 80);
      showScanError('ERROR: ' + reason.toUpperCase());
    }
  }
});

// ============================================================ finds
/* A certain species hit is worth more than a guess at genus or family.
   The index follows the levels in speciesmapping.js: 0 certain, 1 relative,
   2 uncertain. The simulated scan has no level and gets full value. */
const LEVEL_XP = [1, 0.6, 0.35];

function showFind(id, variant){
  const sp = SPECIES_BY_ID[id];
  const isNew = !STATE.found.has(id);
  variant = variant !== undefined ? variant : STATE.targetVariant;
  const level = STATE.targetLevel || 0;
  const mult = (variant ? VARIANTS[variant].bonus : 1) * (LEVEL_XP[level] != null ? LEVEL_XP[level] : 1);
  $('#revealKicker').textContent = variant
    ? VARIANTS[variant].name + ' VARIANT!'
    : level > 0
      ? SPECIESMAPPING.LEVEL_TEXT[level] + ' · ' + (isNew ? 'NEW SPECIES' : 'DUPLICATE')
      : (isNew ? 'NEW SPECIES REGISTERED' : 'DUPLICATE REGISTERED');
  $('#revealKicker').classList.toggle('variant', !!variant);
  const xp = Math.round((isNew ? 60 + sp.rarity*25 : 10) * mult);
  $('#revealXp').textContent = xp;
  $('#revealCard').innerHTML = cardFrame(sp, true, variant);
  TRACE.mark('reveal-card-built');
  SCENES.reveal.setSpecies(id, 3.0, {variant});
  SCENES.reveal.baseY = -0.9;
  goTo('reveal');
  TRACE.mark('reveal-shown');
  $('#revealOk').textContent = isNew ? 'PLANT ON THE LAWN' : 'PLACE ON THE LAWN';
  $('#revealOk').onclick = () => {
    newSpecimen(id, variant);   // duplicates are the point: two alike can be merged
    toast('TAP THE LAWN TO PLACE ' + displayName(id));
    goTo('field');   // the lawn opens in placement mode - you pick the spot yourself
  };
}

// ============================================================ cards
function rarityName(n){
  return ['','COMMON','FAIRLY COMMON','UNCOMMON','RARE','VERY RARE'][n] || '';
}
function cardFrame(sp, big, variant){
  const stars = '★'.repeat(sp.rarity) + '☆'.repeat(5-sp.rarity);
  const badge = variant ? `<div class="card-variant">${VARIANTS[variant].name}</div>` : '';
  return `<article class="card r${sp.rarity}${big?' card-big':''}${variant?' card-var':''}">
    ${badge}
    <div class="card-top">
      <span class="card-name">${sp.name}</span>
      <span class="card-rarity">${stars}</span>
    </div>
    <div class="card-window"></div>
    <div class="card-sci">${sp.sci}</div>
    <div class="card-stats">
      <span><b>${sp.hp}</b>HP</span>
      <span><b>${sp.attack}</b>ATK</span>
      <span><b>${sp.defense}</b>DEF</span>
      <span><b>${sp.speed}</b>SPD</span>
    </div>
    <div class="card-band">${rarityName(sp.rarity)}</div>
  </article>`;
}

// thumbnails for the collection grid - made on demand
const THUMBS = {};
const makeThumb = (() => {
  let rt = null, sc = null, cam = null;
  function setup(){
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
  /* targetHeight fills the frame: above 2.7 the wide models run out of it */
  return (id, variant, targetHeight) => {
    const h = targetHeight || 2.1;
    const key = id + '|' + (variant||'') + '|' + h;
    if(THUMBS[key]) return THUMBS[key];
    if(!rt) setup();
    const g = modelScaled(id, h, {variant});
    g.rotation.y = -0.5;
    sc.add(g);
    rt.render(sc, cam);
    THUMBS[key] = rt.domElement.toDataURL('image/png');
    sc.remove(g);
    return THUMBS[key];
  };
})();

// ============================================================ bridge to battle.js
/* The card game lives in its own file and needs a few things from here. */
window.VM = { STATE, SOUND, vibrate, toast, makeThumb, updateHud, goTo, displayName,
  fieldSnapshot: () => VISIT.snapshot(),
  visitField: (name, field) => VISIT.enter(name, field),
  deckCards, deckHas, deckChoose,
};


/** "Lv 2 x3" under the thumbnail */
function levelBadge(species){
  const list = specimensOf(species);
  if(!list.length) return '';
  const level = topLevel(species);
  return (level > 1 ? 'Lv ' + level : '★'.repeat(SPECIES_BY_ID[species].rarity)) +
         (list.length > 1 ? '  ×' + list.length : '');
}

function buildCollection(){
  const filter = $('.pill.active')?.dataset.filter || 'all';
  const list = SPECIES.filter(s => filter==='all' || s.kind===filter);
  $('#colCount').textContent = STATE.found.size;
  $('#colTotal').textContent = SPECIES.length;
  $('#cardGrid').innerHTML = list.map(sp => {
    const has = STATE.found.has(sp.id);
    const vari = variantOf(sp.id);
    return `<button class="mini r${sp.rarity}${has?'':' locked'}${vari?' mini-var':''}" data-species="${sp.id}">
      ${vari ? `<span class="mini-badge">${VARIANTS[vari].name[0]}</span>` : ''}
      <div class="mini-img">${has
        ? `<img src="${makeThumb(sp.id, vari)}" alt="${sp.name}">`
        : `<span class="mini-q">?</span>`}</div>
      <span class="mini-name">${has ? sp.name : '— — —'}</span>
      <span class="mini-rarity">${has ? levelBadge(sp.id) : '★'.repeat(sp.rarity)}</span>
    </button>`;
  }).join('');
}
$('.col-filters').addEventListener('click', e => {
  const p = e.target.closest('.pill');
  if(!p) return;
  $$('.pill').forEach(x => x.classList.toggle('active', x===p));
  buildCollection();
});
$('#cardGrid').addEventListener('click', e => {
  const b = e.target.closest('.mini');
  if(!b || b.classList.contains('locked')) return;
  showDetail(b.dataset.species);
});

function showDetail(id, ex){
  const sp = SPECIES_BY_ID[id];
  const vari = ex ? ex.variant : variantOf(id);
  const level = ex ? ex.level : topLevel(id);
  const st = statsAtLevel(sp, level);
  $('.detail-close').dataset.go = (current === 'field') ? 'field' : 'collection';
  $('#detailName').textContent = displayName(id);
  $('#detailSci').textContent  = sp.sci;
  $('#detailFact').textContent = sp.fact;
  $('#detailName').textContent += level > 1 ? '  Lv ' + level : '';
  /* READ MORE: the button carries the species id, and hides for species without an article */
  const more = $('#detailMore');
  if(more){
    more.dataset.more = id;
    more.hidden = !(window.ARTICLE && ARTICLE.has(id));
  }
  $('#detailStats').innerHTML = [
    ['HP',st.hp,140],['ATTACK',st.attack,50],['DEFENSE',st.defense,50],['SPEED',st.speed,50]
  ].map(([n,v,m]) =>
    `<div class="stat"><span class="stat-n">${n}</span>
      <div class="stat-bar"><i style="width:${Math.min(100,v/m*100)}%"></i></div>
      <span class="stat-v">${v}</span></div>`).join('');
  SCENES.detail.setSpecies(id, 3.2, {variant:vari});
  SCENES.detail.baseY = 2.1;
  goTo('detail');
}

// ============================================================ shop
/* The icon is the thing itself: the same voxel model that ends up on the lawn,
   rendered once and kept in THUMBS. The glyph is left if WebGL says no. */
function itemIcon(b){
  const id = b.vox || b.iconVox;
  if(!id) return b.icon;
  try { return `<img class="item-img" src="${makeThumb(id, null, 2.6)}" alt="">`; }
  catch { return b.icon; }
}

function buildShop(){
  $('#shopCoins').textContent = STATE.coins;
  const waiting = !!pendingPlacement();
  const intro = $('.shop-intro');
  if(intro) intro.textContent = waiting
    ? 'PLACE WHAT YOU HAVE ALREADY BOUGHT BEFORE YOU BUY MORE.'
    : 'ONE THING AT A TIME. YOU PLACE IT YOURSELF. COINS COME FROM WINNING DUELS.';
  $('#shopGrid').innerHTML = SHOP.map(b => {
    const count = STATE.props.filter(p => p.id === b.id).length;
    const afford = STATE.coins >= b.price;
    return `<article class="item${count?' owned':''}">
      <span class="item-icon">${itemIcon(b)}</span>
      <div class="item-text">
        <span class="item-name">${b.name}${count ? ` <i class="item-count">&times;${count}</i>` : ''}</span>
        <span class="item-desc">${b.desc}</span>
      </div>
      <button class="item-buy" data-item="${b.id}"
        ${!afford || waiting ? 'disabled' : ''}>${b.price} &#9679;</button>
    </article>`;
  }).join('');
}
$('#shopGrid').addEventListener('click', e => {
  const b = e.target.closest('.item-buy');
  if(!b || b.disabled) return;
  const item = SHOP_BY_ID[b.dataset.item];
  if(STATE.coins < item.price || pendingPlacement()) return;
  STATE.coins -= item.price;
  STATE.props.push({ uid: STATE.nextPropUid++, id:item.id, x:null, z:null, rotY:0 });
  SOUND.find(); vibrate([20,40,20]);
  updateHud();
  goTo('field');                 // the lawn opens in placement mode
  toast('TAP THE LAWN TO PLACE ' + item.name);
});

// ============================================================ duel
/* The whole card game lives in battle.js. Here is only the entrance and the bridge. */
/* A network battle is already set up by the lobby by the time we get here.
   Otherwise it is the machine we are playing against. */
function startDuel(){ if(!CARDGAME.CG.net) CARDGAME.start(); }

// ============================================================ odds and ends
function updateHud(){
  $$('.hud-coins').forEach(el => el.textContent = STATE.coins);
  $$('.hud-level').forEach(el => el.textContent = STATE.level);
  saveLawn();
}
let toastId;
function toast(txt){
  const t = $('#toast');
  t.textContent = txt; t.classList.add('show');
  clearTimeout(toastId);
  toastId = setTimeout(() => t.classList.remove('show'), 2200);
}
function flashScreen(){
  const f = $('#flash');
  f.classList.remove('run'); void f.offsetWidth; f.classList.add('run');
}

// ============================================================ startup
// demo links: #screen=field&area=plateau&season=winter&all=1
(function demoLink(){
  const q = new URLSearchParams(location.hash.slice(1));
  if(SEASONS.includes(q.get('season'))) STATE.season = q.get('season');
  if(q.get('all')) SPECIES.forEach(s => newSpecimen(s.id));
  layOutAll();
  const dupl = parseInt(q.get('dupl'), 10);
  if(dupl > 0) SPECIES.slice(0, dupl).forEach(s => newSpecimen(s.id));
  layOutAll();
  if(q.get('buy')) SHOP.forEach((b, i) => {
    const p = fieldSpot(i + 3);
    STATE.props.push({ uid: STATE.nextPropUid++, id:b.id, x:p.x, z:p.z, rotY:turnToward(b, p.x, p.z) });
  });
  if(q.get('coins')) STATE.coins = parseInt(q.get('coins'), 10) || STATE.coins;
  const count = parseInt(q.get('n'), 10);
  if(count > 0) SPECIES.slice(0, count).forEach(s => newSpecimen(s.id));
  layOutAll();
  if(q.get('variant')) SPECIES.forEach((s,i) => { if(i%4===0) STATE.variants[s.id] = Object.keys(VARIANTS)[i%3]; });

  const screen = q.get('screen');
  const species = q.get('species');
  if(q.get('auto')){
    setTimeout(() => { goTo('scan'); setTimeout(() => $('#scanGo').click(), 500); }, 300);
    if(q.get('auto') === 'plant') setTimeout(() => $('#revealOk').click(), 4200);
    return;
  }
  setTimeout(() => {
    if(screen === 'reveal') showFind(species || randomSpecies(), q.get('var') || null);
    else if(screen === 'detail' && species){ newSpecimen(species); layOutAll(); buildField(); showDetail(species); }
    else if(screen) goTo(screen);
  }, 60);
})();

resize();
buildField();
updateHud();
startGeo();
setSeasonButton();
requestAnimationFrame(loop);
setTimeout(() => $('#boot').classList.add('done'), 420);

/* A memory kill leaves no console on a phone, so the previous run reports
   itself here instead. The full list is in diagnostics.html. */
if(TRACE.previous && TRACE.previous.crashed){
  setTimeout(() => toast('LAST RUN DIED AT: ' + TRACE.previous.last.step), 1200);
}

// ---------- season ----------
function setSeasonButton(){
  const b = $('#fieldSeason');
  if(!b) return;
  b.textContent = SEASON_NAMES[STATE.season];
  b.onclick = () => cycleSeason();
}
function cycleSeason(){
  const i = SEASONS.indexOf(STATE.season);
  STATE.season = SEASONS[(i+1) % SEASONS.length];
  buildField();
  setSeasonButton();
  SOUND.click();
  toast('Season: ' + SEASON_NAMES[STATE.season]);
}

// ---------- sound on/off ----------
const SOUND_ICON = {
  on:'<svg class="ico ico-s" viewBox="0 0 9 9" aria-hidden="true"><rect x="1" y="3" width="2" height="3"/><rect x="3" y="2" width="1" height="5"/><rect x="4" y="1" width="1" height="7"/><rect x="6" y="3" width="1" height="3"/><rect x="8" y="2" width="1" height="5"/></svg>',
  off:'<svg class="ico ico-s" viewBox="0 0 9 9" aria-hidden="true"><rect x="1" y="3" width="2" height="3"/><rect x="3" y="2" width="1" height="5"/><rect x="4" y="1" width="1" height="7"/><rect x="6" y="2" width="1" height="1"/><rect x="7" y="3" width="1" height="1"/><rect x="8" y="4" width="1" height="1"/><rect x="8" y="2" width="1" height="1"/><rect x="6" y="4" width="1" height="1"/></svg>'
};
const soundBtn = $('#soundBtn');
if(soundBtn) soundBtn.onclick = () => {
  const off = SOUND.mute();
  soundBtn.innerHTML = off ? SOUND_ICON.off : SOUND_ICON.on;
  soundBtn.classList.toggle('off', off);
  toast(off ? 'Sound off' : 'Sound on');
};

// demo shortcuts while filming: keys 1-8
addEventListener('keydown', e => {
  const keys = { '1':'splash','2':'shop','3':'field','4':'scan','5':'reveal','6':'collection','7':'lobby','8':'battle' };
  if(keys[e.key]){
    if(e.key==='5') showFind(randomSpecies(), rollVariant());
    else goTo(keys[e.key]);
  }
  if(e.key==='a'){ SPECIES.forEach(s => newSpecimen(s.id)); layOutAll(); buildField(); buildCollection(); toast('All species unlocked'); }
  if(e.key==='s'){ cycleSeason(); }
  if(e.key==='v'){ const id = pick(SPECIES).id; newSpecimen(id, pick(Object.keys(VARIANTS))); layOutAll(); buildField(); buildCollection(); toast(displayName(id)); }
  if(e.key==='d'){ const id = pick([...STATE.found]); if(id){ newSpecimen(id); layOutAll(); buildField(); toast('Duplicate: ' + SPECIES_BY_ID[id].name); } }
  if(e.key==='t'){ STATE.found.clear(); STATE.variants = {}; STATE.props = []; STATE.specimens = []; buildField(); toast('Lawn cleared'); }
  if(e.key==='r'){ STATE.specimens.forEach((ex, i) => { const p = fieldSpot(i); ex.x = p.x; ex.z = p.z; }); buildField(); toast('Species lined up in a spiral'); }
  if(e.key==='k'){ STATE.coins += 500; updateHud(); buildShop(); toast('+500 coins'); }
  if(current === 'field' && (e.key === 'ArrowLeft'  || e.key === 'q')) turnActive(-1);
  if(current === 'field' && (e.key === 'ArrowRight' || e.key === 'e')) turnActive(1);
});

})();
