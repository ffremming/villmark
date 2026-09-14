/* VILLMARK - NETWORK LAYER
   Everything that leaves the machine lives here. The rest of the game only
   sees the functions at the bottom of the file and knows nothing about
   Supabase.

   Two transports with the same API:
     supabase  - the real network, Presence for the player list and Broadcast
                 for everything else
     local     - BroadcastChannel between two tabs in the same browser
                 (?fake-net)

   No database tables. Presence carries the name and the leader card, so the
   lobby needs no storage. The anon key is public by design. */

const NET = (() => {
'use strict';

const CONF = window.VILLMARK_NET || {};
const LOCAL_MODE = new URLSearchParams(location.search).has('fake-net')
                    || !CONF.url || !CONF.anonKey;

const LOBBY = 'villmark-lobby';
const HEARTBEAT = 2000;   // local transport: how often we shout that we are alive
const FORGET    = 6000;   // local transport: when a silent player counts as gone
const ANSWER_DEADLINE = 30000;  // how long a challenge stays open
const FIELD_DEADLINE  = 8000;   // how long we wait for another player's lawn

/* ============================================================ state */
const N = {
  ready:false,
  me:{ id:null, name:'', leader:null, status:'free' },
  players:new Map(),         // id -> player
  lobbyChannel:null,
  battleChannel:null,
  battleId:null,
  role:null,                 // 'host' | 'guest'
  opponent:null,             // id of the one we are playing against
  listeners:{ players:[], challenge:[], message:[], gone:[], status:[], fieldRequest:[] },
  connected:false,           // the channel is up
  tracked:false,             // the server has registered us, so others can see us
  outgoing:null,             // the challenge we sent ourselves
  pendingField:null,         // the lawn we asked for ourselves
  sb:null,
};

function emit(name, ...a){ for(const f of N.listeners[name].slice()) f(...a); }

/* Four states, and the two in the middle are the point: the channel can be up
   without us being registered, and then we see everyone else while nobody
   sees us. */
function state(){
  if(LOCAL_MODE) return 'local';
  if(!N.lobbyChannel) return 'off';
  if(!N.connected)    return 'connecting';
  if(!N.tracked)      return 'invisible';
  return 'online';
}
const uuid = () => (crypto.randomUUID ? crypto.randomUUID()
  : Date.now().toString(16) + Math.random().toString(16).slice(2));

/* ============================================================ name and id */
/* In local test mode the identity lives in sessionStorage, so two tabs in the
   same browser become two different players. */
const store = () => LOCAL_MODE ? sessionStorage : localStorage;

function savedName(){ try { return store().getItem('villmark-name') || ''; } catch { return ''; } }
function saveName(n){ try { store().setItem('villmark-name', n); } catch {} }

function randomName(){
  const a = ['SWIFT','SILENT','WILD','GREY','WHITE','SHARP','SOFT','DEEP'];
  const b = ['FOX','OWL','LYNX','MOOSE','ADDER','HARE','FALCON','BADGER'];
  return a[Math.floor(Math.random()*a.length)] + ' ' + b[Math.floor(Math.random()*b.length)];
}

/* ============================================================ lobby logic */
function list(){
  return [...N.players.values()].sort((a,b) => a.name.localeCompare(b.name, 'en'));
}

/* Messages that pass through the lobby: challenge, answer and withdrawal.
   They all carry a recipient, so we throw away what is not for us. */
function lobbyMessage(m){
  if(!m || m.to !== N.me.id) return;

  if(m.t === 'challenge'){
    emit('challenge', { from:m.from, fromName:m.fromName, battleId:m.battleId });
    return;
  }
  if(m.t === 'challenge-cancel'){
    emit('challenge', { from:m.from, cancelled:true });
    return;
  }
  if(m.t === 'challenge-answer'){
    const c = N.outgoing;
    if(!c || c.to !== m.from) return;
    clearTimeout(c.timer);
    N.outgoing = null;
    c.res(m.accepted ? { accepted:true, battleId:c.battleId } : { accepted:false });
    return;
  }

  /* A visit is one question and one answer: the guest asks, the owner
     replies with a snapshot of the lawn. Nothing is stored anywhere. */
  if(m.t === 'field-ask'){
    emit('fieldRequest', m.from);
    return;
  }
  if(m.t === 'field-reply'){
    const p = N.pendingField;
    if(!p || p.from !== m.from) return;
    clearTimeout(p.timer);
    N.pendingField = null;
    p.res({ name:m.name, field:m.field });
  }
}

/* ============================================================ transport: local */
/* BroadcastChannel when two tabs in the same browser play against each other.
   Presence does not exist here, so we build it out of heartbeats. */
const Local = (() => {
  let channel = null, pulse = null;
  const lastSeen = new Map();   // id -> time of the last sign of life

  function send(m){ if(channel) channel.postMessage(m); }

  function prune(){
    const now = Date.now();
    let changed = false;
    for(const [id, t] of lastSeen){
      if(now - t > FORGET){
        lastSeen.delete(id); N.players.delete(id); changed = true;
        if(id === N.opponent) emit('gone');
      }
    }
    if(changed) emit('players', list());
  }

  function receive(m){
    if(m.t === 'hi'){
      if(m.s.id === N.me.id) return;
      lastSeen.set(m.s.id, Date.now());
      const old = N.players.get(m.s.id);
      N.players.set(m.s.id, m.s);
      if(!old || JSON.stringify(old) !== JSON.stringify(m.s)) emit('players', list());
      return;
    }
    if(m.t === 'who'){ send({ t:'hi', s:N.me }); return; }
    if(m.t === 'bye'){
      if(N.players.delete(m.id)){ lastSeen.delete(m.id); emit('players', list()); }
      if(m.id === N.opponent) emit('gone');
      return;
    }
    lobbyMessage(m);
  }

  return {
    async start(){
      N.me.id = sessionStorage.getItem('villmark-id') || uuid();
      sessionStorage.setItem('villmark-id', N.me.id);
      channel = new BroadcastChannel(LOBBY);
      channel.onmessage = e => receive(e.data);
    },
    lobbyIn(){
      if(pulse) return;
      N.connected = true; N.tracked = true;
      emit('status', state());
      send({ t:'hi', s:N.me });
      send({ t:'who' });
      pulse = setInterval(() => { send({ t:'hi', s:N.me }); prune(); }, HEARTBEAT);
    },
    lobbyOut(){
      clearInterval(pulse); pulse = null;
      send({ t:'bye', id:N.me.id });
      N.connected = false; N.tracked = false;
      N.players.clear();
      emit('players', list());
      emit('status', state());
    },
    update(){ send({ t:'hi', s:N.me }); },
    broadcast(m){ send(m); },
  };
})();

/* ============================================================ transport: supabase */
const Cloud = (() => {
  async function loadLibrary(){
    if(window.supabase) return;
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.onload = res; s.onerror = () => rej(new Error('could not load supabase-js'));
      document.head.appendChild(s);
    });
  }

  /* Seeing the others and being visible yourself are two independent things:
     the channel can be up while our own track never got through. Then we see
     everyone else, and nobody sees us. That is why track is repeated until the
     server answers 'ok'. */
  let trackTimer = null, reconnectTimer = null;

  async function trackMe(){
    clearTimeout(trackTimer); trackTimer = null;
    if(!N.lobbyChannel) return;
    let answer;
    try { answer = await N.lobbyChannel.track(N.me); }
    catch { answer = 'error'; }
    const ok = (answer === 'ok');
    if(ok !== N.tracked){ N.tracked = ok; emit('status', state()); }
    if(!ok) trackTimer = setTimeout(trackMe, 2000);
  }

  function reconnect(){
    if(reconnectTimer || !N.lobbyChannel) return;
    reconnectTimer = setTimeout(async () => {
      reconnectTimer = null;
      const c = N.lobbyChannel;
      N.lobbyChannel = null;
      try { await N.sb.removeChannel(c); } catch {}
      Cloud.lobbyIn();
    }, 3000);
  }

  /* Mobile browsers freeze the connection when the screen locks. When the page
     comes back we register ourselves again. */
  if(typeof document !== 'undefined'){
    document.addEventListener('visibilitychange', () => {
      if(document.visibilityState === 'visible' && N.lobbyChannel) trackMe();
    });
  }

  const Cloud = {
    async start(){
      await loadLibrary();
      N.sb = window.supabase.createClient(CONF.url, CONF.anonKey);
      let { data } = await N.sb.auth.getSession();
      if(!data.session){
        const r = await N.sb.auth.signInAnonymously();
        if(r.error) throw r.error;
        data = { session:r.data.session };
      }
      N.me.id = data.session.user.id;
    },

    lobbyIn(){
      if(N.lobbyChannel) return;
      N.lobbyChannel = N.sb.channel(LOBBY, { config:{ presence:{ key:N.me.id } } });
      N.connected = false; N.tracked = false;
      emit('status', state());

      const readPresence = () => {
        if(!N.lobbyChannel) return;
        const all = N.lobbyChannel.presenceState();
        N.players.clear();
        for(const key in all){
          const s = all[key][0];
          if(s && s.id && s.id !== N.me.id) N.players.set(s.id, s);
        }
        if(N.opponent && !N.players.has(N.opponent)) emit('gone');
        emit('players', list());
      };

      N.lobbyChannel
        .on('presence', { event:'sync' },  readPresence)
        .on('presence', { event:'join' },  readPresence)
        .on('presence', { event:'leave' }, readPresence)
        .on('broadcast', { event:'lobby' }, e => lobbyMessage(e.payload))
        .subscribe(status => {
          if(status === 'SUBSCRIBED'){
            N.connected = true;
            emit('status', state());
            trackMe();              // also after a reconnect
            return;
          }
          if(status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED'){
            N.connected = false; N.tracked = false;
            emit('status', state());
            reconnect();
          }
        });
    },

    async lobbyOut(){
      clearTimeout(trackTimer); trackTimer = null;
      clearTimeout(reconnectTimer); reconnectTimer = null;
      if(!N.lobbyChannel) return;
      const c = N.lobbyChannel;
      N.lobbyChannel = null;
      N.connected = false; N.tracked = false;
      N.players.clear();
      emit('players', []);
      try { await c.untrack(); } catch {}
      await N.sb.removeChannel(c);
    },

    update(){ if(N.lobbyChannel) trackMe(); },
    broadcast(m){
      if(N.lobbyChannel) N.lobbyChannel.send({ type:'broadcast', event:'lobby', payload:m });
    },
  };
  return Cloud;
})();

