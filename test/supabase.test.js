/* The same flow as browser.test.js, but against a real Supabase instead of
   BroadcastChannel. Two separate Chrome profiles, since the session and the
   name live in localStorage: two tabs in the same browser would share an
   identity.

   Requires window.VILLMARK_NET in index.html to hold real keys, and anonymous
   sign-in to be switched on in the project. */
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
      const rel = decodeURIComponent(rq.url.split('?')[0]);
      const f = path.join(ROOT, rel === '/' ? 'index.html' : rel);
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
      '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
      '--mute-audio', 'about:blank']);
    let buf = '';
    const deadline = setTimeout(() => {
      p.kill();
      rej(new Error('Chrome did not answer in time'));
    }, 60000);
    const onData = d => {
      buf += d;
      const m = buf.match(/ws:\/\/[^\s]+/);
      if(m){
        clearTimeout(deadline);
        p.stderr.off('data', onData);
        res({ proc:p, ws:m[0] });
      }
    };
    CLEANUP.proc.push(p);
    p.stderr.on('data', onData);
  });
}

function connect(url){
  const ws = new WebSocket(url);
  let nr = 0;
  const waiting = new Map();
  const events = [];
  const ready = new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if(m.id && waiting.has(m.id)){
      const { res, rej } = waiting.get(m.id); waiting.delete(m.id);
      m.error ? rej(new Error(m.error.message)) : res(m.result);
      return;
    }
    if(m.method === 'Runtime.exceptionThrown'){
      const d = m.params.exceptionDetails;
      events.push(((d.exception && d.exception.description) || d.text) +
        ' @ ' + (d.url||'') + ':' + (d.lineNumber+1));
    }
  });
  return {
    ready, events,
    call(method, params = {}, sessionId){
      const id = ++nr;
      return new Promise((res, rej) => {
        waiting.set(id, { res, rej });
        ws.send(JSON.stringify({ id, method, params, sessionId }));
      });
    },
    close(){ ws.close(); },
  };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* A whole browser with one tab in it. */
async function newBrowser(addr){
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'villmark-sb-'));
  const { proc, ws } = await startChrome(profile);
  const cdp = connect(ws);
  await cdp.ready;
  const { targetId } = await cdp.call('Target.createTarget', { url:'about:blank' });
  const { sessionId } = await cdp.call('Target.attachToTarget', { targetId, flatten:true });
  await cdp.call('Runtime.enable', {}, sessionId);
  await cdp.call('Page.enable', {}, sessionId);
  await cdp.call('Page.navigate', { url:addr }, sessionId);

  const N = {
    proc, cdp, sessionId,
    async run(expression){
      const r = await cdp.call('Runtime.evaluate',
        { expression, returnByValue:true, awaitPromise:true }, sessionId);
      if(r.exceptionDetails){
        const d = r.exceptionDetails;
        throw new Error(((d.exception && d.exception.description) || d.text) + '  <- ' + expression);
      }
      return r.result.value;
    },
    /* cleanup() does the actual killing, and it takes the whole process group.
       If we kill the group leader here, the helper processes survive. */
    close(){ cdp.close(); },
  };
  return N;
}

/* Waits until the expression becomes true, or gives up. */
async function waitFor(N, expression, ms = 20000, name = expression){
  const deadline = Date.now() + ms;
  while(Date.now() < deadline){
    if(await N.run(expression)) return true;
    await sleep(500);
  }
  console.log('   gave up waiting for: ' + name);
  return false;
}

