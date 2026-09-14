/* VILLMARK - MAP
   A real map (Leaflet + OSM tiles) with hidden species around the player.
   Species pop up within 5 km. Unknown species show as a shadow. */
(() => {
'use strict';

const $   = s => document.querySelector(s);
const rnd = (a,b) => a + Math.random()*(b-a);
const VM  = () => window.VM || null;

const MAX_M     = 5000;   // no species pops up further away than this
const MIN_M     = 120;    // ... and none right in your pocket either
const COUNT     = 4;      // number of active find points
const MIN_STARS = 4;      // only rare species show up on the map
const HOME      = { lat:63.4305, lon:10.3951 };   // Trondheim - used until geo answers

/* OSM tiles without a key. CARTO needs an API key and stamps the tiles.
   The colors are turned into a dark wilderness map in CSS (.leaflet-tile-pane). */
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

let map = null, speciesLayer = null, meMarker = null, zone = null;
let center = HOME, hasGeo = false, geoAsked = false;
let points = [], selected = null;
let tileError = false;

// ---------------------------------------------------------- small things
const localFound = new Set();
function found(){ return VM()?.STATE?.found || localFound; }
function toast(t){ VM()?.toast ? VM().toast(t) : null; }
function click(){ VM()?.SOUND?.click(); VM()?.vibrate?.(12); }
function nameOf(id){
  try { return VM().displayName(id); } catch(e){ return SPECIES_BY_ID[id].name; }
}
function thumbOf(id){
  try { return VM().makeThumb(id, VM().STATE.variants[id] || null); } catch(e){ return ''; }
}
function stars(n){ return '★'.repeat(n) + '☆'.repeat(5-n); }
function rarityName(n){
  return ['','COMMON','FAIRLY COMMON','UNCOMMON','RARE','VERY RARE'][n] || '';
}

/** metres between two points (haversine) */
function distance(a, b){
  const R = 6371000, r = Math.PI/180;
  const dLat = (b.lat-a.lat)*r, dLon = (b.lon-a.lon)*r;
  const s = Math.sin(dLat/2)**2 +
            Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(s));
}
function showDistance(m){
  return m < 950 ? Math.round(m/10)*10 + ' M' : (m/1000).toFixed(1) + ' KM';
}
/** move a point by a distance in metres and a bearing */
function offset(p, metres, angle){
  const dLat = (metres*Math.cos(angle))/111320;
  const dLon = (metres*Math.sin(angle))/(111320*Math.cos(p.lat*Math.PI/180));
  return { lat:p.lat + dLat, lon:p.lon + dLon };
}

// ---------------------------------------------------------- species choice
/* Rare species show up less often and sit further away.
   Unknown species get priority, otherwise the map runs dry of new finds. */
function pickSpecies(used){
  const rare = SPECIES.filter(s => s.rarity >= MIN_STARS);
  let pool = rare.filter(s => !used.has(s.id));
  if(!pool.length) pool = rare.slice();
  const unseen = pool.filter(s => !found().has(s.id));
  if(unseen.length && Math.random() < 0.8) pool = unseen;
  const weights = pool.map(s => 1/(s.rarity*s.rarity));
  let r = Math.random() * weights.reduce((x,y) => x+y, 0);
  for(let i=0;i<pool.length;i++){ r -= weights[i]; if(r <= 0) return pool[i]; }
  return pool[pool.length-1];
}
/** distance band by rarity - r1 close by, r5 all the way out at 5 km */
function distanceFor(rarity){
  const min = Math.min(MAX_M - 900, 300 + (rarity-1)*600);
  const max = Math.min(MAX_M, 1500 + rarity*700);
  // even spread over area, not over radius - otherwise everything clumps in the middle
  return Math.sqrt(rnd(min*min, max*max));
}
const SPREAD_M = 620;   // least distance between two find points, or the icons cover each other
function newPoint(used, others){
  const sp = pickSpecies(used);
  let pos = null;
  for(let f=0; f<14; f++){
    pos = offset(center, distanceFor(sp.rarity), rnd(0, Math.PI*2));
    if(!others || !others.some(q => distance(q, pos) < SPREAD_M)) break;
  }
  return { species:sp.id, lat:pos.lat, lon:pos.lon, mark:null };
}
function generatePoints(){
  points.forEach(p => p.mark && speciesLayer.removeLayer(p.mark));
  points = [];
  const used = new Set();
  for(let i=0;i<COUNT;i++){
    const p = newPoint(used, points);
    used.add(p.species);
    points.push(p);
  }
  drawPoints();
  frameZone();
  updateHud();
}
/** set the map view so the whole hunting zone is visible */
function frameZone(){
  if(!map || !zone) return;
  map.fitBounds(zone.getBounds(), { padding:[26,26], animate:false });
}

// ---------------------------------------------------------- markers
function iconFor(p){
  const sp = SPECIES_BY_ID[p.species];
  const known = found().has(p.species);
  const img = thumbOf(p.species);
  return L.divIcon({
    className: '',
    iconSize: [58,74], iconAnchor: [29,70],
    html: `<div class="map-mark r${sp.rarity} ${known ? 'known' : 'hidden'}">
      <div class="map-mark-img">${img
        ? `<img src="${img}" alt="">`
        : '<span class="map-mark-q">?</span>'}</div>
      <div class="map-mark-stars">${'★'.repeat(sp.rarity)}</div>
      <i class="map-mark-foot"></i>
    </div>`
  });
}
function drawPoints(){
  points.forEach(p => {
    if(p.mark){ p.mark.setIcon(iconFor(p)); return; }
    p.mark = L.marker([p.lat, p.lon], { icon:iconFor(p), keyboard:false })
      .addTo(speciesLayer)
      .on('click', () => selectPoint(p));
  });
}
function removePoint(p){
  if(p.mark) speciesLayer.removeLayer(p.mark);
  points = points.filter(x => x !== p);
  if(selected === p) closeCard();
  // put out a new one so the map never runs empty
  const used = new Set(points.map(x => x.species));
  const fresh = newPoint(used, points);
  points.push(fresh);
  drawPoints();
  updateHud();
}

// ---------------------------------------------------------- card at the bottom
function selectPoint(p){
  click();
  selected = p;
  const sp = SPECIES_BY_ID[p.species];
  const known = found().has(p.species);
  const m = distance(center, p);

  $('#mapCardName').textContent  = known ? nameOf(p.species) : '? ? ?';
  $('#mapCardSci').textContent   = known ? sp.sci : 'UNIDENTIFIED ' + (sp.kind === 'animal' ? 'ANIMAL' : 'PLANT');
  $('#mapCardStars').textContent = stars(sp.rarity);
  $('#mapCardStars').className   = 'map-card-stars r' + sp.rarity;
  $('#mapCardRank').textContent  = rarityName(sp.rarity);
  $('#mapCardDist').textContent  = showDistance(m);
  $('#mapCardFact').textContent  = known
    ? sp.fact
    : 'Something is moving here. Get closer and scan to add it to your collection.';

  /* READ MORE only shows on species already found - otherwise it gives the species away */
  const more = $('#mapCardMore');
  if(more){
    more.dataset.more = p.species;
    more.hidden = !(known && window.ARTICLE && window.ARTICLE.has(p.species));
  }

  const card = $('#mapCard');
  card.hidden = false;
  card.classList.remove('in'); void card.offsetWidth; card.classList.add('in');
  // lift the marker above the card sliding up from the bottom
  map.setView([p.lat, p.lon], map.getZoom(), { animate:true });
  map.panBy([0, 110], { animate:true });
}
function closeCard(){
  selected = null;
  $('#mapCard').hidden = true;
}

// ---------------------------------------------------------- hud
function updateHud(){
  const hidden = points.filter(p => !found().has(p.species)).length;
  $('#mapTotal').textContent = points.length;
  $('#mapHidden').textContent = hidden;
}

// ---------------------------------------------------------- position
function setCenter(lat, lon, move){
  center = { lat, lon };
  if(meMarker) meMarker.setLatLng([lat, lon]);
  if(zone) zone.setLatLng([lat, lon]);
  // on the first geo hit generatePoints() frames the whole zone - do not fight over the view
  if(move && !points.length) map.setView([lat, lon], map.getZoom(), { animate:false });
  if(selected) $('#mapCardDist').textContent = showDistance(distance(center, selected));
}
function startPosition(){
  if(geoAsked || !navigator.geolocation) return;
  geoAsked = true;
  navigator.geolocation.watchPosition(
    p => {
      const first = !hasGeo;
      hasGeo = true;
      setCenter(p.coords.latitude, p.coords.longitude, first);
      if(first){ generatePoints(); toast('Position found'); }
    },
    () => { if(!hasGeo) toast('No position - using Trondheim'); },
    { enableHighAccuracy:true, timeout:8000, maximumAge:30000 }
  );
}

// ---------------------------------------------------------- setup
function buildMap(){
  if(map) return;
  const box = $('#map');
  if(typeof L === 'undefined'){
    box.innerHTML = '<p class="map-error">MAP LIBRARY MISSING<br><span>Leaflet did not load</span></p>';
    return;
  }
  map = L.map(box, {
    zoomControl:false, attributionControl:true,
    center:[center.lat, center.lon], zoom:12,
    minZoom:9, maxZoom:18, zoomSnap:0.5,
  });
  L.tileLayer(TILES, {
    maxZoom:19, attribution:'&copy; OpenStreetMap',
  }).addTo(map).on('tileerror', () => {
    if(tileError) return;
    tileError = true;
    toast('Map tiles unavailable - are you offline?');
  });

  // 5 km hunting zone
  zone = L.circle([center.lat, center.lon], {
    radius:MAX_M, className:'map-zone',
    color:'#e8b93c', weight:2, dashArray:'6 8', fill:false,
  }).addTo(map);

  meMarker = L.marker([center.lat, center.lon], {
    interactive:false, keyboard:false,
    icon: L.divIcon({ className:'', iconSize:[26,26], iconAnchor:[13,13],
      html:'<div class="map-me"><i></i></div>' })
  }).addTo(map);

  speciesLayer = L.layerGroup().addTo(map);
  map.on('click', closeCard);

  generatePoints();
  startPosition();
}

// ---------------------------------------------------------- buttons
document.addEventListener('click', e => {
  if(e.target.closest('#mapMe')){
    click();
    map && map.setView([center.lat, center.lon], 14, { animate:true });
  }
  if(e.target.closest('#mapSearch')){
    click();
    generatePoints();
    closeCard();
    toast('New tracks in the area');
  }
  if(e.target.closest('#mapCardClose')){ click(); closeCard(); }
});

// ---------------------------------------------------------- in/out of the screen
/* The map page is plain HTML and sits outside the scene routing in app.js.
   We therefore listen for the class change instead of hooking into goTo. */
const screen = $('#screen-map');
if(screen){
  new MutationObserver(() => {
    if(!screen.classList.contains('active')) return;
    buildMap();
    if(!map) return;
    map.invalidateSize();
    /* Species found somewhere else since last time? The point stays, but the
       marker should show the species instead of a shadow. */
    drawPoints();
    updateHud();
  }).observe(screen, { attributes:true, attributeFilter:['class'] });
}

})();