const T = LOCAL_MODE ? Local : Cloud;

/* ============================================================ battle channel */
function battleIn(battleId, role, opponent){
  N.battleId = battleId; N.role = role; N.opponent = opponent;
  N.me.status = 'in_battle';
  T.update();

  if(LOCAL_MODE){
    N.battleChannel = new BroadcastChannel('villmark-battle-' + battleId);
    N.battleChannel.onmessage = e => {
      if(e.data && e.data.from !== N.me.id) emit('message', e.data.m);
    };
    return;
  }
  N.battleChannel = N.sb.channel('battle-' + battleId, { config:{ broadcast:{ self:false } } });
  N.battleChannel
    .on('broadcast', { event:'battle' }, e => emit('message', e.payload))
    .subscribe();
}

function battleOut(){
  if(N.battleChannel){
    send({ t:'bye' });
    const c = N.battleChannel;
    N.battleChannel = null;
    if(LOCAL_MODE) c.close();
    else N.sb.removeChannel(c);
  }
  N.battleId = null; N.role = null; N.opponent = null;
  N.me.status = 'free';
  T.update();
}

function send(m){
  if(!N.battleChannel) return;
  if(LOCAL_MODE){ N.battleChannel.postMessage({ from:N.me.id, m }); return; }
  N.battleChannel.send({ type:'broadcast', event:'battle', payload:m });
}

