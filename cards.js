/* VILLMARK - CARD GAME: card base, rule data and deck building

   The rules follow the One Piece Card Game. The names are carried over into
   villmark:
     SUN = DON!!        LIFE = Life         LEADER = Leader
     SPECIES = Character   EVENT = Event    BIOTOPE = Stage
     COMPOST = Trash    COUNTER = Counter   RUSH = Rush
     BLOCKER = Blocker  DOUBLE_ATTACK = Double Attack
     BANISH = Banish    TRIGGER = Trigger                           */

/* ---------------------------------------------------------- colors
   Every area is a color, the way OPTCG has six colors. A LEADER has two
   colors, and the deck may only hold cards in the LEADER's colors. */
const CARD_COLORS = {
  spruceforest:{ name:'FOREST',   hex:'#3f8a49', dark:'#16301c', light:'#68c274' },
  mountains:   { name:'MOUNTAIN', hex:'#7f8d99', dark:'#2a323a', light:'#b2bec8' },
  bog:         { name:'BOG',      hex:'#8f7c36', dark:'#332c12', light:'#c9b25a' },
  coast:       { name:'COAST',    hex:'#3d86c6', dark:'#122839', light:'#74b4e8' },
  plateau:     { name:'PLATEAU',  hex:'#c08a4a', dark:'#3a2814', light:'#e2b477' },
  fjord:       { name:'FJORD',    hex:'#2f9a9a', dark:'#0f3232', light:'#5fd0d0' },
};

/* ---------------------------------------------------------- keywords */
const KEYWORDS = {
  RUSH:          'Can attack the same turn it is played.',
  BLOCKER:       'Can rest to become the new target of the attack.',
  DOUBLE_ATTACK: 'Takes 2 life cards when it hits a LEADER.',
  BANISH:        'The life card goes to the compost instead of the hand.',
};
const KEYWORD_LABEL = {
  RUSH:'RUSH', BLOCKER:'BLOCKER', DOUBLE_ATTACK:'DOUBLE ATTACK', BANISH:'BANISH',
};

/* ---------------------------------------------------------- rule constants */
const RULES = {
  deck: 50,           // cards in the deck
  sunDeck: 8,         // cards in the SUN deck. 10 was more than anyone used up
  openingHand: 5,     // cards drawn at the start
  sunFirst: 1,        // SUN the first player gets on their first turn
  sunNormal: 2,       // SUN on every other turn
  maxSpecies: 5,      // slots in the species area
  maxCopies: 4,       // copies of the same card in one deck
  sunPower: 1000,     // power per SUN given to a card
};

/* ---------------------------------------------------------- derived numbers
   Stats come from the species data in species.js, so the card and the animal
   always tell the same story.

   The cost is rank-based, not absolute. The raw power of the species sits
   close together (1160 to 6080), so a direct conversion stuffed four of five
   species into cost 1 and 2: the SUN deck grew to 10 while nothing cost more
   than six. Now the species are sorted by raw power and spread over the curve,
   so the pool has expensive cards to spend SUN on all game. The order is the
   same as before, so the bear is still the most expensive and the wood anemone
   the cheapest. */
const COST_CURVE  = [[0.19,1], [0.38,2], [0.55,3], [0.70,4], [0.83,5], [0.93,6], [1.00,7]];
const POWER_CURVE = { 1:2000, 2:3000, 3:4000, 4:5000, 5:6000, 6:7000, 7:9000 };

const rawPower = (attack, hp) => attack*100 + hp*20;

const COST_RANK = (() => {
  const sorted = SPECIES.slice()
    .sort((a,b) => rawPower(a.attack, a.hp) - rawPower(b.attack, b.hp)
                || a.id.localeCompare(b.id));
  const m = {};
  sorted.forEach((sp, i) => {
    const share = (i + 1) / sorted.length;
    m[sp.id] = COST_CURVE.find(([limit]) => share <= limit)[1];
  });
  return m;
})();

/* A specimen at level 3 has no row in COST_RANK, so the scaled raw power is
   placed on the ladder of all raw powers instead. The ladder ends at cost 7:
   above that a higher level only gives the badge, not more power. */
const LEVEL_STEP = 0.15;          // +15 % on every stat per level
const POWER_LADDER = SPECIES.map(sp => rawPower(sp.attack, sp.hp))
                            .sort((a,b) => a - b);

