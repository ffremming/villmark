/* The scan must not hold the camera while the models run. An iPhone ran out of
   memory and WebKit killed the tab right after the answer came up.

   So: SCAN copies one frame, shuts the camera off, and the still stands in the
   viewfinder until SCAN AGAIN brings the camera back. These checks run with
   Chrome's fake camera, and the classifier is stubbed - a real scan would pull
   45 MB from Hugging Face. */
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

const CLEANUP = { proc:[], dirs:[] };
function cleanup(){
  for(const p of CLEANUP.proc){ try { p.kill('SIGKILL'); } catch {} }
  for(const d of CLEANUP.dirs){ try { execFileSync('pkill', ['-9', '-f', d]); } catch {} }
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
      '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream',
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

function connect(url){
  const ws = new WebSocket(url);
  let nr = 0;
  const waiting = new Map();
  const ready = new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if(m.id && waiting.has(m.id)){
      const { res, rej } = waiting.get(m.id); waiting.delete(m.id);
      m.error ? rej(new Error(m.error.message)) : res(m.result);
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
  };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const server = await startServer();
  const addr = 'http://127.0.0.1:' + server.address().port + '/';
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'villmark-camera-'));
  const { ws } = await startChrome(profile);
  const cdp = connect(ws);
  await cdp.ready;

  const { targetId } = await cdp.call('Target.createTarget', { url:'about:blank' });
  const { sessionId } = await cdp.call('Target.attachToTarget', { targetId, flatten:true });
  await cdp.call('Runtime.enable', {}, sessionId);
  await cdp.call('Page.enable', {}, sessionId);
  await cdp.call('Page.navigate', { url:addr }, sessionId);
  await sleep(3500);

  async function run(expression){
    const r = await cdp.call('Runtime.evaluate',
      { expression, returnByValue:true, awaitPromise:true }, sessionId);
    if(r.exceptionDetails){
      const d = r.exceptionDetails;
      throw new Error(((d.exception && (d.exception.description || d.exception.value)) || d.text) + '  <- ' + expression);
    }
    return r.result.value;
  }

  /* The stub answers the way a certain species hit does, so the whole path
     after the answer runs: voxel model, materialize, ACCEPT. */
  await run(`(() => {
    window.__classifyCalls = [];
    CLASSIFIER.classify = async (source) => {
      window.__classifyCalls.push({
        tag: source.tagName,
        live: source.tagName === 'VIDEO',
        w: source.width || source.videoWidth,
      });
      return { id: SPECIES[0].id, level:0, levelText:'CERTAIN',
               latin: SPECIES[0].sci, common: SPECIES[0].name, p:0.91, source:'inat21' };
    };
    return true;
  })()`);

  const cam = () => run(`(() => {
    const v = document.querySelector('#camFeed');
    const still = document.querySelector('#camStill');
    const s = v.srcObject;
    return {
      stream: !!s,
      live: s ? s.getTracks().some(t => t.readyState === 'live') : false,
      stillShown: !still.hidden,
      stillSize: still.width + 'x' + still.height,
      readout: document.querySelector('#scanReadout').textContent,
    };
  })()`);

  /* --- 1. the scan screen turns the camera on --- */
  await run(`VM.goTo('scan')`);
  await sleep(1500);
  let c = await cam();
  check(c.stream && c.live, 'the scan screen gives a live camera');
  check(!c.stillShown, 'no still frame while the camera is live');

  /* --- 2. SCAN copies a frame and lets the camera go --- */
  await run('document.querySelector("#scanGo").click()');
  await sleep(1800);
  c = await cam();
  const calls = await run('window.__classifyCalls');
  check(calls.length === 1, 'the classifier was called once');
  check(calls[0] && calls[0].tag === 'CANVAS',
    'the models get a still frame, not the live camera: ' + (calls[0] && calls[0].tag));
  check(calls[0] && calls[0].w > 0 && calls[0].w <= 1024,
    'the frame is scaled down, not full sensor size: ' + (calls[0] && calls[0].w));
  check(!c.stream && !c.live, 'the camera is off while the models work');
  check(c.stillShown, 'the still frame stands in the viewfinder');
  check(/\d+ %/.test(c.readout), 'the answer reached the frame: ' + c.readout);

  /* --- 3. SCAN AGAIN gives the live camera back --- */
  await run('document.querySelector("#scanRetry").click()');
  await sleep(1500);
  c = await cam();
  check(c.stream && c.live, 'SCAN AGAIN turns the camera back on');
  check(!c.stillShown, 'the still frame is taken down again');

  /* --- 4. a second scan works, and only starts one camera --- */
  await run('document.querySelector("#scanGo").click()');
  await sleep(1800);
  check((await run('window.__classifyCalls')).length === 2, 'the second scan runs too');
  c = await cam();
  check(!c.live, 'the camera is off again after the second scan');

  /* --- 5. leaving the scan screen leaves nothing running --- */
  await run(`VM.goTo('field')`);
  await sleep(500);
  c = await cam();
  check(!c.stream && !c.live, 'leaving the scanner stops the camera');

  cdp.close();
  server.close();
  cleanup();
  console.log(failures ? '\n' + failures + ' failed' : '\nAll camera tests passed');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); cleanup(); process.exit(1); });
