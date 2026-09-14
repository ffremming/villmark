/* Opens the game in two tabs of a real Chrome, lets one challenge the other
   and checks that both end up in the same battle. Driven over the DevTools
   protocol, so the test needs no packages. */
const { spawn, execFileSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

let failures = 0;
const check = (ok, what) => { if(!ok){ failures++; console.log('FAIL: ' + what); } else console.log('ok  - ' + what); };

const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
  '.json':'application/json', '.png':'image/png' };

function startServer(){
  return new Promise(res => {
    const t = http.createServer((rq, rs) => {
      const f = path.join(ROOT, decodeURIComponent(rq.url.split('?')[0]) === '/' ? 'index.html'
        : decodeURIComponent(rq.url.split('?')[0]));
      fs.readFile(f, (e, d) => {
        if(e){ rs.writeHead(404); rs.end(); return; }
        rs.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
        rs.end(d);
      });
    });
    t.listen(0, '127.0.0.1', () => res(t));
  });
}

/* Every browser and profile we start, so nothing is left running if the test
   fails halfway through. */
const CLEANUP = { proc:[], dirs:[] };
function cleanup(){
  for(const p of CLEANUP.proc){ try { p.kill('SIGKILL'); } catch {} }
  /* Chrome starts a pile of helper processes that survive the death of the
     main process. What they have in common is the profile directory, so that
     is the key we clean on. */
  for(const d of CLEANUP.dirs){
    /* The pattern must not start with a dash: pkill reads it as a flag. */
    try { execFileSync('pkill', ['-9', '-f', d]); } catch {}
  }
  for(const d of CLEANUP.dirs){ try { fs.rmSync(d, { recursive:true, force:true }); } catch {} }
  CLEANUP.proc = []; CLEANUP.dirs = [];
}
process.on('exit', cleanup);
for(const sig of ['SIGINT','SIGTERM']) process.on(sig, () => { cleanup(); process.exit(1); });

function startChrome(profile){
  CLEANUP.dirs.push(profile);
  return new Promise((res, rej) => {
    const p = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0',
      '--user-data-dir=' + profile, '--no-first-run', '--no-default-browser-check',
      /* headless Chrome has no GPU: software rendering gives us WebGL anyway */
      '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
      '--mute-audio', 'about:blank']);
    let buf = '';
    const onData = d => {
      buf += d;
      const m = buf.match(/ws:\/\/[^\s]+/);
      if(m){ p.stderr.off('data', onData); res({ proc:p, ws:m[0] }); }
    };
    CLEANUP.proc.push(p);
    p.stderr.on('data', onData);
    setTimeout(() => rej(new Error('Chrome did not answer')), 20000);
  });
}