/* ============================================================ outward API */
async function ready(){
  if(N.ready) return N.me;
  await T.start();
  N.me.name = savedName() || randomName();
  saveName(N.me.name);
  N.ready = true;
  window.addEventListener('beforeunload', () => { try { T.lobbyOut(); } catch {} });
  return N.me;
}

function setName(n){
  N.me.name = (n || '').trim().slice(0, 18).toUpperCase() || randomName();
  saveName(N.me.name);
  T.update();
  return N.me.name;
}

function setLeader(id){ N.me.leader = id; T.update(); }

/* Challenges a player and waits for the answer. The challenger makes the
   battle id, so both sides know which channel to meet in. */
function challenge(toId){
  if(N.outgoing) cancelChallenge();
  const battleId = uuid();
  return new Promise(res => {
    const timer = setTimeout(() => {
      if(N.outgoing && N.outgoing.battleId === battleId){
        N.outgoing = null;
        T.broadcast({ t:'challenge-cancel', from:N.me.id, to:toId });
        res({ accepted:false, timeout:true });
      }
    }, ANSWER_DEADLINE);
    N.outgoing = { to:toId, battleId, res, timer };
    T.broadcast({ t:'challenge', from:N.me.id, fromName:N.me.name, to:toId, battleId });
  });
}

