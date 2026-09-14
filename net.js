/* VILLMARK - NETTLAG
   Alt som gaar ut av maskinen ligger her. Resten av spillet ser bare
   funksjonene nederst i filen og vet ingenting om Supabase.

   To transporter med samme API:
     supabase  - ekte nett, Presence for spillerlista og Broadcast for resten
     lokal     - BroadcastChannel mellom to faner i samme nettleser (?fake-nett)

   Ingen databasetabeller. Presence baerer navn og lederkort, saa lobbyen
   trenger ingen lagring. Anon-noekkelen er offentlig etter design. */

const NETT = (() => {
'use strict';

const KONF = window.VILLMARK_NETT || {};
const LOKAL_MODUS = new URLSearchParams(location.search).has('fake-nett')
                    || !KONF.url || !KONF.anonKey;

const LOBBY = 'villmark-lobby';
const HJERTESLAG = 2000;   // lokal transport: hvor ofte vi roper at vi lever
const GLEMSEL    = 6000;   // lokal transport: naar en stille spiller regnes som borte
const SVARFRIST  = 30000;  // hvor lenge en utfordring staar aapen

/* ============================================================ tilstand */
const N = {
  klar:false,
  meg:{ id:null, navn:'', leder:null, status:'ledig' },
  spillere:new Map(),        // id -> spiller
  lobbyKanal:null,
  kampKanal:null,
  kampId:null,
  rolle:null,                // 'vert' | 'gjest'
  motpart:null,              // id til den vi spiller mot
  lyttere:{ spillere:[], utfordring:[], melding:[], borte:[] },
  utestaaende:null,          // utfordringen vi selv har sendt
  sb:null,
};

function rop(navn, ...a){ for(const f of N.lyttere[navn].slice()) f(...a); }
const uuid = () => (crypto.randomUUID ? crypto.randomUUID()
  : Date.now().toString(16) + Math.random().toString(16).slice(2));

/* ============================================================ navn og id */
/* I lokal testmodus ligger identiteten i sessionStorage, slik at to faner
   i samme nettleser blir to forskjellige spillere. */
const lager = () => LOKAL_MODUS ? sessionStorage : localStorage;

function lagretNavn(){ try { return lager().getItem('villmark-navn') || ''; } catch { return ''; } }
function lagreNavn(n){ try { lager().setItem('villmark-navn', n); } catch {} }

function tilfeldigNavn(){
  const a = ['RASK','STILLE','VILL','GRAA','HVIT','SKARP','MYK','DYP'];
  const b = ['REV','UGLE','GAUPE','ELG','ORM','HARE','FALK','GRAVLING'];
  return a[Math.floor(Math.random()*a.length)] + ' ' + b[Math.floor(Math.random()*b.length)];
}

/* ============================================================ lobbylogikk */
function liste(){
  return [...N.spillere.values()].sort((a,b) => a.navn.localeCompare(b.navn, 'no'));
}

/* Meldinger som gaar gjennom lobbyen: utfordring, svar og tilbaketrekning.
   Alle baerer mottaker, saa vi kaster det som ikke er til oss. */
function lobbyMelding(m){
  if(!m || m.til !== N.meg.id) return;

  if(m.t === 'utfordring'){
    rop('utfordring', { fra:m.fra, fraNavn:m.fraNavn, kampId:m.kampId });
    return;
  }
  if(m.t === 'utfordring-avbrutt'){
    rop('utfordring', { fra:m.fra, avbrutt:true });
    return;
  }
  if(m.t === 'utfordring-svar'){
    const u = N.utestaaende;
    if(!u || u.til !== m.fra) return;
    clearTimeout(u.frist);
    N.utestaaende = null;
    u.res(m.godtatt ? { godtatt:true, kampId:u.kampId } : { godtatt:false });
  }
}

/* ============================================================ transport: lokal */
/* BroadcastChannel naar to faner i samme nettleser skal spille mot hverandre.
   Presence finnes ikke her, saa vi bygger den av hjerteslag. */
const Lokal = (() => {
  let kanal = null, puls = null;
  const sist = new Map();   // id -> tidspunkt for siste livstegn

  function send(m){ if(kanal) kanal.postMessage(m); }

  function luk(){
    const naa = Date.now();
    let endret = false;
    for(const [id, t] of sist){
      if(naa - t > GLEMSEL){
        sist.delete(id); N.spillere.delete(id); endret = true;
        if(id === N.motpart) rop('borte');
      }
    }
    if(endret) rop('spillere', liste());
  }

  function taImot(m){
    if(m.t === 'hei'){
      if(m.s.id === N.meg.id) return;
      sist.set(m.s.id, Date.now());
      const gammel = N.spillere.get(m.s.id);
      N.spillere.set(m.s.id, m.s);
      if(!gammel || JSON.stringify(gammel) !== JSON.stringify(m.s)) rop('spillere', liste());
      return;
    }
    if(m.t === 'hvem'){ send({ t:'hei', s:N.meg }); return; }
    if(m.t === 'hade'){
      if(N.spillere.delete(m.id)){ sist.delete(m.id); rop('spillere', liste()); }
      if(m.id === N.motpart) rop('borte');
      return;
    }
    lobbyMelding(m);
  }

  return {
    async start(){
      N.meg.id = sessionStorage.getItem('villmark-id') || uuid();
      sessionStorage.setItem('villmark-id', N.meg.id);
      kanal = new BroadcastChannel(LOBBY);
      kanal.onmessage = e => taImot(e.data);
    },
    lobbyInn(){
      if(puls) return;
      send({ t:'hei', s:N.meg });
      send({ t:'hvem' });
      puls = setInterval(() => { send({ t:'hei', s:N.meg }); luk(); }, HJERTESLAG);
    },
    lobbyUt(){
      clearInterval(puls); puls = null;
      send({ t:'hade', id:N.meg.id });
      N.spillere.clear();
      rop('spillere', liste());
    },
    oppdater(){ send({ t:'hei', s:N.meg }); },
    kringkast(m){ send(m); },
  };
})();

/* ============================================================ transport: supabase */
const Sky = (() => {
  async function lastBibliotek(){
    if(window.supabase) return;
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.onload = res; s.onerror = () => rej(new Error('fikk ikke lastet supabase-js'));
      document.head.appendChild(s);
    });
  }

  return {
    async start(){
      await lastBibliotek();
      N.sb = window.supabase.createClient(KONF.url, KONF.anonKey);
      let { data } = await N.sb.auth.getSession();
      if(!data.session){
        const r = await N.sb.auth.signInAnonymously();
        if(r.error) throw r.error;
        data = { session:r.data.session };
      }
      N.meg.id = data.session.user.id;
    },

    lobbyInn(){
      if(N.lobbyKanal) return;
      N.lobbyKanal = N.sb.channel(LOBBY, { config:{ presence:{ key:N.meg.id } } });
      N.lobbyKanal
        .on('presence', { event:'sync' }, () => {
          const alle = N.lobbyKanal.presenceState();
          N.spillere.clear();
          for(const nokkel in alle){
            const s = alle[nokkel][0];
            if(s && s.id && s.id !== N.meg.id) N.spillere.set(s.id, s);
          }
          if(N.motpart && !N.spillere.has(N.motpart)) rop('borte');
          rop('spillere', liste());
        })
        .on('broadcast', { event:'lobby' }, e => lobbyMelding(e.payload))
        .subscribe(async status => {
          if(status === 'SUBSCRIBED') await N.lobbyKanal.track(N.meg);
        });
    },

    async lobbyUt(){
      if(!N.lobbyKanal) return;
      const k = N.lobbyKanal;
      N.lobbyKanal = null;
      N.spillere.clear();
      rop('spillere', []);
      try { await k.untrack(); } catch {}
      await N.sb.removeChannel(k);
    },

    oppdater(){ if(N.lobbyKanal) N.lobbyKanal.track(N.meg); },
    kringkast(m){
      if(N.lobbyKanal) N.lobbyKanal.send({ type:'broadcast', event:'lobby', payload:m });
    },
  };
})();

