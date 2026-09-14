/* Runs store.js in a vm context with a fake localStorage. Covers the round
   trip, the uid counters, and every way a stored lawn can be unusable. */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROT = path.join(__dirname, '..');
const kilde = fs.readFileSync(path.join(ROT, 'store.js'), 'utf8');

let feil = 0;
const sjekk = (ok, hva) => { if(!ok){ feil++; console.log('FEIL: ' + hva); } else console.log('ok  - ' + hva); };

/* ---------------------------------------------------------- harness */
function fakeStorage(start){
  const bag = Object.assign({}, start);
  return {
    bag,
    getItem: k => (k in bag ? bag[k] : null),
    setItem: (k, v) => { bag[k] = String(v); },
    removeItem: k => { delete bag[k]; },
  };
}

/** a fresh STORE bound to its own storage */
function nyStore(start){
  const localStorage = fakeStorage(start);
  const ctx = vm.createContext({ localStorage, setTimeout, clearTimeout, console, JSON, Math, Set, Array, isFinite });
  /* const STORE ligger i skriptets eget skop, ikke paa kontekstobjektet,
     saa siste uttrykk gir oss taket paa modulen. */
  const STORE = vm.runInContext(kilde + '\nSTORE;', ctx);
  return { STORE, localStorage };
}

/** a lawn with one bought item and two specimens */
function nyState(){
  return {
    funnet: new Set(['rev','blaaveis']),
    varianter: { rev:'albino' },
    mynt: 320,
    niva: 3,
    pynt: [{ uid:4, id:'dam', x:2, z:-3, rotY:0 }],
    nestePyntUid: 5,
    eksemplarer: [
      { uid:7, art:'rev',      niva:2, variant:'albino', x:1,    z:2, },
      { uid:8, art:'blaaveis', niva:1, variant:null,     x:null, z:null },
    ],
    nesteUid: 9,
    dekk: new Set([7, 8]),
    dekkValgt: true,
    sistLagt: 8,
    sesong: 'vinter',
  };
}

const tom = () => ({ funnet:new Set(), varianter:{}, mynt:500, niva:3, pynt:[],
  nestePyntUid:1, eksemplarer:[], nesteUid:1, dekk:new Set(), dekkValgt:false,
  sistLagt:null, sesong:'host' });

/* ---------------------------------------------------------- round trip */
{
  const { STORE, localStorage } = nyStore();
  const a = nyState();
  STORE.flush(a);

  const b = tom();
  sjekk(STORE.load(b) === true, 'en lagret plen leses tilbake');
  sjekk([...b.funnet].sort().join(',') === 'blaaveis,rev', 'funnet kommer tilbake som Set');
  sjekk(b.varianter.rev === 'albino', 'varianten foelger arten');
  sjekk(b.mynt === 320 && b.niva === 3, 'mynt og nivaa kommer tilbake');
  sjekk(b.pynt.length === 1 && b.pynt[0].id === 'dam' && b.pynt[0].x === 2,
    'hagetingen staar der den stod');
  sjekk(b.eksemplarer.length === 2 && b.eksemplarer[0].niva === 2,
    'eksemplarene kommer tilbake med nivaa');
  sjekk(b.eksemplarer[1].x === null,
    'en ting som ventet paa aa bli satt ut venter fortsatt');
  sjekk(b.sesong === 'host', 'sesongen lagres ikke - den foelger kalenderen');
  sjekk(b.sistLagt === null, 'ingen art staar og venter paa aa vokse fram');
  sjekk(Object.keys(localStorage.bag).length === 1, 'alt ligger under en noekkel');
  sjekk(b.dekk instanceof Set && [...b.dekk].sort().join(',') === '7,8',
    'dekket kommer tilbake som Set med uid');
  sjekk(b.dekkValgt === true, 'et rort dekk huskes som rort');
}

/* ---------------------------------------------------------- the deck */
{
  /* A uid that is gone - two specimens dragged together - must not sit in
     the saved deck forever. */
  const { STORE } = nyStore();
  const a = nyState();
  a.dekk = new Set([7, 8, 99]);
  STORE.flush(a);

  const b = tom();
  STORE.load(b);
  sjekk(!b.dekk.has(99), 'en uid som ikke finnes lenger lagres ikke');
  sjekk(b.dekk.has(7) && b.dekk.has(8), 'uid-ene som staar igjen beholdes');
}
{
  /* A lawn saved before the deck editor existed plays with everything. */
  const gammel = nyStore({ 'villmark-plen-v1': JSON.stringify({
    v:1, mynt:100, niva:2, funnet:['rev'], varianter:{}, pynt:[],
    nestePyntUid:1, nesteUid:3,
    eksemplarer:[ { uid:1, art:'rev', niva:1, variant:null, x:0, z:0 },
                  { uid:2, art:'rev', niva:1, variant:null, x:1, z:1 } ],
  })});
  const s = tom();
  gammel.STORE.load(s);
  sjekk([...s.dekk].sort().join(',') === '1,2',
    'en plen lagret for dekkvelgeren faar alt den eier i dekket');
  sjekk(s.dekkValgt === false, 'og regnes som urort');
}