function costFromPower(power){
  let below = 0;
  while(below < POWER_LADDER.length && POWER_LADDER[below] <= power) below++;
  const share = Math.max(below, 1) / POWER_LADDER.length;
  return COST_CURVE.find(([limit]) => share <= limit)[1];
}

function cardCost(sp, level){
  if(!(level > 1)) return COST_RANK[sp.id];
  const f = 1 + LEVEL_STEP*(level - 1);
  return costFromPower(rawPower(sp.attack*f, sp.hp*f));
}
function cardPower(sp, level){ return POWER_CURVE[cardCost(sp, level)]; }
function cardCounter(sp){
  if(sp.defense >= 22) return 2000;
  if(sp.defense >= 11) return 1000;
  return 0;
}
function cardAttribute(sp){
  if(sp.kind === 'plant') return sp.vox.type === 'mushroom' ? 'POISON' : 'ROOT';
  const t = sp.vox.type;
  if(t === 'bird') return 'BEAK';
  if(t === 'fish' || t === 'seal') return 'FIN';
  if(sp.vox.antlers) return 'HORN';
  return sp.attack >= 25 ? 'CLAWS' : 'FANG';
}

/* ---------------------------------------------------------- effects
   Only six effects exist, and all of them are implemented in the engine.
     does: ko | rest | power | selfPower | draw | sun
     when: on_play | on_attack | activate | main | counter | trigger */
const E = (when, does, o={}) => ({ when, does, value:o.value||0, max:o.max||0 });

function effectText(e){
  const duration = e.when === 'counter' ? 'this battle' : 'this turn';
  switch(e.does){
    case 'ko':        return `KO one of your opponent's SPECIES with cost ${e.max} or less.`;
    case 'rest':      return `Rest one of your opponent's SPECIES with cost ${e.max} or less.`;
    case 'power':     return `Give one of your LEADER or SPECIES +${e.value} power ${duration}.`;
    case 'selfPower': return `This card gets +${e.value} power ${duration}.`;
    case 'draw':      return `Draw ${e.value} cards.`;
    case 'sun':       return `Place ${e.value} SUN from the SUN deck, rested.`;
  }
  return '';
}
const WHEN_PREFIX = {
  on_play:   'ON PLAY',
  on_attack: 'WHEN IT ATTACKS',
  activate:  'ACTIVATE ⟳ once per turn',
  main:      'MAIN',
  counter:   'COUNTER',
  trigger:   'TRIGGER',
};
function effectFullText(e){
  return e ? WHEN_PREFIX[e.when] + ': ' + effectText(e) : '';
}

/* ---------------------------------------------------------- the SPECIES cards
   Keywords and effect per species. Cost, power and counter are derived.
   The max numbers follow the cost curve: 'ko' reaches about cost minus three,
   'rest' about cost minus one. With 13 species at cost 1 and 72 in total,
   max 2 covers a third of the pool and max 4 two thirds, so removal hits
   something but not everything. */
