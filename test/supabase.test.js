/* Samme flyt som nettleser.test.js, men mot ekte Supabase i stedet for
   BroadcastChannel. To atskilte Chrome-profiler, siden okta og navn ligger i
   localStorage: to faner i samme nettleser ville delt identitet.

   Krever at window.VILLMARK_NETT i index.html har ekte noekler, og at
   anonym innlogging er slaatt paa i prosjektet. */
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

/* Alle nettlesere og profiler vi starter, slik at ingenting blir staaende
   igjen om testen feiler midtveis. */
const RYDD = { proc:[], mapper:[] };
function rydd(){
  for(const p of RYDD.proc){ try { p.kill('SIGKILL'); } catch {} }
  /* Chrome starter en haug hjelpeprosesser som overlever at hovedprosessen
     doer. De henger sammen om profilmappa, saa den er noekkelen vi rydder paa. */
  for(const m of RYDD.mapper){
    /* Moensteret maa ikke starte med bindestrek: pkill leser det som et flagg. */
    try { execFileSync('pkill', ['-9', '-f', m]); } catch {}
  }
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
    const frist = setTimeout(() => {
      p.kill();
      rej(new Error('Chrome svarte ikke innen fristen'));
    }, 60000);
    const paaData = d => {
      buf += d;
      const m = buf.match(/ws:\/\/[^\s]+/);
      if(m){
        clearTimeout(frist);
        p.stderr.off('data', paaData);
        res({ proc:p, ws:m[0] });
      }
    };
    RYDD.proc.push(p);
    p.stderr.on('data', paaData);
  });
}

function kobleTil(url){
  const ws = new WebSocket(url);
  let nr = 0;
  const venter = new Map();
  const hendelser = [];
  const klar = new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if(m.id && venter.has(m.id)){
      const { res, rej } = venter.get(m.id); venter.delete(m.id);
      m.error ? rej(new Error(m.error.message)) : res(m.result);
      return;
    }
    if(m.method === 'Runtime.exceptionThrown'){
      const d = m.params.exceptionDetails;
      hendelser.push(((d.exception && d.exception.description) || d.text) +
        ' @ ' + (d.url||'') + ':' + (d.lineNumber+1));
    }
  });
  return {
    klar, hendelser,
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

/* En hel nettleser med en fane i. */
async function nyNettleser(adr){
  const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'villmark-sb-'));
  const { proc, ws } = await startChrome(profil);
  const cdp = kobleTil(ws);
  await cdp.klar;
  const { targetId } = await cdp.kall('Target.createTarget', { url:'about:blank' });
  const { sessionId } = await cdp.kall('Target.attachToTarget', { targetId, flatten:true });
  await cdp.kall('Runtime.enable', {}, sessionId);
  await cdp.kall('Page.enable', {}, sessionId);
  await cdp.kall('Page.navigate', { url:adr }, sessionId);

  const N = {
    proc, cdp, sessionId,
    async kjor(uttrykk){
      const r = await cdp.kall('Runtime.evaluate',
        { expression:uttrykk, returnByValue:true, awaitPromise:true }, sessionId);
      if(r.exceptionDetails){
        const d = r.exceptionDetails;
        throw new Error(((d.exception && d.exception.description) || d.text) + '  <- ' + uttrykk);
      }
      return r.result.value;
    },
    /* Selve drepingen gjor rydd(), som tar hele prosessgruppa. Dreper vi
       gruppelederen her, overlever hjelpeprosessene. */
    lukk(){ cdp.lukk(); },
  };
  return N;
}

/* Venter til uttrykket blir sant, eller gir opp. */
async function vent(N, uttrykk, ms = 20000, navn = uttrykk){
  const frist = Date.now() + ms;
  while(Date.now() < frist){
    if(await N.kjor(uttrykk)) return true;
    await sov(500);
  }
  console.log('   ga opp aa vente paa: ' + navn);
  return false;
}