(async () => {
  const conf = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  if(/anonKey:\s*''/.test(conf)){
    console.log('No keys in index.html - skipping. This test needs a real Supabase.');
    process.exit(0);
  }

  const server = await startServer();
  const addr = 'http://127.0.0.1:' + server.address().port + '/';

  const A = await newBrowser(addr);
  const B = await newBrowser(addr);

  for(const [name, N] of [['A', A], ['B', B]]){
    check(await waitFor(N, 'typeof NET === "object" && typeof VM === "object"', 30000,
      'the scripts in ' + name), 'browser ' + name + ' loaded the scripts');
    check(await N.run('NET.LOCAL_MODE') === false,
      'browser ' + name + ' uses the real Supabase, not test mode');
    await N.run('VM.goTo("lobby")');
  }

  /* sign-in */
  check(await waitFor(A, 'NET.me.id !== null', 25000, 'sign-in A'), 'browser A signed in');
  check(await waitFor(B, 'NET.me.id !== null', 25000, 'sign-in B'), 'browser B signed in');
  const idA = await A.run('NET.me.id'), idB = await B.run('NET.me.id');
  check(idA && idB && idA !== idB, 'the two got a user id each');
  check(await waitFor(A, 'NET.state() === "online"', 25000, 'A registered'),
    'browser A is registered with the server, not merely connected');
  check(await waitFor(B, 'NET.state() === "online"', 25000, 'B registered'),
    'browser B is registered with the server, not merely connected');

  await A.run('NET.setName("ALFA")');
  await B.run('NET.setName("BETA")');

  /* presence */
  check(await waitFor(A, 'document.querySelectorAll("#lobbyList .lobby-row").length === 1', 25000,
    'A sees B in the list'), 'browser A sees the other player');
  check(await waitFor(B, 'document.querySelectorAll("#lobbyList .lobby-row").length === 1', 25000,
    'B sees A in the list'), 'browser B sees the other player');
  /* Asymmetry is the dangerous failure: one sees the other, but not the other way round. */
  check(await A.run('NET.players().length') === 1
     && await B.run('NET.players().length') === 1,
    'both see each other, no asymmetry');
  /* A name change reaches the others over presence, but not instantly. */
  check(await waitFor(A, 'document.querySelector("#lobbyList .lobby-row-name").textContent === "BETA"',
    20000, 'the name BETA'), 'the name travels over presence');

  /* Both sides need a lawn to play with: a deck that is too small declines the
     challenge instead of starting a battle that is already decided. */
  const placed = from => `(() => {
    for(let i = 0; i < 18; i++){
      const sp = SPECIES[(i + ${from}) % SPECIES.length];
      VM.STATE.specimens.push({ uid:${from} + i, species:sp.id, level:1,
        variant:null, x:i, z:i });
      VM.STATE.deck.add(${from} + i);
      VM.STATE.found.add(sp.id);
    }
    VM.goTo('field'); VM.goTo('lobby'); })()`;
  await A.run(placed(9300));
  await B.run(placed(9400));
  await sleep(900);

  /* challenge */
  await A.run('document.querySelector("#lobbyList .lobby-row").click()');
  await sleep(500);
  await A.run('document.querySelector("#lobbyPickDuel").click()');
  check(await waitFor(B, 'document.querySelector("#lobbyList .lobby-row").classList.contains("challenging")',
    20000, 'the challenge arrives'), 'the challenge reaches the other side');

  await B.run('document.querySelector("#lobbyList .lobby-row").click()');
  await sleep(600);
  check(await B.run('!document.querySelector("#lobbyAsk").hidden'), 'B is asked to accept');
  await B.run('document.querySelector("#lobbyAccept").click()');

  /* the battle */
  check(await waitFor(A, '!!CARDGAME.CG.p[0]', 30000, 'A gets a board'), 'browser A is in the battle');
  check(await waitFor(B, '!!CARDGAME.CG.p[0]', 30000, 'B gets a board'), 'browser B is in the battle');
  check(await A.run('CARDGAME.CG.net.role') === 'host', 'A is the host');
  check(await B.run('CARDGAME.CG.net.role') === 'guest', 'B is the guest');
  check(await A.run('CARDGAME.CG.turn') !== await B.run('CARDGAME.CG.turn'),
    'the turn is mirrored between the two');
  check(await B.run('CARDGAME.CG.p[1].hand.every(x => x === "?")'),
    'the guest does not see the host\'s cards');

  /* the opening hand goes over the channel */
  check(await waitFor(A, '!document.querySelector("#cgDialog").hidden', 15000, 'dialog A'),
    'A is asked about the opening hand');
  await A.run('document.querySelector("#cgDialogButtons [data-dlg=\'0\']").click()');
  check(await waitFor(B, '!document.querySelector("#cgDialog").hidden', 20000, 'dialog B'),
    'the question about the opening hand reaches the guest over the network');
  await B.run('document.querySelector("#cgDialogButtons [data-dlg=\'0\']").click()');
  await sleep(2500);

  /* a move must sync both ways */
  const TRY = `(() => {
    const CG = CARDGAME.CG;
    if(CG.turn !== 0) return 'not my turn';
    for(let i=0;i<CG.p[0].hand.length;i++){
      const k = document.querySelector('[data-path="h:' + i + '"]');
      if(!k) continue;
      k.click();
      if(document.querySelector('#cgSheet').hidden) continue;
      const btn = document.querySelector('#cgSheetButtons [data-sheet="0"]');
      if(!btn || btn.disabled){ document.querySelector('#cgSheetBack').click(); continue; }
      btn.click();
      return 'played';
    }
    return 'cannot afford';
  })()`;

  let played = false, player = null, watcher = null;
  for(let round = 0; round < 8 && !played; round++){
    const aHasTurn = await A.run('CARDGAME.CG.turn === 0');
    player  = aHasTurn ? A : B;
    watcher = aHasTurn ? B : A;
    if(await player.run(TRY) === 'played'){ played = true; break; }
    await player.run('document.querySelector("#cgEnd").click()');
    await sleep(2500);
  }
  check(played, 'managed to play a card');
  if(played){
    await sleep(2500);
    const mine = await player.run('CARDGAME.CG.p[0].sun.active');
    check(await waitFor(watcher, 'CARDGAME.CG.p[1].sun.active === ' + mine, 15000, 'sun sync'),
      'the move syncs over the network to the opponent');
  }

  const errors = [...A.cdp.events, ...B.cdp.events];
  check(errors.length === 0, 'no script errors: ' + errors.join(' | '));

  A.close(); B.close(); server.close();
  console.log(failures ? '\n' + failures + ' failures' : '\nAll Supabase checks passed');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('CRASH:', e); process.exit(2); });
