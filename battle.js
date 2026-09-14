/* VILLMARK - CARD GAME ENGINE
   Turn structure, battle and user surface. The rules follow the One Piece Card
   Game: refresh -> draw -> SUN -> main phase (play cards, give SUN, attack)
   -> end phase. An attack goes through the block step, the counter step and the
   damage step. The glossary sits at the top of cards.js. */

const CARDGAME = (() => {
'use strict';

const VM = () => window.VM;                       // bridge to app.js
const $  = s => document.querySelector(s);
const END_SIGNAL = Symbol('end');

/* ============================================================ state */
const CG = {
  p:[null,null],        // 0 = the player, 1 = the opponent
  turn:0, first:0, turnNo:1,
  battle:null,          // attack in progress
  over:false, won:false, reason:'',
  gen:0,                // bumped on restart, so old loops give up
  pending:[],           // unkept promises, broken when the game ends
  turnDone:null,        // resolved by END TURN
  myLeader:'ld_bear',
  selected:null,        // unit or hand card opened in the sheet
  targetPick:null,      // {legal, text}
  log:[],
  net:null,             // {role:'host'|'guest', battleId, name} - null in a solo battle
};

/* Every player is driven by one of three things. The solo battle uses
   'local' against 'ai'; the net battle uses 'local' against 'remote'. */
const isAi     = p => p.control === 'ai';
const isRemote = p => p.control === 'remote';
const isHost   = () => !!CG.net && CG.net.role === 'host';
const isGuest  = () => !!CG.net && CG.net.role === 'guest';

/* ============================================================ small things */
const rndi    = (a,b) => Math.floor(a + Math.random()*(b-a+1));
const pick    = a => a[rndi(0, a.length-1)];
const shuffle = a => { for(let i=a.length-1;i>0;i--){ const j=rndi(0,i); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const wait    = ms => new Promise(r => setTimeout(r, ms));
const power   = u => (u.card.power || 0) + u.sun*RULES.sunPower + u.buff + u.cbuff;

/* The log text is read by both sides, but "You" means different things to each
   of them. We therefore store who acted, and %s / %S are filled in on display. */
function addLog(t, side){
  const entry = { t, s:(side == null ? null : side) };
  CG.log.push(entry);
  if(CG.log.length > 40) CG.log.shift();
  const el = $('#cgLog');
  if(el){ el.textContent = logText(entry, 0); }
}
function logText(l, me){
  if(!l) return '';
  if(l.s == null) return l.t;
  const mine = l.s === me;
  return l.t.replace('%S', mine ? 'YOUR' : "THE OPPONENT'S")
            .replace('%s', mine ? 'You' : 'The opponent');
}

/* promises that must be breakable when the game is suddenly over */
function newPromise(){
  return new Promise((res, rej) => CG.pending.push({res, rej}));
}
/* Resolves the last promise waiting on this screen. Promises waiting for an
   answer from the opponent are marked 'remote' and are resolved by the net
   message instead. */
function resolvePromise(value){
  for(let i = CG.pending.length - 1; i >= 0; i--){
    if(CG.pending[i].remote) continue;
    const l = CG.pending.splice(i, 1)[0];
    l.res(value);
    return;
  }
}
function breakAllPromises(){
  const k = CG.pending.splice(0);
  remoteAnswers.clear();
  for(const l of k) l.rej(END_SIGNAL);
}

/* ============================================================ remote control */
/* The host owns the engine. When the engine needs a choice from the guest, the
   question is sent over the channel and the promise stands until the answer
   comes back. */
const remoteAnswers = new Map();   // question id -> promise
let nextQuestion = 1;

/* Everything going out passes through a queue, so the order holds and we do
   not blow the broadcast rate limit. Only the newest state matters, so two in
   a row are merged. */
const outQueue = [];
let outTimer = null;
const OUT_GAP = () => NET.LOCAL_MODE ? 0 : 120;

function netSend(m){
  if(!CG.net) return;
  const last = outQueue[outQueue.length - 1];
  if(m.t === 'state' && last && last.t === 'state') outQueue[outQueue.length - 1] = m;
  else outQueue.push(m);
  pushQueue();
}
function pushQueue(){
  if(outTimer || !outQueue.length || !CG.net) return;
  NET.send(outQueue.shift());
  outTimer = setTimeout(() => { outTimer = null; pushQueue(); }, OUT_GAP());
}
function clearQueue(){ outQueue.length = 0; clearTimeout(outTimer); outTimer = null; }

function remotePromise(id){
  return new Promise((res, rej) => {
    const l = { res, rej, remote:true, id };
    remoteAnswers.set(id, l);
    CG.pending.push(l);
  });
}
function resolveRemotePromise(id, value){
  const l = remoteAnswers.get(id);
  if(!l) return;
  remoteAnswers.delete(id);
  const i = CG.pending.indexOf(l);
  if(i >= 0) CG.pending.splice(i, 1);
  l.res(value);
}

/* The same question, no matter who is to answer it. */
function ask(side, text, cards, options){
  if(isRemote(CG.p[side])){
    const id = nextQuestion++;
    netSend({ t:'ask', id, text, cards:(cards||[]).map(k => k.id), options });
    return remotePromise(id);
  }
  return question(text, cards, options);
}

function endGame(won, reason){
  CG.over = true; CG.won = won; CG.reason = reason;
  breakAllPromises();
  if(CG.turnDone){ const f = CG.turnDone; CG.turnDone = null; f(); }
  throw END_SIGNAL;
}

/* runs a handler and swallows the end signal */
function safe(fn){
  return async (...a) => {
    try { await fn(...a); }
    catch(e){ if(e !== END_SIGNAL) throw e; }
  };
}

/* ============================================================ units */
function newUnit(card, side, spot){
  return { card, side, spot, rested:false, fresh:(spot === 'species'),
           sun:0, buff:0, cbuff:0, used:false };
}
function units(p){ return [p.leader, ...p.species]; }
function allUnits(){ return [...units(CG.p[0]), ...units(CG.p[1])]; }

function newPlayer(leaderCard, control, deck){
  const p = {
    control, deck: shuffle((deck || buildDeck(leaderCard)).slice()),
    hand:[], compost:[], life:[], species:[], biotope:null,
    sun:{ total:0, active:0, deck:RULES.sunDeck },
    leaderUsed:false,
  };
  p.leader = newUnit(leaderCard, 0, 'leader');
  return p;
}

/* ============================================================ deck
   Your deck comes from the lawn, not from the card base: see cards.js. If you
   have fewer cards out than the minimum deck, the same cards go round again
   until the deck is big enough, so one card on the lawn is enough for a battle
   against the machine. If the lawn is completely empty, the plan deck stands in
   as the fallback. */
function myDeck(leaderCard){
  const vm = window.VM;
  const own = vm && vm.deckCards ? vm.deckCards() : [];
  if(!own.length) return buildDeck(leaderCard);
  const least = minDeckSize(leaderCard);
  return own.length >= least ? own : padDeck(own, least);
}

/** a legal deck from the opponent, otherwise nothing */
function cleanDeck(list){
  if(!Array.isArray(list)) return null;
  const clean = list.filter(id => typeof id === 'string' && cardById(id));
  return clean.length ? clean : null;
}

/* ============================================================ card flow */
function draw(p, n=1){
  for(let i=0;i<n;i++){
    if(!p.deck.length) endGame(p !== CG.p[0], 'DECK RAN OUT');
    p.hand.push(p.deck.shift());
  }
}
function koSpecies(u){
  const p = CG.p[u.side];
  const i = p.species.indexOf(u);
  if(i < 0) return;
  p.species.splice(i, 1);
  p.compost.push(u.card.id);
  addLog(u.card.name + ' is knocked out.');
}
function addSun(p, n){
  const give = Math.min(n, p.sun.deck, RULES.sunDeck - p.sun.total);
  p.sun.deck -= give; p.sun.total += give;      // comes in rested
  return give;
}

/* ============================================================ effects */
async function runEffect(side, e, source){
  if(!e) return;
  const p = CG.p[side];
  switch(e.does){
    case 'draw':
      draw(p, e.value);
      addLog('Draws ' + e.value + ' cards.');
      break;
    case 'sun':
      addLog('+' + addSun(p, e.value) + ' SUN (rested).');
      break;
    case 'selfPower':
      if(e.when === 'counter') source.cbuff += e.value; else source.buff += e.value;
      addLog(source.card.name + ' gets +' + e.value + ' power.');
      break;
    case 'power': {
      const m = await pickTarget(side, u => u.side === side,
        'GIVE +' + e.value + ' POWER');
      if(m){
        if(e.when === 'counter') m.cbuff += e.value; else m.buff += e.value;
        addLog(m.card.name + ' gets +' + e.value + ' power.');
      }
      break; }
    case 'ko': {
      const m = await pickTarget(side,
        u => u.side !== side && u.spot === 'species' && u.card.cost <= e.max,
        'KNOCK OUT A SPECIES (COST ' + e.max + ' OR LESS)');
      if(m) koSpecies(m);
      break; }
    case 'rest': {
      const m = await pickTarget(side,
        u => u.side !== side && u.spot === 'species' && !u.rested && u.card.cost <= e.max,
        'REST A SPECIES (COST ' + e.max + ' OR LESS)');
      if(m){ m.rested = true; addLog(m.card.name + ' must rest.'); }
      break; }
  }
  render();
}

/* ============================================================ target picking */
async function pickTarget(side, filter, text){
  const legal = allUnits().filter(filter);
  if(!legal.length) return null;
  if(isAi(CG.p[side])) return aiPickTarget(side, legal, text);

  if(isRemote(CG.p[side])){
    const id = nextQuestion++;
    netSend({ t:'target', id, text, legal:legal.map(pathOf).filter(Boolean) });
    const path = await remotePromise(id);
    const chosen = path ? unitFromPath(mirrorPath(path)) : null;
    return legal.includes(chosen) ? chosen : null;
  }

  CG.targetPick = { legal, text };
  render();
  const choice = await newPromise();
  CG.targetPick = null;
  render();
  return choice;
}
function aiPickTarget(side, legal, text){
  const own = legal.filter(u => u.side === side);
  if(own.length) return own.sort((a,b) => power(b) - power(a))[0];
  return legal.sort((a,b) => (b.card.cost||0) - (a.card.cost||0))[0];
}

/* ============================================================ setup */
function newGame(myLeaderId, foeLeaderId, foeControl, foeDeck){
  CG.myLeader = myLeaderId;
  const myL  = cardById(myLeaderId);
  const foeL = cardById(foeLeaderId) || pick(LEADERS.filter(l => l.id !== myLeaderId));
  const mine = myDeck(myL);
  /* The machine has no lawn, so it gets as many cards as you bring. The
     opponent in a net battle sends their own. */
  const foe = cleanDeck(foeDeck) || buildAiDeck(foeL, mine.length);
  CG.p[0] = newPlayer(myL, 'local', mine);
  CG.p[1] = newPlayer(foeL, foeControl || 'ai', foe);
  CG.p[0].leader.side = 0;
  CG.p[1].leader.side = 1;
  for(let s=0;s<2;s++){
    const p = CG.p[s];
    for(let i=0;i<RULES.openingHand;i++)   p.hand.push(p.deck.shift());
    for(let i=0;i<p.leader.card.life;i++)  p.life.push(p.deck.shift());
  }
  CG.first = rndi(0,1);
  CG.turn = CG.first;
  CG.turnNo = 1;
  CG.over = false; CG.battle = null; CG.selected = null; CG.targetPick = null;
  CG.log = [];
}

/* the opening hand may be swapped once */
function newHand(p){
  p.deck.push(...p.hand.splice(0));
  shuffle(p.deck);
  for(let i=0;i<RULES.openingHand;i++) p.hand.push(p.deck.shift());
}
async function mulligan(){
  for(let s=0;s<2;s++){
    const p = CG.p[s];
    if(isAi(p)){
      if(p.hand.filter(id => cardById(id).cost <= 3).length < 2) newHand(p);
      continue;
    }
    const answer = await ask(s, 'SWAP THE OPENING HAND?',
      p.hand.map(id => cardById(id)), ['KEEP', 'SWAP']);
    if(answer === 1){ newHand(p); addLog('New opening hand.'); render(); }
  }
}

/* ============================================================ turn loop */
async function runGame(myLeaderId, foeLeaderId, foeControl, foeDeck){
  const g = ++CG.gen;
  try {
    newGame(myLeaderId, foeLeaderId, foeControl, foeDeck);
    render();
    await mulligan();
    if(CG.gen !== g) return;
    while(!CG.over){
      await playTurn();
      if(CG.gen !== g) return;
      CG.turn = 1 - CG.turn;
      if(CG.turn === CG.first) CG.turnNo++;
    }
  } catch(e){
    if(e !== END_SIGNAL) throw e;
  }
  if(CG.gen !== g) return;
  showResult();
}

async function playTurn(){
  const p = CG.p[CG.turn];
  const firstOwn = (CG.turnNo === 1 && CG.turn === CG.first);

  /* 1 refresh */
  for(const u of units(p)){ u.rested = false; u.fresh = false; u.sun = 0; }
  p.sun.active = p.sun.total;
  p.leaderUsed = false;
  if(p.biotope) p.biotope.used = false;

  /* 2 draw */
  if(!firstOwn) draw(p, 1);

  /* 3 SUN */
  const give = firstOwn ? RULES.sunFirst : RULES.sunNormal;
  const n = Math.min(give, p.sun.deck, RULES.sunDeck - p.sun.total);
  p.sun.deck -= n; p.sun.total += n; p.sun.active += n;

  addLog('%S TURN ' + CG.turnNo + ' — +' + n + ' SUN', CG.turn);
  render();

  /* 4 main phase. The remote player waits on the same promise as the local
     one: its actions come in over the channel and resolve it. */
  if(isAi(p)){ await wait(650); await aiTurn(CG.turn); }
  else await humanTurn();

  /* 5 end phase - power "this turn" falls away */
  for(const u of allUnits()){ u.buff = 0; u.cbuff = 0; }
  CG.selected = null;
  render();
}

function humanTurn(){
  return new Promise(res => { CG.turnDone = res; });
}

/* ============================================================ playing cards */
function canPlay(side, card){
  const p = CG.p[side];
  if(CG.turn !== side || CG.battle) return false;
  if(card.cost > p.sun.active) return false;
  if(card.kind === 'event' && card.effect.when !== 'main') return false;
  return true;
}

async function playCard(side, handIndex){
  const p = CG.p[side];
  const id = p.hand[handIndex];
  const card = cardById(id);
  if(!canPlay(side, card)) return;

  /* the species area holds five. For a sixth to come in, one of your own must go. */
  if(card.kind === 'species' && p.species.length >= RULES.maxSpecies){
    let victim;
    if(isAi(p)) victim = p.species.slice().sort((a,b) => a.card.cost - b.card.cost)[0];
    else {
      const answer = await ask(side, 'THE SPECIES AREA IS FULL — WHICH ONE GOES TO THE COMPOST?',
        p.species.map(a => a.card), ['CANCEL', ...p.species.map(a => a.card.name)]);
      if(answer === 0) return;
      victim = p.species[answer-1];
    }
    koSpecies(victim);
  }

  p.hand.splice(p.hand.indexOf(id), 1);
  p.sun.active -= card.cost;
  VM().SOUND.click(); VM().vibrate(12);

  if(card.kind === 'species'){
    const u = newUnit(card, side, 'species');
    p.species.push(u);
    addLog('%s plays ' + card.name + '.', side);
    render();
    if(card.effect && card.effect.when === 'on_play') await runEffect(side, card.effect, u);
  } else if(card.kind === 'biotope'){
    if(p.biotope) p.compost.push(p.biotope.card.id);
    p.biotope = newUnit(card, side, 'biotope');
    p.biotope.used = false;
    addLog('%s puts out ' + card.name + '.', side);
  } else {
    addLog('%s uses ' + card.name + '.', side);
    render();
    await runEffect(side, card.effect, p.leader);
    p.compost.push(id);
  }
  render();
}

/* give one SUN to a card: +1000 power for the rest of the turn */
function giveSun(side, u){
  const p = CG.p[side];
  if(CG.turn !== side || p.sun.active < 1) return;
  p.sun.active -= 1; u.sun += 1;
  VM().SOUND.near();
  addLog(u.card.name + ' gets 1 SUN (+' + RULES.sunPower + ' power).');
  render();
}

/* activated effects on LEADER and BIOTOPE, once per turn */
async function activate(side, u){
  const p = CG.p[side];
  const e = u.card.effect;
  if(!e || e.when !== 'activate' || CG.turn !== side) return;
  if(u.spot === 'leader'){ if(p.leaderUsed) return; p.leaderUsed = true; }
  else { if(u.used) return; u.used = true; }
  addLog(u.card.name + ': ' + effectText(e));
  await runEffect(side, e, u);
}

/* ============================================================ attack */
function canAttack(u){
  if(CG.over || CG.battle) return false;
  if(CG.turn !== u.side || u.rested) return false;
  if(u.spot === 'biotope') return false;
  if(u.spot === 'species' && u.fresh && !u.card.keys.includes('RUSH')) return false;
  return true;
}
function legalTargets(foeSide){
  const fp = CG.p[foeSide];
  return [fp.leader, ...fp.species.filter(a => a.rested)];
}

async function attack(att, target){
  const attS = att.side, defS = 1 - attS;
  att.rested = true;
  CG.battle = { att, target, attS, defS };
  addLog(att.card.name + ' attacks ' + target.card.name + '!');
  VM().SOUND.hit(); VM().vibrate(20);
  render();
  await wait(420);

  /* when-it-attacks effects */
  const e = att.card.effect;
  if(e && e.when === 'on_attack') await runEffect(attS, e, att);

  /* block step */
  await blockStep();
  /* counter step */
  await counterStep();
  /* damage step */
  await damageStep();

  for(const u of allUnits()) u.cbuff = 0;
  CG.battle = null;
  render();
}

async function blockStep(){
  const k = CG.battle;
  const fp = CG.p[k.defS];
  const blockers = fp.species.filter(a =>
    a.card.keys.includes('BLOCKER') && !a.rested && a !== k.target);
  if(!blockers.length) return;

  /* The attack stops anyway - then there is nothing to decide. */
  if(power(k.att) < power(k.target)) return;

  let chosen = null;
  if(isAi(fp)) chosen = aiPickBlocker(blockers);
  else {
    const answer = await ask(k.defS, 'USE A BLOCKER?', blockers.map(v => v.card),
      ['LET IT THROUGH', ...blockers.map(v => v.card.name)]);
    if(answer > 0) chosen = blockers[answer-1];
  }
  if(chosen){
    chosen.rested = true;
    k.target = chosen;
    addLog(chosen.card.name + ' uses BLOCKER and takes the attack.');
    render();
    await wait(420);
  }
}

async function counterStep(){
  const k = CG.battle;
  const fp = CG.p[k.defS];
  if(isAi(fp)){ aiCounter(); return; }

  while(true){
    const cards = fp.hand.map((id,i) => ({ card:cardById(id), i }))
      .filter(o => o.card.counter > 0 ||
        (isCounterEvent(o.card) && o.card.cost <= fp.sun.active));
    if(!cards.length) return;

    /* Nearly every card in the deck has a COUNTER value, so the question came
       up on every single attack - about nine times a game, most often with
       "LET IT THROUGH" as the only sensible answer. Here it is skipped when
       the answer cannot change anything: either the target already holds, or
       everything in hand still falls short. */
    const now = power(k.target), incoming = power(k.att);
    if(now > incoming) return;
    const ceiling = cards.reduce((s,o) => s + Math.max(o.card.counter,
      isCounterEvent(o.card) && o.card.cost <= fp.sun.active ? o.card.effect.value : 0), 0);
    if(now + ceiling < incoming) return;

    const labels = cards.map(o => o.card.kind === 'event' && o.card.effect.when === 'counter'
      ? o.card.name + ' (EVENT)' : o.card.name + ' +' + o.card.counter);
    const answer = await ask(k.defS,
      'COUNTER — ' + power(k.att) + ' AGAINST ' + power(k.target),
      cards.map(o => o.card), ['LET IT THROUGH', ...labels]);
    if(answer === 0) return;
    const chosen = cards[answer-1];
    fp.hand.splice(chosen.i, 1);
    if(chosen.card.kind === 'event' && chosen.card.effect.when === 'counter'){
      fp.sun.active -= chosen.card.cost;
      fp.compost.push(chosen.card.id);
      await runEffect(k.defS, chosen.card.effect, k.target);
    } else {
      k.target.cbuff += chosen.card.counter;
      fp.compost.push(chosen.card.id);
      addLog(chosen.card.name + ' as a counter: +' + chosen.card.counter + ' power.');
    }
    render();
  }
}

async function damageStep(){
  const k = CG.battle;
  const a = power(k.att), d = power(k.target);
  if(a < d){
    addLog(k.target.card.name + ' holds (' + d + ' against ' + a + ').');
    VM().SOUND.click();
    await wait(600);
    return;
  }
  if(k.target.spot === 'species'){
    koSpecies(k.target);
    VM().SOUND.damage(); VM().vibrate(35);
  } else {
    const double = k.att.card.keys.includes('DOUBLE_ATTACK');
    const banish = k.att.card.keys.includes('BANISH');
    await hitLeader(k.defS, double ? 2 : 1, banish);
  }
  render();
  await wait(600);
}

/* The TRIGGER question also came up when the answer could not change anything:
   no legal targets, an empty SUN deck or an empty card deck. Then the life card
   goes straight to the hand without stopping the game. */
function triggerUseful(side, e){
  const p = CG.p[side], fp = CG.p[1-side];
  switch(e.does){
    case 'sun':  return p.sun.deck > 0 && p.sun.total < RULES.sunDeck;
    case 'draw': return p.deck.length > 0;
    case 'ko':   return fp.species.some(a => a.card.cost <= e.max);
    case 'rest': return fp.species.some(a => !a.rested && a.card.cost <= e.max);
    default:     return true;
  }
}

async function hitLeader(side, count, banish){
  const p = CG.p[side];
  for(let i=0;i<count;i++){
    if(!p.life.length) endGame(side === 1, 'OUT OF LIFE');
    const id = p.life.pop();
    const card = cardById(id);
    VM().SOUND.damage(); VM().vibrate(60);
    if(banish){
      p.compost.push(id);
      addLog('BANISH — the life card goes straight to the compost.');
      continue;
    }
    if(card.trigger && triggerUseful(side, card.trigger)){
      const use = isAi(p) ? true
        : (await ask(side, 'TRIGGER: ' + card.name, [card], ['LEAVE IT','USE TRIGGER'])) === 1;
      if(use){
        p.compost.push(id);
        addLog('TRIGGER: ' + effectText(card.trigger));
        await runEffect(side, card.trigger, p.leader);
        continue;
      }
    }
    p.hand.push(id);
    addLog('%s takes 1 damage — the life card goes to the hand.', side);
    render();
  }
  if(!p.life.length) addLog('%s has no life left!', side);
}

/* ============================================================ machine player */
async function aiTurn(side){
  const p = CG.p[side], fp = CG.p[1-side];

  /* play cards, the most expensive first */
  let played = true;
  while(played){
    played = false;
    const choices = p.hand
      .map((id,i) => ({ k:cardById(id), i }))
      .filter(o => canPlay(side, o.k) && aiWantsToPlay(side, o.k))
      .sort((a,b) => b.k.cost - a.k.cost);
    if(choices.length){ await playCard(side, choices[0].i); await wait(330); played = true; }
  }

  /* activated effect */
  if(p.leader.card.effect && p.leader.card.effect.when === 'activate'){
    await activate(side, p.leader); await wait(260);
  }
  if(p.biotope && p.biotope.card.effect.when === 'activate'){
    await activate(side, p.biotope); await wait(260);
  }

  /* attacks */
  for(const a of units(p).slice()){
    if(CG.over) return;
    if(!canAttack(a)) continue;
    const target = aiPickAttackTarget(a, fp);
    if(!target) continue;
    /* give SUN if it decides the attack */
    while(p.sun.active > 0 && power(a) < power(target.u)) giveSun(side, a);
    if(power(a) < power(target.u) && target.u.spot === 'species') continue;
    await attack(a, target.u);
    await wait(400);
  }
  await wait(350);
}

function aiWantsToPlay(side, k){
  const p = CG.p[side], fp = CG.p[1-side];
  if(k.kind === 'species'){
    if(p.species.length < RULES.maxSpecies) return true;
    /* only swaps out a weaker species */
    return k.power > Math.min(...p.species.map(a => a.card.power));
  }
  if(k.kind === 'biotope') return !p.biotope;
  if(k.effect.does === 'ko' || k.effect.does === 'rest')
    return fp.species.some(a => a.card.cost <= k.effect.max && (k.effect.does === 'ko' || !a.rested));
  if(k.effect.does === 'power') return false;   // saved for a battle
  return true;
}

function aiPickAttackTarget(a, fp){
  const k = power(a);
  const species = fp.species.filter(x => x.rested && power(x) <= k)
    .sort((x,y) => y.card.cost - x.card.cost);
  if(species.length && species[0].card.cost >= 4) return { u:species[0] };
  if(k >= power(fp.leader)) return { u:fp.leader };
  if(species.length) return { u:species[0] };
  return null;
}

/* The machine only blocked when the blocker survived the attack. Since a LEADER
   has 5000 power and most BLOCKER cards sit below that, about one blocker was
   used per game, and the keyword was in practice an empty shell: a deck full of
   BLOCKER won every fifth game. Now a cheap blocker is sacrificed to save a life
   card, the way a human would. */
function aiPickBlocker(blockers){
  const k = CG.battle;
  const fp = CG.p[k.defS];
  const safeOnes = blockers.filter(v => power(v) > power(k.att));
  if(safeOnes.length) return safeOnes.sort((a,b) => power(a)-power(b))[0];
  if(k.target.spot !== 'leader') return null;
  const cheapest = blockers.slice().sort((a,b) => a.card.cost - b.card.cost)[0];
  const double = k.att.card.keys.includes('DOUBLE_ATTACK');
  if(fp.life.length <= 2 || double || cheapest.card.cost <= 3) return cheapest;
  return null;
}

const isCounterEvent = card =>
  card.kind === 'event' && card.effect && card.effect.when === 'counter';

/* The machine only counted the COUNTER value and left the COUNTER events alone,
   even though the human could play them. Now both count, and the strongest is
   taken first. The event lands straight on the attacked card: that is always
   what it is meant to save. */
function aiCounter(){
  const k = CG.battle, fp = CG.p[k.defS];
  const important = k.target.spot === 'leader'
    ? fp.life.length <= 2
    : k.target.card.cost >= 4;
  if(!important) return;

  while(power(k.target) <= power(k.att)){
    const choice = fp.hand.map(id => cardById(id))
      .map(card => ({ card, playable: isCounterEvent(card) && card.cost <= fp.sun.active
                                      && card.effect.value > card.counter }))
      .map(o => ({ ...o, gives: o.playable ? o.card.effect.value : o.card.counter }))
      .filter(o => o.gives > 0)
      .sort((a,b) => b.gives - a.gives)[0];
    if(!choice) break;
    fp.hand.splice(fp.hand.indexOf(choice.card.id), 1);
    fp.compost.push(choice.card.id);
    if(choice.playable) fp.sun.active -= choice.card.cost;
    k.target.cbuff += choice.gives;
    addLog('The opponent uses ' + choice.card.name + ' as a counter (+' + choice.gives + ').');
  }
  render();
}

/* ============================================================ card graphics
   The model images are large data URLs. They are therefore put in their own
   stylesheet, one rule per species, so the board can be redrawn without
   dragging several hundred kilobytes of HTML along every time. */
let artSheet = null;
const artDone = new Set();
function art(card){
  const id = card.speciesId, cls = 'art-' + id;
  if(artDone.has(id)) return cls;
  try {
    if(!artSheet){
      const s = document.createElement('style');
      document.head.appendChild(s);
      artSheet = s.sheet;
    }
    artSheet.insertRule(`.${cls}{background-image:url(${VM().makeThumb(id, null)})}`,
      artSheet.cssRules.length);
    artDone.add(id);
  } catch(e){ return ''; }
  return cls;
}
function colorStyle(card){
  const f = CARD_COLORS[card.colors[0]];
  const f2 = CARD_COLORS[card.colors[1] || card.colors[0]];
  return `--f:${f.hex};--fm:${f.dark};--fl:${f.light};--f2:${f2.hex}`;
}
function kindLabel(card){
  return { leader:'LEADER', species:'SPECIES', event:'EVENT', biotope:'BIOTOPE' }[card.kind];
}

/* big card for the sheet */
function bigCardHTML(card){
  const keys = card.keys.map(n => `<span class="cg-key">${KEYWORD_LABEL[n]}</span>`).join('');
  const lines = [];
  if(card.effect)  lines.push(effectFullText(card.effect));
  if(card.trigger) lines.push(effectFullText(card.trigger));
  return `<article class="cg cg-${card.kind}" style="${colorStyle(card)}">
    <div class="cg-head">
      <span class="cg-cost">${card.kind === 'leader' ? card.life : card.cost}</span>
      <span class="cg-cost-label">${card.kind === 'leader' ? 'LIFE' : 'COST'}</span>
      <span class="cg-name">${card.name}</span>
      ${card.attribute ? `<span class="cg-attr">${card.attribute}</span>` : ''}
    </div>
    <div class="cg-art ${art(card)}">
      ${card.counter ? `<span class="cg-counter"><i>CTR</i>${card.counter}</span>` : ''}
      <span class="cg-kind">${kindLabel(card)}</span>
    </div>
    <div class="cg-types">${card.types}</div>
    <div class="cg-text">${keys}${lines.map(l => `<p>${l}</p>`).join('')}
      <p class="cg-sci">${card.sci}</p></div>
    <div class="cg-bottom">
      ${card.power != null ? `<span class="cg-power">${card.power}</span>` : '<span></span>'}
      <span class="cg-color">${card.colors.map(f => CARD_COLORS[f].name).join(' / ')}</span>
    </div>
  </article>`;
}

/* small card for the board and the hand */
function miniCardHTML(card, o={}){
  const cls = ['mc', 'mc-' + card.kind];
  if(o.rested)   cls.push('rested');
  if(o.fresh)    cls.push('fresh');
  if(o.target)   cls.push('target');
  if(o.selected) cls.push('selected');
  if(o.hand)     cls.push('mc-hand');
  if(o.dim)      cls.push('dim');
  const pw = o.power != null ? o.power : card.power;
  const sun = o.sun ? `<span class="mc-sun">${'●'.repeat(Math.min(5,o.sun))}</span>` : '';
  return `<div class="${cls.join(' ')}" style="${colorStyle(card)}" ${o.data||''}>
    <span class="mc-cost">${card.kind === 'leader' ? card.life : card.cost}</span>
    <span class="mc-art ${art(card)}"></span>
    <span class="mc-name">${card.name}</span>
    ${pw != null ? `<span class="mc-power">${pw}</span>` : ''}
    ${card.keys.length ? `<span class="mc-key">${KEYWORD_LABEL[card.keys[0]][0]}</span>` : ''}
    ${sun}
  </div>`;
}

/* ============================================================ rendering */
function isTarget(u){ return !!(CG.targetPick && CG.targetPick.legal.includes(u)); }

function unitHTML(u, path){
  return miniCardHTML(u.card, {
    rested:u.rested, fresh:u.fresh, sun:u.sun, power:power(u),
    target:isTarget(u), selected:CG.selected === u,
    data:`data-path="${path}"`,
  });
}

function sunRowHTML(p){
  let s = '';
  for(let i=0;i<p.sun.total;i++) s += `<i class="${i < p.sun.active ? '' : 'used'}"></i>`;
  return `<span class="cg-suncount">${p.sun.active}/${p.sun.total}</span>${s}`;
}
function lifeRowHTML(p){
  return '<i></i>'.repeat(p.life.length) || '<span class="cg-empty">NO LIFE</span>';
}

function render(){
  if(!CG.p[0]) return;
  const me = CG.p[0], foe = CG.p[1];

  $('#foeLife').innerHTML = lifeRowHTML(foe);
  $('#myLife').innerHTML  = lifeRowHTML(me);
  $('#foeSun').innerHTML  = sunRowHTML(foe);
  $('#mySun').innerHTML   = sunRowHTML(me);

  $('#foeCount').textContent = `DECK ${foe.deck.length} · HAND ${foe.hand.length} · COMPOST ${foe.compost.length}`;
  $('#myCount').textContent  = `DECK ${me.deck.length} · HAND ${me.hand.length} · COMPOST ${me.compost.length}`;

  $('#foeLeader').innerHTML = unitHTML(foe.leader, 'u:1:leader:0');
  $('#myLeader').innerHTML  = unitHTML(me.leader,  'u:0:leader:0');

  $('#foeBiotope').innerHTML = foe.biotope ? unitHTML(foe.biotope, 'u:1:biotope:0') : '<div class="cg-slot">BIOTOPE</div>';
  $('#myBiotope').innerHTML  = me.biotope  ? unitHTML(me.biotope,  'u:0:biotope:0') : '<div class="cg-slot">BIOTOPE</div>';

  $('#foeSpecies').innerHTML = foe.species.map((a,i) => unitHTML(a, 'u:1:species:'+i)).join('')
    || '<div class="cg-slot wide">NO SPECIES</div>';
  $('#mySpecies').innerHTML  = me.species.map((a,i) => unitHTML(a, 'u:0:species:'+i)).join('')
    || '<div class="cg-slot wide">NO SPECIES</div>';

  $('#myHand').innerHTML = me.hand.map((id,i) => {
    const k = cardById(id);
    return miniCardHTML(k, { hand:true, dim:!canPlay(0,k), data:`data-path="h:${i}"` });
  }).join('');

  const mine = CG.turn === 0 && !CG.battle && !CG.targetPick;
  $('#cgEnd').disabled = !mine;
  $('#cgTurn').textContent = CG.over ? 'OVER'
    : (CG.turn === 0 ? 'YOUR TURN ' : 'OPPONENT ') + CG.turnNo;
  $('#cgBanner').hidden = !CG.targetPick;
  if(CG.targetPick) $('#cgBannerTxt').textContent = CG.targetPick.text;
  document.body.classList.toggle('cg-picking', !!CG.targetPick);

  /* The host is the truth: every time the board changes, the guest gets it. */
  if(isHost()) netSend({ t:'state', d:makeState(1) });
}

/* ============================================================ sheet and dialog */
function closeSheet(){ $('#cgSheet').hidden = true; CG.selected = null; render(); }

function openSheet(card, buttons){
  $('#cgSheetCard').innerHTML = bigCardHTML(card);
  $('#cgSheetButtons').innerHTML = buttons
    .map((b,i) => `<button class="btn ${b.pri ? 'btn-primary' : ''}" data-sheet="${i}"${b.off ? ' disabled' : ''}>${b.t}</button>`)
    .join('');
  $('#cgSheet').hidden = false;
  CG.sheetButtons = buttons;
}

/* simple question dialog with a card strip */
function question(text, cards, options){
  $('#cgDialogTxt').textContent = text;
  $('#cgDialogCards').innerHTML = (cards||[]).map(k => miniCardHTML(k, {})).join('');
  $('#cgDialogButtons').innerHTML = options
    .map((v,i) => `<button class="btn ${i ? 'btn-primary' : ''}" data-dlg="${i}">${v}</button>`).join('');
  $('#cgDialog').hidden = false;
  return newPromise().then(v => { $('#cgDialog').hidden = true; return v; });
}

function showResult(){
  resultShown = true;
  if(isHost()) netSend({ t:'state', d:makeState(1) });
  $('#cgResultTxt').textContent = CG.won ? 'VICTORY!' : 'DEFEAT';
  $('#cgResultTxt').classList.toggle('loss', !CG.won);
  $('#cgResultReason').textContent = CG.reason;
  $('#cgResult').hidden = false;
  CG.won ? VM().SOUND.win() : VM().SOUND.lose();
  VM().vibrate(CG.won ? [40,60,40] : 220);
  if(CG.won){ VM().STATE.coins += 80; VM().updateHud(); }
}

/* ============================================================ input */
function path(el){
  const d = el.closest('[data-path]');
  return d ? d.dataset.path.split(':') : null;
}
function unitFromPath(s){
  if(!s) return null;
  const p = CG.p[+s[1]];
  if(!p) return null;
  if(s[2] === 'leader')  return p.leader;
  if(s[2] === 'biotope') return p.biotope;
  return p.species[+s[3]] || null;
}
/* The other way: from unit to path. The path is the three-letter language we
   send over the network, and the same thing that sits in data-path on the board. */
function pathOf(u){
  if(!u) return null;
  if(u.spot === 'leader')  return ['u', String(u.side), 'leader', '0'];
  if(u.spot === 'biotope') return ['u', String(u.side), 'biotope', '0'];
  const i = CG.p[u.side].species.indexOf(u);
  return i < 0 ? null : ['u', String(u.side), 'species', String(i)];
}
/* Mirrors a path between the two perspectives. The operation is its own inverse.
   Paths on the network always stand in the sender's perspective; the receiver
   mirrors them. */
function mirrorPath(s){ return s ? ['u', s[1] === '0' ? '1' : '0', s[2], s[3]] : null; }

const boardClick = safe(async e => {
  const s = path(e.target);
  if(!s) return;

  /* target picking takes priority */
  if(CG.targetPick){
    if(s[0] !== 'u') return;
    const u = unitFromPath(s);
    if(!CG.targetPick.legal.includes(u)) return;
    VM().SOUND.click();
    resolvePromise(u);
    return;
  }
  if(CG.battle || CG.turn !== 0 || CG.over) return;

  if(s[0] === 'h'){
    const i = +s[1];
    const card = cardById(CG.p[0].hand[i]);
    openSheet(card, [
      { t:'PLAY · ' + card.cost + ' SUN', pri:true, off:!canPlay(0,card),
        run: async () => { closeSheet(); await action({ h:'play', i }); } },
      { t:'CLOSE', run: closeSheet },
    ]);
    return;
  }

  const u = unitFromPath(s);
  if(!u) return;
  CG.selected = u;

  /* own attack: pick the target afterwards */
  const buttons = [];
  if(u.side === 0 && canAttack(u)){
    buttons.push({ t:'ATTACK', pri:true, run: async () => {
      closeSheet();
      const target = await pickTarget(0, x => legalTargets(1).includes(x), 'PICK A TARGET FOR THE ATTACK');
      const to = pathOf(target);
      if(to) await action({ h:'attack', from:s, to });
    }});
  }
  if(u.side === 0 && u.spot !== 'biotope' && CG.p[0].sun.active > 0){
    buttons.push({ t:'GIVE SUN', run: async () => { closeSheet(); await action({ h:'sun', path:s }); } });
  }
  if(u.side === 0 && u.card.effect && u.card.effect.when === 'activate'){
    const used = u.spot === 'leader' ? CG.p[0].leaderUsed : u.used;
    buttons.push({ t:'ACTIVATE', off:used, run: async () => { closeSheet(); await action({ h:'activate', path:s }); } });
  }
  buttons.push({ t:'CLOSE', run: closeSheet });
  openSheet(u.card, buttons);
  render();
});

/* ============================================================ net battle */
/* The host owns the engine and is always side 0 in its own CG. The guest does
   not run the engine at all: it gets mirrored snapshots where it sits at
   position 0 itself, and can therefore use render() and boardClick unchanged. */

let resultShown = false;
let hostRunning = false;

/* -------- actions -------- */
/* The five things a player can actually do. The guest sends them over the
   channel instead of performing them; the host performs them for both. */
async function action(m){
  if(isGuest()){ netSend({ t:'action', m }); return; }
  await runAction(0, m);
}

async function runAction(side, m){
  if(CG.over || CG.turn !== side) return;
  switch(m.h){
    case 'play':
      await playCard(side, +m.i);
      break;
    case 'attack': {
      const a = unitFromPath(m.from), b = unitFromPath(m.to);
      if(!a || !b || a.side !== side) return;
      if(!canAttack(a) || !legalTargets(1 - side).includes(b)) return;
      await attack(a, b);
      break; }
    case 'sun': {
      const u = unitFromPath(m.path);
      if(u && u.side === side && u.spot !== 'biotope') giveSun(side, u);
      break; }
    case 'activate': {
      const u = unitFromPath(m.path);
      if(u && u.side === side) await activate(side, u);
      break; }
    case 'end': {
      if(CG.battle || CG.targetPick) return;
      const f = CG.turnDone; CG.turnDone = null;
      if(f) f();
      break; }
  }
}

function mirrorAction(m){
  const r = { ...m };
  if(r.from) r.from = mirrorPath(r.from);
  if(r.to)   r.to   = mirrorPath(r.to);
  if(r.path) r.path = mirrorPath(r.path);
  return r;
}

/* -------- snapshot -------- */
function viewUnit(u, me){
  if(!u) return null;
  return { k:u.card.id, side:(u.side === me ? 0 : 1), spot:u.spot,
           rested:u.rested, fresh:u.fresh, sun:u.sun, buff:u.buff, cbuff:u.cbuff, used:u.used };
}
/* open = the receiver's own side. The opponent's hand and deck are sent as
   counts, so the cards never leave the host. */
function viewPlayer(p, me, open){
  return {
    hand: open ? p.hand.slice() : p.hand.length,
    deck: p.deck.length, compost: p.compost.length, life: p.life.length,
    sun: { ...p.sun }, leaderUsed: p.leaderUsed,
    leader: viewUnit(p.leader, me),
    biotope: viewUnit(p.biotope, me),
    species: p.species.map(a => viewUnit(a, me)),
  };
}
function makeState(forSide){
  const lastLog = CG.log[CG.log.length - 1];
  return {
    p: [ viewPlayer(CG.p[forSide], forSide, true),
         viewPlayer(CG.p[1 - forSide], forSide, false) ],
    turn:  CG.turn  === forSide ? 0 : 1,
    first: CG.first === forSide ? 0 : 1,
    turnNo: CG.turnNo, over: CG.over, reason: CG.reason,
    won: forSide === 0 ? CG.won : !CG.won,
    battle: !!CG.battle,
    log: lastLog
      ? { t:lastLog.t, s:(lastLog.s == null ? null : (lastLog.s === forSide ? 0 : 1)) }
      : null,
  };
}

function readUnit(e){
  if(!e) return null;
  return { card:cardById(e.k), side:e.side, spot:e.spot, rested:e.rested, fresh:e.fresh,
           sun:e.sun, buff:e.buff, cbuff:e.cbuff, used:e.used };
}
/* Card backs we only count. Then lifeRowHTML and the deck count work unchanged. */
const fillBacks = n => new Array(n).fill('?');

function readPlayer(d, control){
  const p = {
    control,
    hand: Array.isArray(d.hand) ? d.hand.slice() : fillBacks(d.hand),
    deck: fillBacks(d.deck), compost: fillBacks(d.compost), life: fillBacks(d.life),
    sun: { ...d.sun }, leaderUsed: d.leaderUsed,
    species: d.species.map(readUnit),
    biotope: readUnit(d.biotope),
  };
  p.leader = readUnit(d.leader);
  return p;
}

function readState(d){
  clearInterval(readyPulse); readyPulse = null;
  CG.p[0] = readPlayer(d.p[0], 'local');
  CG.p[1] = readPlayer(d.p[1], 'remote');
  CG.turn = d.turn; CG.first = d.first; CG.turnNo = d.turnNo;
  CG.over = d.over; CG.won = d.won; CG.reason = d.reason;
  CG.battle = d.battle ? {} : null;
  CG.selected = null;
  /* The units are new objects now, so a target pick in progress must point anew. */
  if(CG.targetPick && CG.targetPick.paths){
    CG.targetPick.legal = CG.targetPick.paths.map(unitFromPath).filter(Boolean);
  }
  if(d.log){
    CG.log.push(d.log);
    if(CG.log.length > 40) CG.log.shift();
  }
  render();
  if(d.log){ const el = $('#cgLog'); if(el) el.textContent = logText(d.log, 0); }
  if(CG.over && !resultShown){ resultShown = true; showResult(); }
}

/* -------- the guest's answers to the host's questions -------- */
async function guestAsk(m){
  const cards = (m.cards || []).map(id => cardById(id)).filter(Boolean);
  let v;
  try { v = await question(m.text, cards, m.options); }
  catch(e){ return; }
  netSend({ t:'answer', id:m.id, value:v });
}

async function guestPickTarget(m){
  const legal = (m.legal || []).map(s => unitFromPath(mirrorPath(s))).filter(Boolean);
  if(!legal.length){ netSend({ t:'answer', id:m.id, value:null }); return; }
  const paths = legal.map(pathOf).filter(Boolean);
  CG.targetPick = { legal, text:m.text, paths };
  render();
  let u = null;
  try { u = await newPromise(); }
  catch(e){ return; }
  CG.targetPick = null;
  render();
  netSend({ t:'answer', id:m.id, value: u ? pathOf(u) : null });
}

/* -------- incoming messages -------- */
const receive = safe(async m => {
  if(!m || !CG.net) return;
  if(m.t === 'bye'){ abortNetBattle('THE OPPONENT LEFT THE BATTLE'); return; }

  if(isHost()){
    if(m.t === 'ready'){ hostStart(m.leader, m.deck); return; }
    if(m.t === 'action'){ await runAction(1, mirrorAction(m.m)); return; }
    if(m.t === 'answer'){ resolveRemotePromise(m.id, m.value); return; }
    return;
  }
  switch(m.t){
    case 'state':  readState(m.d); break;
    case 'ask':    await guestAsk(m); break;
    case 'target': await guestPickTarget(m); break;
  }
});

/* -------- start and end -------- */
function emptyBoard(text){
  for(const id of ['foeLife','myLife','foeSun','mySun','foeLeader','myLeader',
                   'foeBiotope','myBiotope','foeSpecies','mySpecies','myHand']){
    const el = $('#' + id); if(el) el.innerHTML = '';
  }
  $('#foeCount').textContent = ''; $('#myCount').textContent = '';
  $('#cgTurn').textContent = text;
  $('#cgLog').textContent = ' ';
  $('#cgEnd').disabled = true;
}

function startHost(battleId){
  CG.net = { role:'host', battleId };
  CG.p[0] = CG.p[1] = null;
  hostRunning = false;
  reset();
  emptyBoard('WAITING FOR THE OPPONENT');
}

/* The guest does not know when the host has subscribed to the channel, so it
   repeats the message until the first snapshot comes back. */
let readyPulse = null;
function startGuest(battleId){
  CG.net = { role:'guest', battleId };
  CG.p[0] = CG.p[1] = null;
  reset();
  emptyBoard('WAITING FOR THE OPPONENT');
  /* The host computes the whole battle, so it must know the guest's deck. It is
     sent with the ready message: the card ids carry the level, so the host can
     look up the same cards without being sent anything more. */
  const say = () => netSend({ t:'ready', leader:CG.myLeader, deck:myDeck(cardById(CG.myLeader)) });
  say();
  clearInterval(readyPulse);
  readyPulse = setInterval(() => { if(isGuest()) say(); else clearInterval(readyPulse); }, 1000);
}

/* The host waits until the guest reports in, so it knows which leader the
   opponent brings. */
function hostStart(foeLeader, foeDeck){
  if(hostRunning || !isHost()) return;
  hostRunning = true;
  resultShown = false;
  runGame(CG.myLeader, foeLeader, 'remote', foeDeck);
}

function abortNetBattle(reason){
  if(!CG.net) return;
  CG.net = null;
  clearInterval(readyPulse); readyPulse = null;
  CG.gen++;                       // old engine loops give up
  breakAllPromises();
  if(CG.turnDone){ const f = CG.turnDone; CG.turnDone = null; f(); }
  clearQueue();
  NET.battleOut();
  VM().toast(reason);
  VM().goTo('lobby');
}

/* Called when the player leaves the battle screen. */
function leave(){
  if(!CG.net) return;
  CG.net = null;
  clearInterval(readyPulse); readyPulse = null;
  CG.gen++;
  breakAllPromises();
  if(CG.turnDone){ const f = CG.turnDone; CG.turnDone = null; f(); }
  NET.send({ t:'bye' });
  clearQueue();
  NET.battleOut();
}

/* ============================================================ startup */
let wired = false;
function wire(){
  if(wired) return;
  wired = true;
  $('#screen-battle').addEventListener('click', boardClick);  // covers board and hand

  $('#cgSheetButtons').addEventListener('click', safe(async e => {
    const b = e.target.closest('[data-sheet]');
    if(!b) return;
    await CG.sheetButtons[+b.dataset.sheet].run();
  }));
  $('#cgSheetBack').addEventListener('click', closeSheet);

  $('#cgDialogButtons').addEventListener('click', e => {
    const b = e.target.closest('[data-dlg]');
    if(b) resolvePromise(+b.dataset.dlg);
  });

  $('#cgEnd').addEventListener('click', safe(async () => {
    if(CG.turn !== 0 || CG.battle || CG.targetPick || CG.over) return;
    VM().SOUND.click();
    await action({ h:'end' });
  }));

  $('#cgCancel').addEventListener('click', () => {
    if(CG.targetPick) resolvePromise(null);
  });

  /* Swapping leader belongs to the solo battle. In a net battle the leader is
     chosen in the lobby. */
  $('#cgSwap').addEventListener('click', () => {
    if(CG.net){ VM().toast('THE LEADER IS CHOSEN IN THE LOBBY'); return; }
    const i = LEADERS.findIndex(l => l.id === CG.myLeader);
    CG.myLeader = LEADERS[(i+1) % LEADERS.length].id;
    start();
  });

  $('#cgAgain').addEventListener('click', () => {
    if(CG.net){ leave(); VM().goTo('lobby'); return; }
    start();
  });
}

/* Shared cleanup for all three startups. */
function reset(){
  wire();
  $('#cgResult').hidden = true;
  $('#cgDialog').hidden = true;
  $('#cgSheet').hidden = true;
  $('#cgBanner').hidden = true;
  document.body.classList.remove('cg-picking');
  CG.turnDone = null;
  CG.targetPick = null;
  CG.selected = null;
  CG.log = [];
  resultShown = false;
  breakAllPromises();
  clearQueue();
}

function start(){
  CG.net = null;
  reset();
  runGame(CG.myLeader);
}

return {
  start, startHost, startGuest, leave, receive,
  opponentGone: () => abortNetBattle('THE OPPONENT LOST THE CONNECTION'),
  CG,
};
})();
