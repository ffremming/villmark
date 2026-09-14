/* Runs two CARDGAME engines in separate VM contexts and lets them play against
   each other through a stubbed NET. That tests mirroring, the question flow,
   actions and hidden information without a browser. */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

let failures = 0;
const check = (ok, what) => { if(!ok){ failures++; console.log('FAIL: ' + what); } };

/* ---------------------------------------------------------- DOM stub */
function makeDom(){
  const el = new Map();
  const make = id => ({
    id, textContent:'', innerHTML:'', hidden:true, disabled:false,
    dataset:{}, listeners:{},
    classList:{ toggle(){}, add(){}, remove(){}, contains(){ return false; } },
    addEventListener(name, f){ (this.listeners[name] ||= []).push(f); },
    fire(name, e){ for(const f of (this.listeners[name]||[])) f(e); },
  });
  const find = sel => {
    const id = sel.replace('#','');
    if(!el.has(id)) el.set(id, make(id));
    return el.get(id);
  };
  return { find, body:make('body') };
}

/* ---------------------------------------------------------- one player */
function makeSide(name){
  const dom = makeDom();
  const sent = [];
  const S = { name, dom, sent, opponent:null, toasts:[] };

  const sandbox = {
    console,
    /* The animation pauses in the engine make a full battle unbearably slow
       here, so the sandbox gets a setTimeout with no delay. */
    setTimeout: (f, ms, ...a) => setTimeout(f, 0, ...a),
    clearTimeout, setInterval, clearInterval, queueMicrotask,
    Math, Date, JSON, Symbol, Promise, Array, Object, String, Number, Map, Set,
    document: {
      querySelector: dom.find,
      get body(){ return dom.body; },
    },
    NET: {
      LOCAL_MODE: true,
      send(m){ sent.push(m); if(S.opponent) S.opponent.deliver(JSON.parse(JSON.stringify(m))); },
      battleOut(){},
      get role(){ return 'test'; },
    },
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.VM = {
    STATE:{ coins:0 },
    SOUND:{ click(){}, near(){}, hit(){}, damage(){}, win(){}, lose(){} },
    vibrate(){}, toast(t){ S.toasts.push(t); }, updateHud(){},
    goTo(){}, makeThumb(){}, displayName(x){ return x; },
    /* This side's lawn. If it is empty the engine falls back to the plan
       deck, exactly as in a tab with no lawn. */
    deckCards: () => (S.deck || []).slice(),
  };

  const ctx = vm.createContext(sandbox);
  for(const f of ['species.js','cards.js','battle.js']) vm.runInContext(read(f), ctx, { filename:f });
  /* A top-level const lands in the context's lexical scope, not on the global
     object, so we have to fetch it with a run of its own. */
  const K = vm.runInContext('CARDGAME', ctx);
  S.ctx = ctx;
  S.CG = K.CG;
  S.game = K;
  S.deliver = m => K.receive(m);
  return S;
}

const ctxOf = S => S.ctx;

/* ---------------------------------------------------------- helpers */
const tick = () => new Promise(r => setTimeout(r, 0));
async function settle(n = 60){ for(let i=0;i<n;i++) await tick(); }

/* Answers an open dialog with the given button index. */
function answerDialog(S, i){
  const d = S.dom.find('#cgDialog');
  if(d.hidden) return false;
  S.dom.find('#cgDialogButtons').fire('click', {
    target:{ closest: sel => sel === '[data-dlg]' ? { dataset:{ dlg:String(i) } } : null },
  });
  return true;
}
function endTurn(S){
  S.dom.find('#cgEnd').fire('click', {});
}
/* Clicks a board element through data-path, the way the user would. */
function clickPath(S, p){
  S.dom.find('#screen-battle').fire('click', {
    target:{ closest: sel => sel === '[data-path]' ? { dataset:{ path:p } } : null },
  });
}
/* Points at the first legal target while the target picker is open. */
function answerTargetPick(S){
  const tp = S.CG.targetPick;
  if(!tp || !tp.legal.length) return false;
  const u = tp.legal[0];
  const i = u.spot === 'species' ? S.CG.p[u.side].species.indexOf(u) : 0;
  clickPath(S, ['u', u.side, u.spot, i].join(':'));
  return true;
}
function pressSheet(S, i){
  S.dom.find('#cgSheetButtons').fire('click', {
    target:{ closest: sel => sel === '[data-sheet]' ? { dataset:{ sheet:String(i) } } : null },
  });
}

/* ---------------------------------------------------------- setup */
(async () => {
  const host  = makeSide('host');
  const guest = makeSide('guest');
  host.opponent = guest; guest.opponent = host;

  host.CG.myLeader  = 'ld_bear';
  guest.CG.myLeader = 'ld_lynx';

  /* Two different lawns, both above the minimum, and both with a specimen
     dragged up a level. The host computes the whole battle, so the guest's
     deck has to reach it over the channel for the cards to match. */
  const repeat = (list, n) => Array.from({length:n}, (_, i) => list[i % list.length]);
  host.deck  = repeat(['fox', 'squirrel', 'spruce', 'bear@3', 'flyagaric'], 24);
  guest.deck = repeat(['hare', 'lynx@2', 'wolverine', 'hepatica'], 22);

  host.game.startHost('b1');
  guest.game.startGuest('b1');
  await settle();

  /* mulligan: both keep their hand */
  for(let i=0;i<6;i++){
    answerDialog(host, 0); answerDialog(guest, 0);
    await settle(10);
  }
  await settle();

  check(!!host.CG.p[0], 'the host never started the game');
  check(!!guest.CG.p[0], 'the guest never got any state');
  if(!host.CG.p[0] || !guest.CG.p[0]){ console.log('aborting'); process.exit(1); }

  /* ---- the decks ---- */
  /* Every card a player owns sits in the deck, the hand or the life cards. */
  const allCards = p => [...p.deck, ...p.hand, ...p.life].sort().join(',');
  check(allCards(host.CG.p[0]) === host.deck.slice().sort().join(','),
    'the host plays with its own lawn');
  check(allCards(host.CG.p[1]) === guest.deck.slice().sort().join(','),
    'the guest\'s lawn reached the host');
  check(host.sent.length >= 0 && guest.sent.some(m => m.t === 'ready' && Array.isArray(m.deck)),
    'the guest sends its deck with the ready message');
  check(host.CG.p[1].life.length === 4,
    'the guest\'s leader deals out its own life cards, got ' + host.CG.p[1].life.length);

  /* The level cards must be resolvable on both sides, without anything being
     sent about them. */
  const cardAt = (S, id) => vm.runInContext('CARDGAME', ctxOf(S)) && vm.runInContext(
    'cardById(' + JSON.stringify(id) + ')', ctxOf(S));
  check(cardAt(host, 'lynx@2') && cardAt(host, 'lynx@2').level === 2,
    'the host can build the guest\'s level card itself');
  check(cardAt(guest, 'bear@3').power >= cardAt(guest, 'bear').power,
    'a level card is never weaker than the same card at level 1');

  /* ---- mirroring ---- */
  check(guest.CG.p[0].leader.card.id === 'ld_lynx',
    'the guest\'s own leader must sit in slot 0, got ' + guest.CG.p[0].leader.card.id);
  check(guest.CG.p[1].leader.card.id === 'ld_bear',
    'the host\'s leader must sit in slot 1 on the guest, got ' + guest.CG.p[1].leader.card.id);
  check(host.CG.turn !== guest.CG.turn || host.CG.over,
    'the turn must be mirrored: host=' + host.CG.turn + ' guest=' + guest.CG.turn);

  /* ---- hidden information ---- */
  const hostHand = host.CG.p[0].hand;
  check(guest.CG.p[1].hand.every(x => x === '?'),
    'the guest must not see the host\'s cards, got ' + JSON.stringify(guest.CG.p[1].hand.slice(0,3)));
  check(guest.CG.p[1].hand.length === hostHand.length,
    'the guest must see the right number of cards on the host');
  check(guest.CG.p[0].hand.join() === host.CG.p[1].hand.join(),
    'the guest must see its own hand in the clear');
  const leak = host.sent
    .filter(m => m.t === 'state')
    .flatMap(m => hostHand.filter(id => JSON.stringify(m.d.p[1]).includes('"' + id + '"')));
  check(leak.length === 0, 'the host\'s hand leaks to the guest: ' + leak.join(','));
  check(typeof host.sent.find(m => m.t === 'state').d.p[1].hand === 'number',
    'the host\'s hand must be sent as a count, not as cards');

  /* ---- the guest plays a card on its turn ---- */
  /* find whose turn it is and let that side play the cheapest card it can */
  const onTurn = host.CG.turn === 0 ? host : guest;
  const before = { species: onTurn.CG.p[0].species.length, sun: onTurn.CG.p[0].sun.active };

  const hand = onTurn.CG.p[0].hand;
  let played = -1;
  for(let i=0;i<hand.length;i++){
    const k = onTurn.game.CG.p[0].hand[i];
    clickPath(onTurn, 'h:' + i);
    const sheetOpen = !onTurn.dom.find('#cgSheet').hidden;
    if(!sheetOpen) continue;
    pressSheet(onTurn, 0);               // PLAY
    await settle(20);
    answerTargetPick(onTurn); answerTargetPick(onTurn === host ? guest : host);
    await settle(20);
    if(onTurn.CG.p[0].species.length > before.species || onTurn.CG.p[0].sun.active < before.sun){ played = i; break; }
    void k;
  }
  const couldAfford = hand.some(id => {
    const k = vm.runInContext('CARD_BASE', ctxOf(onTurn))[id];
    if(!k || k.cost == null || k.cost > before.sun) return false;
    return k.kind !== 'event' || k.effect.when === 'main';
  });
  check(played >= 0 || !couldAfford,
    'could afford a card, but never got it played');

  const other = onTurn === host ? guest : host;
  await settle(20);
  check(other.CG.p[1].species.length === onTurn.CG.p[0].species.length,
    'the opponent does not see the same number of species: ' + other.CG.p[1].species.length
      + ' against ' + onTurn.CG.p[0].species.length);
  check(other.CG.p[1].sun.active === onTurn.CG.p[0].sun.active,
    'the sun accounting differs between the two');

  /* ---- the turn moves on ---- */
  const turnBefore = host.CG.turnNo;
  for(let round=0; round<6 && !host.CG.over; round++){
    const n = host.CG.turn === 0 ? host : guest;
    endTurn(n);
    await settle(30);
    for(let i=0;i<4;i++){
      answerDialog(host,0); answerDialog(guest,0);
      answerTargetPick(host); answerTargetPick(guest);
      await settle(8);
    }
  }
  check(host.CG.turnNo > turnBefore, 'the turn counter is stuck: ' + host.CG.turnNo
    + ' (over=' + host.CG.over + ' reason=' + host.CG.reason + ')');
  check(host.CG.turnNo === guest.CG.turnNo,
    'the turn counter differs: host=' + host.CG.turnNo + ' guest=' + guest.CG.turnNo);
  check(host.CG.p[0].life.length === guest.CG.p[1].life.length,
    'the life count differs between the two');

  /* ---- the guest cannot act outside its own turn ---- */
  const offTurn = host.CG.turn === 0 ? guest : host;
  const speciesBefore = offTurn.CG.p[0].species.length;
  await offTurn.game.receive({ t:'action', m:{ h:'play', i:0 } });
  await settle(10);
  check(offTurn.CG.p[0].species.length === speciesBefore,
    'an action outside your own turn was carried out');

  /* ---- play the battle out ---- */
  /* A simple strategy on both sides: play what you can afford, attack with
     everything that can attack, say no to blockers and counters, end the turn. */
  function sheetButton(S, label){
    const b = S.CG.sheetButtons || [];
    return b.findIndex(x => x.t.startsWith(label) && !x.off);
  }
  async function tidyUp(){
    for(let i=0;i<5;i++){
      let something = false;
      for(const S of [host, guest]){
        if(answerDialog(S, 0)) something = true;
        if(answerTargetPick(S)) something = true;
      }
      await settle(8);
      if(!something) break;
    }
  }
  async function playTurn(S){
    for(let round=0; round<12; round++){
      let playedOne = false;
      for(let i=0; i<S.CG.p[0].hand.length; i++){
        clickPath(S, 'h:' + i);
        if(S.dom.find('#cgSheet').hidden) continue;
        const j = sheetButton(S, 'PLAY');
        if(j < 0){ pressSheet(S, sheetButton(S, 'CLOSE')); continue; }
        pressSheet(S, j);
        await settle(15);
        await tidyUp();
        playedOne = true;
        break;
      }
      if(!playedOne) break;
    }

    const mine = [['u','0','leader','0'],
      ...S.CG.p[0].species.map((_, i) => ['u','0','species',String(i)])];
    for(const p of mine){
      if(S.CG.over || S.CG.turn !== 0) break;
      clickPath(S, p.join(':'));
      if(S.dom.find('#cgSheet').hidden) continue;
      const j = sheetButton(S, 'ATTACK');
      if(j < 0){ pressSheet(S, sheetButton(S, 'CLOSE')); continue; }
      pressSheet(S, j);
      await settle(15);
      answerTargetPick(S);
      await settle(25);
      await tidyUp();
    }
    if(!S.CG.over && S.CG.turn === 0) endTurn(S);
    await settle(30);
    await tidyUp();
  }

  let turns = 0;
  while(!host.CG.over && turns < 120){
    await playTurn(host.CG.turn === 0 ? host : guest);
    turns++;
  }

  check(host.CG.over, 'the battle never finished in ' + turns + ' turns');
  check(guest.CG.over, 'the guest never learned that the battle was over');
  check(host.CG.won !== guest.CG.won,
    'both sides think they won or lost: host=' + host.CG.won + ' guest=' + guest.CG.won);
  check(host.CG.reason === guest.CG.reason,
    'different reasons: "' + host.CG.reason + '" against "' + guest.CG.reason + '"');
  check(!host.dom.find('#cgResult').hidden && !guest.dom.find('#cgResult').hidden,
    'the result screen did not come up on both sides');

  const leak2 = host.sent
    .filter(m => m.t === 'state')
    .some(m => typeof m.d.p[1].hand !== 'number');
  check(!leak2, 'the host\'s hand was sent as cards somewhere during the battle');

  /* ---- one card on the lawn holds up against the machine ---- */
  {
    const solo = makeSide('solo');
    solo.CG.myLeader = 'ld_bear';
    solo.deck = ['fox'];
    solo.game.start();
    await settle();
    for(let i=0;i<4;i++){ answerDialog(solo, 0); await settle(10); }

    const p = solo.CG.p[0];
    const least = vm.runInContext('minDeckSize(cardById("ld_bear"))', ctxOf(solo));
    const all = p ? [...p.deck, ...p.hand, ...p.life] : [];
    check(!!p, 'the solo battle did not start with one card on the lawn');
    check(all.length === least,
      'the deck was not padded up to the minimum: ' + all.length + ' against ' + least);
    check(all.every(id => id === 'fox'),
      'the single card on the lawn was swapped out for the plan deck');
    check(!solo.CG.over, 'the solo battle was decided straight away');
  }

  console.log(failures ? '\n' + failures + ' failures' : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('CRASH:', e); process.exit(2); });
