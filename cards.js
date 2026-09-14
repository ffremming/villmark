/* VILLMARK - KORTSPILL: kortbase, regeldata og stokkbygging

   Reglene folger One Piece Card Game. Navnene er omsatt til villmark:
     SOL = DON!!        LIV = Life          LEDER = Leader
     ART = Character    HENDELSE = Event    BIOTOP = Stage
     KOMPOST = Trash    MOTTREKK = Counter  SPRANG = Rush
     VERN = Blocker     DOBBELTHOGG = Double Attack
     FORTAER = Banish   UTLOSER = Trigger                          */

/* ---------------------------------------------------------- farger
   Hvert omrade er en farge, slik OPTCG har seks farger. En LEDER har to
   farger, og stokken kan bare inneholde kort i LEDERens farger. */
const KORTFARGER = {
  granskogen:{ navn:'SKOG',  hex:'#3f8a49', mork:'#16301c', lys:'#68c274' },
  fjellet:   { navn:'FJELL', hex:'#7f8d99', mork:'#2a323a', lys:'#b2bec8' },
  myra:      { navn:'MYR',   hex:'#8f7c36', mork:'#332c12', lys:'#c9b25a' },
  kysten:    { navn:'KYST',  hex:'#3d86c6', mork:'#122839', lys:'#74b4e8' },
  vidda:     { navn:'VIDDE', hex:'#c08a4a', mork:'#3a2814', lys:'#e2b477' },
  fjorden:   { navn:'FJORD', hex:'#2f9a9a', mork:'#0f3232', lys:'#5fd0d0' },
};

/* ---------------------------------------------------------- nokkelord */
const NOKLER = {
  SPRANG:      'Kan angripe samme tur som den spilles.',
  VERN:        'Kan hvile for å bli nytt mål for angrepet.',
  DOBBELTHOGG: 'Tar 2 livskort når den treffer en LEDER.',
  FORTAER:     'Livskortet går til kompost i stedet for hånda.',
};
const NOKKEL_VIS = {
  SPRANG:'SPRANG', VERN:'VERN', DOBBELTHOGG:'DOBBELTHOGG', FORTAER:'FORTÆR',
};

/* ---------------------------------------------------------- regelkonstanter */
const REGLER = {
  stokk: 50,          // kort i kortstokken
  solStokk: 8,        // kort i SOL-stokken. 10 rakk ingen a bruke opp
  apningshand: 5,     // kort trukket ved start
  solForste: 1,       // SOL forste spiller far pa sin forste tur
  solVanlig: 2,       // SOL alle andre turer
  maksArter: 5,       // plasser i artsomradet
  maksKopier: 4,      // kopier av samme kort i en stokk
  solKraft: 1000,     // kraft per SOL som er gitt til et kort
};

/* ---------------------------------------------------------- avledede tall
   Stats kommer fra artsdataene i species.js, slik at kortet og dyret
   alltid forteller det samme.

   Kosten er rangbasert, ikke absolutt. Rastyrken til artene ligger tett
   (1160 til 6080), saa en direkte omregning stappet fire av fem arter i
   kost 1 og 2: SOL-stokken vokste til 10 mens ingenting kostet mer enn
   seks. Na sorteres artene etter rastyrke og fordeles over kurven, slik
   at bassenget har dyre kort a bruke SOL paa ut spillet. Rekkefolgen er
   den samme som for, saa bjornen er fortsatt dyrest og hvitveisen
   billigst. */
const KOSTKURVE  = [[0.19,1], [0.38,2], [0.55,3], [0.70,4], [0.83,5], [0.93,6], [1.00,7]];
const KRAFTKURVE = { 1:2000, 2:3000, 3:4000, 4:5000, 5:6000, 6:7000, 7:9000 };