function cancelChallenge(){
  const c = N.outgoing;
  if(!c) return;
  clearTimeout(c.timer);
  N.outgoing = null;
  T.broadcast({ t:'challenge-cancel', from:N.me.id, to:c.to });
  c.res({ accepted:false, cancelled:true });
}

function answerChallenge(fromId, battleId, accepted){
  T.broadcast({ t:'challenge-answer', from:N.me.id, to:fromId, battleId, accepted });
}

/* ------------------------------------------------ visiting a lawn */
/** Ask a player for their lawn. Resolves with {name, field}, or null if the
    answer never came. Only one question stands at a time. */
function askField(toId){
  cancelField();
  return new Promise(res => {
    const timer = setTimeout(() => {
      if(N.pendingField && N.pendingField.from === toId){
        N.pendingField = null;
        res(null);
      }
    }, FIELD_DEADLINE);
    N.pendingField = { from:toId, res, timer };
    T.broadcast({ t:'field-ask', from:N.me.id, to:toId });
  });
}

/** Answer someone who asked for our lawn. */
function sendField(toId, field){
  T.broadcast({ t:'field-reply', from:N.me.id, to:toId, name:N.me.name, field });
}

/** Stop waiting - the answer is dropped if it turns up later. */
function cancelField(){
  const p = N.pendingField;
  if(!p) return;
  clearTimeout(p.timer);
  N.pendingField = null;
  p.res(null);
}

function on(name, f){
  N.listeners[name].push(f);
  return () => {
    const i = N.listeners[name].indexOf(f);
    if(i >= 0) N.listeners[name].splice(i, 1);
  };
}

return {
  LOCAL_MODE,
  ready, setName, setLeader, state,
  get me(){ return N.me; },
  get role(){ return N.role; },
  get opponentId(){ return N.opponent; },
  get opponent(){ return N.players.get(N.opponent) || null; },
  players: list,
  lobbyIn: () => T.lobbyIn(),
  lobbyOut: () => T.lobbyOut(),
  challenge, cancelChallenge, answerChallenge,
  askField, sendField, cancelField,
  battleIn, battleOut, send, on,
};
})();