const SPECIES_CARDS = {
  /* SPRUCE FOREST */
  fox:         { keys:['RUSH'],          effect:E('on_play','rest',{max:4}),       trigger:E('trigger','power',{value:2000}) },
  squirrel:    { keys:['RUSH'],          effect:E('on_play','sun',{value:1}),      trigger:E('trigger','draw',{value:1}) },
  bear:        { keys:['DOUBLE_ATTACK'], effect:E('on_play','ko',{max:4}) },
  wolf:        { keys:['DOUBLE_ATTACK'], effect:E('on_attack','selfPower',{value:1000}) },
  spruce:      { keys:['BLOCKER'],       effect:E('activate','power',{value:1000}) },
  flyagaric:   { keys:[],                effect:E('on_play','rest',{max:3}),       trigger:E('trigger','rest',{max:3}) },
  chanterelle: { keys:[],                effect:E('on_play','draw',{value:1}),     trigger:E('trigger','draw',{value:1}) },
  /* MOUNTAINS */
  hare:        { keys:['RUSH'],          effect:null,                              trigger:E('trigger','draw',{value:1}) },
  lynx:        { keys:['DOUBLE_ATTACK'], effect:E('on_attack','selfPower',{value:1000}) },
  wolverine:   { keys:['BLOCKER'],       effect:E('on_play','ko',{max:3}) },
  hepatica:    { keys:[],                effect:E('on_play','power',{value:2000}), trigger:E('trigger','power',{value:3000}) },
  /* THE BOG */
  moose:       { keys:['BLOCKER'],       effect:E('on_attack','selfPower',{value:1000}) },
  lingonberry: { keys:[],                effect:E('on_play','draw',{value:1}),     trigger:E('trigger','draw',{value:1}) },
  cloudberry:  { keys:[],                effect:E('on_play','sun',{value:1}),      trigger:E('trigger','sun',{value:1}) },
  birch:       { keys:['BLOCKER'],       effect:null,                              trigger:E('trigger','power',{value:2000}) },
  /* THE COAST */
  eagleowl:    { keys:['BANISH'],        effect:E('on_play','rest',{max:5}) },
  seaeagle:    { keys:['RUSH'],          effect:E('on_attack','selfPower',{value:1000}) },
  pine:        { keys:['BLOCKER'],       effect:E('activate','power',{value:1000}) },
  /* THE PLATEAU */
  reindeer:    { keys:['BLOCKER'],       effect:E('on_play','power',{value:2000}) },
  ptarmigan:   { keys:['RUSH'],          effect:E('on_play','draw',{value:1}),     trigger:E('trigger','draw',{value:1}) },
  arcticfox:   { keys:['RUSH'],          effect:E('on_play','sun',{value:1}),      trigger:E('trigger','sun',{value:1}) },
  heather:     { keys:['BLOCKER'],       effect:null,                              trigger:E('trigger','power',{value:2000}) },
  /* THE FJORD */
  otter:       { keys:['RUSH'],          effect:E('on_play','draw',{value:1}) },
  cod:         { keys:[],                effect:E('on_play','sun',{value:1}),      trigger:E('trigger','sun',{value:1}) },
  harbourseal: { keys:['BLOCKER'],       effect:E('on_play','power',{value:1000}) },
  kelp:        { keys:['BLOCKER'],       effect:null,                              trigger:E('trigger','power',{value:2000}) },
};

/* The species without their own row above made up fifty of the seventy-two
   SPECIES cards, all of them without text and therefore interchangeable. They
   now get one keyword from their own numbers, so one card differs from another
   by more than power. One each, so the pool does not overflow with BLOCKER and
   DOUBLE_ATTACK. */
function deriveKeywords(sp){
  const neighbours = SPECIES.filter(x => x.area === sp.area);
  const avg = f => neighbours.reduce((s,x) => s + f(x), 0) / neighbours.length;
  const rel = f => f(sp) / (avg(f) || 1);
  const best = [
    ['DOUBLE_ATTACK', rel(x => x.attack)],
    ['RUSH',          rel(x => x.speed)],
    ['BLOCKER',       rel(x => x.defense)],
  ].sort((a,b) => b[1] - a[1])[0];
  return best[1] >= 1.2 ? [best[0]] : [];
}

/* ---------------------------------------------------------- the EVENT cards
   Every card is derived from the species' first move in species.js.
   Animal moves become COUNTER events. Plant moves become MAIN events.

   The cost of the plant events used to sit in the attack strength of the move,
   and all ten landed on 2. Now the price stands next to the effect, so a
   removal costs more than a power-up. */
const PLANT_EVENTS = {
  spruce:      { cost:3, effect:E('main','rest',{max:4}) },
  flyagaric:   { cost:4, effect:E('main','ko',{max:3}) },
  chanterelle: { cost:2, effect:E('main','draw',{value:2}) },
  hepatica:    { cost:1, effect:E('main','power',{value:3000}) },
  lingonberry: { cost:2, effect:E('main','draw',{value:2}) },
  cloudberry:  { cost:1, effect:E('main','sun',{value:1}) },
  birch:       { cost:2, effect:E('main','rest',{max:3}) },
  pine:        { cost:3, effect:E('main','ko',{max:2}) },
  heather:     { cost:2, effect:E('main','power',{value:4000}) },
  kelp:        { cost:3, effect:E('main','rest',{max:4}) },
};

/* ---------------------------------------------------------- the BIOTOPE cards
   The BIOTOPE works every turn it stands, so removal here is kept low. */
