/* Kjorer to KORTSPILL-motorer i hver sin VM-kontekst og lar dem spille mot
   hverandre gjennom et NETT-stubb. Da testes speiling, spoersmalsflyt,
   handlinger og sladding uten nettleser. */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROT = path.join(__dirname, '..');
const les = f => fs.readFileSync(path.join(ROT, f), 'utf8');

let feil = 0;
const sjekk = (ok, hva) => { if(!ok){ feil++; console.log('FEIL: ' + hva); } };

/* ---------------------------------------------------------- DOM-stubb */
function lagDom(){
  const el = new Map();
  const nytt = id => ({
    id, textContent:'', innerHTML:'', hidden:true, disabled:false,
    dataset:{}, lyttere:{},
    classList:{ toggle(){}, add(){}, remove(){}, contains(){ return false; } },
    addEventListener(navn, f){ (this.lyttere[navn] ||= []).push(f); },
    fyr(navn, e){ for(const f of (this.lyttere[navn]||[])) f(e); },
  });
  const finn = sel => {
    const id = sel.replace('#','');
    if(!el.has(id)) el.set(id, nytt(id));
    return el.get(id);
  };
  return { finn, body:nytt('body') };
}

/* ---------------------------------------------------------- en spiller */
function lagSide(navn){
  const dom = lagDom();
  const sendt = [];
  const S = { navn, dom, sendt, motpart:null, toaster:[] };

  const sandkasse = {
    console,
    /* Animasjonspausene i motoren gjor en full kamp uutholdelig treg her,
       saa sandkassen far en setTimeout uten ventetid. */
    setTimeout: (f, ms, ...a) => setTimeout(f, 0, ...a),
    clearTimeout, setInterval, clearInterval, queueMicrotask,
    Math, Date, JSON, Symbol, Promise, Array, Object, String, Number, Map, Set,
    document: {
      querySelector: dom.finn,
      get body(){ return dom.body; },
    },
    NETT: {
      LOKAL_MODUS: true,
      send(m){ sendt.push(m); if(S.motpart) S.motpart.lever(JSON.parse(JSON.stringify(m))); },
      kampUt(){},
      get rolle(){ return 'test'; },
    },
  };
  sandkasse.window = sandkasse;
  sandkasse.globalThis = sandkasse;
  sandkasse.VM = {
    STATE:{ mynt:0 },
    LYD:{ klikk(){}, naer(){}, treff(){}, skade(){}, seier(){}, tap(){} },
    dirr(){}, toast(t){ S.toaster.push(t); }, oppdaterHud(){},
    gaTil(){}, lagMini(){}, visningsNavn(x){ return x; },
    /* Plenen til denne siden. Er den tom, faller motoren tilbake til
       planstokken, akkurat som i en fane uten plen. */
    dekkStokk: () => (S.stokk || []).slice(),
  };

  const ctx = vm.createContext(sandkasse);
  for(const f of ['species.js','cards.js','battle.js']) vm.runInContext(les(f), ctx, { filename:f });
  /* const paa toppniva havner i kontekstens leksikalske skop, ikke paa
     globalobjektet, saa vi maa hente det med en egen kjoring. */
  const K = vm.runInContext('KORTSPILL', ctx);
  S.ctx = ctx;
  S.KS = K.KS;
  S.spill = K;
  S.lever = m => K.taImot(m);
  return S;
}

const ctxAv = S => S.ctx;

/* ---------------------------------------------------------- hjelpere */
const tikk = () => new Promise(r => setTimeout(r, 0));
async function ro(n = 60){ for(let i=0;i<n;i++) await tikk(); }

