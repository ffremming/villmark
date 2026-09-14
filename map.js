/* VILLMARK - KART
   Ekte kart (Leaflet + OSM-fliser) med skjulte arter rundt spilleren.
   Arter spretter opp innenfor 5 km. Ukjente arter vises som skygge. */
(() => {
'use strict';

const $   = s => document.querySelector(s);
const rnd = (a,b) => a + Math.random()*(b-a);
const VM  = () => window.VM || null;

const MAKS_M   = 5000;   // ingen art spretter opp lenger unna enn dette
const MIN_M    = 120;    // ... og ingen rett oppi lomma heller
const ANTALL   = 4;      // antall aktive funnpunkt
const MIN_STJ  = 4;      // berre sjeldne arter dukkar opp paa kartet
const HJEM     = { lat:63.4305, lon:10.3951 };   // Trondheim - brukes til geo svarer

/* OSM-fliser uten noekkel. CARTO krever API-noekkel og stempler flisene.
   Fargene vrenges til moerkt villmarkskart i CSS (.leaflet-tile-pane). */
const FLISER = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

let kart = null, artLag = null, megMark = null, sone = null;
let senter = HJEM, harGeo = false, geoBedt = false;
let punkter = [], valgt = null, sistSendt = null;
let flisFeil = false;

// ---------------------------------------------------------- småting
const lokaltFunnet = new Set();
function funnet(){ return VM()?.STATE?.funnet || lokaltFunnet; }
function toast(t){ VM()?.toast ? VM().toast(t) : null; }
function klikk(){ VM()?.LYD?.klikk(); VM()?.dirr?.(12); }
function navnPa(id){
  try { return VM().visningsNavn(id); } catch(e){ return SPECIES_BY_ID[id].navn; }
}
function miniBilde(id){
  try { return VM().lagMini(id, VM().STATE.varianter[id] || null); } catch(e){ return ''; }
}
function stjerner(n){ return '★'.repeat(n) + '☆'.repeat(5-n); }
function sjeldenNavn(n){
  return ['','VANLIG','NOKSÅ VANLIG','UVANLIG','SJELDEN','SVÆRT SJELDEN'][n] || '';
}

/** meter mellom to punkt (haversine) */
function avstand(a, b){
  const R = 6371000, r = Math.PI/180;
  const dLat = (b.lat-a.lat)*r, dLon = (b.lon-a.lon)*r;
  const s = Math.sin(dLat/2)**2 +
            Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(s));
}
function visAvstand(m){
  return m < 950 ? Math.round(m/10)*10 + ' M' : (m/1000).toFixed(1).replace('.',',') + ' KM';
}
/** flytt et punkt gitt meter og retning */
function forskyv(p, meter, vinkel){
  const dLat = (meter*Math.cos(vinkel))/111320;
  const dLon = (meter*Math.sin(vinkel))/(111320*Math.cos(p.lat*Math.PI/180));
  return { lat:p.lat + dLat, lon:p.lon + dLon };
}

// ---------------------------------------------------------- artsvalg
/* Sjeldne arter dukker sjeldnere opp og ligger lenger unna.
   Ukjente arter prioriteres, ellers blir kartet tomt for nye funn. */
function velgArt(brukte){
  const sjeldne = SPECIES.filter(s => s.sjelden >= MIN_STJ);
  let basseng = sjeldne.filter(s => !brukte.has(s.id));
  if(!basseng.length) basseng = sjeldne.slice();
  const nye = basseng.filter(s => !funnet().has(s.id));
  if(nye.length && Math.random() < 0.8) basseng = nye;
  const vekter = basseng.map(s => 1/(s.sjelden*s.sjelden));
  let r = Math.random() * vekter.reduce((x,y) => x+y, 0);
  for(let i=0;i<basseng.length;i++){ r -= vekter[i]; if(r <= 0) return basseng[i]; }
  return basseng[basseng.length-1];
}
/** avstandsbånd etter sjeldenhet - r1 tett på, r5 helt ute ved 5 km */
function avstandFor(sjelden){
  const min  = Math.min(MAKS_M - 900, 300 + (sjelden-1)*600);
  const maks = Math.min(MAKS_M, 1500 + sjelden*700);
  // jevn fordeling i areal, ikke i radius - ellers klumper alt seg i midten
  return Math.sqrt(rnd(min*min, maks*maks));
}
const SPRIK_M = 620;   // minste avstand mellom to funnpunkt, ellers dekker ikonene kvarandre
function nyttPunkt(brukte, andre){
  const sp = velgArt(brukte);
  let pos = null;
  for(let f=0; f<14; f++){
    pos = forskyv(senter, avstandFor(sp.sjelden), rnd(0, Math.PI*2));
    if(!andre || !andre.some(q => avstand(q, pos) < SPRIK_M)) break;
  }
  return { art:sp.id, lat:pos.lat, lon:pos.lon, mark:null };
}
function genererPunkter(){
  punkter.forEach(p => p.mark && artLag.removeLayer(p.mark));
  punkter = [];
  const brukte = new Set();
  for(let i=0;i<ANTALL;i++){
    const p = nyttPunkt(brukte, punkter);
    brukte.add(p.art);
    punkter.push(p);
  }
  tegnPunkter();
  rammInn();
  oppdaterHud();
}
/** legg kartutsnittet slik at heile jaktsona er synleg */
function rammInn(){
  if(!kart || !sone) return;
  kart.fitBounds(sone.getBounds(), { padding:[26,26], animate:false });
}

// ---------------------------------------------------------- markører
function ikonFor(p){
  const sp = SPECIES_BY_ID[p.art];
  const kjent = funnet().has(p.art);
  const bilde = miniBilde(p.art);
  return L.divIcon({
    className: '',
    iconSize: [58,74], iconAnchor: [29,70],
    html: `<div class="kartmark r${sp.sjelden} ${kjent ? 'kjent' : 'skjult'}">
      <div class="kartmark-bilde">${bilde
        ? `<img src="${bilde}" alt="">`
        : '<span class="kartmark-q">?</span>'}</div>
      <div class="kartmark-stj">${'★'.repeat(sp.sjelden)}</div>
      <i class="kartmark-fot"></i>
    </div>`
  });
}
function tegnPunkter(){
  punkter.forEach(p => {
    if(p.mark){ p.mark.setIcon(ikonFor(p)); return; }
    p.mark = L.marker([p.lat, p.lon], { icon:ikonFor(p), keyboard:false })
      .addTo(artLag)
      .on('click', () => velgPunkt(p));
  });
}
function fjernPunkt(p){
  if(p.mark) artLag.removeLayer(p.mark);
  punkter = punkter.filter(x => x !== p);
  if(valgt === p) lukkKort();
  // sett ut en ny så kartet aldri går tomt
  const brukte = new Set(punkter.map(x => x.art));
  const ny = nyttPunkt(brukte, punkter);
  punkter.push(ny);
  tegnPunkter();
  oppdaterHud();
}

// ---------------------------------------------------------- kort nederst
function velgPunkt(p){
  klikk();
  valgt = p;
  const sp = SPECIES_BY_ID[p.art];
  const kjent = funnet().has(p.art);
  const m = avstand(senter, p);

  $('#kartKortNavn').textContent  = kjent ? navnPa(p.art) : '? ? ?';
  $('#kartKortSci').textContent   = kjent ? sp.sci : 'UIDENTIFISERT ' + (sp.kind === 'dyr' ? 'DYR' : 'PLANTE');
  $('#kartKortStj').textContent   = stjerner(sp.sjelden);
  $('#kartKortStj').className     = 'kart-kort-stj r' + sp.sjelden;
  $('#kartKortRang').textContent  = sjeldenNavn(sp.sjelden);
  $('#kartKortDist').textContent  = visAvstand(m);
  $('#kartKortFakta').textContent = kjent
    ? sp.fakta
    : 'Noe beveger seg her. Gå nærmere og skann for å få det inn i samlinga.';

  /* LES MER staar bare pa arter som alt er funnet - ellers avslorer den arten */
  const mer = $('#kartKortMer');
  if(mer){
    mer.dataset.mer = p.art;
    mer.hidden = !(kjent && window.ARTIKKEL && window.ARTIKKEL.har(p.art));
  }

  const kort = $('#kartKort');
  kort.hidden = false;
  kort.classList.remove('inn'); void kort.offsetWidth; kort.classList.add('inn');
  // loft markoeren over kortet som sklir opp nedst
  kart.setView([p.lat, p.lon], kart.getZoom(), { animate:true });
  kart.panBy([0, 110], { animate:true });
}
function lukkKort(){
  valgt = null;
  $('#kartKort').hidden = true;
}

// ---------------------------------------------------------- hud
function oppdaterHud(){
  const skjult = punkter.filter(p => !funnet().has(p.art)).length;
  $('#kartAntall').textContent = punkter.length;
  $('#kartSkjult').textContent = skjult;
}

// ---------------------------------------------------------- posisjon
function settSenter(lat, lon, flytt){
  senter = { lat, lon };
  if(megMark) megMark.setLatLng([lat, lon]);
  if(sone) sone.setLatLng([lat, lon]);
  // ved foerste geo-treff rammar genererPunkter() inn heile sona - ikkje slaass om utsnittet
  if(flytt && !punkter.length) kart.setView([lat, lon], kart.getZoom(), { animate:false });
  if(valgt) $('#kartKortDist').textContent = visAvstand(avstand(senter, valgt));
}
function startPosisjon(){
  if(geoBedt || !navigator.geolocation) return;
  geoBedt = true;
  navigator.geolocation.watchPosition(
    p => {
      const forste = !harGeo;
      harGeo = true;
      settSenter(p.coords.latitude, p.coords.longitude, forste);
      if(forste){ genererPunkter(); toast('Posisjon funnet'); }
    },
    () => { if(!harGeo) toast('Ingen posisjon - bruker Trondheim'); },
    { enableHighAccuracy:true, timeout:8000, maximumAge:30000 }
  );
}

// ---------------------------------------------------------- oppsett
function byggKart(){
  if(kart) return;
  const boks = $('#kart');
  if(typeof L === 'undefined'){
    boks.innerHTML = '<p class="kart-feil">KARTBIBLIOTEK MANGLER<br><span>Leaflet lastet ikke ned</span></p>';
    return;
  }
  kart = L.map(boks, {
    zoomControl:false, attributionControl:true,
    center:[senter.lat, senter.lon], zoom:12,
    minZoom:9, maxZoom:18, zoomSnap:0.5,
  });
  L.tileLayer(FLISER, {
    maxZoom:19, attribution:'&copy; OpenStreetMap',
  }).addTo(kart).on('tileerror', () => {
    if(flisFeil) return;
    flisFeil = true;
    toast('Kartfliser utilgjengelig - er du frakoblet?');
  });

  // 5 km jaktsone
  sone = L.circle([senter.lat, senter.lon], {
    radius:MAKS_M, className:'kart-sone',
    color:'#e8b93c', weight:2, dashArray:'6 8', fill:false,
  }).addTo(kart);

  megMark = L.marker([senter.lat, senter.lon], {
    interactive:false, keyboard:false,
    icon: L.divIcon({ className:'', iconSize:[26,26], iconAnchor:[13,13],
      html:'<div class="kart-meg"><i></i></div>' })
  }).addTo(kart);

  artLag = L.layerGroup().addTo(kart);
  kart.on('click', lukkKort);

  genererPunkter();
  startPosisjon();
}

// ---------------------------------------------------------- knapper
document.addEventListener('click', e => {
  if(e.target.closest('#kartMeg')){
    klikk();
    kart && kart.setView([senter.lat, senter.lon], 14, { animate:true });
  }
  if(e.target.closest('#kartSok')){
    klikk();
    genererPunkter();
    lukkKort();
    toast('Nye spor i området');
  }
  if(e.target.closest('#kartKortLukk')){ klikk(); lukkKort(); }
  if(e.target.closest('#kartKortGo') && valgt){
    klikk();
    sistSendt = valgt;
    const vm = VM();
    if(vm){ vm.STATE.kartMal = valgt.art; vm.gaTil('scan'); }
    else   { toast('Skanneren er ikke klar'); }
  }
});

// ---------------------------------------------------------- inn/ut av skjermen
/* Kartsiden er ren HTML og ligger utenfor scenerutinga i app.js.
   Vi lytter derfor på klasseendringa i stedet for å hekte oss på gaTil. */
const skjerm = $('#screen-map');
if(skjerm){
  new MutationObserver(() => {
    if(!skjerm.classList.contains('active')) return;
    byggKart();
    if(!kart) return;
    kart.invalidateSize();
    // art skannet siden sist? fjern punktet og sett ut et nytt
    if(sistSendt && funnet().has(sistSendt.art) && punkter.includes(sistSendt)){
      const p = sistSendt; sistSendt = null;
      if(p.mark) p.mark.setIcon(ikonFor(p));
      setTimeout(() => fjernPunkt(p), 900);
    }
    tegnPunkter();
    oppdaterHud();
  }).observe(skjerm, { attributes:true, attributeFilter:['class'] });
}

})();
