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
  solStokk: 10,       // kort i SOL-stokken
  apningshand: 5,     // kort trukket ved start
  solForste: 1,       // SOL forste spiller far pa sin forste tur
  solVanlig: 2,       // SOL alle andre turer
  maksArter: 5,       // plasser i artsomradet
  maksKopier: 4,      // kopier av samme kort i en stokk
  solKraft: 1000,     // kraft per SOL som er gitt til et kort
};

/* ---------------------------------------------------------- avledede tall
   Stats kommer fra artsdataene i species.js, slik at kortet og dyret
   alltid forteller det samme. */
function kortKraft(sp){
  const rad = sp.angrep*100 + sp.hp*20;
  return Math.max(1000, Math.min(10000, Math.round(rad/1000)*1000));
}
function kortKost(sp){
  const k = Math.round(kortKraft(sp)/1000) - 1 + (sp.sjelden >= 5 ? 1 : 0);
  return Math.max(1, Math.min(10, k));
}
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
   Nokkelord og effekt per art. Kost, kraft og mottrekk er avledet. */
const ARTSKORT = {
  /* GRANSKOGEN */
  rev:       { nokler:[],              eff:E('ved_spill','hvil',{maks:4}),      utloser:E('utloser','kraft',{verdi:2000}) },
  ekorn:     { nokler:['SPRANG'],      eff:E('ved_spill','sol',{verdi:1}),      utloser:E('utloser','trekk',{verdi:1}) },
  bjorn:     { nokler:['DOBBELTHOGG'], eff:E('ved_spill','ko',{maks:4}) },
  ulv:       { nokler:['DOBBELTHOGG'], eff:E('nar_angrep','selvkraft',{verdi:1000}) },
  gran:      { nokler:['VERN'],        eff:E('aktiver','kraft',{verdi:1000}) },
  fluesopp:  { nokler:[],              eff:E('ved_spill','hvil',{maks:5}),      utloser:E('utloser','hvil',{maks:5}) },
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
  hubro:     { nokler:['FORTAER'],     eff:E('ved_spill','hvil',{maks:4}) },
  havorn:    { nokler:['SPRANG'],      eff:E('nar_angrep','selvkraft',{verdi:1000}) },
  furu:      { nokler:['VERN'],        eff:E('aktiver','kraft',{verdi:1000}) },
  /* VIDDA */
  rein:      { nokler:[],              eff:E('ved_spill','kraft',{verdi:2000}) },
  rype:      { nokler:['SPRANG'],      eff:E('ved_spill','trekk',{verdi:1}),    utloser:E('utloser','trekk',{verdi:1}) },
  fjellrev:  { nokler:['SPRANG'],      eff:E('ved_spill','sol',{verdi:1}),      utloser:E('utloser','sol',{verdi:1}) },
  rosslyng:  { nokler:['VERN'],        eff:null,                                utloser:E('utloser','kraft',{verdi:2000}) },
  /* FJORDEN */
  oter:      { nokler:['SPRANG'],      eff:E('ved_spill','trekk',{verdi:1}) },
  torsk:     { nokler:[],              eff:E('ved_spill','sol',{verdi:1}),      utloser:E('utloser','sol',{verdi:1}) },
  steinkobbe:{ nokler:['VERN'],        eff:E('ved_spill','kraft',{verdi:1000}) },
  tare:      { nokler:['VERN'],        eff:null,                                utloser:E('utloser','kraft',{verdi:2000}) },
};

/* ---------------------------------------------------------- HENDELSE-kortene
   Hvert kort er avledet av artens forste trekk i species.js.
   Dyretrekk blir MOTTREKK-hendelser. Plantetrekk blir HOVED-hendelser. */
const PLANTEHENDELSE = {
  gran:      E('hoved','hvil',{maks:5}),
  fluesopp:  E('hoved','ko',{maks:3}),
  kantarell: E('hoved','trekk',{verdi:2}),
  blaveis:   E('hoved','kraft',{verdi:3000}),
  tyttebaer: E('hoved','trekk',{verdi:2}),
  molte:     E('hoved','sol',{verdi:1}),
  bjork:     E('hoved','hvil',{maks:4}),
  furu:      E('hoved','ko',{maks:2}),
  rosslyng:  E('hoved','kraft',{verdi:4000}),
  tare:      E('hoved','hvil',{maks:6}),
};

