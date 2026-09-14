/* VILLMARK - crash breadcrumbs.

   A phone that runs out of memory takes the whole tab with it. No console, no
   stack, no onerror - WebKit just kills the page. The only thing that survives
   is what was written to disk before the kill.

   So every step of the scan writes its name to localStorage. On the next load
   the record is read back: if the last step is not 'closed', the previous run
   died right there, and the step tells us which one.

   Turn off with TRACE.off() when the hunt is over. */
const TRACE = (() => {
'use strict';

const KEY   = 'villmark-trace';        // the run in progress, overwritten on every boot
const CRASH = 'villmark-trace-crash';  // the last run that was killed, kept until cleared
const MAX = 60;          // one scan writes about 15 marks

let steps = [];
let t0 = Date.now();
let on = true;

/* usedJSHeapSize exists in Chrome on Android and on desktop, never in WebKit.
   Null on iPhone is expected and is not an error. */
function heapMb(){
  const m = performance.memory;
  return m ? Math.round(m.usedJSHeapSize / 1e6) : null;
}

function save(){
  try { localStorage.setItem(KEY, JSON.stringify({ t0, steps })); } catch(_){}
}

function mark(step, extra){
  if(!on) return;
  steps.push({
    step,
    extra: extra === undefined ? null : extra,
    ms: Date.now() - t0,
    heap: heapMb(),
  });
  if(steps.length > MAX) steps.shift();
  save();
}

/* Read the previous run before this one overwrites it. A record whose last
   step is 'closed' ended normally - anything else is a kill. */
function readPrevious(){
  let old = null;
  try { old = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(_){}
  if(!old || !Array.isArray(old.steps) || !old.steps.length) return null;
  const last = old.steps[old.steps.length - 1];
  return { crashed: last.step !== 'closed', last, steps: old.steps };
}

/* The record of the run in progress is overwritten on the next boot, so a kill
   is copied aside at once. Otherwise opening diagnostics.html - which also
   boots - would erase the very thing it is there to show. */
const previous = readPrevious();
if(previous && previous.crashed){
  try { localStorage.setItem(CRASH, JSON.stringify(previous)); } catch(_){}
}
function lastCrash(){
  try { return JSON.parse(localStorage.getItem(CRASH) || 'null'); } catch(_){ return null; }
}

/* A normal navigation, reload or tab close fires pagehide. A memory kill does
   not, and that difference is the whole signal. */
addEventListener('pagehide', () => mark('closed'));

/* An ordinary JS error is not a crash, but on a phone it looks like one, so it
   goes in the same record. */
addEventListener('error', e => mark('window-error', String(e.message || '').slice(0, 120)));
addEventListener('unhandledrejection', e =>
  mark('unhandled-rejection', String((e.reason && e.reason.message) || e.reason || '').slice(0, 120)));

function report(){
  const rec = lastCrash() || previous;
  if(!rec) return 'no earlier run recorded';
  const rows = rec.steps.map(s =>
    s.ms + ' ms  ' + s.step + (s.heap != null ? '  ' + s.heap + ' MB' : '') +
    (s.extra != null ? '  ' + s.extra : '')).join('\n');
  return (rec.crashed
    ? 'THE RUN DIED AT: ' + rec.last.step + '\n\n'
    : 'the previous run ended normally\n\n') + rows;
}

function off(){
  on = false;
  try { localStorage.removeItem(KEY); localStorage.removeItem(CRASH); } catch(_){}
}

mark('boot');

return { mark, previous, lastCrash, report, off, get steps(){ return steps.slice(); } };
})();

if(typeof window !== 'undefined') window.TRACE = TRACE;