const BIOTOPE_CARDS = {
  spruceforest:{ name:'THE COPSE',       cost:3, effect:E('activate','power',{value:2000}) },
  mountains:   { name:'THE SCREE',       cost:2, effect:E('activate','rest',{max:2}) },
  bog:         { name:'THE PEAT BOG',    cost:1, effect:E('activate','power',{value:1000}) },
  coast:       { name:'THE CLIFF FACE',  cost:2, effect:E('activate','rest',{max:2}) },
  plateau:     { name:'THE HEATH',       cost:1, effect:E('activate','power',{value:1000}) },
  fjord:       { name:'THE KELP FOREST', cost:3, effect:E('activate','power',{value:2000}) },
};

/* ---------------------------------------------------------- the LEADER cards
   One LEADER per area. Two colors, so the deck has enough cards to choose
   from. Every color is used by exactly two leaders, and every effect is shared
   by two leaders.

   Life and effect must balance each other: the strongest effect belongs with
   the least life. It used to be the other way around - LYNX and REINDEER had
   both five life and a draw every turn, while BEAR and HARBOUR SEAL had four
   life and a SUN effect that did nothing, since the SUN deck reaches its cap
   by itself anyway. The best leader won four out of five games against the
   weakest. */
const LEADER_CARDS = [
  { id:'ld_lynx',        species:'lynx',        life:4, colors:['mountains','plateau'],     effect:E('activate','draw',{value:1}) },
  { id:'ld_reindeer',    species:'reindeer',    life:4, colors:['plateau','bog'],           effect:E('activate','draw',{value:1}) },
  { id:'ld_seaeagle',    species:'seaeagle',    life:5, colors:['coast','fjord'],           effect:E('on_attack','selfPower',{value:1000}) },
  { id:'ld_moose',       species:'moose',       life:5, colors:['bog','coast'],             effect:E('on_attack','selfPower',{value:1000}) },
  { id:'ld_bear',        species:'bear',        life:5, colors:['spruceforest','mountains'],effect:E('activate','power',{value:2000}) },
  { id:'ld_harbourseal', species:'harbourseal', life:5, colors:['fjord','spruceforest'],    effect:E('activate','power',{value:2000}) },
];

/* ---------------------------------------------------------- card building
   A SPECIES card carries the level of the specimen it came from. The level
   lives in the id - 'fox@3' - so the engine can still send plain id lists over
   the network, and the opponent looks up the same card without being sent
   anything. At level 1 it keeps the bare species id, so old ids work as before. */
function cardIdFor(speciesId, level){
  return level > 1 ? speciesId + '@' + level : speciesId;
}
function splitCardId(id){
  const i = id.indexOf('@');
  if(i < 0) return { speciesId:id, level:1 };
  const level = Number(id.slice(i + 1));
  return { speciesId: id.slice(0, i), level: level >= 1 ? level : 1 };
}

function typeLine(sp){
  return (sp.kind === 'animal' ? 'ANIMAL' : 'PLANT') + ' / ' + CARD_COLORS[sp.area].name;
}

/* A BLOCKER gives up the turn it comes down: it is meant to stop something,
   not to attack. In return it stands as a card two steps higher on the power
   curve. Without that, the defense-heavy colors lose on speed alone - THE BOG,
   which is eight plants and four animals, attacked ten times a game against
   THE COAST's fourteen, and the MOOSE won every fifth game. */
const BLOCKER_POWER = 2000;

function buildSpeciesCard(sp, level){
  const d = SPECIES_CARDS[sp.id] || { keys: deriveKeywords(sp), effect:null };
  const keys = d.keys || [];
  const n = level > 1 ? level : 1;
  return {
    id: cardIdFor(sp.id, n), kind:'species', speciesId: sp.id, level: n,
    name: sp.name, sci: sp.sci,
    colors: [sp.area],
    cost: cardCost(sp, n), counter: cardCounter(sp),
    power: cardPower(sp, n) + (keys.includes('BLOCKER') ? BLOCKER_POWER : 0),
    attribute: cardAttribute(sp), types: typeLine(sp),
    keys, effect: d.effect || null, trigger: d.trigger || null,
    rarity: sp.rarity, fact: sp.fact,
  };
}