/* Svarer paa en aapen dialog med gitt knappeindeks. */
function svarDialog(S, i){
  const d = S.dom.finn('#ksDialog');
  if(d.hidden) return false;
  S.dom.finn('#ksDialogKnapper').fyr('click', {
    target:{ closest: sel => sel === '[data-dlg]' ? { dataset:{ dlg:String(i) } } : null },
  });
  return true;
}
function avsluttTur(S){
  S.dom.finn('#ksAvslutt').fyr('click', {});
}
/* Klikker paa et brettelement via data-sti, slik brukeren ville gjort. */
function klikkSti(S, sti){
  S.dom.finn('#screen-battle').fyr('click', {
    target:{ closest: sel => sel === '[data-sti]' ? { dataset:{ sti } } : null },
  });
}
/* Peker paa det forste lovlige malet naar malvelgeren staar aapen. */
function svarMalvalg(S){
  const mv = S.KS.malvalg;
  if(!mv || !mv.lovlige.length) return false;
  const u = mv.lovlige[0];
  const i = u.sted === 'art' ? S.KS.p[u.side].arter.indexOf(u) : 0;
  klikkSti(S, ['e', u.side, u.sted, i].join(':'));
  return true;
}
function trykkArk(S, i){
  S.dom.finn('#ksArkKnapper').fyr('click', {
    target:{ closest: sel => sel === '[data-ark]' ? { dataset:{ ark:String(i) } } : null },
  });
}