const T = LOKAL_MODUS ? Lokal : Sky;

/* ============================================================ kampkanal */
function kampInn(kampId, rolle, motpart){
  N.kampId = kampId; N.rolle = rolle; N.motpart = motpart;
  N.meg.status = 'i_kamp';
  T.oppdater();

  if(LOKAL_MODUS){
    N.kampKanal = new BroadcastChannel('villmark-kamp-' + kampId);
    N.kampKanal.onmessage = e => {
      if(e.data && e.data.fra !== N.meg.id) rop('melding', e.data.m);
    };
    return;
  }
  N.kampKanal = N.sb.channel('kamp-' + kampId, { config:{ broadcast:{ self:false } } });
  N.kampKanal
    .on('broadcast', { event:'kamp' }, e => rop('melding', e.payload))
    .subscribe();
}

function kampUt(){
  if(N.kampKanal){
    send({ t:'farvel' });
    const k = N.kampKanal;
    N.kampKanal = null;
    if(LOKAL_MODUS) k.close();
    else N.sb.removeChannel(k);
  }
  N.kampId = null; N.rolle = null; N.motpart = null;
  N.meg.status = 'ledig';
  T.oppdater();
}

function send(m){
  if(!N.kampKanal) return;
  if(LOKAL_MODUS){ N.kampKanal.postMessage({ fra:N.meg.id, m }); return; }
  N.kampKanal.send({ type:'broadcast', event:'kamp', payload:m });
}

