/* Aapner spillet i to faner i ekte Chrome, lar den ene utfordre den andre og
   sjekker at begge havner i samme kamp. Styres over DevTools-protokollen,
   saa testen trenger ingen pakker. */
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
      const f = path.join(ROT, decodeURIComponent(rq.url.split('?')[0]) === '/' ? 'index.html'
        : decodeURIComponent(rq.url.split('?')[0]));
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
      /* headless Chrome har ingen GPU: programvarerendering gir WebGL likevel */
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

/* --------- minimal DevTools-klient --------- */
function kobleTil(url){
  const ws = new WebSocket(url);
  let nr = 0;
  const venter = new Map();
  const klar = new Promise(r => ws.addEventListener('open', r));
  const hendelser = [];
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if(m.id && venter.has(m.id)){
      const { res, rej } = venter.get(m.id); venter.delete(m.id);
      m.error ? rej(new Error(m.error.message)) : res(m.result);
      return;
    }
    if(m.method === 'Runtime.exceptionThrown'){
      const d = m.params.exceptionDetails;
      hendelser.push((m.sessionId||'?') + ' ' +
        ((d.exception && d.exception.description) || d.text) +
        ' @ ' + (d.url||'') + ':' + (d.lineNumber+1));
    }
    if(m.method === 'Log.entryAdded' && m.params.entry.level === 'error'){
      hendelser.push((m.sessionId||'?') + ' LOG ' + m.params.entry.text +
        ' @ ' + (m.params.entry.url||''));
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
    hendelser,
  };
}