const KOSTRANG = (() => {
  const sortert = SPECIES.slice()
    .sort((a,b) => (a.angrep*100 + a.hp*20) - (b.angrep*100 + b.hp*20)
                || a.id.localeCompare(b.id));
  const m = {};
  sortert.forEach((sp, i) => {
    const andel = (i + 1) / sortert.length;
    m[sp.id] = KOSTKURVE.find(([grense]) => andel <= grense)[1];
  });
  return m;
})();

function kortKost(sp){ return KOSTRANG[sp.id]; }
function kortKraft(sp){ return KRAFTKURVE[kortKost(sp)]; }
function kortMottrekk(sp){
  if(sp.forsvar >= 22) return 2000;
  if(sp.forsvar >= 11) return 1000;
  return 0;
}
function kortAttributt(sp){
  if(sp.kind === 'plante') return sp.vox.type === 'sopp' ? 'GIFT' : 'ROT';
  const t = sp.vox.type;
  if(t === 'fugl') return 'NEBB';
  if(t === 'fisk' || t === 'sel') return 'FINNE';
  if(sp.vox.gevir) return 'HORN';
  return sp.angrep >= 25 ? 'KLØR' : 'TANN';
}

/* ---------------------------------------------------------- effekter
   Bare seks virkninger finnes, og alle er implementert i motoren.
     gjor: ko | hvil | kraft | selvkraft | trekk | sol
     nar:  ved_spill | nar_angrep | aktiver | hoved | mottrekk | utloser */
const E = (nar, gjor, o={}) => ({ nar, gjor, verdi:o.verdi||0, maks:o.maks||0 });

function effTekst(e){
  const varighet = e.nar === 'mottrekk' ? 'denne kampen' : 'denne turen';
  switch(e.gjor){
    case 'ko':        return `KO én av motstanderens ARTer med kostnad ${e.maks} eller mindre.`;
    case 'hvil':      return `Hvil én av motstanderens ARTer med kostnad ${e.maks} eller mindre.`;
    case 'kraft':     return `Gi én av dine LEDER eller ARTer +${e.verdi} kraft ${varighet}.`;
    case 'selvkraft': return `Dette kortet får +${e.verdi} kraft ${varighet}.`;
    case 'trekk':     return `Trekk ${e.verdi} kort.`;
    case 'sol':       return `Legg ${e.verdi} SOL fra SOL-stokken, hvilt.`;
  }
  return '';
}
const NAR_PREFIKS = {
  ved_spill:  'NÅR SPILT',
  nar_angrep: 'NÅR DEN ANGRIPER',
  aktiver:    'AKTIVER ⟳ én gang per tur',
  hoved:      'HOVED',
  mottrekk:   'MOTTREKK',
  utloser:    'UTLØSER',
};
function effHeltekst(e){
  return e ? NAR_PREFIKS[e.nar] + ': ' + effTekst(e) : '';
}

/* ---------------------------------------------------------- ART-kortene
   Nokkelord og effekt per art. Kost, kraft og mottrekk er avledet.
   maks-tallene folger kostkurven: 'ko' rekker om lag kost minus tre,
   'hvil' om lag kost minus en. Med 13 arter paa kost 1 og 72 totalt
   dekker maks 2 en tredel av bassenget og maks 4 to tredeler, saa
   fjerning treffer noe men ikke alt. */