/* ---------------------------------------------------------- oppsett */
(async () => {
  const vert  = lagSide('vert');
  const gjest = lagSide('gjest');
  vert.motpart = gjest; gjest.motpart = vert;

  vert.KS.minLeder  = 'ld_bjorn';
  gjest.KS.minLeder = 'ld_gaupe';

  /* To ulike plener, begge over minstemaalet, og begge med et eksemplar som
     er dratt opp et nivaa. Verten regner ut hele kampen, saa gjestens stokk
     maa komme dit over kanalen for at kortene skal stemme. */
  const gjenta = (liste, n) => Array.from({length:n}, (_, i) => liste[i % liste.length]);
  vert.stokk  = gjenta(['rev', 'ekorn', 'gran', 'bjorn@3', 'fluesopp'], 24);
  gjest.stokk = gjenta(['hare', 'gaupe@2', 'jerv', 'blaveis'], 22);

  vert.spill.startVert('k1');
  gjest.spill.startGjest('k1');
  await ro();

  /* mulligan: begge beholder handa */
  for(let i=0;i<6;i++){
    svarDialog(vert, 0); svarDialog(gjest, 0);
    await ro(10);
  }
  await ro();

  sjekk(!!vert.KS.p[0], 'verten har ikke startet spillet');
  sjekk(!!gjest.KS.p[0], 'gjesten har ikke faatt noen tilstand');
  if(!vert.KS.p[0] || !gjest.KS.p[0]){ console.log('avbryter'); process.exit(1); }

  /* ---- dekkene ---- */
  /* Alt av kort en spiller eier ligger i stokken, handa eller livskortene. */
  const alleKort = p => [...p.stokk, ...p.hand, ...p.liv].sort().join(',');
  sjekk(alleKort(vert.KS.p[0]) === vert.stokk.slice().sort().join(','),
    'verten spiller med sin egen plen');
  sjekk(alleKort(vert.KS.p[1]) === gjest.stokk.slice().sort().join(','),
    'gjestens plen kom fram til verten');
  sjekk(vert.sendt.length >= 0 && gjest.sendt.some(m => m.t === 'klar' && Array.isArray(m.stokk)),
    'gjesten sender stokken sin med klarmeldingen');
  sjekk(vert.KS.p[1].liv.length === 4,
    'gjestens leder deler ut sine egne livskort, fikk ' + vert.KS.p[1].liv.length);

  /* Nivaakortene maa kunne slaas opp hos begge, uten at noe er sendt om dem. */
  const kortHos = (S, id) => vm.runInContext('KORTSPILL', ctxAv(S)) && vm.runInContext(
    'kortAv(' + JSON.stringify(id) + ')', ctxAv(S));
  sjekk(kortHos(vert, 'gaupe@2') && kortHos(vert, 'gaupe@2').niva === 2,
    'verten kan bygge gjestens nivaakort selv');
  sjekk(kortHos(gjest, 'bjorn@3').kraft >= kortHos(gjest, 'bjorn').kraft,
    'et nivaakort er aldri svakere enn det samme kortet paa nivaa 1');

  /* ---- speiling ---- */
  sjekk(gjest.KS.p[0].leder.kort.id === 'ld_gaupe',
    'gjestens egen leder skal ligge paa plass 0, fikk ' + gjest.KS.p[0].leder.kort.id);
  sjekk(gjest.KS.p[1].leder.kort.id === 'ld_bjorn',
    'vertens leder skal ligge paa plass 1 hos gjesten, fikk ' + gjest.KS.p[1].leder.kort.id);
  sjekk(vert.KS.tur !== gjest.KS.tur || vert.KS.slutt,
    'turen skal vaere speilvendt: vert=' + vert.KS.tur + ' gjest=' + gjest.KS.tur);

  /* ---- sladding ---- */
  const vertsHand = vert.KS.p[0].hand;
  sjekk(gjest.KS.p[1].hand.every(x => x === '?'),
    'gjesten skal ikke se vertens kort, fikk ' + JSON.stringify(gjest.KS.p[1].hand.slice(0,3)));
  sjekk(gjest.KS.p[1].hand.length === vertsHand.length,
    'gjesten skal se riktig antall kort hos verten');
  sjekk(gjest.KS.p[0].hand.join() === vert.KS.p[1].hand.join(),
    'gjesten skal se sin egen hand i klartekst');
  const lekk = vert.sendt
    .filter(m => m.t === 'tilstand')
    .flatMap(m => vertsHand.filter(id => JSON.stringify(m.d.p[1]).includes('"' + id + '"')));
  sjekk(lekk.length === 0, 'vertens hand lekker til gjesten: ' + lekk.join(','));
  sjekk(typeof vert.sendt.find(m => m.t === 'tilstand').d.p[1].hand === 'number',
    'vertens hand skal sendes som antall, ikke som kort');

  /* ---- gjesten spiller et kort paa sin tur ---- */
  /* finn hvem som har turen og la den spille billigste mulige kort */
  const paaTur = vert.KS.tur === 0 ? vert : gjest;
  const foer = { arter: paaTur.KS.p[0].arter.length, sol: paaTur.KS.p[0].sol.aktiv };

  const hand = paaTur.KS.p[0].hand;
  let spilt = -1;
  for(let i=0;i<hand.length;i++){
    const k = paaTur.spill.KS.p[0].hand[i];
    const kort = vert.KS.p[0].hand ? null : null;   // kortdata hentes under
    void kort;
    klikkSti(paaTur, 'h:' + i);
    const arkAap = !paaTur.dom.finn('#ksArk').hidden;
    if(!arkAap) continue;
    trykkArk(paaTur, 0);                 // SPILL
    await ro(20);
    svarMalvalg(paaTur); svarMalvalg(paaTur === vert ? gjest : vert);
    await ro(20);
    if(paaTur.KS.p[0].arter.length > foer.arter || paaTur.KS.p[0].sol.aktiv < foer.sol){ spilt = i; break; }
    void k;
  }
  const hadeRaad = hand.some(id => {
    const k = vm.runInContext('KORTBASE', ctxAv(paaTur))[id];
    if(!k || k.kost == null || k.kost > foer.sol) return false;
    return k.kat !== 'hendelse' || k.eff.nar === 'hoved';
  });
  sjekk(spilt >= 0 || !hadeRaad,
    'hadde raad til et kort, men fikk ikke spilt det');

  const motpart = paaTur === vert ? gjest : vert;
  await ro(20);
  sjekk(motpart.KS.p[1].arter.length === paaTur.KS.p[0].arter.length,
    'motparten ser ikke samme antall arter: ' + motpart.KS.p[1].arter.length
      + ' mot ' + paaTur.KS.p[0].arter.length);
  sjekk(motpart.KS.p[1].sol.aktiv === paaTur.KS.p[0].sol.aktiv,
    'solregnskapet er ulikt hos de to');

  /* ---- turen gaar videre ---- */
  const turFoer = vert.KS.turNr;
  for(let runde=0; runde<6 && !vert.KS.slutt; runde++){
    const n = vert.KS.tur === 0 ? vert : gjest;
    avsluttTur(n);
    await ro(30);
    for(let i=0;i<4;i++){
      svarDialog(vert,0); svarDialog(gjest,0);
      svarMalvalg(vert); svarMalvalg(gjest);
      await ro(8);
    }
  }
  sjekk(vert.KS.turNr > turFoer, 'turtelleren staar stille: ' + vert.KS.turNr
    + ' (slutt=' + vert.KS.slutt + ' grunn=' + vert.KS.grunn + ')');
  sjekk(vert.KS.turNr === gjest.KS.turNr,
    'turtelleren er ulik: vert=' + vert.KS.turNr + ' gjest=' + gjest.KS.turNr);
  sjekk(vert.KS.p[0].liv.length === gjest.KS.p[1].liv.length,
    'livtellingen er ulik hos de to');

  /* ---- gjesten kan ikke handle utenfor sin tur ---- */
  const utenforTur = vert.KS.tur === 0 ? gjest : vert;
  const arterFoer = utenforTur.KS.p[0].arter.length;
  await utenforTur.spill.taImot({ t:'handling', m:{ h:'spill', i:0 } });
  await ro(10);
  sjekk(utenforTur.KS.p[0].arter.length === arterFoer,
    'en handling utenfor egen tur ble utfort');

  /* ---- spill kampen ut ---- */
  /* Enkel strategi paa begge sider: spill det du har raad til, angrip med alt
     som kan angripe, si nei til vern og mottrekk, avslutt turen. */
  function arkKnapp(S, merke){
    const k = S.KS.arkValg || [];
    return k.findIndex(b => b.t.startsWith(merke) && !b.av);
  }
  async function ryddOpp(){
    for(let i=0;i<5;i++){
      let noe = false;
      for(const S of [vert, gjest]){
        if(svarDialog(S, 0)) noe = true;
        if(svarMalvalg(S)) noe = true;
      }
      await ro(8);
      if(!noe) break;
    }
  }
  async function spillTur(S){
    for(let runde=0; runde<12; runde++){
      let spilte = false;
      for(let i=0; i<S.KS.p[0].hand.length; i++){
        klikkSti(S, 'h:' + i);
        if(S.dom.finn('#ksArk').hidden) continue;
        const j = arkKnapp(S, 'SPILL');
        if(j < 0){ trykkArk(S, arkKnapp(S, 'LUKK')); continue; }
        trykkArk(S, j);
        await ro(15);
        await ryddOpp();
        spilte = true;
        break;
      }
      if(!spilte) break;
    }

    const mine = [['e','0','leder','0'],
      ...S.KS.p[0].arter.map((_, i) => ['e','0','art',String(i)])];
    for(const sti of mine){
      if(S.KS.slutt || S.KS.tur !== 0) break;
      klikkSti(S, sti.join(':'));
      if(S.dom.finn('#ksArk').hidden) continue;
      const j = arkKnapp(S, 'ANGRIP');
      if(j < 0){ trykkArk(S, arkKnapp(S, 'LUKK')); continue; }
      trykkArk(S, j);
      await ro(15);
      svarMalvalg(S);
      await ro(25);
      await ryddOpp();
    }
    if(!S.KS.slutt && S.KS.tur === 0) avsluttTur(S);
    await ro(30);
    await ryddOpp();
  }

  let turer = 0;
  while(!vert.KS.slutt && turer < 120){
    await spillTur(vert.KS.tur === 0 ? vert : gjest);
    turer++;
  }

  sjekk(vert.KS.slutt, 'kampen ble aldri ferdig paa ' + turer + ' turer');
  sjekk(gjest.KS.slutt, 'gjesten fikk aldri vite at kampen var slutt');
  sjekk(vert.KS.seier !== gjest.KS.seier,
    'begge sider mener de vant eller tapte: vert=' + vert.KS.seier + ' gjest=' + gjest.KS.seier);
  sjekk(vert.KS.grunn === gjest.KS.grunn,
    'ulik begrunnelse: "' + vert.KS.grunn + '" mot "' + gjest.KS.grunn + '"');
  sjekk(!vert.dom.finn('#ksResult').hidden && !gjest.dom.finn('#ksResult').hidden,
    'resultatskjermen kom ikke opp hos begge');

  const lekk2 = vert.sendt
    .filter(m => m.t === 'tilstand')
    .some(m => typeof m.d.p[1].hand !== 'number');
  sjekk(!lekk2, 'vertens hand ble sendt som kort et sted i lopet av kampen');

  console.log(feil ? '\n' + feil + ' feil' : '\nAlle sjekker gikk gjennom');
  process.exit(feil ? 1 : 0);
})().catch(e => { console.error('KRASJ:', e); process.exit(2); });
