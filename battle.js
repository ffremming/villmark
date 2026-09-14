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
  nett:null,            // {rolle:'vert'|'gjest', kampId, navn} - null i enspillerkamp
};

/* Hver spiller styres av en av tre ting. Enspillerkampen bruker
   'lokal' mot 'ai'; nettkampen bruker 'lokal' mot 'fjern'. */
const erAi    = p => p.styring === 'ai';
const erFjern = p => p.styring === 'fjern';
const erVert  = () => !!KS.nett && KS.nett.rolle === 'vert';
const erGjest = () => !!KS.nett && KS.nett.rolle === 'gjest';

/* ============================================================ smating */
const rndi  = (a,b) => Math.floor(a + Math.random()*(b-a+1));
const pick  = a => a[rndi(0, a.length-1)];
const stokkOm = a => { for(let i=a.length-1;i>0;i--){ const j=rndi(0,i); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const vent  = ms => new Promise(r => setTimeout(r, ms));
const kraft = u => (u.kort.kraft || 0) + u.sol*REGLER.solKraft + u.buff + u.kbuff;

/* Loggteksten leses av begge sider, men "Du" betyr ulike ting hos dem.
   Derfor lagres hvem som handlet, og %s / %S settes inn ved visning. */
function logg(t, side){
  const post = { t, s:(side == null ? null : side) };
  KS.logg.push(post);
  if(KS.logg.length > 40) KS.logg.shift();
  const el = $('#ksLogg');
  if(el){ el.textContent = loggTekst(post, 0); }
}
function loggTekst(l, meg){
  if(!l) return '';
  if(l.s == null) return l.t;
  const min = l.s === meg;
  return l.t.replace('%S', min ? 'DIN' : 'MOTSTANDERENS')
            .replace('%s', min ? 'Du' : 'Motstanderen');
}

/* lofter som ma kunne brytes nar spillet plutselig er over */
function nyttLofte(){
  return new Promise((res, rej) => KS.ventende.push({res, rej}));
}
/* Loser det siste loftet som venter paa denne skjermen. Lofter som venter paa
   svar fra motparten er merket 'fjern' og loses av nettmeldingen i stedet. */
function losLofte(verdi){
  for(let i = KS.ventende.length - 1; i >= 0; i--){
    if(KS.ventende[i].fjern) continue;
    const l = KS.ventende.splice(i, 1)[0];
    l.res(verdi);
    return;
  }
}
function brytAlleLofter(){
  const k = KS.ventende.splice(0);
  fjernSvar.clear();
  for(const l of k) l.rej(SLUTT_SIGNAL);
}

/* ============================================================ fjernstyring */
/* Verten eier motoren. Naar motoren trenger et valg fra gjesten, sendes
   spoersmalet over kanalen og loftet blir staaende til svaret kommer. */
const fjernSvar = new Map();   // spoersmalsid -> lofte
let nesteSpm = 1;

/* Alt som skal ut gaar gjennom en ko, saa rekkefolgen holder og vi ikke
   sprenger takgrensa for kringkasting. Bare den siste tilstanden er
   interessant, saa to paa rad slaas sammen. */
const utKo = [];
let utTimer = null;
const UT_GAP = () => NETT.LOKAL_MODUS ? 0 : 120;

function nettSend(m){
  if(!KS.nett) return;
  const siste = utKo[utKo.length - 1];
  if(m.t === 'tilstand' && siste && siste.t === 'tilstand') utKo[utKo.length - 1] = m;
  else utKo.push(m);
  skyvKo();
}
function skyvKo(){
  if(utTimer || !utKo.length || !KS.nett) return;
  NETT.send(utKo.shift());
  utTimer = setTimeout(() => { utTimer = null; skyvKo(); }, UT_GAP());
}
function tomKo(){ utKo.length = 0; clearTimeout(utTimer); utTimer = null; }

function fjernLofte(id){
  return new Promise((res, rej) => {
    const l = { res, rej, fjern:true, id };
    fjernSvar.set(id, l);
    KS.ventende.push(l);
  });
}
function losFjernLofte(id, verdi){
  const l = fjernSvar.get(id);
  if(!l) return;
  fjernSvar.delete(id);
  const i = KS.ventende.indexOf(l);
  if(i >= 0) KS.ventende.splice(i, 1);
  l.res(verdi);
}

/* Samme spoersmal, uansett hvem som skal svare. */
function spor(side, tekst, kort, valg){
  if(erFjern(KS.p[side])){
    const id = nesteSpm++;
    nettSend({ t:'spor', id, tekst, kort:(kort||[]).map(k => k.id), valg });
    return fjernLofte(id);
  }
  return sporsmal(tekst, kort, valg);
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

function nySpiller(lederKort, styring){
  const p = {
    styring, stokk: stokkOm(byggStokk(lederKort).slice()),
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
  if(erAi(KS.p[side])) return aiVelgMal(side, lovlige, tekst);

  if(erFjern(KS.p[side])){
    const id = nesteSpm++;
    nettSend({ t:'malvalg', id, tekst, lovlige:lovlige.map(stiAv).filter(Boolean) });
    const sti = await fjernLofte(id);
    const valgt = sti ? enhetFraSti(speilSti(sti)) : null;
    return lovlige.includes(valgt) ? valgt : null;
  }

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
function nyttSpill(minLederId, motLederId, motStyring){
  KS.minLeder = minLederId;
  const minL = KORTBASE[minLederId];
  const foeL = KORTBASE[motLederId] || pick(LEDERE.filter(l => l.id !== minLederId));
  KS.p[0] = nySpiller(minL, 'lokal');
  KS.p[1] = nySpiller(foeL, motStyring || 'ai');
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
function nyHand(p){
  p.stokk.push(...p.hand.splice(0));
  stokkOm(p.stokk);
  for(let i=0;i<REGLER.apningshand;i++) p.hand.push(p.stokk.shift());
}
async function mulligan(){
  for(let s=0;s<2;s++){
    const p = KS.p[s];
    if(erAi(p)){
      if(p.hand.filter(id => KORTBASE[id].kost <= 3).length < 2) nyHand(p);
      continue;
    }
    const svar = await spor(s, 'BYTTE ÅPNINGSHÅND?',
      p.hand.map(id => KORTBASE[id]), ['BEHOLD', 'BYTT']);
    if(svar === 1){ nyHand(p); logg('Ny apningshand.'); tegn(); }
  }
}

/* ============================================================ turlokke */
async function kjorSpill(minLederId, motLederId, motStyring){
  const g = ++KS.gen;
  try {
    nyttSpill(minLederId, motLederId, motStyring);
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

  logg('%S TUR ' + KS.turNr + ' — +' + n + ' SOL', KS.tur);
  tegn();

  /* 4 hovedfase. Fjernspilleren venter paa samme loftet som den lokale:
     handlingene dens kommer inn over kanalen og loser det. */
  if(erAi(p)){ await vent(650); await aiTur(KS.tur); }
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
    if(erAi(p)) offer = p.arter.slice().sort((a,b) => a.kort.kost - b.kort.kost)[0];
    else {
      const svar = await spor(side, 'ARTSOMRÅDET ER FULLT — HVILKEN SKAL I KOMPOSTEN?',
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
    logg('%s spiller ' + kort.navn + '.', side);
    tegn();
    if(kort.eff && kort.eff.nar === 'ved_spill') await utfoerEff(side, kort.eff, u);
  } else if(kort.kat === 'biotop'){
    if(p.biotop) p.kompost.push(p.biotop.kort.id);
    p.biotop = nyEnhet(kort, side, 'biotop');
    p.biotop.brukt = false;
    logg('%s legger ut ' + kort.navn + '.', side);
  } else {
    logg('%s bruker ' + kort.navn + '.', side);
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

  /* Angrepet stanser uansett — da er det ingenting a ta stilling til. */
  if(kraft(k.ang) < kraft(k.mal)) return;

  let valgt = null;
  if(erAi(fp)) valgt = aiVelgVern(vern);
  else {
    const svar = await spor(k.forsvS, 'BRUKE VERN?', vern.map(v => v.kort),
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
  if(erAi(fp)){ aiMottrekk(); return; }

  while(true){
    const kort = fp.hand.map((id,i) => ({ kort:KORTBASE[id], i }))
      .filter(o => o.kort.mot > 0 ||
        (erMottrekkshendelse(o.kort) && o.kort.kost <= fp.sol.aktiv));
    if(!kort.length) return;

    /* Naermest hvert kort i stokken har en MOT-verdi, saa spoersmalet kom
       for paa hvert eneste angrep — omtrent ni ganger i partiet, som
       oftest med "LA DET STA" som eneste fornuftige svar. Her hoppes det
       over naar svaret ikke kan endre noe: enten star maalet allerede
       imot, eller saa rekker ikke alt paa handa opp. */
    const na = kraft(k.mal), inn = kraft(k.ang);
    if(na > inn) return;
    const tak = kort.reduce((s,o) => s + Math.max(o.kort.mot,
      erMottrekkshendelse(o.kort) && o.kort.kost <= fp.sol.aktiv ? o.kort.eff.verdi : 0), 0);
    if(na + tak < inn) return;

    const merker = kort.map(o => o.kort.kat === 'hendelse' && o.kort.eff.nar === 'mottrekk'
      ? o.kort.navn + ' (HENDELSE)' : o.kort.navn + ' +' + o.kort.mot);
    const svar = await spor(k.forsvS,
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

/* UTLOESER-spoersmalet kom ogsaa naar svaret ikke kunne endre noe: ingen
   lovlige mal, tom SOL-stokk eller tom kortstokk. Da gaar livskortet rett
   paa handa uten a stoppe spillet. */
function utloserNytter(side, e){
  const p = KS.p[side], mp = KS.p[1-side];
  switch(e.gjor){
    case 'sol':   return p.sol.stokk > 0 && p.sol.total < REGLER.solStokk;
    case 'trekk': return p.stokk.length > 0;
    case 'ko':    return mp.arter.some(a => a.kort.kost <= e.maks);
    case 'hvil':  return mp.arter.some(a => !a.hvilt && a.kort.kost <= e.maks);
    default:      return true;
  }
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
    if(kort.utloser && utloserNytter(side, kort.utloser)){
      const bruk = erAi(p) ? true
        : (await spor(side, 'UTLØSER: ' + kort.navn, [kort], ['LA DET LIGGE','BRUK UTLØSER'])) === 1;
      if(bruk){
        p.kompost.push(id);
        logg('UTLØSER: ' + effTekst(kort.utloser));
        await utfoerEff(side, kort.utloser, p.leder);
        continue;
      }
    }
    p.hand.push(id);
    logg('%s tar 1 skade — livskortet gar til handa.', side);
    tegn();
  }
  if(!p.liv.length) logg('%s har ingen liv igjen!', side);
}

/* ============================================================ maskinspiller */
async function aiTur(side){
  const p = KS.p[side], mp = KS.p[1-side];

  /* spill kort, dyreste forst */
  let spilte = true;
  while(spilte){
    spilte = false;
    const valg = p.hand
      .map((id,i) => ({ k:KORTBASE[id], i }))
      .filter(o => kanSpille(side, o.k) && aiVilSpille(side, o.k))
      .sort((a,b) => b.k.kost - a.k.kost);
    if(valg.length){ await spillKort(side, valg[0].i); await vent(330); spilte = true; }
  }

  /* aktivert effekt */
  if(p.leder.kort.eff && p.leder.kort.eff.nar === 'aktiver'){
    await aktiver(side, p.leder); await vent(260);
  }
  if(p.biotop && p.biotop.kort.eff.nar === 'aktiver'){
    await aktiver(side, p.biotop); await vent(260);
  }

  /* angrep */
  for(const a of enheter(p).slice()){
    if(KS.slutt) return;
    if(!kanAngripe(a)) continue;
    const mal = aiVelgAngrepsmal(a, mp);
    if(!mal) continue;
    /* gi SOL hvis det avgjor angrepet */
    while(p.sol.aktiv > 0 && kraft(a) < kraft(mal.u)) giSol(side, a);
    if(kraft(a) < kraft(mal.u) && mal.u.sted === 'art') continue;
    await angrip(a, mal.u);
    await vent(400);
  }
  await vent(350);
}

function aiVilSpille(side, k){
  const p = KS.p[side], mp = KS.p[1-side];
  if(k.kat === 'art'){
    if(p.arter.length < REGLER.maksArter) return true;
    /* bytter bare ut en svakere art */
    return k.kraft > Math.min(...p.arter.map(a => a.kort.kraft));
  }
  if(k.kat === 'biotop') return !p.biotop;
  if(k.eff.gjor === 'ko' || k.eff.gjor === 'hvil')
    return mp.arter.some(a => a.kort.kost <= k.eff.maks && (k.eff.gjor === 'ko' || !a.hvilt));
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

/* Maskinen blokkerte bare naar vernet overlevde angrepet. Siden en LEDER
   har 5000 kraft og de fleste VERN-kortene ligger under, ble det brukt
   omtrent ett vern per parti, og noekkelordet var i praksis en tom kropp:
   en stokk full av VERN vant hvert femte parti. Na ofres et billig vern
   for a spare et livskort, slik et menneske ville gjort. */
function aiVelgVern(vern){
  const k = KS.kamp;
  const fp = KS.p[k.forsvS];
  const trygt = vern.filter(v => kraft(v) > kraft(k.ang));
  if(trygt.length) return trygt.sort((a,b) => kraft(a)-kraft(b))[0];
  if(k.mal.sted !== 'leder') return null;
  const billigst = vern.slice().sort((a,b) => a.kort.kost - b.kort.kost)[0];
  const dobbel = k.ang.kort.nokler.includes('DOBBELTHOGG');
  if(fp.liv.length <= 2 || dobbel || billigst.kort.kost <= 3) return billigst;
  return null;
}

const erMottrekkshendelse = kort =>
  kort.kat === 'hendelse' && kort.eff && kort.eff.nar === 'mottrekk';

/* Maskinen regnet bare med MOT-verdien og lot MOTTREKK-hendelsene ligge,
   selv om mennesket kunne spille dem. Na teller begge veier, og den
   sterkeste tas forst. Hendelsen legges rett paa det angrepne kortet:
   det er alltid det den skal redde. */
function aiMottrekk(){
  const k = KS.kamp, fp = KS.p[k.forsvS];
  const viktig = k.mal.sted === 'leder'
    ? fp.liv.length <= 2
    : k.mal.kort.kost >= 4;
  if(!viktig) return;

  while(kraft(k.mal) <= kraft(k.ang)){
    const valg = fp.hand.map(id => KORTBASE[id])
      .map(kort => ({ kort, spilles: erMottrekkshendelse(kort) && kort.kost <= fp.sol.aktiv
                                     && kort.eff.verdi > kort.mot }))
      .map(o => ({ ...o, gir: o.spilles ? o.kort.eff.verdi : o.kort.mot }))
      .filter(o => o.gir > 0)
      .sort((a,b) => b.gir - a.gir)[0];
    if(!valg) break;
    fp.hand.splice(fp.hand.indexOf(valg.kort.id), 1);
    fp.kompost.push(valg.kort.id);
    if(valg.spilles) fp.sol.aktiv -= valg.kort.kost;
    k.mal.kbuff += valg.gir;
    logg('Motstanderen bruker ' + valg.kort.navn + ' som mottrekk (+' + valg.gir + ').');
  }
  tegn();
}

/* ============================================================ kortgrafikk
   Modellbildene er store data-URLer. De legges derfor i et eget stilark,
   en regel per art, slik at brettet kan tegnes om uten a dra med seg
   flere hundre kilobyte HTML hver gang. */
let kunstArk = null;
const kunstLagt = new Set();
function kunst(kort){
  const id = kort.artId, kl = 'kunst-' + id;
  if(kunstLagt.has(id)) return kl;
  try {
    if(!kunstArk){
      const s = document.createElement('style');
      document.head.appendChild(s);
      kunstArk = s.sheet;
    }
    kunstArk.insertRule(`.${kl}{background-image:url(${VM().lagMini(id, null)})}`,
      kunstArk.cssRules.length);
    kunstLagt.add(id);
  } catch(e){ return ''; }
  return kl;
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
    <div class="kg-kunst ${kunst(kort)}">
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
    <span class="kk-kunst ${kunst(kort)}"></span>
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

  /* Verten er sannheten: hver gang brettet endrer seg, far gjesten det. */
  if(erVert()) nettSend({ t:'tilstand', d:lagTilstand(1) });
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
  vistResultat = true;
  if(erVert()) nettSend({ t:'tilstand', d:lagTilstand(1) });
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
  if(!s) return null;
  const p = KS.p[+s[1]];
  if(!p) return null;
  if(s[2] === 'leder')  return p.leder;
  if(s[2] === 'biotop') return p.biotop;
  return p.arter[+s[3]] || null;
}
/* Motsatt vei: fra enhet til sti. Stien er trebokstavsspraaket vi sender
   over nettet, og det samme som ligger i data-sti paa brettet. */
function stiAv(u){
  if(!u) return null;
  if(u.sted === 'leder')  return ['e', String(u.side), 'leder', '0'];
  if(u.sted === 'biotop') return ['e', String(u.side), 'biotop', '0'];
  const i = KS.p[u.side].arter.indexOf(u);
  return i < 0 ? null : ['e', String(u.side), 'art', String(i)];
}
/* Speiler en sti mellom de to perspektivene. Operasjonen er sin egen invers.
   Stier paa nettet staar alltid i avsenderens perspektiv; mottakeren speiler. */
function speilSti(s){ return s ? ['e', s[1] === '0' ? '1' : '0', s[2], s[3]] : null; }

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
        gjor: async () => { lukkArk(); await handling({ h:'spill', i }); } },
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
      const til = stiAv(mal);
      if(til) await handling({ h:'angrip', fra:s, til });
    }});
  }
  if(u.side === 0 && u.sted !== 'biotop' && KS.p[0].sol.aktiv > 0){
    knapper.push({ t:'GI SOL', gjor: async () => { lukkArk(); await handling({ h:'sol', sti:s }); } });
  }
  if(u.side === 0 && u.kort.eff && u.kort.eff.nar === 'aktiver'){
    const brukt = u.sted === 'leder' ? KS.p[0].lederBrukt : u.brukt;
    knapper.push({ t:'AKTIVER', av:brukt, gjor: async () => { lukkArk(); await handling({ h:'aktiver', sti:s }); } });
  }
  knapper.push({ t:'LUKK', gjor: lukkArk });
  apneArk(u.kort, knapper);
  tegn();
});

/* ============================================================ nettkamp */
/* Verten eier motoren og er alltid side 0 i sin egen KS. Gjesten kjorer ikke
   motoren i det hele tatt: den far speilvendte oyeblikksbilder der den selv
   ligger paa plass 0, og kan derfor bruke tegn() og brettKlikk uendret. */

let vistResultat = false;
let vertIGang = false;

/* -------- handlinger -------- */
/* De fem tingene en spiller faktisk kan gjore. Gjesten sender dem over
   kanalen i stedet for a utfore dem; verten utforer dem for begge. */
async function handling(m){
  if(erGjest()){ nettSend({ t:'handling', m }); return; }
  await utforHandling(0, m);
}

async function utforHandling(side, m){
  if(KS.slutt || KS.tur !== side) return;
  switch(m.h){
    case 'spill':
      await spillKort(side, +m.i);
      break;
    case 'angrip': {
      const a = enhetFraSti(m.fra), b = enhetFraSti(m.til);
      if(!a || !b || a.side !== side) return;
      if(!kanAngripe(a) || !lovligeMal(1 - side).includes(b)) return;
      await angrip(a, b);
      break; }
    case 'sol': {
      const u = enhetFraSti(m.sti);
      if(u && u.side === side && u.sted !== 'biotop') giSol(side, u);
      break; }
    case 'aktiver': {
      const u = enhetFraSti(m.sti);
      if(u && u.side === side) await aktiver(side, u);
      break; }
    case 'avslutt': {
      if(KS.kamp || KS.malvalg) return;
      const f = KS.turFerdig; KS.turFerdig = null;
      if(f) f();
      break; }
  }
}

function speilHandling(m){
  const r = { ...m };
  if(r.fra) r.fra = speilSti(r.fra);
  if(r.til) r.til = speilSti(r.til);
  if(r.sti) r.sti = speilSti(r.sti);
  return r;
}

/* -------- oyeblikksbilde -------- */
function serEnhet(u, meg){
  if(!u) return null;
  return { k:u.kort.id, side:(u.side === meg ? 0 : 1), sted:u.sted,
           hvilt:u.hvilt, ny:u.ny, sol:u.sol, buff:u.buff, kbuff:u.kbuff, brukt:u.brukt };
}
/* aapen = mottakerens egen side. Motpartens hand og stokk sendes som antall,
   saa kortene aldri forlater verten. */
function serSpiller(p, meg, aapen){
  return {
    hand: aapen ? p.hand.slice() : p.hand.length,
    stokk: p.stokk.length, kompost: p.kompost.length, liv: p.liv.length,
    sol: { ...p.sol }, lederBrukt: p.lederBrukt,
    leder: serEnhet(p.leder, meg),
    biotop: serEnhet(p.biotop, meg),
    arter: p.arter.map(a => serEnhet(a, meg)),
  };
}
function lagTilstand(forSide){
  const sisteLogg = KS.logg[KS.logg.length - 1];
  return {
    p: [ serSpiller(KS.p[forSide], forSide, true),
         serSpiller(KS.p[1 - forSide], forSide, false) ],
    tur:    KS.tur    === forSide ? 0 : 1,
    forste: KS.forste === forSide ? 0 : 1,
    turNr: KS.turNr, slutt: KS.slutt, grunn: KS.grunn,
    seier: forSide === 0 ? KS.seier : !KS.seier,
    kamp: !!KS.kamp,
    logg: sisteLogg
      ? { t:sisteLogg.t, s:(sisteLogg.s == null ? null : (sisteLogg.s === forSide ? 0 : 1)) }
      : null,
  };
}

function deEnhet(e){
  if(!e) return null;
  return { kort:KORTBASE[e.k], side:e.side, sted:e.sted, hvilt:e.hvilt, ny:e.ny,
           sol:e.sol, buff:e.buff, kbuff:e.kbuff, brukt:e.brukt };
}
/* Kortrygger vi bare teller. Da virker livRadHTML og stokketellingen uendret. */
const fyll = n => new Array(n).fill('?');

function deSpiller(d, styring){
  const p = {
    styring,
    hand: Array.isArray(d.hand) ? d.hand.slice() : fyll(d.hand),
    stokk: fyll(d.stokk), kompost: fyll(d.kompost), liv: fyll(d.liv),
    sol: { ...d.sol }, lederBrukt: d.lederBrukt,
    arter: d.arter.map(deEnhet),
    biotop: deEnhet(d.biotop),
  };
  p.leder = deEnhet(d.leder);
  return p;
}

function lesTilstand(d){
  clearInterval(klarPuls); klarPuls = null;
  KS.p[0] = deSpiller(d.p[0], 'lokal');
  KS.p[1] = deSpiller(d.p[1], 'fjern');
  KS.tur = d.tur; KS.forste = d.forste; KS.turNr = d.turNr;
  KS.slutt = d.slutt; KS.seier = d.seier; KS.grunn = d.grunn;
  KS.kamp = d.kamp ? {} : null;
  KS.valgt = null;
  /* Enhetene er nye objekter naa, saa et paagaende malvalg maa peke paa nytt. */
  if(KS.malvalg && KS.malvalg.stier){
    KS.malvalg.lovlige = KS.malvalg.stier.map(enhetFraSti).filter(Boolean);
  }
  if(d.logg){
    KS.logg.push(d.logg);
    if(KS.logg.length > 40) KS.logg.shift();
  }
  tegn();
  if(d.logg){ const el = $('#ksLogg'); if(el) el.textContent = loggTekst(d.logg, 0); }
  if(KS.slutt && !vistResultat){ vistResultat = true; visResultat(); }
}

/* -------- gjestens svar paa vertens spoersmal -------- */
async function gjestSpor(m){
  const kort = (m.kort || []).map(id => KORTBASE[id]).filter(Boolean);
  let v;
  try { v = await sporsmal(m.tekst, kort, m.valg); }
  catch(e){ return; }
  nettSend({ t:'svar', id:m.id, verdi:v });
}

async function gjestMalvalg(m){
  const lovlige = (m.lovlige || []).map(s => enhetFraSti(speilSti(s))).filter(Boolean);
  if(!lovlige.length){ nettSend({ t:'svar', id:m.id, verdi:null }); return; }
  const stier = lovlige.map(stiAv).filter(Boolean);
  KS.malvalg = { lovlige, tekst:m.tekst, stier };
  tegn();
  let u = null;
  try { u = await nyttLofte(); }
  catch(e){ return; }
  KS.malvalg = null;
  tegn();
  nettSend({ t:'svar', id:m.id, verdi: u ? stiAv(u) : null });
}

/* -------- innkommende meldinger -------- */
const taImot = trygg(async m => {
  if(!m || !KS.nett) return;
  if(m.t === 'farvel'){ avbrytNettkamp('MOTSTANDEREN FORLOT KAMPEN'); return; }

  if(erVert()){
    if(m.t === 'klar'){ vertStart(m.leder); return; }
    if(m.t === 'handling'){ await utforHandling(1, speilHandling(m.m)); return; }
    if(m.t === 'svar'){ losFjernLofte(m.id, m.verdi); return; }
    return;
  }
  switch(m.t){
    case 'tilstand': lesTilstand(m.d); break;
    case 'spor':     await gjestSpor(m); break;
    case 'malvalg':  await gjestMalvalg(m); break;
  }
});

/* -------- start og slutt -------- */
function tomtBrett(tekst){
  for(const id of ['foeLiv','myLiv','foeSol','mySol','foeLeder','myLeder',
                   'foeBiotop','myBiotop','foeArter','myArter','myHand']){
    const el = $('#' + id); if(el) el.innerHTML = '';
  }
  $('#foeTall').textContent = ''; $('#myTall').textContent = '';
  $('#ksTur').textContent = tekst;
  $('#ksLogg').textContent = ' ';
  $('#ksAvslutt').disabled = true;
}

function startVert(kampId){
  KS.nett = { rolle:'vert', kampId };
  KS.p[0] = KS.p[1] = null;
  vertIGang = false;
  nullstill();
  tomtBrett('VENTER PÅ MOTSTANDEREN');
}

/* Gjesten vet ikke naar verten har abonnert paa kanalen, saa den gjentar
   meldingen til det forste oyeblikksbildet kommer tilbake. */
let klarPuls = null;
function startGjest(kampId){
  KS.nett = { rolle:'gjest', kampId };
  KS.p[0] = KS.p[1] = null;
  nullstill();
  tomtBrett('VENTER PÅ MOTSTANDEREN');
  const si = () => nettSend({ t:'klar', leder:KS.minLeder });
  si();
  clearInterval(klarPuls);
  klarPuls = setInterval(() => { if(erGjest()) si(); else clearInterval(klarPuls); }, 1000);
}

/* Verten venter til gjesten melder seg, saa den vet hvilken leder
   motparten stiller med. */
function vertStart(motLeder){
  if(vertIGang || !erVert()) return;
  vertIGang = true;
  vistResultat = false;
  kjorSpill(KS.minLeder, motLeder, 'fjern');
}

function avbrytNettkamp(grunn){
  if(!KS.nett) return;
  KS.nett = null;
  clearInterval(klarPuls); klarPuls = null;
  KS.gen++;                       // gamle motorlokker gir seg
  brytAlleLofter();
  if(KS.turFerdig){ const f = KS.turFerdig; KS.turFerdig = null; f(); }
  tomKo();
  NETT.kampUt();
  VM().toast(grunn);
  VM().gaTil('lobby');
}

/* Kalles naar spilleren gaar ut av dystskjermen. */
function forlat(){
  if(!KS.nett) return;
  KS.nett = null;
  clearInterval(klarPuls); klarPuls = null;
  KS.gen++;
  brytAlleLofter();
  if(KS.turFerdig){ const f = KS.turFerdig; KS.turFerdig = null; f(); }
  NETT.send({ t:'farvel' });
  tomKo();
  NETT.kampUt();
}

/* ============================================================ oppstart */
let kablet = false;
function kable(){
  if(kablet) return;
  kablet = true;
  $('#screen-battle').addEventListener('click', brettKlikk);  // dekker brett og hand

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

  $('#ksAvslutt').addEventListener('click', trygg(async () => {
    if(KS.tur !== 0 || KS.kamp || KS.malvalg || KS.slutt) return;
    VM().LYD.klikk();
    await handling({ h:'avslutt' });
  }));

  $('#ksAvbryt').addEventListener('click', () => {
    if(KS.malvalg) losLofte(null);
  });

  /* Lederbytte hoerer til enspillerkampen. I nettkamp velges lederen i lobbyen. */
  $('#ksBytt').addEventListener('click', () => {
    if(KS.nett){ VM().toast('LEDEREN VELGES I LOBBYEN'); return; }
    const i = LEDERE.findIndex(l => l.id === KS.minLeder);
    KS.minLeder = LEDERE[(i+1) % LEDERE.length].id;
    start();
  });

  $('#ksIgjen').addEventListener('click', () => {
    if(KS.nett){ forlat(); VM().gaTil('lobby'); return; }
    start();
  });
}

/* Felles opprydding for alle tre oppstartene. */
function nullstill(){
  kable();
  $('#ksResult').hidden = true;
  $('#ksDialog').hidden = true;
  $('#ksArk').hidden = true;
  $('#ksBanner').hidden = true;
  document.body.classList.remove('ks-velger');
  KS.turFerdig = null;
  KS.malvalg = null;
  KS.valgt = null;
  KS.logg = [];
  vistResultat = false;
  brytAlleLofter();
  tomKo();
}

function start(){
  KS.nett = null;
  nullstill();
  kjorSpill(KS.minLeder);
}

return {
  start, startVert, startGjest, forlat, taImot,
  motpartBorte: () => avbrytNettkamp('MOTSTANDEREN MISTET FORBINDELSEN'),
  KS,
};
})();