/* ---------------------------------------------------------- BIOTOP-kortene */
const BIOTOPKORT = {
  granskogen:{ navn:'SKOGHOLTET', kost:2, eff:E('aktiver','kraft',{verdi:2000}) },
  fjellet:   { navn:'STEINURA',   kost:2, eff:E('aktiver','hvil',{maks:3}) },
  myra:      { navn:'TORVMYRA',   kost:1, eff:E('aktiver','kraft',{verdi:1000}) },
  kysten:    { navn:'BERGVEGGEN', kost:2, eff:E('aktiver','hvil',{maks:2}) },
  vidda:     { navn:'LYNGHEIA',   kost:1, eff:E('aktiver','kraft',{verdi:1000}) },
  fjorden:   { navn:'TARESKOGEN', kost:2, eff:E('aktiver','kraft',{verdi:2000}) },
};

/* ---------------------------------------------------------- LEDER-kortene
   En LEDER per omrade. To farger, slik at stokken far nok kort a velge i. */
const LEDERKORT = [
  { id:'ld_bjorn',      art:'bjorn',      farger:['granskogen','myra'], eff:E('nar_angrep','selvkraft',{verdi:1000}) },
  { id:'ld_gaupe',      art:'gaupe',      farger:['fjellet','vidda'],   eff:E('nar_angrep','selvkraft',{verdi:1000}) },
  { id:'ld_elg',        art:'elg',        farger:['myra','granskogen'], eff:E('aktiver','kraft',{verdi:1000}) },
  { id:'ld_havorn',     art:'havorn',     farger:['kysten','fjorden'],  eff:E('aktiver','hvil',{maks:3}) },
  { id:'ld_rein',       art:'rein',       farger:['vidda','fjellet'],   eff:E('aktiver','sol',{verdi:1}) },
  { id:'ld_steinkobbe', art:'steinkobbe', farger:['fjorden','kysten'],  eff:E('aktiver','trekk',{verdi:1}) },
];

/* ---------------------------------------------------------- kortbygging */
function typeLinje(sp){
  return (sp.kind === 'dyr' ? 'DYR' : 'PLANTE') + ' / ' + KORTFARGER[sp.omrade].navn;
}

function byggArtKort(sp){
  const d = ARTSKORT[sp.id] || { nokler:[], eff:null };
  return {
    id: sp.id, kat:'art', artId: sp.id,
    navn: sp.navn, sci: sp.sci,
    farger: [sp.omrade],
    kost: kortKost(sp), kraft: kortKraft(sp), mot: kortMottrekk(sp),
    attributt: kortAttributt(sp), typer: typeLinje(sp),
    nokler: d.nokler || [], eff: d.eff || null, utloser: d.utloser || null,
    sjelden: sp.sjelden, fakta: sp.fakta,
  };
}

function byggHendelseKort(sp){
  const t = sp.trekk[0];
  const plante = sp.kind === 'plante';
  const eff = plante
    ? (PLANTEHENDELSE[sp.id] || E('hoved','trekk',{verdi:1}))
    : E('mottrekk','kraft',{ verdi: t.s >= 30 ? 4000 : 3000 });
  return {
    id: 'hn_' + sp.id, kat:'hendelse', artId: sp.id,
    navn: t.n, sci: sp.sci,
    farger: [sp.omrade],
    kost: plante ? Math.max(1, Math.min(4, Math.ceil(t.s/9))) : (t.s >= 30 ? 2 : 1),
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
    kost: null, kraft: 5000, mot: 0, liv: sp.hp >= 90 ? 5 : 4,
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
   Kortene legges runde for runde slik at kurven blir jevn. */
function byggStokk(leder){
  const basseng = Object.values(KORTBASE)
    .filter(k => k.kat !== 'leder' && leder.farger.includes(k.farger[0]))
    .sort((a,b) => a.kost - b.kost || a.id.localeCompare(b.id));
  const stokk = [];
  for(let kopi = 0; kopi < REGLER.maksKopier && stokk.length < REGLER.stokk; kopi++){
    for(const k of basseng){
      if(stokk.length >= REGLER.stokk) break;
      stokk.push(k.id);
    }
  }
  return stokk;
}
