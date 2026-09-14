/* Runs store.js in a vm context with a fake localStorage. Covers the round
   trip, the uid counters, and every way a stored lawn can be unusable. */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(ROOT, 'store.js'), 'utf8');

const KEY = 'villmark-lawn-v1';

let failures = 0;
const check = (ok, what) => { if(!ok){ failures++; console.log('FAIL: ' + what); } else console.log('ok  - ' + what); };

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
function newStore(start){
  const localStorage = fakeStorage(start);
  const ctx = vm.createContext({ localStorage, setTimeout, clearTimeout, console, JSON, Math, Set, Array, isFinite });
  /* const STORE lives in the script's own scope, not on the context object,
     so the last expression is our handle on the module. */
  const STORE = vm.runInContext(source + '\nSTORE;', ctx);
  return { STORE, localStorage };
}

/** a lawn with one bought item and two specimens */
function newState(){
  return {
    found: new Set(['fox','hepatica']),
    variants: { fox:'albino' },
    coins: 320,
    level: 3,
    props: [{ uid:4, id:'pond', x:2, z:-3, rotY:0 }],
    nextPropUid: 5,
    specimens: [
      { uid:7, species:'fox',      level:2, variant:'albino', x:1,    z:2, },
      { uid:8, species:'hepatica', level:1, variant:null,     x:null, z:null },
    ],
    nextUid: 9,
    deck: new Set([7, 8]),
    deckChosen: true,
    lastPlaced: 8,
    season: 'winter',
  };
}

const empty = () => ({ found:new Set(), variants:{}, coins:500, level:3, props:[],
  nextPropUid:1, specimens:[], nextUid:1, deck:new Set(), deckChosen:false,
  lastPlaced:null, season:'autumn' });

/* ---------------------------------------------------------- round trip */
{
  const { STORE, localStorage } = newStore();
  const a = newState();
  STORE.flush(a);

  const b = empty();
  check(STORE.load(b) === true, 'a saved lawn is read back');
  check([...b.found].sort().join(',') === 'fox,hepatica', 'found comes back as a Set');
  check(b.variants.fox === 'albino', 'the variant follows the species');
  check(b.coins === 320 && b.level === 3, 'coins and level come back');
  check(b.props.length === 1 && b.props[0].id === 'pond' && b.props[0].x === 2,
    'the garden item stands where it stood');
  check(b.specimens.length === 2 && b.specimens[0].level === 2,
    'the specimens come back with their level');
  check(b.specimens[1].x === null,
    'a thing waiting to be placed is still waiting');
  check(b.season === 'autumn', 'the season is not saved - it follows the calendar');
  check(b.lastPlaced === null, 'no species is standing around waiting to grow in');
  check(Object.keys(localStorage.bag).length === 1, 'everything sits under one key');
  check(b.deck instanceof Set && [...b.deck].sort().join(',') === '7,8',
    'the deck comes back as a Set of uids');
  check(b.deckChosen === true, 'a deck that was edited is remembered as edited');
}

/* ---------------------------------------------------------- the deck */
{
  /* A uid that is gone - two specimens dragged together - must not sit in
     the saved deck forever. */
  const { STORE } = newStore();
  const a = newState();
  a.deck = new Set([7, 8, 99]);
  STORE.flush(a);

  const b = empty();
  STORE.load(b);
  check(!b.deck.has(99), 'a uid that no longer exists is not saved');
  check(b.deck.has(7) && b.deck.has(8), 'the uids that remain are kept');
}
{
  /* A lawn saved before the deck editor existed plays with everything. */
  const old = newStore({ [KEY]: JSON.stringify({
    v:1, coins:100, level:2, found:['fox'], variants:{}, props:[],
    nextPropUid:1, nextUid:3,
    specimens:[ { uid:1, species:'fox', level:1, variant:null, x:0, z:0 },
                { uid:2, species:'fox', level:1, variant:null, x:1, z:1 } ],
  })});
  const s = empty();
  old.STORE.load(s);
  check([...s.deck].sort().join(',') === '1,2',
    'a lawn saved before the deck editor gets everything it owns in the deck');
  check(s.deckChosen === false, 'and counts as untouched');
}

/* ---------------------------------------------------------- uid counters */
{
  const { STORE } = newStore();
  const a = newState();
  a.nextUid = 2;           // an older save whose counter fell behind
  a.nextPropUid = 1;
  STORE.flush(a);

  const b = empty();
  STORE.load(b);
  check(b.nextUid === 9, 'nextUid clears every specimen on the lawn');
  check(b.nextPropUid === 5, 'nextPropUid clears every garden item on the lawn');
}

/* ---------------------------------------------------------- bad input */
{
  const nothing = newStore();
  check(nothing.STORE.load(empty()) === false, 'no save means no change');

  const broken = newStore({ [KEY]: '{not json' });
  const s1 = empty();
  check(broken.STORE.load(s1) === false, 'broken json is thrown away');
  check(s1.coins === 500, 'the lawn is untouched when the save is broken');

  const old = newStore({ [KEY]: JSON.stringify({ v:0, coins:9 }) });
  const s2 = empty();
  check(old.STORE.load(s2) === false, 'an unknown version is thrown away');
  check(s2.coins === 500, 'the lawn is untouched when the version is unknown');

  const junk = newStore({ [KEY]: JSON.stringify({
    v:1, coins:'lots', level:null, found:['fox', 7, null], variants:'no',
    props:[ {id:'pond', x:1, z:1}, null, {x:2}, 'bench' ],
    specimens:[ {species:'fox', x:0, z:0}, {level:3}, 42 ],
  }) });
  const s3 = empty();
  check(junk.STORE.load(s3) === true, 'a partly broken lawn is read as far as it goes');
  check(s3.coins === 500, 'coins that are not a number fall back to what the game had');
  check([...s3.found].join(',') === 'fox', 'only species ids that are text are kept');
  check(typeof s3.variants === 'object' && !Array.isArray(s3.variants),
    'variants that are not an object are replaced by an empty object');
  check(s3.props.length === 1, 'a garden item without an id is thrown away');
  check(s3.specimens.length === 1 && s3.specimens[0].level === 1,
    'a specimen without a species is thrown away, and a missing level becomes 1');
}

/* ---------------------------------------------------------- holding writes */
{
  const { STORE, localStorage } = newStore();
  const mine = newState();
  STORE.flush(mine);
  const before = localStorage.bag[KEY];

  STORE.hold(true);                      // a guest lawn is on screen
  const guest = empty();
  guest.coins = 1;
  STORE.save(guest);
  STORE.flush(guest);
  check(localStorage.bag[KEY] === before,
    'nothing is written while somebody else\'s lawn sits in STATE');

  STORE.hold(false);
  mine.coins = 999;
  STORE.flush(mine);
  const after = JSON.parse(localStorage.bag[KEY]);
  check(after.coins === 999, 'your own lawn is written again once the visit is over');
}

/* ---------------------------------------------------------- delayed write */
(async () => {
  const { STORE, localStorage } = newStore();
  const s = newState();
  STORE.save(s);
  check(localStorage.bag[KEY] === undefined, 'save does not write straight away');
  s.coins = 111;
  STORE.save(s);
  await new Promise(r => setTimeout(r, 700));
  const d = JSON.parse(localStorage.bag[KEY]);
  check(d.coins === 111, 'several calls in a row become one write with the last state');

  STORE.clear();
  check(localStorage.bag[KEY] === undefined, 'clear removes the save');

  console.log(failures ? '\n' + failures + ' failures' : '\nAll save checks passed');
  process.exit(failures ? 1 : 0);
})();