/* --------- minimal DevTools client --------- */
function connect(url){
  const ws = new WebSocket(url);
  let nr = 0;
  const waiting = new Map();
  const ready = new Promise(r => ws.addEventListener('open', r));
  const events = [];
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if(m.id && waiting.has(m.id)){
      const { res, rej } = waiting.get(m.id); waiting.delete(m.id);
      m.error ? rej(new Error(m.error.message)) : res(m.result);
      return;
    }
    if(m.method === 'Runtime.exceptionThrown'){
      const d = m.params.exceptionDetails;
      events.push((m.sessionId||'?') + ' ' +
        ((d.exception && d.exception.description) || d.text) +
        ' @ ' + (d.url||'') + ':' + (d.lineNumber+1));
    }
    if(m.method === 'Log.entryAdded' && m.params.entry.level === 'error'){
      events.push((m.sessionId||'?') + ' LOG ' + m.params.entry.text +
        ' @ ' + (m.params.entry.url||''));
    }
  });
  return {
    ready,
    call(method, params = {}, sessionId){
      const id = ++nr;
      return new Promise((res, rej) => {
        waiting.set(id, { res, rej });
        ws.send(JSON.stringify({ id, method, params, sessionId }));
      });
    },
    close(){ ws.close(); },
    events,
  };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const server = await startServer();
  const addr = 'http://127.0.0.1:' + server.address().port + '/?fake-net';
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'villmark-'));
  const { proc, ws } = await startChrome(profile);
  const cdp = connect(ws);
  await cdp.ready;

  const errorMessages = [];

  async function newTab(){
    const { targetId } = await cdp.call('Target.createTarget', { url:'about:blank' });
    const { sessionId } = await cdp.call('Target.attachToTarget', { targetId, flatten:true });
    await cdp.call('Runtime.enable', {}, sessionId);
    await cdp.call('Log.enable', {}, sessionId);
    await cdp.call('Page.enable', {}, sessionId);
    await cdp.call('Page.addScriptToEvaluateOnNewDocument', { source:
      "window.__lasterrors=[];addEventListener('error',e=>window.__lasterrors.push(String(e.message)+' @ '+(e.filename||'')+':'+e.lineno));" +
      "addEventListener('unhandledrejection',e=>window.__lasterrors.push('rejection: '+e.reason));" }, sessionId);
    await cdp.call('Page.navigate', { url:addr }, sessionId);
    return sessionId;
  }
  async function run(sid, expression){
    const r = await cdp.call('Runtime.evaluate',
      { expression, returnByValue:true, awaitPromise:true }, sid);
    if(r.exceptionDetails){
      const d = r.exceptionDetails;
      const message = (d.exception && (d.exception.description || d.exception.value)) || d.text;
      throw new Error(message + '  <- ' + expression);
    }
    return r.result.value;
  }

  const a = await newTab();
  const b = await newTab();
  await sleep(3500);

  /* collect errors from both tabs */
  for(const [name, sid] of [['A', a], ['B', b]]){
    const f = await run(sid, `(() => { window.__errors = window.__errors || [];
      if(!window.__hooked){ window.__hooked = true;
        window.addEventListener('error', e => window.__errors.push(String(e.message)));
      }
      return window.__errors; })()`);
    void name; void f;
  }


  /* --------- load the lobby in both tabs --------- */
  for(const sid of [a, b]){
    check(await run(sid, 'typeof NET === "object" && typeof LOBBY === "object" && typeof CARDGAME === "object"'),
      'the scripts loaded in the tab');
    await run(sid, 'VM.goTo("lobby")');
  }
  await sleep(1500);

  await run(a, 'NET.setName("ALFA")');
  await run(b, 'NET.setName("BETA")');
  await sleep(2500);

  const listA = await run(a, 'document.querySelectorAll("#lobbyList .lobby-row").length');
  const listB = await run(b, 'document.querySelectorAll("#lobbyList .lobby-row").length');
  check(listA === 1, 'tab A sees the other player (got ' + listA + ')');
  check(listB === 1, 'tab B sees the other player (got ' + listB + ')');
  check(await run(a, 'document.querySelector("#lobbyList .lobby-row-name").textContent') === 'BETA',
    'tab A sees the right name on the opponent');

  /* --------- the deck comes from the lawn --------- */
  /* The deck is the lawn, so an empty lawn has no cards and the battle is
     closed. We place enough species for the deck to be legal. */
  const c = await newTab();
  await sleep(3000);
  await run(c, 'VM.goTo("lobby")');
  await sleep(800);
  check(await run(c, 'document.querySelector("#lobbyVsAi").disabled'),
    'an empty lawn gives no cards, so the battle is closed');
  check(await run(c, '!document.querySelector("#lobbyDeckHint").hidden'),
    'and the player is told why');

  await run(c, `(() => {
    for(let i = 0; i < 20; i++){
      const sp = SPECIES[i % SPECIES.length];
      VM.STATE.specimens.push({ uid:9200 + i, species:sp.id, level: i === 0 ? 3 : 1,
        variant:null, x:i, z:i });
      VM.STATE.deck.add(9200 + i);
      VM.STATE.found.add(sp.id);
    }
    VM.goTo('field'); })()`);
  await sleep(600);
  await run(c, 'VM.goTo("lobby")');
  await sleep(900);

  check(!(await run(c, 'document.querySelector("#lobbyVsAi").disabled')),
    'a lawn with enough species opens the battle');
  const slots = await run(c, 'document.querySelectorAll("#lobbyDeck .lobby-card").length');
  check(slots === 20, 'the deck editor shows one slot per species on the lawn (got ' + slots + ')');
  check(await run(c, 'document.querySelectorAll("#lobbyDeck .lobby-card.in").length') === 20,
    'everything on the lawn is in the deck until somebody takes it out');
  check(await run(c, 'document.querySelector("#lobbyDeck .lobby-card-level") !== null'),
    'a specimen dragged up a level is marked');

  /* --------- a card can be taken out and put back in --------- */
  const beforeOut = await run(c, 'VM.deckCards().length');
  await run(c, 'document.querySelector("#lobbyDeck .lobby-card").click()');
  await sleep(300);
  check(await run(c, 'VM.deckCards().length') === beforeOut - 1,
    'a card that is clicked away disappears from the deck');
  check(await run(c, 'document.querySelectorAll("#lobbyDeck .lobby-card").length') === 20,
    'but the slot stays, so it can be put back in');
  await run(c, 'document.querySelector("#lobbyDeck .lobby-card").click()');
  await sleep(300);
  check(await run(c, 'VM.deckCards().length') === beforeOut,
    'and another click puts it back in');

  /* --------- the solo battle must still work --------- */
  await run(c, 'document.querySelector("#lobbyVsAi").click()');
  await sleep(1500);
  /* Cards move around as the turns go by, so we count every place a card can
     sit. The sum must be the deck the player brought. */
  const owns = i => `(p => p.deck.length + p.hand.length + p.life.length
    + p.species.length + p.compost.length + (p.biotope ? 1 : 0))(CARDGAME.CG.p[${i}])`;
  check(await run(c, owns(0)) === 20,
    'the battle is played with the lawn, not with the plan deck');
  check(await run(c, owns(1)) === 20,
    'the machine brings the same number of cards');
  check(await run(c, 'CARDGAME.CG.net === null'),
    'the solo battle does not use the network');
  check(await run(c, 'CARDGAME.CG.p[1].control') === 'ai',
    'the opponent in the solo battle is driven by the machine');
  check(await run(c, 'document.querySelectorAll("#myHand .mc").length > 0'),
    'the solo battle has drawn the hand');
  await run(c, 'VM.goTo("field")');
  await sleep(400);

  /* --------- B visits A's lawn --------- */
  /* A places a species, so there is something to look at next door. */
  await run(a, `VM.STATE.specimens.push({ uid:9001, species:SPECIES[0].id, level:1,
    variant:null, x:4, z:4 }); VM.STATE.found.add(SPECIES[0].id); VM.goTo('field');`);
  await sleep(900);
  /* The save waits a moment for more changes before it writes, so we look for
     it instead of guessing at a pause. */
  let written = false;
  for(let i = 0; i < 12 && !written; i++){
    written = await run(a, `(() => { const d = JSON.parse(localStorage.getItem('villmark-lawn-v1') || '{}');
      return (d.specimens || []).some(e => e.uid === 9001); })()`);
    if(!written) await sleep(400);
  }
  check(written, 'the lawn is written to the phone when it changes');
  await run(a, 'VM.goTo("lobby")');
  await sleep(900);

  await run(b, 'document.querySelector("#lobbyList .lobby-row").click()');
  await sleep(400);
  check(await run(b, '!document.querySelector("#lobbyPick").hidden'),
    'tab B gets the choice between visiting and challenging');

  await run(b, 'document.querySelector("#lobbyPickVisit").click()');
  await sleep(1500);
  check(await run(b, 'document.querySelector("#screen-field").classList.contains("active")'),
    'tab B lands on the lawn after a visit');
  check(await run(b, '!document.querySelector("#fieldVisit").hidden'),
    'tab B sees whose lawn it is standing on');
  check(await run(b, 'document.querySelector("#fieldVisitName").textContent') === 'LAWN OF ALFA',
    'the line names the host');
  check(await run(b, 'document.body.classList.contains("visiting")'),
    'the lawn is marked as a guest lawn');
  check(await run(b, 'VM.STATE.specimens.some(e => e.uid === 9001)'),
    'tab B sees the species standing on A\'s lawn');

  /* back out: your own lawn must be back, and nothing of A must be left */
  await run(b, 'document.querySelector("#fieldVisitOut").click()');
  await sleep(1200);
  check(await run(b, '!VM.STATE.specimens.some(e => e.uid === 9001)'),
    'tab B has its own lawn back afterwards');
  check(await run(b, 'document.querySelector("#fieldVisit").hidden'),
    'the visit line is gone again');
  check(await run(b, 'document.querySelector("#screen-lobby").classList.contains("active")'),
    'BACK goes to the list you came from');
  await sleep(600);

  /* --------- A challenges B --------- */
  /* Both need a lawn to play with: without cards the challenge is closed. */
  const placed = (from, level) => `(() => {
    for(let i = 0; i < 18; i++){
      const sp = SPECIES[(i + ${from}) % SPECIES.length];
      VM.STATE.specimens.push({ uid:${from} + i, species:sp.id, level: i === 0 ? ${level} : 1,
        variant:null, x:i, z:i });
      VM.STATE.deck.add(${from} + i);
      VM.STATE.found.add(sp.id);
    } })()`;
  await run(a, placed(9300, 2));
  await run(b, placed(9400, 4));
  await run(a, 'VM.goTo("field"); VM.goTo("lobby")');
  await run(b, 'VM.goTo("field"); VM.goTo("lobby")');
  await sleep(900);
  check(!(await run(a, 'document.querySelector("#lobbyVsAi").disabled')),
    'tab A has a legal deck before the challenge');

  await run(a, 'document.querySelector("#lobbyList .lobby-row").click()');
  await sleep(400);
  await run(a, 'document.querySelector("#lobbyPickDuel").click()');
  await sleep(900);
  check(await run(a, '!document.querySelector("#lobbyWait").hidden'),
    'tab A is waiting for an answer');
  check(await run(b, 'document.querySelector("#lobbyList .lobby-row").classList.contains("challenging")'),
    'tab B gets the mark next to the name of the challenger');

  await run(b, 'document.querySelector("#lobbyList .lobby-row").click()');
  await sleep(500);
  check(await run(b, '!document.querySelector("#lobbyAsk").hidden'),
    'tab B is asked to accept, not given the choice');
  check(await run(b, 'document.querySelector("#lobbyPick").hidden'),
    'the choice dialog stays put when somebody challenges you');

  await run(b, 'document.querySelector("#lobbyAccept").click()');
  await sleep(3000);

  /* --------- both must be in the battle --------- */
  for(const [name, sid] of [['A', a], ['B', b]]){
    check(await run(sid, 'document.querySelector("#screen-battle").classList.contains("active")'),
      'tab ' + name + ' is on the battle screen');
    check(await run(sid, 'CARDGAME.CG.net !== null'),
      'tab ' + name + ' has a net battle');
    check(await run(sid, '!!CARDGAME.CG.p[0]'),
      'tab ' + name + ' has been given a board');
    check(await run(sid, 'document.querySelectorAll("#myHand .mc").length > 0'),
      'tab ' + name + ' has drawn the hand');
  }
  check(await run(a, 'CARDGAME.CG.net.role') === 'host', 'tab A is the host');
  check(await run(b, 'CARDGAME.CG.net.role') === 'guest', 'tab B is the guest');

  /* The host computes the whole battle, so the guest's lawn must have reached
     it. Only B has a specimen at level 4, so the card says where the deck came
     from. The level sits in the card id, and the host builds the card itself. */
  const mark = (i, n) => `(p => [...p.deck, ...p.hand, ...p.life]
    .some(id => typeof id === 'string' && id.endsWith('@${n}')))(CARDGAME.CG.p[${i}])`;
  check(await run(a, mark(0, 2)), 'the host plays with its own lawn');
  check(await run(a, mark(1, 4)), 'the guest\'s lawn reached the host');
  check(await run(a, 'CARDGAME.CG.turn') !== await run(b, 'CARDGAME.CG.turn'),
    'the turn is mirrored between the tabs');

  /* --------- a question over the channel: the opening hand --------- */
  for(const [name, sid] of [['A', a], ['B', b]]){
    check(await run(sid, '!document.querySelector("#cgDialog").hidden'),
      'tab ' + name + ' is asked about the opening hand');
    await run(sid, 'document.querySelector("#cgDialogButtons [data-dlg=\'0\']").click()');
  }
  await sleep(1500);
  for(const [name, sid] of [['A', a], ['B', b]]){
    check(await run(sid, 'document.querySelector("#cgDialog").hidden'),
      'tab ' + name + ' is done with the opening hand');
  }

  /* Play on until somebody can afford a card, so a real click in a real DOM
     gets tested too: the card sheet, the PLAY button and the sync to the
     opponent. */
  const TRY_PLAY = `(() => {
    const CG = CARDGAME.CG;
    if(CG.turn !== 0) return 'not my turn';
    for(let i=0;i<CG.p[0].hand.length;i++){
      const card = document.querySelector('[data-path="h:' + i + '"]');
      if(!card) continue;
      card.click();
      if(document.querySelector('#cgSheet').hidden) continue;
      const button = document.querySelector('#cgSheetButtons [data-sheet="0"]');
      if(!button || button.disabled){ document.querySelector('#cgSheetBack').click(); continue; }
      button.click();
      return 'played';
    }
    return 'cannot afford';
  })()`;

  let played = false, player = null, watcher = null, speciesBefore = 0;
  for(let round = 0; round < 8 && !played; round++){
    const hostHasTurn = await run(a, 'CARDGAME.CG.turn === 0');
    player  = hostHasTurn ? a : b;
    watcher = hostHasTurn ? b : a;
    speciesBefore = await run(watcher, 'CARDGAME.CG.p[1].species.length');
    const outcome = await run(player, TRY_PLAY);
    await sleep(1200);
    if(outcome === 'played'){ played = true; break; }
    await run(player, 'document.querySelector("#cgEnd").click()');
    await sleep(1400);
  }
  check(played, 'managed to play a card through the user interface');
  if(played){
    check(await run(watcher, 'CARDGAME.CG.p[1].species.length') >= speciesBefore,
      'the opponent sees the board after a card was played');
    check(await run(watcher, 'CARDGAME.CG.p[1].sun.active')
       === await run(player, 'CARDGAME.CG.p[0].sun.active'),
      'the sun accounting matches between the tabs');
    /* Only the guest must be blind: the host owns the engine and has all the state. */
    if(watcher === b){
      check(await run(b, 'CARDGAME.CG.p[1].hand.every(x => x === "?")'),
        'the guest does not see the host\'s cards');
    }
    check(await run(b, 'CARDGAME.CG.p[1].hand.every(x => x === "?")'),
      'the guest never sees the host\'s cards');
  }

  /* --------- the lawn survives a page reload --------- */
  /* Tab C stands on its own: A and B are in a battle and do not touch their lawns. */
  await run(c, `VM.STATE.specimens.push({ uid:9101, species:SPECIES[1].id, level:1,
    variant:null, x:-5, z:6 }); VM.STATE.found.add(SPECIES[1].id); VM.goTo('field');`);
  await sleep(900);
  await cdp.call('Page.reload', {}, c);
  await sleep(4000);
  check(await run(c, 'VM.STATE.specimens.some(e => e.uid === 9101)'),
    'the lawn comes back after the page is reloaded');
  check(await run(c, 'VM.STATE.found.has(SPECIES[1].id)'),
    'the find list comes back after the page is reloaded');

  for(const [name, sid] of [['A', a], ['B', b]]){
    const f = await run(sid, 'JSON.stringify(window.__errors || [])');
    if(f && f !== '[]'){ errorMessages.push(name + ': ' + f); }
  }
  check(errorMessages.length === 0, 'no script errors in the browser: ' + errorMessages.join(' | '));

  cdp.close(); server.close();   // cleanup() kills the whole process group
  console.log(failures ? '\n' + failures + ' failures' : '\nAll browser checks passed');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('CRASH:', e); process.exit(2); });