const sov = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const tjener = await startTjener();
  const adr = 'http://127.0.0.1:' + tjener.address().port + '/?fake-nett';
  const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'villmark-'));
  const { proc, ws } = await startChrome(profil);
  const cdp = kobleTil(ws);
  await cdp.klar;

  const feilmeldinger = [];

  async function nyFane(){
    const { targetId } = await cdp.kall('Target.createTarget', { url:'about:blank' });
    const { sessionId } = await cdp.kall('Target.attachToTarget', { targetId, flatten:true });
    await cdp.kall('Runtime.enable', {}, sessionId);
    await cdp.kall('Log.enable', {}, sessionId);
    await cdp.kall('Page.enable', {}, sessionId);
    await cdp.kall('Page.addScriptToEvaluateOnNewDocument', { source:
      "window.__lastfeil=[];addEventListener('error',e=>window.__lastfeil.push(String(e.message)+' @ '+(e.filename||'')+':'+e.lineno));" +
      "addEventListener('unhandledrejection',e=>window.__lastfeil.push('rejection: '+e.reason));" }, sessionId);
    await cdp.kall('Page.navigate', { url:adr }, sessionId);
    return sessionId;
  }
  async function kjor(sid, uttrykk){
    const r = await cdp.kall('Runtime.evaluate',
      { expression:uttrykk, returnByValue:true, awaitPromise:true }, sid);
    if(r.exceptionDetails){
      const d = r.exceptionDetails;
      const melding = (d.exception && (d.exception.description || d.exception.value)) || d.text;
      throw new Error(melding + '  <- ' + uttrykk);
    }
    return r.result.value;
  }

  const a = await nyFane();
  const b = await nyFane();
  await sov(3500);

  /* samle opp feil fra begge faner */
  for(const [navn, sid] of [['A', a], ['B', b]]){
    const f = await kjor(sid, `(() => { window.__feil = window.__feil || [];
      if(!window.__hekta){ window.__hekta = true;
        window.addEventListener('error', e => window.__feil.push(String(e.message)));
      }
      return window.__feil; })()`);
    void navn; void f;
  }


  /* --------- last lobbyen i begge faner --------- */
  for(const sid of [a, b]){
    sjekk(await kjor(sid, 'typeof NETT === "object" && typeof LOBBY === "object" && typeof KORTSPILL === "object"'),
      'skriptene lastet i fanen');
    await kjor(sid, 'VM.gaTil("lobby")');
  }
  await sov(1500);

  await kjor(a, 'NETT.settNavn("ALFA")');
  await kjor(b, 'NETT.settNavn("BETA")');
  await sov(2500);

  const listeA = await kjor(a, 'document.querySelectorAll("#lobListe .lob-rad").length');
  const listeB = await kjor(b, 'document.querySelectorAll("#lobListe .lob-rad").length');
  sjekk(listeA === 1, 'fane A ser den andre spilleren (fikk ' + listeA + ')');
  sjekk(listeB === 1, 'fane B ser den andre spilleren (fikk ' + listeB + ')');
  sjekk(await kjor(a, 'document.querySelector("#lobListe .lob-rad-navn").textContent') === 'BETA',
    'fane A ser riktig navn paa motparten');

  /* --------- enspillerkampen skal fortsatt virke --------- */
  const c = await nyFane();
  await sov(3000);
  await kjor(c, 'VM.gaTil("lobby")');
  await sov(800);
  await kjor(c, 'document.querySelector("#lobMotAI").click()');
  await sov(1500);
  sjekk(await kjor(c, 'KORTSPILL.KS.nett === null'),
    'enspillerkampen bruker ikke nettet');
  sjekk(await kjor(c, 'KORTSPILL.KS.p[1].styring') === 'ai',
    'motstanderen i enspillerkampen styres av maskinen');
  sjekk(await kjor(c, 'document.querySelectorAll("#myHand .kk").length > 0'),
    'enspillerkampen har tegnet handa');
  await kjor(c, 'VM.gaTil("field")');
  await sov(400);

  /* --------- B besoeker plenen til A --------- */
  /* A setter ut en art, saa det er noe aa se paa hos naboen. */
  await kjor(a, `VM.STATE.eksemplarer.push({ uid:9001, art:SPECIES[0].id, niva:1,
    variant:null, x:4, z:4 }); VM.STATE.funnet.add(SPECIES[0].id); VM.gaTil('field');`);
  await sov(900);
  /* Lagringen venter litt paa flere endringer foer den skriver, saa vi ser
     etter den i stedet for aa gjette paa en pause. */
  let skrevet = false;
  for(let i = 0; i < 12 && !skrevet; i++){
    skrevet = await kjor(a, `(() => { const d = JSON.parse(localStorage.getItem('villmark-plen-v1') || '{}');
      return (d.eksemplarer || []).some(e => e.uid === 9001); })()`);
    if(!skrevet) await sov(400);
  }
  sjekk(skrevet, 'plenen skrives til telefonen naar den endrer seg');
  await kjor(a, 'VM.gaTil("lobby")');
  await sov(900);

  await kjor(b, 'document.querySelector("#lobListe .lob-rad").click()');
  await sov(400);
  sjekk(await kjor(b, '!document.querySelector("#lobVelg").hidden'),
    'fane B faar valget mellom aa besoeke og aa utfordre');

  await kjor(b, 'document.querySelector("#lobVelgBesok").click()');
  await sov(1500);
  sjekk(await kjor(b, 'document.querySelector("#screen-field").classList.contains("active")'),
    'fane B havner paa plenen etter et besoek');
  sjekk(await kjor(b, '!document.querySelector("#feltBesok").hidden'),
    'fane B ser hvem sin plen den staar paa');
  sjekk(await kjor(b, 'document.querySelector("#feltBesokNavn").textContent') === 'PLENEN TIL ALFA',
    'linja navngir verten');
  sjekk(await kjor(b, 'document.body.classList.contains("visiting")'),
    'plenen er merket som gjesteplen');
  sjekk(await kjor(b, 'VM.STATE.eksemplarer.some(e => e.uid === 9001)'),
    'fane B ser arten som staar paa plenen til A');

  /* ut igjen: egen plen skal vaere tilbake, og ingenting av A skal henge igjen */
  await kjor(b, 'document.querySelector("#feltBesokUt").click()');
  await sov(1200);
  sjekk(await kjor(b, '!VM.STATE.eksemplarer.some(e => e.uid === 9001)'),
    'fane B har sin egen plen tilbake etterpaa');
  sjekk(await kjor(b, 'document.querySelector("#feltBesok").hidden'),
    'besoekslinja er borte igjen');
  sjekk(await kjor(b, 'document.querySelector("#screen-lobby").classList.contains("active")'),
    'TILBAKE gaar til lista du kom fra');
  await sov(600);

  /* --------- A utfordrer B --------- */
  await kjor(a, 'document.querySelector("#lobListe .lob-rad").click()');
  await sov(400);
  await kjor(a, 'document.querySelector("#lobVelgDyst").click()');
  await sov(900);
  sjekk(await kjor(a, '!document.querySelector("#lobVent").hidden'),
    'fane A venter paa svar');
  sjekk(await kjor(b, 'document.querySelector("#lobListe .lob-rad").classList.contains("utfordrer")'),
    'fane B faar merket ved navnet til den som utfordrer');

  await kjor(b, 'document.querySelector("#lobListe .lob-rad").click()');
  await sov(500);
  sjekk(await kjor(b, '!document.querySelector("#lobSpor").hidden'),
    'fane B faar spoersmaal om aa godta, ikke valget');
  sjekk(await kjor(b, 'document.querySelector("#lobVelg").hidden'),
    'valgdialogen ligger stille naar noen utfordrer deg');

  await kjor(b, 'document.querySelector("#lobGodta").click()');
  await sov(3000);

  /* --------- begge skal vaere i kamp --------- */
  for(const [navn, sid] of [['A', a], ['B', b]]){
    sjekk(await kjor(sid, 'document.querySelector("#screen-battle").classList.contains("active")'),
      'fane ' + navn + ' er paa kampskjermen');
    sjekk(await kjor(sid, 'KORTSPILL.KS.nett !== null'),
      'fane ' + navn + ' har en nettkamp');
    sjekk(await kjor(sid, '!!KORTSPILL.KS.p[0]'),
      'fane ' + navn + ' har faatt et brett');
    sjekk(await kjor(sid, 'document.querySelectorAll("#myHand .kk").length > 0'),
      'fane ' + navn + ' har tegnet handa');
  }
  sjekk(await kjor(a, 'KORTSPILL.KS.nett.rolle') === 'vert', 'fane A er vert');
  sjekk(await kjor(b, 'KORTSPILL.KS.nett.rolle') === 'gjest', 'fane B er gjest');
  sjekk(await kjor(a, 'KORTSPILL.KS.tur') !== await kjor(b, 'KORTSPILL.KS.tur'),
    'turen er speilvendt mellom fanene');

  /* --------- spoersmaal over kanalen: aapningshanda --------- */
  for(const [navn, sid] of [['A', a], ['B', b]]){
    sjekk(await kjor(sid, '!document.querySelector("#ksDialog").hidden'),
      'fane ' + navn + ' faar spoersmaal om aapningshanda');
    await kjor(sid, 'document.querySelector("#ksDialogKnapper [data-dlg=\'0\']").click()');
  }
  await sov(1500);
  for(const [navn, sid] of [['A', a], ['B', b]]){
    sjekk(await kjor(sid, 'document.querySelector("#ksDialog").hidden'),
      'fane ' + navn + ' er ferdig med aapningshanda');
  }

  /* Spill videre til noen faar raad til et kort, saa ekte klikk i ekte DOM
     blir testet ogsaa: kortarket, SPILL-knappen og synkingen til motparten. */
  const PROVE_SPILL = `(() => {
    const KS = KORTSPILL.KS;
    if(KS.tur !== 0) return 'ikke min tur';
    for(let i=0;i<KS.p[0].hand.length;i++){
      const kort = document.querySelector('[data-sti="h:' + i + '"]');
      if(!kort) continue;
      kort.click();
      if(document.querySelector('#ksArk').hidden) continue;
      const knapp = document.querySelector('#ksArkKnapper [data-ark="0"]');
      if(!knapp || knapp.disabled){ document.querySelector('#ksArkBak').click(); continue; }
      knapp.click();
      return 'spilte';
    }
    return 'ingen raad';
  })()`;

  let spilte = false, spiller = null, seer = null, foerArter = 0;
  for(let runde = 0; runde < 8 && !spilte; runde++){
    const vertHarTuren = await kjor(a, 'KORTSPILL.KS.tur === 0');
    spiller = vertHarTuren ? a : b;
    seer    = vertHarTuren ? b : a;
    foerArter = await kjor(seer, 'KORTSPILL.KS.p[1].arter.length');
    const utfall = await kjor(spiller, PROVE_SPILL);
    await sov(1200);
    if(utfall === 'spilte'){ spilte = true; break; }
    await kjor(spiller, 'document.querySelector("#ksAvslutt").click()');
    await sov(1400);
  }
  sjekk(spilte, 'fikk spilt et kort gjennom brukerflaten');
  if(spilte){
    sjekk(await kjor(seer, 'KORTSPILL.KS.p[1].arter.length') >= foerArter,
      'motparten ser brettet etter at det ble spilt et kort');
    sjekk(await kjor(seer, 'KORTSPILL.KS.p[1].sol.aktiv')
       === await kjor(spiller, 'KORTSPILL.KS.p[0].sol.aktiv'),
      'solregnskapet stemmer mellom fanene');
    /* Bare gjesten skal vaere blind: verten eier motoren og har all tilstand. */
    if(seer === b){
      sjekk(await kjor(b, 'KORTSPILL.KS.p[1].hand.every(x => x === "?")'),
        'gjesten ser ikke vertens kort');
    }
    sjekk(await kjor(b, 'KORTSPILL.KS.p[1].hand.every(x => x === "?")'),
      'gjesten ser aldri vertens kort');
  }

  /* --------- plenen overlever at sida lastes paa nytt --------- */
  /* Fane C staar for seg selv: A og B er i kamp og roerer ikke plenen sin. */
  await kjor(c, `VM.STATE.eksemplarer.push({ uid:9101, art:SPECIES[1].id, niva:1,
    variant:null, x:-5, z:6 }); VM.STATE.funnet.add(SPECIES[1].id); VM.gaTil('field');`);
  await sov(900);
  await cdp.kall('Page.reload', {}, c);
  await sov(4000);
  sjekk(await kjor(c, 'VM.STATE.eksemplarer.some(e => e.uid === 9101)'),
    'plenen kommer tilbake etter at sida lastes paa nytt');
  sjekk(await kjor(c, 'VM.STATE.funnet.has(SPECIES[1].id)'),
    'funnlista kommer tilbake etter at sida lastes paa nytt');

  for(const [navn, sid] of [['A', a], ['B', b]]){
    const f = await kjor(sid, 'JSON.stringify(window.__feil || [])');
    if(f && f !== '[]'){ feilmeldinger.push(navn + ': ' + f); }
  }
  sjekk(feilmeldinger.length === 0, 'ingen skriptfeil i nettleseren: ' + feilmeldinger.join(' | '));

  cdp.lukk(); tjener.close();   // rydd() dreper hele prosessgruppa
  console.log(feil ? '\n' + feil + ' feil' : '\nAlle nettlesersjekker gikk gjennom');
  process.exit(feil ? 1 : 0);
})().catch(e => { console.error('KRASJ:', e); process.exit(2); });