const ARTSKORT = {
  /* GRANSKOGEN */
  rev:       { nokler:['SPRANG'],      eff:E('ved_spill','hvil',{maks:4}),      utloser:E('utloser','kraft',{verdi:2000}) },
  ekorn:     { nokler:['SPRANG'],      eff:E('ved_spill','sol',{verdi:1}),      utloser:E('utloser','trekk',{verdi:1}) },
  bjorn:     { nokler:['DOBBELTHOGG'], eff:E('ved_spill','ko',{maks:4}) },
  ulv:       { nokler:['DOBBELTHOGG'], eff:E('nar_angrep','selvkraft',{verdi:1000}) },
  gran:      { nokler:['VERN'],        eff:E('aktiver','kraft',{verdi:1000}) },
  fluesopp:  { nokler:[],              eff:E('ved_spill','hvil',{maks:3}),      utloser:E('utloser','hvil',{maks:3}) },
  kantarell: { nokler:[],              eff:E('ved_spill','trekk',{verdi:1}),    utloser:E('utloser','trekk',{verdi:1}) },
  /* FJELLET */
  hare:      { nokler:['SPRANG'],      eff:null,                                utloser:E('utloser','trekk',{verdi:1}) },
  gaupe:     { nokler:['DOBBELTHOGG'], eff:E('nar_angrep','selvkraft',{verdi:1000}) },
  jerv:      { nokler:['VERN'],        eff:E('ved_spill','ko',{maks:3}) },
  blaveis:   { nokler:[],              eff:E('ved_spill','kraft',{verdi:2000}), utloser:E('utloser','kraft',{verdi:3000}) },
  /* MYRA */
  elg:       { nokler:['VERN'],        eff:E('nar_angrep','selvkraft',{verdi:1000}) },
  tyttebaer: { nokler:[],              eff:E('ved_spill','trekk',{verdi:1}),    utloser:E('utloser','trekk',{verdi:1}) },
  molte:     { nokler:[],              eff:E('ved_spill','sol',{verdi:1}),      utloser:E('utloser','sol',{verdi:1}) },
  bjork:     { nokler:['VERN'],        eff:null,                                utloser:E('utloser','kraft',{verdi:2000}) },
  /* KYSTEN */
  hubro:     { nokler:['FORTAER'],     eff:E('ved_spill','hvil',{maks:5}) },
  havorn:    { nokler:['SPRANG'],      eff:E('nar_angrep','selvkraft',{verdi:1000}) },
  furu:      { nokler:['VERN'],        eff:E('aktiver','kraft',{verdi:1000}) },
  /* VIDDA */
  rein:      { nokler:['VERN'],        eff:E('ved_spill','kraft',{verdi:2000}) },
  rype:      { nokler:['SPRANG'],      eff:E('ved_spill','trekk',{verdi:1}),    utloser:E('utloser','trekk',{verdi:1}) },
  fjellrev:  { nokler:['SPRANG'],      eff:E('ved_spill','sol',{verdi:1}),      utloser:E('utloser','sol',{verdi:1}) },
  rosslyng:  { nokler:['VERN'],        eff:null,                                utloser:E('utloser','kraft',{verdi:2000}) },
  /* FJORDEN */
  oter:      { nokler:['SPRANG'],      eff:E('ved_spill','trekk',{verdi:1}) },
  torsk:     { nokler:[],              eff:E('ved_spill','sol',{verdi:1}),      utloser:E('utloser','sol',{verdi:1}) },
  steinkobbe:{ nokler:['VERN'],        eff:E('ved_spill','kraft',{verdi:1000}) },
  tare:      { nokler:['VERN'],        eff:null,                                utloser:E('utloser','kraft',{verdi:2000}) },
};

/* Artene uten egen rad over sto for femti av de syttito ART-kortene, alle
   uten tekst og dermed utbyttbare. De far na ett nokkelord fra sine egne
   tall, saa et kort skiller seg fra et annet paa mer enn kraft. Ett hvert,
   for at bassenget ikke skal renne over av VERN og DOBBELTHOGG. */
function avledeNokler(sp){
  const naboer = SPECIES.filter(x => x.omrade === sp.omrade);
  const snitt = f => naboer.reduce((s,x) => s + f(x), 0) / naboer.length;
  const rel = f => f(sp) / (snitt(f) || 1);
  const best = [
    ['DOBBELTHOGG', rel(x => x.angrep)],
    ['SPRANG',      rel(x => x.fart)],
    ['VERN',        rel(x => x.forsvar)],
  ].sort((a,b) => b[1] - a[1])[0];
  return best[1] >= 1.2 ? [best[0]] : [];
}

