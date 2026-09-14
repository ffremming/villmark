/* VILLMARK - DYSTLOBBY
   Skjermen foran kortspillet: velg navn, velg dekk, se hvem som er paanett
   og utfordre dem. Lobbyen kjenner bare NETT og KORTSPILL sine ytterdorer. */

const LOBBY = (() => {
'use strict';

const VM = () => window.VM;
const $  = s => document.querySelector(s);

const L = {
  kablet:false,
  startet:false,
  spillere:[],
  innkomne:new Map(),   // id -> kampId for dem som har utfordret oss
  venterPaa:null,       // id vi selv har utfordret
  venterFelt:false,     // we asked someone for their lawn and wait for it
  minLeder:'ld_bjorn',
};

/* ============================================================ tegning */
function lederKnappHTML(l, valgt){
  const f = KORTFARGER[l.farger[0]], g = KORTFARGER[l.farger[1]];
  return `<button class="lob-leder${valgt ? ' valgt' : ''}" data-leder="${l.id}"
    style="--a:${f.hex};--b:${g.hex}">
    <span class="lob-leder-navn">${l.navn}</span>
    <span class="lob-leder-farge">${f.navn} / ${g.navn}</span>
    <span class="lob-leder-liv">${l.liv} LIV</span>
  </button>`;
}

function tegnLedere(){
  $('#lobLedere').innerHTML = LEDERE.map(l => lederKnappHTML(l, l.id === L.minLeder)).join('');
}

/* ============================================================ dekket
   Kortstokken er plenen: hvert dyr og hver plante som staar ute er ett kort.
   Her velger du hvilke av dem som blir med. Lederen bestemmer hvor stort
   dekket minst maa vaere, siden livskortene ogsaa tas av stokken. */
function dekkTilstand(){
  const leder = KORTBASE[L.minLeder];
  const ute = dekkbareEksemplarer(VM().STATE.eksemplarer)
    .sort((a,b) => kortKost(SPECIES_BY_ID[a.art], a.niva)
                 - kortKost(SPECIES_BY_ID[b.art], b.niva)
                || SPECIES_BY_ID[a.art].navn.localeCompare(SPECIES_BY_ID[b.art].navn)
                || a.uid - b.uid);
  return { leder, ute, antall: VM().dekkStokk().length, minst: dekkMinst(leder) };
}
const dekkOk = () => { const d = dekkTilstand(); return d.antall >= d.minst; };

function dekkRuteHTML(e){
  const kort = kortAv(kortIdFor(e.art, e.niva));
  const med  = VM().dekkHar(e.uid);
  return `<button class="lob-kort${med ? ' med' : ''}" data-uid="${e.uid}"
    aria-pressed="${med}">
    <span class="lob-kort-bilde"><img src="${VM().lagMini(e.art, e.variant)}" alt=""></span>
    <span class="lob-kort-navn">${kort.navn}</span>
    <span class="lob-kort-tall">${kort.kost} SOL &middot; ${kort.kraft}</span>
    ${e.niva > 1 ? `<span class="lob-kort-niva">Nv ${e.niva}</span>` : ''}
  </button>`;
}

function tegnDekk(){
  const { ute, antall, minst } = dekkTilstand();
  const nok = antall >= minst;

  const tall = $('#lobDekkTall');
  tall.textContent = antall + ' KORT';
  tall.classList.toggle('lob-for-faa', !nok);

  const hint = $('#lobDekkHint');
  const tekst = !ute.length
    ? 'SETT DYR OG PLANTER UT PÅ PLENEN FOR Å FÅ KORT.'
    : !nok ? 'DEKKET MÅ HA MINST ' + minst + ' KORT MOT DENNE LEDEREN.' : '';
  hint.textContent = tekst;
  hint.hidden = !tekst;

  $('#lobDekk').innerHTML = ute.map(dekkRuteHTML).join('');
  $('#lobDekkBryter').disabled = !ute.length;
  $('#lobMotAI').disabled = !nok;
}

function tegnListe(){
  const ut = $('#lobListe');
  if(!L.spillere.length){
    ut.innerHTML = `<p class="lob-tomt">INGEN ANDRE ER PÅNETT NÅ.${
      NETT.LOKAL_MODUS ? '<br><small>LOKAL TESTMODUS — ÅPNE SPILLET I EN FANE TIL.</small>' : ''}</p>`;
    return;
  }
  ut.innerHTML = L.spillere.map(s => {
    const leder = KORTBASE[s.leder];
    const utfordrer = L.innkomne.has(s.id);
    const opptatt = s.status === 'i_kamp';
    return `<button class="lob-rad${utfordrer ? ' utfordrer' : ''}"
      data-spiller="${s.id}"${opptatt && !utfordrer ? ' disabled' : ''}>
      <span class="lob-rad-navn">${s.navn}</span>
      <span class="lob-rad-leder">${leder ? leder.navn : '—'}</span>
      ${utfordrer ? '<span class="lob-merkelapp">UTFORDRER DEG</span>'
                  : `<span class="lob-rad-status">${opptatt ? 'I KAMP' : 'LEDIG'}</span>`}
    </button>`;
  }).join('');
}

/* Statuslinja skiller mellom aa vaere tilkoblet og aa vaere synlig.
   Er du 'usynlig' ser du alle andre, mens ingen ser deg. */
const STATUSTEKST = {
  lokal:    'LOKAL TESTMODUS',
  av:       'KOBLER TIL …',
  kobler:   'KOBLER TIL …',
  usynlig:  'IKKE SYNLIG — PRØVER IGJEN',
  paanett:  'PÅNETT',
};
function tegnStatus(){
  const el = $('#lobStatus');
  const t = NETT.tilstand();
  el.textContent = STATUSTEKST[t] || t;
  el.classList.toggle('lob-status-varsel', t === 'usynlig' || t === 'kobler');
}

function vent(tekst){
  $('#lobVentTxt').textContent = tekst;
  $('#lobVent').hidden = false;
}
function lukkVent(){ $('#lobVent').hidden = true; }

/* ============================================================ utfordringer */
async function utfordre(id){
  const s = L.spillere.find(x => x.id === id);
  if(!s) return;
  if(!dekkOk()){ VM().toast('DEKKET DITT ER FOR LITE'); return; }
  L.venterPaa = id;
  vent('VENTER PÅ SVAR FRA ' + s.navn + ' …');

  const svar = await NETT.utfordre(id);
  L.venterPaa = null;
  lukkVent();

  if(!svar.godtatt){
    VM().toast(svar.tidsavbrudd ? 'INGEN SVAR' : 'UTFORDRINGEN BLE AVSLÅTT');
    return;
  }
  gaTilKamp(svar.kampId, 'vert', id);
}

/* ------------------------------------------------ visiting a lawn */
/* A visit is a question to a player who is online right now: they answer
   with a snapshot of their lawn, and it is drawn read-only. Nobody's lawn
   is stored on the network, so an offline player cannot be visited. */
async function besok(id){
  const s = L.spillere.find(x => x.id === id);
  if(!s) return;
  L.venterFelt = true;
  vent('HENTER PLENEN TIL ' + s.navn + ' \u2026');

  const svar = await NETT.askField(id);
  L.venterFelt = false;
  lukkVent();
  if(!svar || !svar.felt){ VM().toast('FIKK IKKE TAK I PLENEN'); return; }

  VM().visitField(svar.navn || s.navn, svar.felt);
}

function godta(id){
  const kampId = L.innkomne.get(id);
  if(!kampId) return;
  /* Et for lite dekk taper paa tom kortstokk foer tredje tur, saa
     utfordringen avslaas i stedet for aa starte en kamp som er avgjort. */
  if(!dekkOk()){
    L.innkomne.delete(id);
    NETT.svarUtfordring(id, kampId, false);
    VM().toast('DEKKET DITT ER FOR LITE');
    tegnListe();
    return;
  }
  L.innkomne.delete(id);
  NETT.svarUtfordring(id, kampId, true);
  gaTilKamp(kampId, 'gjest', id);
}

function avsla(id){
  const kampId = L.innkomne.get(id);
  if(!kampId) return;
  L.innkomne.delete(id);
  NETT.svarUtfordring(id, kampId, false);
  tegnListe();
}

/* Kanalen maa staa foer kampen starter, ellers gaar den forste meldingen tapt. */
function gaTilKamp(kampId, rolle, motpart){
  NETT.kampInn(kampId, rolle, motpart);
  KORTSPILL.KS.minLeder = L.minLeder;
  if(rolle === 'vert') KORTSPILL.startVert(kampId);
  else                 KORTSPILL.startGjest(kampId);
  VM().gaTil('battle');
}

/* ============================================================ kabling */
function kable(){
  if(L.kablet) return;
  L.kablet = true;

  $('#lobNavn').addEventListener('change', e => {
    const n = NETT.settNavn(e.target.value);
    e.target.value = n;
  });

  $('#lobLedere').addEventListener('click', e => {
    const b = e.target.closest('[data-leder]');
    if(!b) return;
    L.minLeder = b.dataset.leder;
    KORTSPILL.KS.minLeder = L.minLeder;
    NETT.settLeder(L.minLeder);
    tegnLedere();
    tegnDekk();            // en leder med flere liv krever et storre dekk
  });

  $('#lobDekkBryter').addEventListener('click', () => {
    const rut = $('#lobDekk');
    rut.hidden = !rut.hidden;
    $('#lobDekkBryter').textContent = rut.hidden ? 'ENDRE' : 'FERDIG';
  });

  $('#lobDekk').addEventListener('click', e => {
    const b = e.target.closest('[data-uid]');
    if(!b) return;
    const uid = Number(b.dataset.uid);
    VM().dekkVelg(uid, !VM().dekkHar(uid));
    tegnDekk();
  });

  $('#lobListe').addEventListener('click', e => {
    const b = e.target.closest('[data-spiller]');
    if(!b || b.disabled) return;
    const id = b.dataset.spiller;
    if(L.innkomne.has(id)) sporGodta(id);
    else sporValg(id);
  });

  $('#lobVentAvbryt').addEventListener('click', () => {
    if(L.venterFelt){ NETT.cancelField(); L.venterFelt = false; }
    else NETT.avbrytUtfordring();
    L.venterPaa = null;
    lukkVent();
  });

  $('#lobVelgBesok').addEventListener('click', () => {
    const id = $('#lobVelg').dataset.spiller;
    $('#lobVelg').hidden = true;
    besok(id);
  });
  $('#lobVelgDyst').addEventListener('click', () => {
    const id = $('#lobVelg').dataset.spiller;
    $('#lobVelg').hidden = true;
    utfordre(id);
  });
  $('#lobVelgAvbryt').addEventListener('click', () => { $('#lobVelg').hidden = true; });

  $('#lobMotAI').addEventListener('click', () => {
    KORTSPILL.KS.minLeder = L.minLeder;
    VM().gaTil('battle');
  });

  $('#lobGodta').addEventListener('click', () => {
    const id = $('#lobSpor').dataset.fra;
    $('#lobSpor').hidden = true;
    godta(id);
  });
  $('#lobAvsla').addEventListener('click', () => {
    const id = $('#lobSpor').dataset.fra;
    $('#lobSpor').hidden = true;
    avsla(id);
  });

  /* Someone wants to see our lawn. It costs nothing to show it, so the
     answer goes out without asking - the lawn holds nothing private. */
  NETT.paa('fieldRequest', fra => NETT.sendField(fra, VM().fieldSnapshot()));

  NETT.paa('spillere', liste => {
    L.spillere = liste;
    for(const id of [...L.innkomne.keys()]){
      if(!liste.some(s => s.id === id)) L.innkomne.delete(id);
    }
    const valgt = $('#lobVelg');
    if(!valgt.hidden && !liste.some(s => s.id === valgt.dataset.spiller)) valgt.hidden = true;
    tegnListe();
  });

  NETT.paa('utfordring', u => {
    if(u.avbrutt){
      L.innkomne.delete(u.fra);
      if($('#lobSpor').dataset.fra === u.fra) $('#lobSpor').hidden = true;
      tegnListe();
      return;
    }
    L.innkomne.set(u.fra, u.kampId);
    tegnListe();
    VM().LYD.naer();
    VM().toast(u.fraNavn + ' VIL DYSTE');
  });

  NETT.paa('melding', m => KORTSPILL.taImot(m));

  NETT.paa('status', tegnStatus);

  NETT.paa('borte', () => {
    if(NETT.rolle) KORTSPILL.motpartBorte();
  });
}

/** the two things you can do with another player */
function sporValg(id){
  const s = L.spillere.find(x => x.id === id);
  const d = $('#lobVelg');
  d.dataset.spiller = id;
  $('#lobVelgNavn').textContent = s ? s.navn : 'SPILLER';
  d.hidden = false;
}

function sporGodta(id){
  const s = L.spillere.find(x => x.id === id);
  const d = $('#lobSpor');
  d.dataset.fra = id;
  $('#lobSporTxt').textContent = (s ? s.navn : 'NOEN') + ' VIL DYSTE MOT DEG';
  d.hidden = false;
}

/* ============================================================ inn og ut */
async function aapne(){
  kable();
  tegnLedere();
  tegnDekk();
  tegnListe();
  tegnStatus();

  if(!L.startet){
    try {
      await NETT.klar();
      L.startet = true;
    } catch(e){
      $('#lobStatus').textContent = 'FIKK IKKE KONTAKT';
      VM().toast('NETTET SVARER IKKE');
      return;
    }
    NETT.settLeder(L.minLeder);
  }
  $('#lobNavn').value = NETT.meg.navn;
  NETT.lobbyInn();
  tegnStatus();
  tegnListe();
}

return { aapne, get minLeder(){ return L.minLeder; } };
})();