(async () => {
  const konf = fs.readFileSync(path.join(ROT, 'index.html'), 'utf8');
  if(/anonKey:\s*''/.test(konf)){
    console.log('Ingen noekler i index.html - hopper over. Denne testen krever ekte Supabase.');
    process.exit(0);
  }

  const tjener = await startTjener();
  const adr = 'http://127.0.0.1:' + tjener.address().port + '/';

  const A = await nyNettleser(adr);
  const B = await nyNettleser(adr);

  for(const [navn, N] of [['A', A], ['B', B]]){
    sjekk(await vent(N, 'typeof NETT === "object" && typeof VM === "object"', 30000,
      'skriptene i ' + navn), 'nettleser ' + navn + ' lastet skriptene');
    sjekk(await N.kjor('NETT.LOKAL_MODUS') === false,
      'nettleser ' + navn + ' bruker ekte Supabase, ikke testmodus');
    await N.kjor('VM.gaTil("lobby")');
  }

  /* innlogging */
  sjekk(await vent(A, 'NETT.meg.id !== null', 25000, 'innlogging A'), 'nettleser A logget inn');
  sjekk(await vent(B, 'NETT.meg.id !== null', 25000, 'innlogging B'), 'nettleser B logget inn');
  const idA = await A.kjor('NETT.meg.id'), idB = await B.kjor('NETT.meg.id');
  sjekk(idA && idB && idA !== idB, 'de to fikk hver sin bruker-id');
  sjekk(await A.kjor('document.querySelector("#lobStatus").textContent') === 'PÅNETT',
    'lobbyen melder PAANETT');

  await A.kjor('NETT.settNavn("ALFA")');
  await B.kjor('NETT.settNavn("BETA")');

  /* presence */
  sjekk(await vent(A, 'document.querySelectorAll("#lobListe .lob-rad").length === 1', 25000,
    'A ser B i lista'), 'nettleser A ser den andre spilleren');
  sjekk(await vent(B, 'document.querySelectorAll("#lobListe .lob-rad").length === 1', 25000,
    'B ser A i lista'), 'nettleser B ser den andre spilleren');
  /* Et navnebytte naar de andre via presence, men ikke oyeblikkelig. */
  sjekk(await vent(A, 'document.querySelector("#lobListe .lob-rad-navn").textContent === "BETA"',
    20000, 'navnet BETA'), 'navnet foelger med over presence');

  /* utfordring */
  await A.kjor('document.querySelector("#lobListe .lob-rad").click()');
  sjekk(await vent(B, 'document.querySelector("#lobListe .lob-rad").classList.contains("utfordrer")',
    20000, 'utfordringen naar fram'), 'utfordringen naar fram til den andre');

  await B.kjor('document.querySelector("#lobListe .lob-rad").click()');
  await sov(600);
  sjekk(await B.kjor('!document.querySelector("#lobSpor").hidden'), 'B faar spoersmaal om aa godta');
  await B.kjor('document.querySelector("#lobGodta").click()');

  /* kampen */
  sjekk(await vent(A, '!!KORTSPILL.KS.p[0]', 30000, 'A faar brett'), 'nettleser A er i kampen');
  sjekk(await vent(B, '!!KORTSPILL.KS.p[0]', 30000, 'B faar brett'), 'nettleser B er i kampen');
  sjekk(await A.kjor('KORTSPILL.KS.nett.rolle') === 'vert', 'A er vert');
  sjekk(await B.kjor('KORTSPILL.KS.nett.rolle') === 'gjest', 'B er gjest');
  sjekk(await A.kjor('KORTSPILL.KS.tur') !== await B.kjor('KORTSPILL.KS.tur'),
    'turen er speilvendt mellom de to');
  sjekk(await B.kjor('KORTSPILL.KS.p[1].hand.every(x => x === "?")'),
    'gjesten ser ikke vertens kort');

  /* aapningshanda gaar over kanalen */
  sjekk(await vent(A, '!document.querySelector("#ksDialog").hidden', 15000, 'dialog A'),
    'A faar spoersmaal om aapningshanda');
  await A.kjor('document.querySelector("#ksDialogKnapper [data-dlg=\'0\']").click()');
  sjekk(await vent(B, '!document.querySelector("#ksDialog").hidden', 20000, 'dialog B'),
    'spoersmaalet om aapningshanda naar gjesten over nettet');
  await B.kjor('document.querySelector("#ksDialogKnapper [data-dlg=\'0\']").click()');
  await sov(2500);

  /* et trekk skal synkes begge veier */
  const PROVE = `(() => {
    const KS = KORTSPILL.KS;
    if(KS.tur !== 0) return 'ikke min tur';
    for(let i=0;i<KS.p[0].hand.length;i++){
      const k = document.querySelector('[data-sti="h:' + i + '"]');
      if(!k) continue;
      k.click();
      if(document.querySelector('#ksArk').hidden) continue;
      const kn = document.querySelector('#ksArkKnapper [data-ark="0"]');
      if(!kn || kn.disabled){ document.querySelector('#ksArkBak').click(); continue; }
      kn.click();
      return 'spilte';
    }
    return 'ingen raad';
  })()`;

  let spilte = false, spiller = null, seer = null;
  for(let runde = 0; runde < 8 && !spilte; runde++){
    const aHarTuren = await A.kjor('KORTSPILL.KS.tur === 0');
    spiller = aHarTuren ? A : B;
    seer    = aHarTuren ? B : A;
    if(await spiller.kjor(PROVE) === 'spilte'){ spilte = true; break; }
    await spiller.kjor('document.querySelector("#ksAvslutt").click()');
    await sov(2500);
  }
  sjekk(spilte, 'fikk spilt et kort');
  if(spilte){
    await sov(2500);
    const mine = await spiller.kjor('KORTSPILL.KS.p[0].sol.aktiv');
    sjekk(await vent(seer, 'KORTSPILL.KS.p[1].sol.aktiv === ' + mine, 15000, 'synk av sol'),
      'trekket synkes over nettet til motparten');
  }

  const utfeil = [...A.cdp.hendelser, ...B.cdp.hendelser];
  sjekk(utfeil.length === 0, 'ingen skriptfeil: ' + utfeil.join(' | '));

  A.lukk(); B.lukk(); tjener.close();
  console.log(feil ? '\n' + feil + ' feil' : '\nAlle Supabase-sjekker gikk gjennom');
  process.exit(feil ? 1 : 0);
})().catch(e => { console.error('KRASJ:', e); process.exit(2); });