function buildEventCard(sp){
  const t = sp.moves[0];
  const plant = sp.kind === 'plant';
  const p = plant && (PLANT_EVENTS[sp.id] || { cost:2, effect:E('main','draw',{value:1}) });
  const effect = plant ? p.effect
    : E('counter','power',{ value: t.s >= 30 ? 4000 : 3000 });
  return {
    id: 'ev_' + sp.id, kind:'event', speciesId: sp.id,
    name: t.n, sci: sp.sci,
    colors: [sp.area],
    cost: plant ? p.cost : (t.s >= 30 ? 2 : 1),
    power: null, counter: plant ? 0 : 1000,
    attribute: null, types: 'EVENT / ' + CARD_COLORS[sp.area].name,
    keys: [], effect, trigger: plant ? null : E('trigger','power',{value:3000}),
    rarity: sp.rarity, fact: sp.fact,
  };
}

function buildBiotopeCard(area){
  const b = BIOTOPE_CARDS[area.id];
  return {
    id: 'bt_' + area.id, kind:'biotope', speciesId: area.species[0],
    name: b.name, sci: area.name,
    colors: [area.id],
    cost: b.cost, power: null, counter: 0,
    attribute: null, types: 'BIOTOPE / ' + CARD_COLORS[area.id].name,
    keys: [], effect: b.effect, trigger: null,
    rarity: 2, fact: area.desc,
  };
}

function buildLeaderCard(l){
  const sp = SPECIES_BY_ID[l.species];
  return {
    id: l.id, kind:'leader', speciesId: l.species,
    name: sp.name, sci: sp.sci,
    colors: l.colors,
    cost: null, power: 5000, counter: 0, life: l.life,
    attribute: cardAttribute(sp),
    types: CARD_COLORS[l.colors[0]].name + ' / ' + CARD_COLORS[l.colors[1]].name,
    keys: [], effect: l.effect, trigger: null,
    rarity: sp.rarity, fact: sp.fact,
  };
}

/* the whole card base, looked up by id */
const CARD_BASE = (() => {
  const b = {};
  for(const sp of SPECIES){
    const a = buildSpeciesCard(sp); b[a.id] = a;
    const h = buildEventCard(sp);   b[h.id] = h;
  }
  for(const area of AREAS)      { const k = buildBiotopeCard(area); b[k.id] = k; }
  for(const l of LEADER_CARDS)  { const k = buildLeaderCard(l);     b[k.id] = k; }
  return b;
})();
const LEADERS = LEADER_CARDS.map(l => CARD_BASE[l.id]);

/* Lookup that also knows the level cards. CARD_BASE only holds level 1, so
   'fox@3' is built the first time someone asks for it and then stays. The
   engine uses this instead of CARD_BASE[id]. */
function cardById(id){
  const hit = CARD_BASE[id];
  if(hit) return hit;
  if(typeof id !== 'string' || id.indexOf('@') < 0) return undefined;
  const { speciesId, level } = splitCardId(id);
  const sp = SPECIES_BY_ID[speciesId];
  if(!sp) return undefined;
  const card = buildSpeciesCard(sp, level);
  CARD_BASE[card.id] = card;
  return card;
}

/* ---------------------------------------------------------- deck building
   50 cards, only in the LEADER's two colors, at most 4 copies of each card.

   The deck used to be picked as one copy of every card in the pool. That gave
   50 different cards: no two games looked alike, the four-copy rule never
   kicked in, and half the deck was counter events. Now a fixed plan is filled
   with real copies. The plan says how many cards the deck should hold of each
   category and each cost, so the curve holds no matter which two colors the
   leader has. */
const DECK_PLAN = {
  species: { 1:4, 2:7, 3:7, 4:7, 5:5, 6:4, 7:2 },   /* 36 */
  event:   { 1:4, 2:5, 3:3 },                       /* 12 */
};
const DECK_BIOTOPES = 2;   /* one of each color - only one can be out at a time */

