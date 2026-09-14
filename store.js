/* VILLMARK - LOCAL SAVE
   The lawn belongs to the phone, not to the network: one JSON blob in
   localStorage, written a short moment after the last change. Only the
   parts the player built are stored. The season follows the calendar and
   scan targets die with the session, so neither is saved.

   Writes are held while a guest lawn is on screen - see VISIT in app.js.
   Nothing here throws: private mode and a full quota both mean "no save". */

const STORE = (() => {
'use strict';

const KEY     = 'villmark-lawn-v1';
const VERSION = 1;
const DELAY   = 400;      // wait this long after the last change before writing

let timer = null;
let held  = false;        // true while another player's lawn is loaded

/* ------------------------------------------------ shaping */
const num = (v, fallback) => (typeof v === 'number' && isFinite(v)) ? v : fallback;

/** one bought item, or null if the record is unusable */
function cleanProp(p){
  if(!p || typeof p !== 'object' || typeof p.id !== 'string') return null;
  return {
    uid:  num(p.uid, 0),
    id:   p.id,
    x:    p.x === null ? null : num(p.x, null),
    z:    p.z === null ? null : num(p.z, null),
    rotY: num(p.rotY, 0),
  };
}

/** what the model named a mapped find, or null. Lawns saved before the mapping
    screen existed have no origin, and read back as an exact find. */
function cleanOrigin(o){
  if(!o || typeof o !== 'object' || typeof o.name !== 'string' || !o.name) return null;
  return {
    name:      o.name.slice(0, 80),
    levelText: typeof o.levelText === 'string' ? o.levelText.slice(0, 40) : '',
  };
}

/** one scanned specimen, or null if the record is unusable */
function cleanSpecimen(e){
  if(!e || typeof e !== 'object' || typeof e.species !== 'string') return null;
  return {
    uid:     num(e.uid, 0),
    species: e.species,
    level:   num(e.level, 1),
    variant: typeof e.variant === 'string' ? e.variant : null,
    x:       e.x === null ? null : num(e.x, null),
    z:       e.z === null ? null : num(e.z, null),
    origin:  cleanOrigin(e.origin),
  };
}

/* The deck is a list of specimen uids. Uids drop out of it when two
   specimens are dragged together, so the list is pruned on the way out
   rather than growing for the life of the lawn. */
function liveUids(S){
  if(!S.deck) return S.specimens.map(e => e.uid);
  const live = new Set(S.specimens.map(e => e.uid));
  return [...S.deck].filter(uid => live.has(uid));
}

function snapshot(S){
  return {
    v:            VERSION,
    coins:        S.coins,
    level:        S.level,
    found:        [...S.found],
    variants:     S.variants,
    props:        S.props,
    nextPropUid:  S.nextPropUid,
    specimens:    S.specimens,
    nextUid:      S.nextUid,
    deck:         liveUids(S),
    deckChosen:   !!S.deckChosen,
  };
}

/* ------------------------------------------------ writing */
function write(S){
  timer = null;
  if(held) return;
  try { localStorage.setItem(KEY, JSON.stringify(snapshot(S))); } catch {}
}

/** ask for a save - several calls in a row cost one write */
function save(S){
  if(held) return;
  clearTimeout(timer);
  timer = setTimeout(() => write(S), DELAY);
}

/** write now, for the moment the page is about to go away */
function flush(S){
  clearTimeout(timer);
  write(S);
}

/* ------------------------------------------------ reading */
/** pour a saved lawn back into STATE. Returns true if anything was restored. */
function load(S){
  let raw;
  try { raw = localStorage.getItem(KEY); } catch { return false; }
  if(!raw) return false;

  let d;
  try { d = JSON.parse(raw); } catch { return false; }
  if(!d || typeof d !== 'object' || d.v !== VERSION) return false;

  const props     = Array.isArray(d.props)     ? d.props.map(cleanProp).filter(Boolean)         : [];
  const specimens = Array.isArray(d.specimens) ? d.specimens.map(cleanSpecimen).filter(Boolean) : [];

  S.coins = num(d.coins, S.coins);
  S.level = num(d.level, S.level);
  S.found = new Set(Array.isArray(d.found) ? d.found.filter(x => typeof x === 'string') : []);
  S.variants = (d.variants && typeof d.variants === 'object') ? d.variants : {};
  S.props = props;
  S.specimens = specimens;

  /* A lawn saved before the deck editor existed has no deck. It gets every
     specimen it owns, which is what it played with. */
  S.deck = new Set(Array.isArray(d.deck)
    ? d.deck.filter(uid => typeof uid === 'number' && isFinite(uid))
    : specimens.map(e => e.uid));
  S.deckChosen = d.deckChosen === true;

  /* The uid counters must clear everything already on the lawn. Otherwise a
     new find takes the uid of an old one, and the two are dragged as one. */
  const top = (list, start) => list.reduce((m, o) => Math.max(m, o.uid), start - 1) + 1;
  S.nextPropUid = Math.max(num(d.nextPropUid, 1), top(props, 1));
  S.nextUid     = Math.max(num(d.nextUid, 1),     top(specimens, 1));
  S.lastPlaced = null;
  return true;
}

/** wipe the save - the lawn on screen is untouched */
function clear(){
  clearTimeout(timer); timer = null;
  try { localStorage.removeItem(KEY); } catch {}
}

/** hold writes while a guest lawn sits in STATE */
function hold(on){ held = !!on; if(held) clearTimeout(timer); }

return { load, save, flush, clear, hold, KEY };
})();
