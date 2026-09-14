/* VILLMARK - DUEL LOBBY
   The screen in front of the card game: pick a name, pick a deck, see who is
   online and challenge them. The lobby knows only the front doors of NET and
   CARDGAME. */

const LOBBY = (() => {
'use strict';

const VM = () => window.VM;
const $  = s => document.querySelector(s);

const L = {
  wired:false,
  started:false,
  players:[],
  incoming:new Map(),   // id -> battleId for those who have challenged us
  waitingFor:null,      // id we have challenged ourselves
  waitingField:false,   // we asked someone for their lawn and wait for it
  myLeader:'ld_bear',
};

/* ============================================================ drawing */
function leaderButtonHTML(l, selected){
  const f = CARD_COLORS[l.colors[0]], g = CARD_COLORS[l.colors[1]];
  return `<button class="lobby-leader${selected ? ' selected' : ''}" data-leader="${l.id}"
    style="--a:${f.hex};--b:${g.hex}">
    <span class="lobby-leader-name">${l.name}</span>
    <span class="lobby-leader-color">${f.name} / ${g.name}</span>
    <span class="lobby-leader-life">${l.life} LIFE</span>
  </button>`;
}

function drawLeaders(){
  $('#lobbyLeaders').innerHTML = LEADERS.map(l => leaderButtonHTML(l, l.id === L.myLeader)).join('');
}

/* ============================================================ the deck
   The deck is the lawn: every animal and every plant standing out there is
   one card. Here you choose which of them come along. The leader decides how
   big the deck has to be at the least, since the life cards are taken off the
   deck too. */
function deckState(){
  const leader = CARD_BASE[L.myLeader];
  const out = deckableSpecimens(VM().STATE.specimens)
    .sort((a,b) => cardCost(SPECIES_BY_ID[a.species], a.level)
                 - cardCost(SPECIES_BY_ID[b.species], b.level)
                || SPECIES_BY_ID[a.species].name.localeCompare(SPECIES_BY_ID[b.species].name)
                || a.uid - b.uid);
  return { leader, out, count: VM().deckCards().length, least: minDeckSize(leader) };
}
const deckOk = () => { const d = deckState(); return d.count >= d.least; };

function deckTileHTML(e){
  const card = cardById(cardIdFor(e.species, e.level));
  const inDeck = VM().deckHas(e.uid);
  return `<button class="lobby-card${inDeck ? ' in' : ''}" data-uid="${e.uid}"
    aria-pressed="${inDeck}">
    <span class="lobby-card-img"><img src="${VM().makeThumb(e.species, e.variant)}" alt=""></span>
    <span class="lobby-card-name">${card.name}</span>
    <span class="lobby-card-num">${card.cost} SUN &middot; ${card.power}</span>
    ${e.level > 1 ? `<span class="lobby-card-level">Lv ${e.level}</span>` : ''}
  </button>`;
}

function drawDeck(){
  const { out, count, least } = deckState();
  const enough = count >= least;

  const num = $('#lobbyDeckCount');
  num.textContent = count + ' CARDS';
  num.classList.toggle('lobby-too-few', !enough);

  /* Against the machine one card is enough: the deck is padded out with the
     same cards over again. Against other players the minimum deck applies as
     before. */
  const hint = $('#lobbyDeckHint');
  const text = !out.length
    ? 'PLACE ANIMALS AND PLANTS ON THE LAWN TO GET CARDS.'
    : !count ? 'CHOOSE AT LEAST ONE CARD FOR THE DECK.'
    : !enough ? 'THE DECK MUST HAVE AT LEAST ' + least + ' CARDS AGAINST OTHER PLAYERS. '
           + 'AGAINST THE MACHINE THE SAME CARDS GO ROUND AND ROUND AGAIN.' : '';
  hint.textContent = text;
  hint.hidden = !text;

  $('#lobbyDeck').innerHTML = out.map(deckTileHTML).join('');
  $('#lobbyDeckToggle').disabled = !out.length;
  $('#lobbyVsAi').disabled = count < 1;
}

function drawList(){
  const out = $('#lobbyList');
  if(!L.players.length){
    out.innerHTML = `<p class="lobby-empty">NOBODY ELSE IS ONLINE RIGHT NOW.${
      NET.LOCAL_MODE ? '<br><small>LOCAL TEST MODE — OPEN THE GAME IN ONE MORE TAB.</small>' : ''}</p>`;
    return;
  }
  out.innerHTML = L.players.map(s => {
    const leader = CARD_BASE[s.leader];
    const challenging = L.incoming.has(s.id);
    const busy = s.status === 'in_battle';
    return `<button class="lobby-row${challenging ? ' challenging' : ''}"
      data-player="${s.id}"${busy && !challenging ? ' disabled' : ''}>
      <span class="lobby-row-name">${s.name}</span>
      <span class="lobby-row-leader">${leader ? leader.name : '—'}</span>
      ${challenging ? '<span class="lobby-tag">CHALLENGES YOU</span>'
                    : `<span class="lobby-row-status">${busy ? 'IN BATTLE' : 'FREE'}</span>`}
    </button>`;
  }).join('');
}

/* The status line tells being connected apart from being visible.
   When you are 'invisible' you see everyone else, while nobody sees you. */
const STATUS_TEXT = {
  local:      'LOCAL TEST MODE',
  off:        'CONNECTING …',
  connecting: 'CONNECTING …',
  invisible:  'NOT VISIBLE — TRYING AGAIN',
  online:     'ONLINE',
};
function drawStatus(){
  const el = $('#lobbyStatus');
  const t = NET.state();
  el.textContent = STATUS_TEXT[t] || t;
  el.classList.toggle('lobby-status-warn', t === 'invisible' || t === 'connecting');
}

function wait(text){
  $('#lobbyWaitTxt').textContent = text;
  $('#lobbyWait').hidden = false;
}
function closeWait(){ $('#lobbyWait').hidden = true; }

/* ============================================================ challenges */
async function challenge(id){
  const s = L.players.find(x => x.id === id);
  if(!s) return;
  if(!deckOk()){ VM().toast('YOUR DECK IS TOO SMALL'); return; }
  L.waitingFor = id;
  wait('WAITING FOR AN ANSWER FROM ' + s.name + ' …');

  const answer = await NET.challenge(id);
  L.waitingFor = null;
  closeWait();

  if(!answer.accepted){
    VM().toast(answer.timeout ? 'NO ANSWER' : 'THE CHALLENGE WAS DECLINED');
    return;
  }
  goToBattle(answer.battleId, 'host', id);
}

/* ------------------------------------------------ visiting a lawn */
/* A visit is a question to a player who is online right now: they answer
   with a snapshot of their lawn, and it is drawn read-only. Nobody's lawn
   is stored on the network, so an offline player cannot be visited. */
async function visit(id){
  const s = L.players.find(x => x.id === id);
  if(!s) return;
  L.waitingField = true;
  wait('FETCHING THE LAWN OF ' + s.name + ' …');

  const answer = await NET.askField(id);
  L.waitingField = false;
  closeWait();
  if(!answer || !answer.field){ VM().toast('COULD NOT GET HOLD OF THE LAWN'); return; }

  VM().visitField(answer.name || s.name, answer.field);
}

function accept(id){
  const battleId = L.incoming.get(id);
  if(!battleId) return;
  /* Too small a deck loses on an empty deck before the third turn, so the
     challenge is declined instead of starting a battle that is already
     decided. */
  if(!deckOk()){
    L.incoming.delete(id);
    NET.answerChallenge(id, battleId, false);
    VM().toast('YOUR DECK IS TOO SMALL');
    drawList();
    return;
  }
  L.incoming.delete(id);
  NET.answerChallenge(id, battleId, true);
  goToBattle(battleId, 'guest', id);
}

function decline(id){
  const battleId = L.incoming.get(id);
  if(!battleId) return;
  L.incoming.delete(id);
  NET.answerChallenge(id, battleId, false);
  drawList();
}

/* The channel must be up before the battle starts, or the first message is lost. */
function goToBattle(battleId, role, opponent){
  NET.battleIn(battleId, role, opponent);
  CARDGAME.CG.myLeader = L.myLeader;
  if(role === 'host') CARDGAME.startHost(battleId);
  else                CARDGAME.startGuest(battleId);
  VM().goTo('battle');
}

/* ============================================================ wiring */
function wire(){
  if(L.wired) return;
  L.wired = true;

  $('#lobbyName').addEventListener('change', e => {
    const n = NET.setName(e.target.value);
    e.target.value = n;
  });

  $('#lobbyLeaders').addEventListener('click', e => {
    const b = e.target.closest('[data-leader]');
    if(!b) return;
    L.myLeader = b.dataset.leader;
    CARDGAME.CG.myLeader = L.myLeader;
    NET.setLeader(L.myLeader);
    drawLeaders();
    drawDeck();            // a leader with more life needs a bigger deck
  });

  $('#lobbyDeckToggle').addEventListener('click', () => {
    const grid = $('#lobbyDeck');
    grid.hidden = !grid.hidden;
    $('#lobbyDeckToggle').textContent = grid.hidden ? 'EDIT' : 'DONE';
  });

  $('#lobbyDeck').addEventListener('click', e => {
    const b = e.target.closest('[data-uid]');
    if(!b) return;
    const uid = Number(b.dataset.uid);
    VM().deckChoose(uid, !VM().deckHas(uid));
    drawDeck();
  });

  $('#lobbyList').addEventListener('click', e => {
    const b = e.target.closest('[data-player]');
    if(!b || b.disabled) return;
    const id = b.dataset.player;
    if(L.incoming.has(id)) askAccept(id);
    else askChoice(id);
  });

  $('#lobbyWaitCancel').addEventListener('click', () => {
    if(L.waitingField){ NET.cancelField(); L.waitingField = false; }
    else NET.cancelChallenge();
    L.waitingFor = null;
    closeWait();
  });

  $('#lobbyPickVisit').addEventListener('click', () => {
    const id = $('#lobbyPick').dataset.player;
    $('#lobbyPick').hidden = true;
    visit(id);
  });
  $('#lobbyPickDuel').addEventListener('click', () => {
    const id = $('#lobbyPick').dataset.player;
    $('#lobbyPick').hidden = true;
    challenge(id);
  });
  $('#lobbyPickCancel').addEventListener('click', () => { $('#lobbyPick').hidden = true; });

  $('#lobbyVsAi').addEventListener('click', () => {
    CARDGAME.CG.myLeader = L.myLeader;
    VM().goTo('battle');
  });

  $('#lobbyAccept').addEventListener('click', () => {
    const id = $('#lobbyAsk').dataset.from;
    $('#lobbyAsk').hidden = true;
    accept(id);
  });
  $('#lobbyDecline').addEventListener('click', () => {
    const id = $('#lobbyAsk').dataset.from;
    $('#lobbyAsk').hidden = true;
    decline(id);
  });

  /* Someone wants to see our lawn. It costs nothing to show it, so the
     answer goes out without asking - the lawn holds nothing private. */
  NET.on('fieldRequest', from => NET.sendField(from, VM().fieldSnapshot()));

  NET.on('players', players => {
    L.players = players;
    for(const id of [...L.incoming.keys()]){
      if(!players.some(s => s.id === id)) L.incoming.delete(id);
    }
    const chosen = $('#lobbyPick');
    if(!chosen.hidden && !players.some(s => s.id === chosen.dataset.player)) chosen.hidden = true;
    drawList();
  });

  NET.on('challenge', c => {
    if(c.cancelled){
      L.incoming.delete(c.from);
      if($('#lobbyAsk').dataset.from === c.from) $('#lobbyAsk').hidden = true;
      drawList();
      return;
    }
    L.incoming.set(c.from, c.battleId);
    drawList();
    VM().SOUND.near();
    VM().toast(c.fromName + ' WANTS TO DUEL');
  });

  NET.on('message', m => CARDGAME.receive(m));

  NET.on('status', drawStatus);

  NET.on('gone', () => {
    if(NET.role) CARDGAME.opponentGone();
  });
}

/** the two things you can do with another player */
function askChoice(id){
  const s = L.players.find(x => x.id === id);
  const d = $('#lobbyPick');
  d.dataset.player = id;
  $('#lobbyPickName').textContent = s ? s.name : 'PLAYER';
  d.hidden = false;
}

function askAccept(id){
  const s = L.players.find(x => x.id === id);
  const d = $('#lobbyAsk');
  d.dataset.from = id;
  $('#lobbyAskTxt').textContent = (s ? s.name : 'SOMEONE') + ' WANTS TO DUEL YOU';
  d.hidden = false;
}

/* ============================================================ in and out */
async function open(){
  wire();
  drawLeaders();
  drawDeck();
  drawList();
  drawStatus();

  if(!L.started){
    try {
      await NET.ready();
      L.started = true;
    } catch(e){
      $('#lobbyStatus').textContent = 'COULD NOT CONNECT';
      VM().toast('THE NETWORK IS NOT ANSWERING');
      return;
    }
    NET.setLeader(L.myLeader);
  }
  $('#lobbyName').value = NET.me.name;
  NET.lobbyIn();
  drawStatus();
  drawList();
}

return { open, get myLeader(){ return L.myLeader; } };
})();