/* ---------------------------------------------------------- uid counters */
{
  const { STORE } = nyStore();
  const a = nyState();
  a.nesteUid = 2;          // an older save whose counter fell behind
  a.nestePyntUid = 1;
  STORE.flush(a);

  const b = tom();
  STORE.load(b);
  sjekk(b.nesteUid === 9, 'nesteUid klarer alle eksemplarene paa plenen');
  sjekk(b.nestePyntUid === 5, 'nestePyntUid klarer alle hagetingene paa plenen');
}

/* ---------------------------------------------------------- bad input */
{
  const nothing = nyStore();
  sjekk(nothing.STORE.load(tom()) === false, 'ingen lagring gir ingen endring');

  const broken = nyStore({ 'villmark-plen-v1': '{ikke json' });
  const s1 = tom();
  sjekk(broken.STORE.load(s1) === false, 'oedelagt json kastes');
  sjekk(s1.mynt === 500, 'plenen staar urort naar lagringen er oedelagt');

  const gammel = nyStore({ 'villmark-plen-v1': JSON.stringify({ v:0, mynt:9 }) });
  const s2 = tom();
  sjekk(gammel.STORE.load(s2) === false, 'ukjent versjon kastes');
  sjekk(s2.mynt === 500, 'plenen staar urort naar versjonen er ukjent');

  const rusk = nyStore({ 'villmark-plen-v1': JSON.stringify({
    v:1, mynt:'mye', niva:null, funnet:['rev', 7, null], varianter:'nei',
    pynt:[ {id:'dam', x:1, z:1}, null, {x:2}, 'benk' ],
    eksemplarer:[ {art:'rev', x:0, z:0}, {niva:3}, 42 ],
  }) });
  const s3 = tom();
  sjekk(rusk.STORE.load(s3) === true, 'en delvis oedelagt plen leses saa langt den rekker');
  sjekk(s3.mynt === 500, 'mynt som ikke er tall faller tilbake til det spillet hadde');
  sjekk([...s3.funnet].join(',') === 'rev', 'bare artsider som er tekst beholdes');
  sjekk(typeof s3.varianter === 'object' && !Array.isArray(s3.varianter),
    'varianter som ikke er objekt byttes ut med et tomt objekt');
  sjekk(s3.pynt.length === 1, 'hageting uten id kastes');
  sjekk(s3.eksemplarer.length === 1 && s3.eksemplarer[0].niva === 1,
    'eksemplar uten art kastes, og manglende nivaa blir 1');
}

/* ---------------------------------------------------------- holding writes */
{
  const { STORE, localStorage } = nyStore();
  const mitt = nyState();
  STORE.flush(mitt);
  const foer = localStorage.bag['villmark-plen-v1'];

  STORE.hold(true);                      // a guest lawn is on screen
  const gjest = tom();
  gjest.mynt = 1;
  STORE.save(gjest);
  STORE.flush(gjest);
  sjekk(localStorage.bag['villmark-plen-v1'] === foer,
    'ingenting skrives mens en annens plen ligger i STATE');

  STORE.hold(false);
  mitt.mynt = 999;
  STORE.flush(mitt);
  const etter = JSON.parse(localStorage.bag['villmark-plen-v1']);
  sjekk(etter.mynt === 999, 'egen plen skrives igjen naar besoeket er over');
}

/* ---------------------------------------------------------- delayed write */
(async () => {
  const { STORE, localStorage } = nyStore();
  const s = nyState();
  STORE.save(s);
  sjekk(localStorage.bag['villmark-plen-v1'] === undefined, 'save skriver ikke med en gang');
  s.mynt = 111;
  STORE.save(s);
  await new Promise(r => setTimeout(r, 700));
  const d = JSON.parse(localStorage.bag['villmark-plen-v1']);
  sjekk(d.mynt === 111, 'flere kall paa rad blir en skriving med siste tilstand');

  STORE.clear();
  sjekk(localStorage.bag['villmark-plen-v1'] === undefined, 'clear fjerner lagringen');

  console.log(feil ? '\n' + feil + ' feil' : '\nAlle lagringssjekker gikk gjennom');
  process.exit(feil ? 1 : 0);
})();
