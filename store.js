/* VILLMARK - LOCAL SAVE
   The lawn belongs to the phone, not to the network: one JSON blob in
   localStorage, written a short moment after the last change. Only the
   parts the player built are stored. The season follows the calendar and
   scan targets die with the session, so neither is saved.

   Writes are held while a guest lawn is on screen - see VISIT in app.js.
   Nothing here throws: private mode and a full quota both mean "no save". */

const STORE = (() => {
'use strict';

const KEY     = 'villmark-plen-v1';
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

/** one scanned specimen, or null if the record is unusable */
function cleanSpecimen(e){
  if(!e || typeof e !== 'object' || typeof e.art !== 'string') return null;
  return {
    uid:     num(e.uid, 0),
    art:     e.art,
    niva:    num(e.niva, 1),
    variant: typeof e.variant === 'string' ? e.variant : null,
    x:       e.x === null ? null : num(e.x, null),
    z:       e.z === null ? null : num(e.z, null),
  };
}

function snapshot(S){
  return {
    v:            VERSION,
    mynt:         S.mynt,
    niva:         S.niva,
    funnet:       [...S.funnet],
    varianter:    S.varianter,
    pynt:         S.pynt,
    nestePyntUid: S.nestePyntUid,
    eksemplarer:  S.eksemplarer,
    nesteUid:     S.nesteUid,
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

  const props     = Array.isArray(d.pynt)        ? d.pynt.map(cleanProp).filter(Boolean)            : [];
  const specimens = Array.isArray(d.eksemplarer) ? d.eksemplarer.map(cleanSpecimen).filter(Boolean) : [];

  S.mynt = num(d.mynt, S.mynt);
  S.niva = num(d.niva, S.niva);
  S.funnet = new Set(Array.isArray(d.funnet) ? d.funnet.filter(x => typeof x === 'string') : []);
  S.varianter = (d.varianter && typeof d.varianter === 'object') ? d.varianter : {};
  S.pynt = props;
  S.eksemplarer = specimens;

  /* The uid counters must clear everything already on the lawn. Otherwise a
     new find takes the uid of an old one, and the two are dragged as one. */
  const top = (list, start) => list.reduce((m, o) => Math.max(m, o.uid), start - 1) + 1;
  S.nestePyntUid = Math.max(num(d.nestePyntUid, 1), top(props, 1));
  S.nesteUid     = Math.max(num(d.nesteUid, 1),     top(specimens, 1));
  S.sistLagt = null;
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
