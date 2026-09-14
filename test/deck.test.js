/* Runs species.js and cards.js in a vm context and checks the deck that the
   lawn builds: the level-carrying card ids, the cost ladder they climb, and
   which specimens are allowed to become cards at all. */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

let failures = 0;
const check = (ok, what) => { if(!ok){ failures++; console.log('FAIL: ' + what); } else console.log('ok  - ' + what); };

/* ---------------------------------------------------------- harness */
/* The consts in the two files live in the script's own scope, not on the
   context object, so the last expression is our handle on them. */
const ctx = vm.createContext({ console, Math, JSON, Set, Map, Array, Object, Number, isFinite });
const K = vm.runInContext(read('species.js') + '\n' + read('cards.js') + `
;({ SPECIES, SPECIES_BY_ID, CARD_BASE, LEADERS, RULES, COST_CURVE,
    cardById, cardIdFor, splitCardId, cardCost, cardPower,
    buildDeckFromLawn, deckableSpecimens, minDeckSize, buildAiDeck, buildDeck,
    padDeck });`, ctx);

const ex = (uid, species, level, x) =>
  ({ uid, species, level, variant:null, x: x === undefined ? 0 : x, z: x === undefined ? 0 : x });

/* ---------------------------------------------------------- card ids */
{
  check(K.cardIdFor('fox', 1) === 'fox', 'level 1 keeps the bare species id');
  check(K.cardIdFor('fox', 3) === 'fox@3', 'a higher level is appended to the id');

  const a = K.splitCardId('fox');
  const b = K.splitCardId('fox@4');
  check(a.speciesId === 'fox' && a.level === 1, 'a bare species id reads as level 1');
  check(b.speciesId === 'fox' && b.level === 4, 'the level is read back out');

  check(K.cardById('fox') === K.CARD_BASE.fox, 'level 1 comes straight from the card base');
  check(K.cardById('fox@3').speciesId === 'fox' && K.cardById('fox@3').level === 3,
    'a level card is built on the first lookup');
  check(K.cardById('fox@3') === K.cardById('fox@3'),
    'and stays, so two lookups give the same card');
  check(K.cardById('doesnotexist@2') === undefined, 'an unknown species gives no card');
  check(K.cardById('doesnotexist') === undefined, 'an unknown id gives no card');
}

/* ---------------------------------------------------------- the cost ladder */
{
  const sp = K.SPECIES_BY_ID.fox;
  const cost = n => K.cardCost(sp, n);
  check(cost(1) === K.CARD_BASE.fox.cost, 'level 1 costs what the card base says');

  let falls = false, previous = cost(1);
  for(let n = 2; n <= 12; n++){
    if(cost(n) < previous) falls = true;
    previous = cost(n);
  }
  check(!falls, 'the cost never falls as the level rises');

  const ceiling = K.COST_CURVE[K.COST_CURVE.length - 1][1];
  check(cost(40) === ceiling, 'the ladder stops at the most expensive cost');
  check(K.cardPower(sp, 40) > K.cardPower(sp, 1), 'a high level gives more power');
  check(K.cardPower(sp, 40) === K.cardPower(sp, 80),
    'above the ceiling the level gives no more power');

  /* A BLOCKER sits two notches above the power curve - that must hold for the
     level cards too, or an upgraded BLOCKER ends up weaker than a fresh one. */
  const blocker = K.SPECIES.find(s => K.CARD_BASE[s.id].keys.includes('BLOCKER'));
  check(K.cardById(K.cardIdFor(blocker.id, 3)).power
      > K.cardById(blocker.id).power, 'an upgraded BLOCKER keeps its bonus');
}

/* ---------------------------------------------------------- what may be a card */
{
  const lawn = [
    ex(1, 'fox',      1),
    ex(2, 'fox',      3),
    ex(3, 'squirrel', 1),
    ex(4, 'bear',     1, null),   // not placed yet
    { uid:5, species:'doesnotexist', level:1, variant:null, x:0, z:0 },
  ];

  const out = K.deckableSpecimens(lawn);
  check(out.length === 3, 'only specimens that are actually placed count');
  check(!out.some(e => e.uid === 4), 'a specimen waiting to be placed is left out');
  check(!out.some(e => e.uid === 5), 'a species that does not exist is thrown away');

  const all = K.buildDeckFromLawn(lawn, null);
  check(all.join(',') === 'fox,fox@3,squirrel',
    'with no selection everything placed becomes a card, each at its own level');

  const chosen = K.buildDeckFromLawn(lawn, new Set([1, 3]));
  check(chosen.join(',') === 'fox,squirrel', 'a deselected specimen does not become a card');
  check(K.buildDeckFromLawn(lawn, new Set()).length === 0, 'an empty selection gives an empty deck');
  check(K.buildDeckFromLawn([], null).length === 0, 'an empty lawn gives an empty deck');
  check(K.buildDeckFromLawn(undefined, null).length === 0, 'no lawn gives an empty deck');

  /* Two specimens of the same species at the same level are two identical
     cards: the copy limit from the plan deck does not apply here. */
  const sixFoxes = K.buildDeckFromLawn([1,2,3,4,5,6].map(u => ex(u, 'fox', 1)), null);
  check(sixFoxes.length === 6 && sixFoxes.every(id => id === 'fox'),
    'six foxes on the lawn are six fox cards, copy limit or not');

  /* Every card in the deck must be resolvable again */
  check(all.every(id => K.cardById(id)), 'every card in the deck exists in the card base');
}

/* ---------------------------------------------------------- deck size */
{
  for(const leader of K.LEADERS){
    const least = K.minDeckSize(leader);
    check(least > leader.life + K.RULES.openingHand,
      'the minimum deck against ' + leader.name + ' has cards left after hand and life');
  }
  const most = K.LEADERS.reduce((a,b) => a.life > b.life ? a : b);
  const fewest = K.LEADERS.reduce((a,b) => a.life < b.life ? a : b);
  check(K.minDeckSize(most) >= K.minDeckSize(fewest),
    'a leader with more life demands a bigger deck');
}

/* ---------------------------------------------------------- the machine */
{
  const leader = K.LEADERS[0];
  for(const n of [1, 14, 50, 137]){
    const ai = K.buildAiDeck(leader, n);
    check(ai.length === n, 'the machine brings ' + n + ' cards when you do');
    check(ai.every(id => K.cardById(id)), 'every card of the machine exists (' + n + ')');
  }
  check(K.buildAiDeck(leader, 137).length > K.buildDeck(leader).length,
    'the plan deck is extended when your lawn is bigger than it');
}

/* ---------------------------------------------------------- padding */
{
  check(K.padDeck(['fox'], 14).length === 14 &&
        K.padDeck(['fox'], 14).every(id => id === 'fox'),
    'one card goes round again until the deck is big enough');
  check(K.padDeck(['fox','hare'], 5).join(',') === 'fox,hare,fox,hare,fox',
    'several cards go round in the same order');
  check(K.padDeck(['fox','hare','spruce'], 2).join(',') === 'fox,hare',
    'a source that is too big is cut down');
  check(K.padDeck([], 14).length === 0, 'an empty source gives an empty deck');
  check(K.padDeck(['fox'], 0).length === 0, 'zero cards gives an empty deck');
}

console.log(failures ? '\n' + failures + ' deck checks failed' : '\nAll deck checks passed');
process.exit(failures ? 1 : 0);
