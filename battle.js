/* VILLMARK - KORTSPILLMOTOR
   Turstruktur, kamp og brukerflate. Reglene folger One Piece Card Game:
   oppfriskning -> trekk -> SOL -> hovedfase (spill kort, gi SOL, angrip)
   -> sluttfase. Angrep gar gjennom blokksteg, mottrekksteg og skadesteg.
   Ordlista ligger overst i cards.js. */

const KORTSPILL = (() => {
'use strict';

const VM = () => window.VM;                       // bro til app.js
const $  = s => document.querySelector(s);
const SLUTT_SIGNAL = Symbol('slutt');

/* ============================================================ tilstand */
const KS = {
  p:[null,null],        // 0 = spilleren, 1 = motstanderen
  tur:0, forste:0, turNr:1,
  kamp:null,            // pagaende angrep
  slutt:false, seier:false, grunn:'',
  gen:0,                // okes ved omstart, saa gamle lokker gir seg
  ventende:[],          // uinnfridde lofter, brytes nar spillet tar slutt
  turFerdig:null,       // loses av AVSLUTT TUR
  minLeder:'ld_bjorn',
  valgt:null,           // enhet eller handkort som er apnet i arket
  malvalg:null,         // {filter, tekst, res}
  logg:[],
};

/* ============================================================ smating */
const rndi  = (a,b) => Math.floor(a + Math.random()*(b-a+1));
const pick  = a => a[rndi(0, a.length-1)];
const stokkOm = a => { for(let i=a.length-1;i>0;i--){ const j=rndi(0,i); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const vent  = ms => new Promise(r => setTimeout(r, ms));
const kraft = u => (u.kort.kraft || 0) + u.sol*REGLER.solKraft + u.buff + u.kbuff;

function logg(t){
  KS.logg.push(t);
  if(KS.logg.length > 40) KS.logg.shift();
  const el = $('#ksLogg');
  if(el){ el.textContent = t; }
}

/* lofter som ma kunne brytes nar spillet plutselig er over */
function nyttLofte(){
  return new Promise((res, rej) => KS.ventende.push({res, rej}));
}
function losLofte(verdi){
  const l = KS.ventende.pop();
  if(l) l.res(verdi);
}
function brytAlleLofter(){
  const k = KS.ventende.splice(0);
  for(const l of k) l.rej(SLUTT_SIGNAL);
}

function avsluttSpill(seier, grunn){
  KS.slutt = true; KS.seier = seier; KS.grunn = grunn;
  brytAlleLofter();
  if(KS.turFerdig){ const f = KS.turFerdig; KS.turFerdig = null; f(); }
  throw SLUTT_SIGNAL;
}

/* kjorer en handler og svelger sluttsignalet */
function trygg(fn){
  return async (...a) => {
    try { await fn(...a); }
    catch(e){ if(e !== SLUTT_SIGNAL) throw e; }
  };
}

/* ============================================================ enheter */
function nyEnhet(kort, side, sted){
  return { kort, side, sted, hvilt:false, ny:(sted === 'art'),
           sol:0, buff:0, kbuff:0, brukt:false };
}
function enheter(p){ return [p.leder, ...p.arter]; }
function alleEnheter(){ return [...enheter(KS.p[0]), ...enheter(KS.p[1])]; }

function nySpiller(lederKort, ai){
  const p = {
    ai, stokk: stokkOm(byggStokk(lederKort).slice()),
    hand:[], kompost:[], liv:[], arter:[], biotop:null,
    sol:{ total:0, aktiv:0, stokk:REGLER.solStokk },
    lederBrukt:false,
  };
  p.leder = nyEnhet(lederKort, 0, 'leder');
  return p;
}

/* ============================================================ kortflyt */
function trekk(p, n=1){
  for(let i=0;i<n;i++){
    if(!p.stokk.length) avsluttSpill(p !== KS.p[0], 'TOM KORTSTOKK');
    p.hand.push(p.stokk.shift());
  }
}
function koArt(u){
  const p = KS.p[u.side];
  const i = p.arter.indexOf(u);
  if(i < 0) return;
  p.arter.splice(i, 1);
  p.kompost.push(u.kort.id);
  logg(u.kort.navn + ' er slatt ut.');
}
function leggSol(p, n){
  const gi = Math.min(n, p.sol.stokk, REGLER.solStokk - p.sol.total);
  p.sol.stokk -= gi; p.sol.total += gi;      // kommer inn hvilt
  return gi;
}

/* ============================================================ effekter */
async function utfoerEff(side, e, kilde){
  if(!e) return;
  const p = KS.p[side];
  switch(e.gjor){
    case 'trekk':
      trekk(p, e.verdi);
      logg('Trekker ' + e.verdi + ' kort.');
      break;
    case 'sol':
      logg('+' + leggSol(p, e.verdi) + ' SOL (hvilt).');
      break;
    case 'selvkraft':
      if(e.nar === 'mottrekk') kilde.kbuff += e.verdi; else kilde.buff += e.verdi;
      logg(kilde.kort.navn + ' far +' + e.verdi + ' kraft.');
      break;
    case 'kraft': {
      const m = await velgMal(side, u => u.side === side,
        'GI +' + e.verdi + ' KRAFT');
      if(m){
        if(e.nar === 'mottrekk') m.kbuff += e.verdi; else m.buff += e.verdi;
        logg(m.kort.navn + ' far +' + e.verdi + ' kraft.');
      }
      break; }
    case 'ko': {
      const m = await velgMal(side,
        u => u.side !== side && u.sted === 'art' && u.kort.kost <= e.maks,
        'SLÅ UT EN ART (KOST ' + e.maks + ' ELLER MINDRE)');
      if(m) koArt(m);
      break; }
    case 'hvil': {
      const m = await velgMal(side,
        u => u.side !== side && u.sted === 'art' && !u.hvilt && u.kort.kost <= e.maks,
        'HVIL EN ART (KOST ' + e.maks + ' ELLER MINDRE)');
      if(m){ m.hvilt = true; logg(m.kort.navn + ' ma hvile.'); }
      break; }
  }
  tegn();
}

/* ============================================================ malvalg */
async function velgMal(side, filter, tekst){
  const lovlige = alleEnheter().filter(filter);
  if(!lovlige.length) return null;
  if(KS.p[side].ai) return aiVelgMal(side, lovlige, tekst);

  KS.malvalg = { lovlige, tekst };
  tegn();
  const valg = await nyttLofte();
  KS.malvalg = null;
  tegn();
  return valg;
}
function aiVelgMal(side, lovlige, tekst){
  const egne = lovlige.filter(u => u.side === side);
  if(egne.length) return egne.sort((a,b) => kraft(b) - kraft(a))[0];
  return lovlige.sort((a,b) => (b.kort.kost||0) - (a.kort.kost||0))[0];
}

/* ============================================================ oppsett */
function nyttSpill(minLederId){
  KS.minLeder = minLederId;
  const minL = KORTBASE[minLederId];
  const foeL = pick(LEDERE.filter(l => l.id !== minLederId));
  KS.p[0] = nySpiller(minL, false);
  KS.p[1] = nySpiller(foeL, true);
  KS.p[0].leder.side = 0;
  KS.p[1].leder.side = 1;
  for(let s=0;s<2;s++){
    const p = KS.p[s];
    for(let i=0;i<REGLER.apningshand;i++) p.hand.push(p.stokk.shift());
    for(let i=0;i<p.leder.kort.liv;i++)   p.liv.push(p.stokk.shift());
  }
  KS.forste = rndi(0,1);
  KS.tur = KS.forste;
  KS.turNr = 1;
  KS.slutt = false; KS.kamp = null; KS.valgt = null; KS.malvalg = null;
  KS.logg = [];
}

/* apningshanda kan byttes en gang */
async function mulligan(){
  const p = KS.p[1];
  if(p.hand.filter(id => KORTBASE[id].kost <= 3).length < 2){
    p.stokk.push(...p.hand.splice(0));
    stokkOm(p.stokk);
    for(let i=0;i<REGLER.apningshand;i++) p.hand.push(p.stokk.shift());
  }
  const svar = await sporsmal('BYTTE ÅPNINGSHÅND?',
    KS.p[0].hand.map(id => KORTBASE[id]), ['BEHOLD', 'BYTT']);
  if(svar === 1){
    const q = KS.p[0];
    q.stokk.push(...q.hand.splice(0));
    stokkOm(q.stokk);
    for(let i=0;i<REGLER.apningshand;i++) q.hand.push(q.stokk.shift());
    logg('Ny apningshand.');
  }
}

/* ============================================================ turlokke */
async function kjorSpill(minLederId){
  const g = ++KS.gen;
  try {
    nyttSpill(minLederId);
    tegn();
    await mulligan();
    if(KS.gen !== g) return;
    while(!KS.slutt){
      await turen();
      if(KS.gen !== g) return;
      KS.tur = 1 - KS.tur;
      if(KS.tur === KS.forste) KS.turNr++;
    }
  } catch(e){
    if(e !== SLUTT_SIGNAL) throw e;
  }
  if(KS.gen !== g) return;
  visResultat();
}

async function turen(){
  const p = KS.p[KS.tur];
  const forsteEgne = (KS.turNr === 1 && KS.tur === KS.forste);

  /* 1 oppfriskning */
  for(const u of enheter(p)){ u.hvilt = false; u.ny = false; u.sol = 0; }
  p.sol.aktiv = p.sol.total;
  p.lederBrukt = false;
  if(p.biotop) p.biotop.brukt = false;

  /* 2 trekk */
  if(!forsteEgne) trekk(p, 1);

  /* 3 SOL */
  const gi = forsteEgne ? REGLER.solForste : REGLER.solVanlig;
  const n = Math.min(gi, p.sol.stokk, REGLER.solStokk - p.sol.total);
  p.sol.stokk -= n; p.sol.total += n; p.sol.aktiv += n;

  logg((p.ai ? 'MOTSTANDEREN' : 'DIN') + ' TUR ' + KS.turNr + ' — +' + n + ' SOL');
  tegn();

  /* 4 hovedfase */
  if(p.ai){ await vent(650); await aiTur(); }
  else await menneskeTur();

  /* 5 sluttfase - kraft "denne turen" faller bort */
  for(const u of alleEnheter()){ u.buff = 0; u.kbuff = 0; }
  KS.valgt = null;
  tegn();
}

function menneskeTur(){
  return new Promise(res => { KS.turFerdig = res; });
}

/* ============================================================ spille kort */
function kanSpille(side, kort){
  const p = KS.p[side];
  if(KS.tur !== side || KS.kamp) return false;
  if(kort.kost > p.sol.aktiv) return false;
  if(kort.kat === 'hendelse' && kort.eff.nar !== 'hoved') return false;
  return true;
}

async function spillKort(side, handIndeks){
  const p = KS.p[side];
  const id = p.hand[handIndeks];
  const kort = KORTBASE[id];
  if(!kanSpille(side, kort)) return;

  /* artsomradet rommer fem. Skal en sjette inn, ma en av dine egne vekk. */
  if(kort.kat === 'art' && p.arter.length >= REGLER.maksArter){
    let offer;
    if(p.ai) offer = p.arter.slice().sort((a,b) => a.kort.kost - b.kort.kost)[0];
    else {
      const svar = await sporsmal('ARTSOMRÅDET ER FULLT — HVILKEN SKAL I KOMPOSTEN?',
        p.arter.map(a => a.kort), ['AVBRYT', ...p.arter.map(a => a.kort.navn)]);
      if(svar === 0) return;
      offer = p.arter[svar-1];
    }
    koArt(offer);
  }

  p.hand.splice(p.hand.indexOf(id), 1);
  p.sol.aktiv -= kort.kost;
  VM().LYD.klikk(); VM().dirr(12);

  if(kort.kat === 'art'){
    const u = nyEnhet(kort, side, 'art');
    p.arter.push(u);
    logg((side ? 'Motstanderen' : 'Du') + ' spiller ' + kort.navn + '.');
    tegn();
    if(kort.eff && kort.eff.nar === 'ved_spill') await utfoerEff(side, kort.eff, u);
  } else if(kort.kat === 'biotop'){
    if(p.biotop) p.kompost.push(p.biotop.kort.id);
    p.biotop = nyEnhet(kort, side, 'biotop');
    p.biotop.brukt = false;
    logg((side ? 'Motstanderen' : 'Du') + ' legger ut ' + kort.navn + '.');
  } else {
    logg((side ? 'Motstanderen' : 'Du') + ' bruker ' + kort.navn + '.');
    tegn();
    await utfoerEff(side, kort.eff, p.leder);
    p.kompost.push(id);
  }
  tegn();
}

/* gi ett SOL til et kort: +1000 kraft ut turen */
function giSol(side, u){
  const p = KS.p[side];
  if(KS.tur !== side || p.sol.aktiv < 1) return;
  p.sol.aktiv -= 1; u.sol += 1;
  VM().LYD.naer();
  logg(u.kort.navn + ' far 1 SOL (+' + REGLER.solKraft + ' kraft).');
  tegn();
}

/* aktiverte effekter pa LEDER og BIOTOP, en gang per tur */
async function aktiver(side, u){
  const p = KS.p[side];
  const e = u.kort.eff;
  if(!e || e.nar !== 'aktiver' || KS.tur !== side) return;
  if(u.sted === 'leder'){ if(p.lederBrukt) return; p.lederBrukt = true; }
  else { if(u.brukt) return; u.brukt = true; }
  logg(u.kort.navn + ': ' + effTekst(e));
  await utfoerEff(side, e, u);
}

/* ============================================================ angrep */
function kanAngripe(u){
  if(KS.slutt || KS.kamp) return false;
  if(KS.tur !== u.side || u.hvilt) return false;
  if(u.sted === 'biotop') return false;
  if(u.sted === 'art' && u.ny && !u.kort.nokler.includes('SPRANG')) return false;
  return true;
}
function lovligeMal(motSide){
  const mp = KS.p[motSide];
  return [mp.leder, ...mp.arter.filter(a => a.hvilt)];
}

async function angrip(ang, mal){
  const angS = ang.side, forsvS = 1 - angS;
  ang.hvilt = true;
  KS.kamp = { ang, mal, angS, forsvS };
  logg(ang.kort.navn + ' angriper ' + mal.kort.navn + '!');
  VM().LYD.treff(); VM().dirr(20);
  tegn();
  await vent(420);

  /* nar-den-angriper-effekter */
  const e = ang.kort.eff;
  if(e && e.nar === 'nar_angrep') await utfoerEff(angS, e, ang);

  /* blokksteg */
  await blokkSteg();
  /* mottrekksteg */
  await mottrekkSteg();
  /* skadesteg */
  await skadeSteg();

  for(const u of alleEnheter()) u.kbuff = 0;
  KS.kamp = null;
  tegn();
}

async function blokkSteg(){
  const k = KS.kamp;
  const fp = KS.p[k.forsvS];
  const vern = fp.arter.filter(a =>
    a.kort.nokler.includes('VERN') && !a.hvilt && a !== k.mal);
  if(!vern.length) return;

  let valgt = null;
  if(fp.ai) valgt = aiVelgVern(vern);
  else {
    const svar = await sporsmal('BRUKE VERN?', vern.map(v => v.kort),
      ['LA DET STÅ', ...vern.map(v => v.kort.navn)]);
    if(svar > 0) valgt = vern[svar-1];
  }
  if(valgt){
    valgt.hvilt = true;
    k.mal = valgt;
    logg(valgt.kort.navn + ' bruker VERN og tar angrepet.');
    tegn();
    await vent(420);
  }
}

async function mottrekkSteg(){
  const k = KS.kamp;
  const fp = KS.p[k.forsvS];
  if(fp.ai){ aiMottrekk(); return; }

  while(true){
    const kort = fp.hand.map((id,i) => ({ kort:KORTBASE[id], i }))
      .filter(o => o.kort.mot > 0 ||
        (o.kort.kat === 'hendelse' && o.kort.eff.nar === 'mottrekk' && o.kort.kost <= fp.sol.aktiv));
    if(!kort.length) return;
    const merker = kort.map(o => o.kort.kat === 'hendelse' && o.kort.eff.nar === 'mottrekk'
      ? o.kort.navn + ' (HENDELSE)' : o.kort.navn + ' +' + o.kort.mot);
    const svar = await sporsmal(
      'MOTTREKK — ' + kraft(k.ang) + ' MOT ' + kraft(k.mal),
      kort.map(o => o.kort), ['LA DET STÅ', ...merker]);
    if(svar === 0) return;
    const valgt = kort[svar-1];
    fp.hand.splice(valgt.i, 1);
    if(valgt.kort.kat === 'hendelse' && valgt.kort.eff.nar === 'mottrekk'){
      fp.sol.aktiv -= valgt.kort.kost;
      fp.kompost.push(valgt.kort.id);
      await utfoerEff(k.forsvS, valgt.kort.eff, k.mal);
    } else {
      k.mal.kbuff += valgt.kort.mot;
      fp.kompost.push(valgt.kort.id);
      logg(valgt.kort.navn + ' som mottrekk: +' + valgt.kort.mot + ' kraft.');
    }
    tegn();
  }
}

async function skadeSteg(){
  const k = KS.kamp;
  const a = kraft(k.ang), d = kraft(k.mal);
  if(a < d){
    logg(k.mal.kort.navn + ' star imot (' + d + ' mot ' + a + ').');
    VM().LYD.klikk();
    await vent(600);
    return;
  }
  if(k.mal.sted === 'art'){
    koArt(k.mal);
    VM().LYD.skade(); VM().dirr(35);
  } else {
    const dobbel  = k.ang.kort.nokler.includes('DOBBELTHOGG');
    const fortaer = k.ang.kort.nokler.includes('FORTAER');
    await treffLeder(k.forsvS, dobbel ? 2 : 1, fortaer);
  }
  tegn();
  await vent(600);
}

async function treffLeder(side, antall, fortaer){
  const p = KS.p[side];
  for(let i=0;i<antall;i++){
    if(!p.liv.length) avsluttSpill(side === 1, 'LIVET ER UTE');
    const id = p.liv.pop();
    const kort = KORTBASE[id];
    VM().LYD.skade(); VM().dirr(60);
    if(fortaer){
      p.kompost.push(id);
      logg('FORTÆR — livskortet gar rett i komposten.');
      continue;
    }
    if(kort.utloser){
      const bruk = p.ai ? true
        : (await sporsmal('UTLØSER: ' + kort.navn, [kort], ['LA DET LIGGE','BRUK UTLØSER'])) === 1;
      if(bruk){
        p.kompost.push(id);
        logg('UTLØSER: ' + effTekst(kort.utloser));
        await utfoerEff(side, kort.utloser, p.leder);
        continue;
      }
    }
    p.hand.push(id);
    logg((side ? 'Motstanderen' : 'Du') + ' tar 1 skade — livskortet gar til handa.');
    tegn();
  }
  if(!p.liv.length) logg((side ? 'Motstanderen' : 'Du') + ' har ingen liv igjen!');
}

/* ============================================================ maskinspiller */
async function aiTur(){
  const p = KS.p[1], mp = KS.p[0];

  /* spill kort, dyreste forst */
  let spilte = true;
  while(spilte){
    spilte = false;
    const valg = p.hand
      .map((id,i) => ({ k:KORTBASE[id], i }))
      .filter(o => kanSpille(1, o.k) && aiVilSpille(o.k))
      .sort((a,b) => b.k.kost - a.k.kost);
    if(valg.length){ await spillKort(1, valg[0].i); await vent(330); spilte = true; }
  }

  /* aktivert effekt */
  if(p.leder.kort.eff && p.leder.kort.eff.nar === 'aktiver'){
    await aktiver(1, p.leder); await vent(260);
  }
  if(p.biotop && p.biotop.kort.eff.nar === 'aktiver'){
    await aktiver(1, p.biotop); await vent(260);
  }

  /* angrep */
  let angripere = enheter(p).filter(kanAngripe);
  for(const a of angripere){
    if(KS.slutt) return;
    if(!kanAngripe(a)) continue;
    const mal = aiVelgAngrepsmal(a, mp);
    if(!mal) continue;
    /* gi SOL hvis det avgjor angrepet */
    while(p.sol.aktiv > 0 && kraft(a) < kraft(mal.u)) giSol(1, a);
    if(kraft(a) < kraft(mal.u) && mal.u.sted === 'art') continue;
    await angrip(a, mal.u);
    await vent(400);
  }
  await vent(350);
}

function aiVilSpille(k){
  const p = KS.p[1];
  if(k.kat === 'art'){
    if(p.arter.length < REGLER.maksArter) return true;
    /* bytter bare ut en svakere art */
    return k.kraft > Math.min(...p.arter.map(a => a.kort.kraft));
  }
  if(k.kat === 'biotop') return !p.biotop;
  if(k.eff.gjor === 'ko' || k.eff.gjor === 'hvil')
    return KS.p[0].arter.some(a => a.kort.kost <= k.eff.maks && (k.eff.gjor === 'ko' || !a.hvilt));
  if(k.eff.gjor === 'kraft') return false;   // spares til kamp
  return true;
}

function aiVelgAngrepsmal(a, mp){
  const k = kraft(a);
  const arter = mp.arter.filter(x => x.hvilt && kraft(x) <= k)
    .sort((x,y) => y.kort.kost - x.kort.kost);
  if(arter.length && arter[0].kort.kost >= 4) return { u:arter[0] };
  if(k >= kraft(mp.leder)) return { u:mp.leder };
  if(arter.length) return { u:arter[0] };
  return null;
}

function aiVelgVern(vern){
  const k = KS.kamp;
  const trygt = vern.filter(v => kraft(v) > kraft(k.ang));
  const kritisk = k.mal.sted === 'leder' && KS.p[k.forsvS].liv.length <= 2;
  if(trygt.length) return trygt.sort((a,b) => kraft(a)-kraft(b))[0];
  if(kritisk) return vern.sort((a,b) => (a.kort.kost)-(b.kort.kost))[0];
  return null;
}

function aiMottrekk(){
  const k = KS.kamp, fp = KS.p[k.forsvS];
  const viktig = k.mal.sted === 'leder'
    ? fp.liv.length <= 2
    : k.mal.kort.kost >= 4;
  if(!viktig) return;
  const kort = fp.hand.map((id,i) => ({ k:KORTBASE[id], i }))
    .filter(o => o.k.mot > 0)
    .sort((a,b) => b.k.mot - a.k.mot);
  for(const o of kort){
    if(kraft(k.mal) > kraft(k.ang)) break;
    const idx = fp.hand.indexOf(o.k.id);
    if(idx < 0) continue;
    fp.hand.splice(idx, 1);
    fp.kompost.push(o.k.id);
    k.mal.kbuff += o.k.mot;
    logg('Motstanderen bruker ' + o.k.navn + ' som mottrekk (+' + o.k.mot + ').');
  }
  tegn();
}

/* ============================================================ kortgrafikk */
function kunst(kort){
  try { return VM().lagMini(kort.artId, null); } catch(e){ return ''; }
}
function fargeStil(kort){
  const f = KORTFARGER[kort.farger[0]];
  const f2 = KORTFARGER[kort.farger[1] || kort.farger[0]];
  return `--f:${f.hex};--fm:${f.mork};--fl:${f.lys};--f2:${f2.hex}`;
}
function katMerke(kort){
  return { leder:'LEDER', art:'ART', hendelse:'HENDELSE', biotop:'BIOTOP' }[kort.kat];
}

/* stort kort til arket */
function kortStorHTML(kort){
  const nok = kort.nokler.map(n => `<span class="kg-nok">${NOKKEL_VIS[n]}</span>`).join('');
  const linjer = [];
  if(kort.eff)     linjer.push(effHeltekst(kort.eff));
  if(kort.utloser) linjer.push(effHeltekst(kort.utloser));
  return `<article class="kg kg-${kort.kat}" style="${fargeStil(kort)}">
    <div class="kg-hode">
      <span class="kg-kost">${kort.kat === 'leder' ? kort.liv : kort.kost}</span>
      <span class="kg-kostmerke">${kort.kat === 'leder' ? 'LIV' : 'KOST'}</span>
      <span class="kg-navn">${kort.navn}</span>
      ${kort.attributt ? `<span class="kg-attr">${kort.attributt}</span>` : ''}
    </div>
    <div class="kg-kunst" style="background-image:url(${kunst(kort)})">
      ${kort.mot ? `<span class="kg-mot"><i>MOT</i>${kort.mot}</span>` : ''}
      <span class="kg-kat">${katMerke(kort)}</span>
    </div>
    <div class="kg-typer">${kort.typer}</div>
    <div class="kg-tekst">${nok}${linjer.map(l => `<p>${l}</p>`).join('')}
      <p class="kg-sci">${kort.sci}</p></div>
    <div class="kg-bunn">
      ${kort.kraft != null ? `<span class="kg-kraft">${kort.kraft}</span>` : '<span></span>'}
      <span class="kg-farge">${kort.farger.map(f => KORTFARGER[f].navn).join(' / ')}</span>
    </div>
  </article>`;
}

/* lite kort til brettet og handa */
function kortMiniHTML(kort, o={}){
  const kl = ['kk', 'kk-' + kort.kat];
  if(o.hvilt) kl.push('hvilt');
  if(o.ny)    kl.push('ny');
  if(o.mal)   kl.push('mal');
  if(o.valgt) kl.push('valgt');
  if(o.hand)  kl.push('kk-hand');
  if(o.udyr)  kl.push('udyr');
  const kr = o.kraft != null ? o.kraft : kort.kraft;
  const sol = o.sol ? `<span class="kk-sol">${'●'.repeat(Math.min(5,o.sol))}</span>` : '';
  return `<div class="${kl.join(' ')}" style="${fargeStil(kort)}" ${o.data||''}>
    <span class="kk-kost">${kort.kat === 'leder' ? kort.liv : kort.kost}</span>
    <span class="kk-kunst" style="background-image:url(${kunst(kort)})"></span>
    <span class="kk-navn">${kort.navn}</span>
    ${kr != null ? `<span class="kk-kraft">${kr}</span>` : ''}
    ${kort.nokler.length ? `<span class="kk-nok">${NOKKEL_VIS[kort.nokler[0]][0]}</span>` : ''}
    ${sol}
  </div>`;
}

/* ============================================================ tegning */
function erMal(u){ return !!(KS.malvalg && KS.malvalg.lovlige.includes(u)); }

function enhetHTML(u, sti){
  return kortMiniHTML(u.kort, {
    hvilt:u.hvilt, ny:u.ny, sol:u.sol, kraft:kraft(u),
    mal:erMal(u), valgt:KS.valgt === u,
    data:`data-sti="${sti}"`,
  });
}

function solRadHTML(p){
  const brukt = p.sol.total - p.sol.aktiv;
  let s = '';
  for(let i=0;i<p.sol.total;i++) s += `<i class="${i < p.sol.aktiv ? '' : 'brukt'}"></i>`;
  return `<span class="ks-soltall">${p.sol.aktiv}/${p.sol.total}</span>${s}`;
}
function livRadHTML(p){
  return '<i></i>'.repeat(p.liv.length) || '<span class="ks-tomt">INGEN LIV</span>';
}

function tegn(){
  if(!KS.p[0]) return;
  const me = KS.p[0], foe = KS.p[1];

  $('#foeLiv').innerHTML  = livRadHTML(foe);
  $('#myLiv').innerHTML   = livRadHTML(me);
  $('#foeSol').innerHTML  = solRadHTML(foe);
  $('#mySol').innerHTML   = solRadHTML(me);

  $('#foeTall').textContent = `STOKK ${foe.stokk.length} · HÅND ${foe.hand.length} · KOMPOST ${foe.kompost.length}`;
  $('#myTall').textContent  = `STOKK ${me.stokk.length} · HÅND ${me.hand.length} · KOMPOST ${me.kompost.length}`;

  $('#foeLeder').innerHTML = enhetHTML(foe.leder, 'e:1:leder:0');
  $('#myLeder').innerHTML  = enhetHTML(me.leder,  'e:0:leder:0');

  $('#foeBiotop').innerHTML = foe.biotop ? enhetHTML(foe.biotop, 'e:1:biotop:0') : '<div class="ks-plass">BIOTOP</div>';
  $('#myBiotop').innerHTML  = me.biotop  ? enhetHTML(me.biotop,  'e:0:biotop:0') : '<div class="ks-plass">BIOTOP</div>';

  $('#foeArter').innerHTML = foe.arter.map((a,i) => enhetHTML(a, 'e:1:art:'+i)).join('')
    || '<div class="ks-plass bred">INGEN ARTER</div>';
  $('#myArter').innerHTML  = me.arter.map((a,i) => enhetHTML(a, 'e:0:art:'+i)).join('')
    || '<div class="ks-plass bred">INGEN ARTER</div>';

  $('#myHand').innerHTML = me.hand.map((id,i) => {
    const k = KORTBASE[id];
    return kortMiniHTML(k, { hand:true, udyr:!kanSpille(0,k), data:`data-sti="h:${i}"` });
  }).join('');

  const min = KS.tur === 0 && !KS.kamp && !KS.malvalg;
  $('#ksAvslutt').disabled = !min;
  $('#ksTur').textContent = KS.slutt ? 'SLUTT'
    : (KS.tur === 0 ? 'DIN TUR ' : 'MOTSTANDER ') + KS.turNr;
  $('#ksBanner').hidden = !KS.malvalg;
  if(KS.malvalg) $('#ksBannerTxt').textContent = KS.malvalg.tekst;
  document.body.classList.toggle('ks-velger', !!KS.malvalg);
}

/* ============================================================ ark og dialog */
function lukkArk(){ $('#ksArk').hidden = true; KS.valgt = null; tegn(); }

function apneArk(kort, knapper){
  $('#ksArkKort').innerHTML = kortStorHTML(kort);
  $('#ksArkKnapper').innerHTML = knapper
    .map((b,i) => `<button class="btn ${b.pri ? 'btn-primary' : ''}" data-ark="${i}"${b.av ? ' disabled' : ''}>${b.t}</button>`)
    .join('');
  $('#ksArk').hidden = false;
  KS.arkValg = knapper;
}

/* enkel sporsmalsdialog med kortstripe */
function sporsmal(tekst, kort, valg){
  $('#ksDialogTxt').textContent = tekst;
  $('#ksDialogKort').innerHTML = (kort||[]).map(k => kortMiniHTML(k, {})).join('');
  $('#ksDialogKnapper').innerHTML = valg
    .map((v,i) => `<button class="btn ${i ? 'btn-primary' : ''}" data-dlg="${i}">${v}</button>`).join('');
  $('#ksDialog').hidden = false;
  return nyttLofte().then(v => { $('#ksDialog').hidden = true; return v; });
}

function visResultat(){
  $('#ksResultTxt').textContent = KS.seier ? 'SEIER!' : 'TAP';
  $('#ksResultTxt').classList.toggle('tap', !KS.seier);
  $('#ksResultGrunn').textContent = KS.grunn;
  $('#ksResult').hidden = false;
  KS.seier ? VM().LYD.seier() : VM().LYD.tap();
  VM().dirr(KS.seier ? [40,60,40] : 220);
  if(KS.seier){ VM().STATE.mynt += 80; VM().oppdaterHud(); }
}

/* ============================================================ inndata */
function sti(el){
  const d = el.closest('[data-sti]');
  return d ? d.dataset.sti.split(':') : null;
}
function enhetFraSti(s){
  const p = KS.p[+s[1]];
  if(s[2] === 'leder')  return p.leder;
  if(s[2] === 'biotop') return p.biotop;
  return p.arter[+s[3]];
}

const brettKlikk = trygg(async e => {
  const s = sti(e.target);
  if(!s) return;

  /* malvalg har forrang */
  if(KS.malvalg){
    if(s[0] !== 'e') return;
    const u = enhetFraSti(s);
    if(!KS.malvalg.lovlige.includes(u)) return;
    VM().LYD.klikk();
    losLofte(u);
    return;
  }
  if(KS.kamp || KS.tur !== 0 || KS.slutt) return;

  if(s[0] === 'h'){
    const i = +s[1];
    const kort = KORTBASE[KS.p[0].hand[i]];
    apneArk(kort, [
      { t:'SPILL · ' + kort.kost + ' SOL', pri:true, av:!kanSpille(0,kort),
        gjor: async () => { lukkArk(); await spillKort(0, i); } },
      { t:'LUKK', gjor: lukkArk },
    ]);
    return;
  }

  const u = enhetFraSti(s);
  if(!u) return;
  KS.valgt = u;

  /* eget angrep: velg mal etterpa */
  const knapper = [];
  if(u.side === 0 && kanAngripe(u)){
    knapper.push({ t:'ANGRIP', pri:true, gjor: async () => {
      lukkArk();
      const mal = await velgMal(0, x => lovligeMal(1).includes(x), 'VELG MÅL FOR ANGREPET');
      if(mal) await angrip(u, mal);
    }});
  }
  if(u.side === 0 && u.sted !== 'biotop' && KS.p[0].sol.aktiv > 0){
    knapper.push({ t:'GI SOL', gjor: () => { giSol(0, u); lukkArk(); } });
  }
  if(u.side === 0 && u.kort.eff && u.kort.eff.nar === 'aktiver'){
    const brukt = u.sted === 'leder' ? KS.p[0].lederBrukt : u.brukt;
    knapper.push({ t:'AKTIVER', av:brukt, gjor: async () => { lukkArk(); await aktiver(0, u); } });
  }
  knapper.push({ t:'LUKK', gjor: lukkArk });
  apneArk(u.kort, knapper);
  tegn();
});

/* ============================================================ oppstart */
let kablet = false;
function kable(){
  if(kablet) return;
  kablet = true;
  $('#ksBrett').addEventListener('click', brettKlikk);

  $('#ksArkKnapper').addEventListener('click', trygg(async e => {
    const b = e.target.closest('[data-ark]');
    if(!b) return;
    await KS.arkValg[+b.dataset.ark].gjor();
  }));
  $('#ksArkBak').addEventListener('click', lukkArk);

  $('#ksDialogKnapper').addEventListener('click', e => {
    const b = e.target.closest('[data-dlg]');
    if(b) losLofte(+b.dataset.dlg);
  });

  $('#ksAvslutt').addEventListener('click', () => {
    if(KS.tur !== 0 || KS.kamp || KS.malvalg || KS.slutt) return;
    VM().LYD.klikk();
    const f = KS.turFerdig; KS.turFerdig = null;
    if(f) f();
  });

  $('#ksAvbryt').addEventListener('click', () => {
    if(KS.malvalg) losLofte(null);
  });

  $('#ksBytt').addEventListener('click', () => {
    const i = LEDERE.findIndex(l => l.id === KS.minLeder);
    KS.minLeder = LEDERE[(i+1) % LEDERE.length].id;
    start();
  });

  $('#ksIgjen').addEventListener('click', () => start());
}

function start(){
  kable();
  $('#ksResult').hidden = true;
  $('#ksDialog').hidden = true;
  $('#ksArk').hidden = true;
  KS.turFerdig = null;
  brytAlleLofter();
  kjorSpill(KS.minLeder);
}

return { start, KS };
})();
