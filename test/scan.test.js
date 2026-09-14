/* Sjekker at skanneren aldri gjetter: uten modell skal den si fra og tilby
   SKANN PAA NYTT, og tilfeldig-knappen skal gi en art uten aa paastaa prosent. */
const { spawn, execFileSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROT = path.join(__dirname, '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

let feil = 0;
const sjekk = (ok, hva) => { if(!ok){ feil++; console.log('FEIL: ' + hva); } else console.log('ok  - ' + hva); };

const TYPER = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
  '.json':'application/json', '.png':'image/png' };

function startTjener(){
  return new Promise(res => {
    const t = http.createServer((rq, rs) => {
      const rel = decodeURIComponent(rq.url.split('?')[0]);
      const f = path.join(ROT, rel === '/' ? 'index.html' : rel);
      fs.readFile(f, (e, d) => {
        if(e){ rs.writeHead(404); rs.end(); return; }
        rs.writeHead(200, { 'content-type': TYPER[path.extname(f)] || 'application/octet-stream' });
        rs.end(d);
      });
    });
    t.listen(0, '127.0.0.1', () => res(t));
  });
}

const RYDD = { proc:[], mapper:[] };
function rydd(){
  for(const p of RYDD.proc){ try { p.kill('SIGKILL'); } catch {} }
  for(const m of RYDD.mapper){ try { execFileSync('pkill', ['-9', '-f', m]); } catch {} }
  for(const m of RYDD.mapper){ try { fs.rmSync(m, { recursive:true, force:true }); } catch {} }
  RYDD.proc = []; RYDD.mapper = [];
}
process.on('exit', rydd);
for(const sig of ['SIGINT','SIGTERM']) process.on(sig, () => { rydd(); process.exit(1); });

function startChrome(profil){
  RYDD.mapper.push(profil);
  return new Promise((res, rej) => {
    const p = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0',
      '--user-data-dir=' + profil, '--no-first-run', '--no-default-browser-check',
      '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
      '--mute-audio', 'about:blank']);
    let buf = '';
    const paaData = d => {
      buf += d;
      const m = buf.match(/ws:\/\/[^\s]+/);
      if(m){ p.stderr.off('data', paaData); res({ proc:p, ws:m[0] }); }
    };
    RYDD.proc.push(p);
    p.stderr.on('data', paaData);
    setTimeout(() => rej(new Error('Chrome svarte ikke')), 20000);
  });
}

function kobleTil(url){
  const ws = new WebSocket(url);
  let nr = 0;
  const venter = new Map();
  const klar = new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if(m.id && venter.has(m.id)){
      const { res, rej } = venter.get(m.id); venter.delete(m.id);
      m.error ? rej(new Error(m.error.message)) : res(m.result);
    }
  });
  return {
    klar,
    kall(metode, params = {}, sessionId){
      const id = ++nr;
      return new Promise((res, rej) => {
        venter.set(id, { res, rej });
        ws.send(JSON.stringify({ id, method:metode, params, sessionId }));
      });
    },
    lukk(){ ws.close(); },
  };
}