/* ---------------------------------------------------------- HENDELSE-kortene
   Hvert kort er avledet av artens forste trekk i species.js.
   Dyretrekk blir MOTTREKK-hendelser. Plantetrekk blir HOVED-hendelser.

   Kosten til plantehendelsene sto for i angrepsstyrken til trekket, og
   alle ti havnet paa 2. Na staar prisen ved siden av virkningen, slik at
   en fjerning koster mer enn en oppladning. */
const PLANTEHENDELSE = {
  gran:      { kost:3, eff:E('hoved','hvil',{maks:4}) },
  fluesopp:  { kost:4, eff:E('hoved','ko',{maks:3}) },
  kantarell: { kost:2, eff:E('hoved','trekk',{verdi:2}) },
  blaveis:   { kost:1, eff:E('hoved','kraft',{verdi:3000}) },
  tyttebaer: { kost:2, eff:E('hoved','trekk',{verdi:2}) },
  molte:     { kost:1, eff:E('hoved','sol',{verdi:1}) },
  bjork:     { kost:2, eff:E('hoved','hvil',{maks:3}) },
  furu:      { kost:3, eff:E('hoved','ko',{maks:2}) },
  rosslyng:  { kost:2, eff:E('hoved','kraft',{verdi:4000}) },
  tare:      { kost:3, eff:E('hoved','hvil',{maks:4}) },
};

/* ---------------------------------------------------------- BIOTOP-kortene
   BIOTOPen virker hver tur den staar, saa fjerningen her er holdt lavt. */
const BIOTOPKORT = {
  granskogen:{ navn:'SKOGHOLTET', kost:3, eff:E('aktiver','kraft',{verdi:2000}) },
  fjellet:   { navn:'STEINURA',   kost:2, eff:E('aktiver','hvil',{maks:2}) },
  myra:      { navn:'TORVMYRA',   kost:1, eff:E('aktiver','kraft',{verdi:1000}) },
  kysten:    { navn:'BERGVEGGEN', kost:2, eff:E('aktiver','hvil',{maks:2}) },
  vidda:     { navn:'LYNGHEIA',   kost:1, eff:E('aktiver','kraft',{verdi:1000}) },
  fjorden:   { navn:'TARESKOGEN', kost:3, eff:E('aktiver','kraft',{verdi:2000}) },
};

/* ---------------------------------------------------------- LEDER-kortene
   En LEDER per omrade. To farger, slik at stokken far nok kort a velge i.
   Hver farge brukes av noyaktig to ledere, og hver effekt deles av to
   ledere.

   Liv og effekt skal veie mot hverandre: den sterkeste effekten horer
   sammen med minst liv. For sto det motsatt — GAUPE og REIN hadde bade
   fem liv og trekk hver tur, mens BJORN og STEINKOBBE hadde fire liv og
   en SOL-effekt som ikke gjorde noe, siden SOL-stokken uansett naar taket
   av seg selv. Den beste lederen vant fire av fem partier mot den
   svakeste. */
const LEDERKORT = [
  { id:'ld_gaupe',      art:'gaupe',      liv:4, farger:['fjellet','vidda'],     eff:E('aktiver','trekk',{verdi:1}) },
  { id:'ld_rein',       art:'rein',       liv:4, farger:['vidda','myra'],        eff:E('aktiver','trekk',{verdi:1}) },
  { id:'ld_havorn',     art:'havorn',     liv:5, farger:['kysten','fjorden'],    eff:E('nar_angrep','selvkraft',{verdi:1000}) },
  { id:'ld_elg',        art:'elg',        liv:5, farger:['myra','kysten'],       eff:E('nar_angrep','selvkraft',{verdi:1000}) },
  { id:'ld_bjorn',      art:'bjorn',      liv:5, farger:['granskogen','fjellet'],eff:E('aktiver','kraft',{verdi:2000}) },
  { id:'ld_steinkobbe', art:'steinkobbe', liv:5, farger:['fjorden','granskogen'],eff:E('aktiver','kraft',{verdi:2000}) },
];