function buildDeck(leader){
  const pool = Object.values(CARD_BASE)
    .filter(k => k.kind !== 'leader' && leader.colors.includes(k.colors[0]));
  /* cards with text first, then the rare ones: the deck should have something to do */
  const weight = k => (k.effect ? 2 : 0) + (k.trigger ? 1 : 0)
                    + (k.keys ? k.keys.length : 0) + k.rarity/10;

  const deck = [], copies = {};
  const add = (card, wanted) => {
    let added = 0;
    while(added < wanted && deck.length < RULES.deck
          && (copies[card.id] || 0) < RULES.maxCopies){
      copies[card.id] = (copies[card.id] || 0) + 1;
      deck.push(card.id);
      added++;
    }
    return added;
  };
  /* Fill one slot in the plan. If the colors lack cards at exactly that cost,
     the nearest cost in the same category is used, so the plan always adds up.
     A card that is too expensive counts as twice as far away as one that is
     too cheap: a hole filled upwards cannot be played on the curve, and then
     SUN sits unused. THE BOG and THE COAST have no species at cost 5, and when
     the MOOSE's hole was filled with cost 6 he only won every fourth game. */
  const gap = (k, cost) => k.cost > cost ? (k.cost - cost) * 2 : cost - k.cost;
  const fill = (kind, cost, count) => {
    const near = pool.filter(k => k.kind === kind).sort((a,b) =>
      gap(a, cost) - gap(b, cost)
      || weight(b) - weight(a) || a.id.localeCompare(b.id));
    let left = count;
    for(const k of near){
      if(left <= 0) break;
      left -= add(k, Math.min(RULES.maxCopies, left));
    }
  };
  /* one BIOTOPE of each color. More copies are wasted: only one can be out,
     and the other lands straight in the compost. */
  for(const k of pool.filter(k => k.kind === 'biotope')
                     .sort((a,b) => a.id.localeCompare(b.id))
                     .slice(0, DECK_BIOTOPES)) add(k, 1);

  for(const kind of ['species','event'])
    for(const cost of Object.keys(DECK_PLAN[kind]))
      fill(kind, Number(cost), DECK_PLAN[kind][cost]);

  /* If a color has too few cards to fill the plan, it is topped up with the
     best SPECIES cards left over. */
  const rest = pool.filter(k => k.kind === 'species')
    .sort((a,b) => weight(b) - weight(a) || a.cost - b.cost || a.id.localeCompare(b.id));
  while(deck.length < RULES.deck){
    const before = deck.length;
    for(const k of rest) add(k, 1);
    if(deck.length === before) break;              // everything is used up
  }
  return deck;
}

/* ---------------------------------------------------------- the player's deck
   The deck above is the machine's: a plan filled with cards from the whole
   card base. Your own deck is your lawn instead. Every specimen standing out
   there is one card, at its own level, and you choose which of them come along.

   Neither of the two rules from the plan deck therefore applies here: the color
   no longer limits anything, since the lawn has no areas, and the copy cap makes
   no sense when six foxes on the lawn are exactly six fox cards. BIOTOPE and
   EVENT belong to areas and moves, not to animals standing on a lawn, so they
   are out of the player's deck. */

const DECK_SLACK = 4;     // cards left in the deck after the opening hand and life

/** the smallest legal deck against this leader: hand + life + a few draws */
function minDeckSize(leaderCard){
  return RULES.openingHand + (leaderCard ? leaderCard.life : 5) + DECK_SLACK;
}

/** the specimens that may come along: the ones actually standing out on the lawn */
function deckableSpecimens(specimens){
  return (specimens || []).filter(e =>
    e && e.x !== null && e.z !== null && SPECIES_BY_ID[e.species]);
}

/** the card ids in the deck. chosen = Set of uids, null means everything out on the lawn */
function buildDeckFromLawn(specimens, chosen){
  return deckableSpecimens(specimens)
    .filter(e => !chosen || chosen.has(e.uid))
    .map(e => cardIdFor(e.species, e.level));
}

/* Cuts or extends a deck to exactly that many cards by going round and round
   inside it. Empty in gives empty out. */
function padDeck(source, count){
  if(!source || !source.length || count <= 0) return [];
  const deck = [];
  while(deck.length < count) deck.push(source[deck.length % source.length]);
  return deck;
}

/* The machine has no lawn. It gets its plan deck as before, but cut or extended
   to the same number of cards you bring, so neither of you runs out before the
   other. */
function buildAiDeck(leaderCard, count){
  return padDeck(buildDeck(leaderCard), count);
}