/* ============================================================ utvendig API */
async function klar(){
  if(N.klar) return N.meg;
  await T.start();
  N.meg.navn = lagretNavn() || tilfeldigNavn();
  lagreNavn(N.meg.navn);
  N.klar = true;
  window.addEventListener('beforeunload', () => { try { T.lobbyUt(); } catch {} });
  return N.meg;
}

function settNavn(n){
  N.meg.navn = (n || '').trim().slice(0, 18).toUpperCase() || tilfeldigNavn();
  lagreNavn(N.meg.navn);
  T.oppdater();
  return N.meg.navn;
}

function settLeder(id){ N.meg.leder = id; T.oppdater(); }

/* Utfordrer en spiller og venter paa svar. Utfordreren lager kamp-id-en,
   slik at begge sider vet hvilken kanal de skal moetes i. */
function utfordre(tilId){
  if(N.utestaaende) avbrytUtfordring();
  const kampId = uuid();
  return new Promise(res => {
    const frist = setTimeout(() => {
      if(N.utestaaende && N.utestaaende.kampId === kampId){
        N.utestaaende = null;
        T.kringkast({ t:'utfordring-avbrutt', fra:N.meg.id, til:tilId });
        res({ godtatt:false, tidsavbrudd:true });
      }
    }, SVARFRIST);
    N.utestaaende = { til:tilId, kampId, res, frist };
    T.kringkast({ t:'utfordring', fra:N.meg.id, fraNavn:N.meg.navn, til:tilId, kampId });
  });
}

function avbrytUtfordring(){
  const u = N.utestaaende;
  if(!u) return;
  clearTimeout(u.frist);
  N.utestaaende = null;
  T.kringkast({ t:'utfordring-avbrutt', fra:N.meg.id, til:u.til });
  u.res({ godtatt:false, avbrutt:true });
}

function svarUtfordring(fraId, kampId, godtatt){
  T.kringkast({ t:'utfordring-svar', fra:N.meg.id, til:fraId, kampId, godtatt });
}

function paa(navn, f){
  N.lyttere[navn].push(f);
  return () => {
    const i = N.lyttere[navn].indexOf(f);
    if(i >= 0) N.lyttere[navn].splice(i, 1);
  };
}

return {
  LOKAL_MODUS,
  klar, settNavn, settLeder,
  get meg(){ return N.meg; },
  get rolle(){ return N.rolle; },
  get motpartId(){ return N.motpart; },
  get motpart(){ return N.spillere.get(N.motpart) || null; },
  spillere: liste,
  lobbyInn: () => T.lobbyInn(),
  lobbyUt:  () => T.lobbyUt(),
  utfordre, avbrytUtfordring, svarUtfordring,
  kampInn, kampUt, send, paa,
};
})();