/* ---------------------------------------------------------- kortbygging */
function typeLinje(sp){
  return (sp.kind === 'dyr' ? 'DYR' : 'PLANTE') + ' / ' + KORTFARGER[sp.omrade].navn;
}

/* Et VERN gir fra seg turen det kommer ned: det skal stoppe noe, ikke
   angripe. Til gjengjeld staar det som et kort to hakk lenger oppe paa
   kraftkurven. Uten det taper de forsvarstunge fargene paa ren fart —
   MYRA, som er atte planter og fire dyr, angrep ti ganger i partiet mot
   KYSTENs fjorten, og ELGen vant hvert femte parti. */
const VERNKRAFT = 2000;

function byggArtKort(sp){
  const d = ARTSKORT[sp.id] || { nokler: avledeNokler(sp), eff:null };
  const nokler = d.nokler || [];
  return {
    id: sp.id, kat:'art', artId: sp.id,
    navn: sp.navn, sci: sp.sci,
    farger: [sp.omrade],
    kost: kortKost(sp), mot: kortMottrekk(sp),
    kraft: kortKraft(sp) + (nokler.includes('VERN') ? VERNKRAFT : 0),
    attributt: kortAttributt(sp), typer: typeLinje(sp),
    nokler, eff: d.eff || null, utloser: d.utloser || null,
    sjelden: sp.sjelden, fakta: sp.fakta,
  };
}

function byggHendelseKort(sp){
  const t = sp.trekk[0];
  const plante = sp.kind === 'plante';
  const p = plante && (PLANTEHENDELSE[sp.id] || { kost:2, eff:E('hoved','trekk',{verdi:1}) });
  const eff = plante ? p.eff
    : E('mottrekk','kraft',{ verdi: t.s >= 30 ? 4000 : 3000 });
  return {
    id: 'hn_' + sp.id, kat:'hendelse', artId: sp.id,
    navn: t.n, sci: sp.sci,
    farger: [sp.omrade],
    kost: plante ? p.kost : (t.s >= 30 ? 2 : 1),
    kraft: null, mot: plante ? 0 : 1000,
    attributt: null, typer: 'HENDELSE / ' + KORTFARGER[sp.omrade].navn,
    nokler: [], eff, utloser: plante ? null : E('utloser','kraft',{verdi:3000}),
    sjelden: sp.sjelden, fakta: sp.fakta,
  };
}

function byggBiotopKort(omr){
  const b = BIOTOPKORT[omr.id];
  return {
    id: 'bt_' + omr.id, kat:'biotop', artId: omr.arter[0],
    navn: b.navn, sci: omr.navn,
    farger: [omr.id],
    kost: b.kost, kraft: null, mot: 0,
    attributt: null, typer: 'BIOTOP / ' + KORTFARGER[omr.id].navn,
    nokler: [], eff: b.eff, utloser: null,
    sjelden: 2, fakta: omr.desc,
  };
}

function byggLederKort(l){
  const sp = SPECIES_BY_ID[l.art];
  return {
    id: l.id, kat:'leder', artId: l.art,
    navn: sp.navn, sci: sp.sci,
    farger: l.farger,
    kost: null, kraft: 5000, mot: 0, liv: l.liv,
    attributt: kortAttributt(sp),
    typer: KORTFARGER[l.farger[0]].navn + ' / ' + KORTFARGER[l.farger[1]].navn,
    nokler: [], eff: l.eff, utloser: null,
    sjelden: sp.sjelden, fakta: sp.fakta,
  };
}

/* hele kortbasen, oppslagbar pa id */
const KORTBASE = (() => {
  const b = {};
  for(const sp of SPECIES){
    const a = byggArtKort(sp);      b[a.id] = a;
    const h = byggHendelseKort(sp); b[h.id] = h;
  }
  for(const omr of AREAS)    { const k = byggBiotopKort(omr); b[k.id] = k; }
  for(const l of LEDERKORT)  { const k = byggLederKort(l);    b[k.id] = k; }
  return b;
})();
const LEDERE = LEDERKORT.map(l => KORTBASE[l.id]);