const sov = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const tjener = await startTjener();
  const adr = 'http://127.0.0.1:' + tjener.address().port + '/';
  const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'villmark-skann-'));
  const { ws } = await startChrome(profil);
  const cdp = kobleTil(ws);
  await cdp.klar;

  const { targetId } = await cdp.kall('Target.createTarget', { url:'about:blank' });
  const { sessionId } = await cdp.kall('Target.attachToTarget', { targetId, flatten:true });
  await cdp.kall('Runtime.enable', {}, sessionId);
  await cdp.kall('Page.enable', {}, sessionId);
  await cdp.kall('Page.addScriptToEvaluateOnNewDocument', { source:
    "window.__sidefeil=[];addEventListener('error',e=>window.__sidefeil.push(String(e.message)+' @ '+(e.filename||'')+':'+e.lineno));" }, sessionId);
  await cdp.kall('Page.navigate', { url:adr }, sessionId);
  await sov(3500);

  async function kjor(uttrykk){
    const r = await cdp.kall('Runtime.evaluate',
      { expression:uttrykk, returnByValue:true, awaitPromise:true }, sessionId);
    if(r.exceptionDetails){
      const d = r.exceptionDetails;
      throw new Error(((d.exception && (d.exception.description || d.exception.value)) || d.text) + '  <- ' + uttrykk);
    }
    return r.result.value;
  }

  sjekk(await kjor('typeof KLASSIFISER === "object"'), 'klassifiser.js lastet');

  const knapper = () => kjor(`(() => {
    const id = s => document.querySelector(s);
    return { go:!id('#scanGo').hidden, godta:!id('#scanGodta').hidden,
             retry:!id('#scanRetry').hidden, rnd:!id('#scanRandom').hidden,
             ruta: id('#scanReadout').textContent };
  })()`);

  /* --- 1. skanneruta i utgangsstilling --- */
  await kjor('VM.gaTil("scan")');
  await sov(1200);
  let k = await knapper();
  sjekk(k.go && !k.godta && !k.retry && k.rnd, 'klar: SKANN + TILFELDIG, ingen GODTA/RETRY');

  /* --- 2. skann uten kamera skal si fra, ikke gjette --- */
  await kjor('document.querySelector("#scanGo").click()');
  await sov(600);
  k = await knapper();
  sjekk(!k.go && !k.godta && k.retry, 'feil: SKANN PAA NYTT vises, GODTA ikke');
  sjekk(/INGEN KAMERA|INGEN ARTSMODELL|FEIL:|MODELLEN/.test(k.ruta), 'feil: ruta sier hvorfor: ' + k.ruta);
  sjekk(!/%/.test(k.ruta), 'feil: ingen prosent i ruta');
  sjekk(await kjor('VM.STATE.malArt === null'), 'feil: ingen art satt');

  /* --- 3. SKANN PAA NYTT gir klar stilling igjen --- */
  await kjor('document.querySelector("#scanRetry").click()');
  await sov(300);
  k = await knapper();
  sjekk(k.go && !k.godta && !k.retry, 'retry: tilbake til klar');

  /* --- 4. GI MEG EN TILFELDIG gir art, uten prosent --- */
  await kjor('document.querySelector("#scanRandom").click()');
  await sov(3000);
  k = await knapper();
  sjekk(k.godta && k.retry && !k.go, 'tilfeldig: GODTA + SKANN PAA NYTT');
  sjekk(/TILFELDIG TREKNING/.test(k.ruta), 'tilfeldig: ruta merker trekningen: ' + k.ruta);
  sjekk(!/%/.test(k.ruta) && !/SIKKER/.test(k.ruta), 'tilfeldig: ingen prosent, ingen SIKKER');
  sjekk(await kjor('typeof VM.STATE.malArt === "string"'), 'tilfeldig: art satt');

  /* --- 5. retry etter treff kaster arten --- */
  await kjor('document.querySelector("#scanRetry").click()');
  await sov(300);
  sjekk(await kjor('VM.STATE.malArt === null'), 'retry etter treff: arten kastet');

  /* --- 6. GODTA gaar til funn --- */
  await kjor('document.querySelector("#scanRandom").click()');
  await sov(3000);
  await kjor('document.querySelector("#scanGodta").click()');
  await sov(600);
  sjekk(await kjor('document.querySelector("#screen-reveal").classList.contains("active")'),
    'godta: funnskjermen aapner');

  cdp.lukk();
  tjener.close();
  rydd();
  console.log(feil ? '\n' + feil + ' feilet' : '\nAlle skanntester gikk gjennom');
  process.exit(feil ? 1 : 0);
})().catch(e => { console.error(e); rydd(); process.exit(1); });