/* ---------------------------------------------------------- stokkbygging
   50 kort, bare i LEDERens to farger, maks 4 kopier av hvert kort.

   For ble stokken plukket som ett eksemplar av hvert kort i bassenget.
   Det ga 50 forskjellige kort: ingen to partier lignet hverandre, fire-
   kopier-regelen slo aldri inn, og halve stokken var mottrekkshendelser.
   Na fylles en fast plan med ekte kopier. Planen sier hvor mange kort
   stokken skal ha av hver kategori og hver kost, slik at kurven holder
   uansett hvilke to farger lederen har. */
const STOKKPLAN = {
  art:      { 1:4, 2:7, 3:7, 4:7, 5:5, 6:4, 7:2 },   /* 36 */
  hendelse: { 1:4, 2:5, 3:3 },                       /* 12 */
};
const STOKK_BIOTOP = 2;   /* ett av hver farge — bare en kan ligge ute om gangen */

function byggStokk(leder){
  const basseng = Object.values(KORTBASE)
    .filter(k => k.kat !== 'leder' && leder.farger.includes(k.farger[0]));
  /* kort med tekst forst, saa de sjeldne: stokken skal ha noe a gjore */
  const vekt = k => (k.eff ? 2 : 0) + (k.utloser ? 1 : 0)
                  + (k.nokler ? k.nokler.length : 0) + k.sjelden/10;

  const stokk = [], kopier = {};
  const legg = (kort, onsket) => {
    let lagt = 0;
    while(lagt < onsket && stokk.length < REGLER.stokk
          && (kopier[kort.id] || 0) < REGLER.maksKopier){
      kopier[kort.id] = (kopier[kort.id] || 0) + 1;
      stokk.push(kort.id);
      lagt++;
    }
    return lagt;
  };
  /* Fyll en rute i planen. Mangler fargene kort til akkurat den kosten,
     brukes naermeste kost i samme kategori, saa planen alltid gaar opp.
     Et for dyrt kort teller dobbelt saa langt unna som et for billig: et
     hull fylt oppover kan ikke spilles paa kurven, og da star SOL ubrukt.
     MYRA og KYSTEN har ingen art paa kost 5, og da ELGens hull ble fylt
     med kost 6 vant han bare hvert fjerde parti. */
  const avstand = (k, kost) => k.kost > kost ? (k.kost - kost) * 2 : kost - k.kost;
  const fyll = (kat, kost, antall) => {
    const naer = basseng.filter(k => k.kat === kat).sort((a,b) =>
      avstand(a, kost) - avstand(b, kost)
      || vekt(b) - vekt(a) || a.id.localeCompare(b.id));
    let igjen = antall;
    for(const k of naer){
      if(igjen <= 0) break;
      igjen -= legg(k, Math.min(REGLER.maksKopier, igjen));
    }
  };
  /* en BIOTOP av hver farge. Flere kopier er bortkastet: bare en kan
     ligge ute, og den andre havner rett i komposten. */
  for(const k of basseng.filter(k => k.kat === 'biotop')
                        .sort((a,b) => a.id.localeCompare(b.id))
                        .slice(0, STOKK_BIOTOP)) legg(k, 1);

  for(const kat of ['art','hendelse'])
    for(const kost of Object.keys(STOKKPLAN[kat]))
      fyll(kat, Number(kost), STOKKPLAN[kat][kost]);

  /* Har en farge for faa kort til a fylle planen, toppes det opp med de
     beste ART-kortene som er igjen. */
  const rest = basseng.filter(k => k.kat === 'art')
    .sort((a,b) => vekt(b) - vekt(a) || a.kost - b.kost || a.id.localeCompare(b.id));
  while(stokk.length < REGLER.stokk){
    const for_ = stokk.length;
    for(const k of rest) legg(k, 1);
    if(stokk.length === for_) break;              // alt er brukt opp
  }
  return stokk;
}
