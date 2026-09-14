/* VILLMARK - artsdata + voxel-oppskrifter */

const AREAS = [
  { id:'granskogen', navn:'GRANSKOGEN', desc:'Tett barskog. Rev, ekorn og gran trives her.',
    pos:[-7,  6], farge:0x2f6b3a, kulisse:'gran', kulisseAntall:16,
    palett:[0x3c7a3e,0x458a45,0x336d38,0x4b9149],
    arter:['rev','ekorn','gran','fluesopp','kantarell','bjorn','ulv'] },

  { id:'fjellet',    navn:'FJELLET',    desc:'Over tregrensa. Hare og gaupe jakter i steinura.',
    pos:[ 6,  7], farge:0x7d8a93, kulisse:null, kulisseAntall:0, stein:22,
    palett:[0x8d979c,0x7c868b,0x9aa3a7,0x6f797e],
    arter:['hare','gaupe','blaveis','jerv'] },

  { id:'myra',       navn:'MYRA',       desc:'Våtmark og torv. Elgen beiter i skumringen.',
    pos:[-5, -7], farge:0x6b6134, kulisse:'bjork', kulisseAntall:9,
    palett:[0x6b6134,0x5c5630,0x77713e,0x4f4a2a],
    arter:['elg','tyttebaer','molte','bjork'] },

  { id:'kysten',     navn:'KYSTEN',     desc:'Knauser og furu mot havet. Hubroen ruger i berget.',
    pos:[ 7, -6], farge:0x35708a, kulisse:'furu', kulisseAntall:7,
    palett:[0x7f8e7a,0x93a08a,0x6e7d6c,0xc0b894],
    arter:['hubro','havorn','furu'] },

  { id:'vidda',      navn:'VIDDA',      desc:'Åpen høyfjellsvidde. Reinen trekker i flokk over lyngen.',
    pos:[ 1, 11], farge:0xa8895c, kulisse:null, kulisseAntall:0, stein:18, lyng:16,
    palett:[0x7a7544,0x868453,0x6b6939,0x8f8857],
    arter:['rein','rype','fjellrev','rosslyng'] },

  { id:'fjorden',    navn:'FJORDEN',    desc:'Brekkende sjø over tareskogen. Oteren fisker i fjæra.',
    pos:[-13, -10], farge:0x2f7fae, kulisse:null, kulisseAntall:0, vann:1.2, stein:10,
    palett:[0x9a8c6a,0x8b7e5e,0xa39472,0x7f8a74],
    arter:['oter','torsk','steinkobbe','tare'] },
];

const SPECIES = [

  /* ---------------------------------------------------------- GRANSKOGEN */
  { id:'rev', navn:'REV', sci:'Vulpes vulpes', kind:'dyr', omrade:'granskogen',
    sjelden:2, hp:64, angrep:22, forsvar:14, fart:26, hoyde:1.6,
    fakta:'Reven hører mus under 60 cm snø og hopper rett ned gjennom skaren.',
    trekk:[{n:'MUSESPRANG',s:24},{n:'SNIKANGREP',s:18},{n:'BJEFF',s:12}],
    vox:{ type:'quadruped', len:9, hoy:5, bred:5, ben:3,
      kropp:0xd2662f, hode:0xdd7a3c, buk:0xf4e7d4, bein:0x2e2119,
      hale:{len:5, farge:0xd2662f, tupp:0xf4e7d4, bust:2},
      orer:{h:2, farge:0x2e2119}, snute:0xf4e7d4, oyne:0x171114 } },

  { id:'ekorn', navn:'EKORN', sci:'Sciurus vulgaris', kind:'dyr', omrade:'granskogen',
    sjelden:1, hp:38, angrep:14, forsvar:9, fart:34, hoyde:1.0,
    fakta:'Ekornet gjemmer nøtter på hundrevis av steder og glemmer mange av dem.',
    trekk:[{n:'NØTTEKAST',s:16},{n:'KLOSPRETT',s:12},{n:'SURR',s:8}],
    vox:{ type:'quadruped', len:6, hoy:4, bred:4, ben:2,
      kropp:0xa84a24, hode:0xb85631, buk:0xf0e0cc, bein:0x6b2f18,
      hale:{len:6, farge:0xa84a24, tupp:0xc96f3d, bust:3, opp:true},
      orer:{h:2, farge:0xa84a24, dusk:true}, snute:0xf0e0cc, oyne:0x120d0a } },

  { id:'bjorn', navn:'BJØRN', sci:'Ursus arctos', kind:'dyr', omrade:'granskogen',
    sjelden:5, hp:124, angrep:36, forsvar:30, fart:16, hoyde:2.6,
    fakta:'Binna føder i hiet midt på vinteren og sover videre mens ungene dier.',
    trekk:[{n:'RAMSLAG',s:38},{n:'KLOHOGG',s:29},{n:'REISNING',s:17}],
    vox:{ type:'quadruped', len:11, hoy:7, bred:7, ben:4,
      kropp:0x4a3526, hode:0x55402e, buk:0x3b2a1e, bein:0x2a1d14,
      hale:{len:1, farge:0x4a3526, tupp:0x4a3526, bust:1},
      orer:{h:2, farge:0x3b2a1e}, snute:0x8a7150, oyne:0x120d0a } },

  { id:'ulv', navn:'ULV', sci:'Canis lupus', kind:'dyr', omrade:'granskogen',
    sjelden:5, hp:88, angrep:33, forsvar:21, fart:30, hoyde:1.9,
    fakta:'Et ulvehyl bærer over 10 km i stille vinterluft og holder flokken samlet.',
    trekk:[{n:'FLOKKBITT',s:35},{n:'STRUPETAK',s:28},{n:'HYL',s:15}],
    vox:{ type:'quadruped', len:10, hoy:6, bred:5, ben:5,
      kropp:0x7d7b74, hode:0x8b8880, buk:0xd8d3c6, bein:0x565349,
      hale:{len:5, farge:0x6f6c65, tupp:0x33302b, bust:2},
      orer:{h:3, farge:0x565349}, snute:0x33302b, oyne:0xc9a92e } },

  { id:'gran', navn:'GRAN', sci:'Picea abies', kind:'plante', omrade:'granskogen',
    sjelden:1, hp:90, angrep:8, forsvar:34, fart:2, hoyde:4.2,
    fakta:'Old Tjikko i Sverige er en gran med rotsystem datert til 9 550 år.',
    trekk:[{n:'NÅLEREGN',s:14},{n:'ROTGREP',s:10},{n:'HARPIKS',s:12}],
    vox:{ type:'tre', hoy:13, radius:5, lov:0x2c5c33, lov2:0x3a7340, stamme:0x4a3524 } },

  { id:'fluesopp', navn:'FLUESOPP', sci:'Amanita muscaria', kind:'plante', omrade:'granskogen',
    sjelden:3, hp:42, angrep:19, forsvar:10, fart:3, hoyde:1.3,
    fakta:'Rød fluesopp er giftig, men lever i symbiose med bjørk og gran.',
    trekk:[{n:'SPORESKY',s:22},{n:'GIFTHETTE',s:17},{n:'RINGSLAG',s:9}],
    vox:{ type:'sopp', hoy:7, hatt:0xc22a25, prikk:0xf4efe4, stilk:0xf0e8d8, lamell:0xd8cdb6 } },

  { id:'kantarell', navn:'KANTARELL', sci:'Cantharellus cibarius', kind:'plante', omrade:'granskogen',
    sjelden:3, hp:36, angrep:11, forsvar:13, fart:4, hoyde:1.1,
    fakta:'Kantarellen lukter av aprikos. Den kan ikke dyrkes, bare plukkes.',
    trekk:[{n:'SPORESTØV',s:15},{n:'MYKELNETT',s:12},{n:'APRIKOSDUFT',s:8}],
    vox:{ type:'sopp', trakt:true, hoy:6, hatt:0xe0a01e, prikk:null,
      stilk:0xe8b64a, lamell:0xc88a16 } },

  /* ---------------------------------------------------------- FJELLET */
  { id:'hare', navn:'HARE', sci:'Lepus timidus', kind:'dyr', omrade:'fjellet',
    sjelden:2, hp:46, angrep:12, forsvar:11, fart:38, hoyde:1.3,
    fakta:'Hara skifter til kritthvit vinterpels styrt av dagslengden, ikke av snøen.',
    trekk:[{n:'SIKKSAKK',s:15},{n:'BAKSPARK',s:18},{n:'DUKK',s:7}],
    vox:{ type:'quadruped', len:7, hoy:5, bred:4, ben:3,
      kropp:0xe8e6e0, hode:0xf2f1ee, buk:0xffffff, bein:0xc9c6bf,
      hale:{len:1, farge:0xffffff, tupp:0xffffff, bust:1},
      orer:{h:5, farge:0xe8e6e0, tupp:0x2b2b2b}, snute:0xd8a0a8, oyne:0x1a1418 } },

  { id:'gaupe', navn:'GAUPE', sci:'Lynx lynx', kind:'dyr', omrade:'fjellet',
    sjelden:5, hp:82, angrep:34, forsvar:20, fart:28, hoyde:1.9,
    fakta:'Gaupa er Norges eneste ville kattedyr. Labbene virker som truger i snøen.',
    trekk:[{n:'STRUPETAK',s:38},{n:'LABBESLAG',s:27},{n:'LURING',s:14}],
    vox:{ type:'quadruped', len:9, hoy:6, bred:5, ben:4,
      kropp:0xc7a271, hode:0xd4b184, buk:0xefe4d0, bein:0xa8855a,
      hale:{len:2, farge:0xc7a271, tupp:0x2b2118, bust:1},
      orer:{h:2, farge:0xc7a271, dusk:true, duskFarge:0x211a12},
      snute:0xefe4d0, oyne:0xcfa61f, flekker:0x8a6a41 } },

  { id:'jerv', navn:'JERV', sci:'Gulo gulo', kind:'dyr', omrade:'fjellet',
    sjelden:5, hp:78, angrep:31, forsvar:27, fart:19, hoyde:1.5,
    fakta:'Jerven legger kjøtt i steinur der kulda holder det ferskt til våren.',
    trekk:[{n:'KJEVEBITT',s:33},{n:'STEINRAS',s:24},{n:'MOSKUSDUFT',s:13}],
    vox:{ type:'quadruped', len:8, hoy:5, bred:5, ben:2,
      kropp:0x3b2c22, hode:0x2e221a, buk:0x2a1f18, bein:0x1f1712,
      hale:{len:3, farge:0x3b2c22, tupp:0x2a1f18, bust:2},
      orer:{h:1, farge:0x2e221a}, snute:0x1f1712, oyne:0x120d0a, flekker:0xa88a5c } },

  { id:'blaveis', navn:'BLÅVEIS', sci:'Hepatica nobilis', kind:'plante', omrade:'fjellet',
    sjelden:3, hp:30, angrep:6, forsvar:8, fart:4, hoyde:1.1,
    fakta:'Blåveisen blomstrer før løvet kommer, og fanger vårsola på skogbunnen.',
    trekk:[{n:'POLLENSKY',s:11},{n:'RANKE',s:8},{n:'DUFT',s:6}],
    vox:{ type:'blomst', hoy:6, kron:0x4a6fd4, kron2:0x7b96e8, midt:0xf0e08a,
      stilk:0x3f6b34, blad:0x2f5a2a, kinder:5 } },

  /* ---------------------------------------------------------- MYRA */
  { id:'elg', navn:'ELG', sci:'Alces alces', kind:'dyr', omrade:'myra',
    sjelden:4, hp:110, angrep:30, forsvar:26, fart:12, hoyde:2.8,
    fakta:'Elgoksen feller geviret hver vinter og bygger det opp igjen på én sommer.',
    trekk:[{n:'GEVIRSTØT',s:34},{n:'TRAMP',s:26},{n:'BRØL',s:15}],
    vox:{ type:'quadruped', len:11, hoy:8, bred:6, ben:6,
      kropp:0x50392a, hode:0x422f22, buk:0x3a2a1f, bein:0x261b13,
      hale:{len:1, farge:0x50392a, tupp:0x50392a, bust:0},
      orer:{h:2, farge:0x422f22}, snute:0x2b1f17, oyne:0x120d0a,
      gevir:{spenn:7, farge:0xcbb78d}, muleskjegg:0x3a2a1f } },

  { id:'tyttebaer', navn:'TYTTEBÆR', sci:'Vaccinium vitis-idaea', kind:'plante', omrade:'myra',
    sjelden:2, hp:34, angrep:9, forsvar:12, fart:5, hoyde:1.3,
    fakta:'Tyttebær holder seg friske i vann i årevis. Benzosyra konserverer dem selv.',
    trekk:[{n:'BÆRSALVE',s:12},{n:'KRATTFLETT',s:10},{n:'SYREBITT',s:14}],
    vox:{ type:'baer', hoy:5, blad:0x2f6b34, blad2:0x3f8440, baer:0xc2202c, stilk:0x4a5a32 } },

  { id:'molte', navn:'MOLTE', sci:'Rubus chamaemorus', kind:'plante', omrade:'myra',
    sjelden:4, hp:32, angrep:13, forsvar:9, fart:6, hoyde:1.2,
    fakta:'Molte kalles myras gull. Hann- og hunnplanter står hver for seg, så avlinga svikter ofte.',
    trekk:[{n:'MYRGULL',s:18},{n:'TORVGREP',s:11},{n:'SUR SAFT',s:9}],
    vox:{ type:'baer', hoy:5, blad:0x4a7a3a, blad2:0x5c8f45, baer:0xe8a33c, stilk:0x6b7a3a } },

  { id:'bjork', navn:'BJØRK', sci:'Betula pubescens', kind:'plante', omrade:'myra',
    sjelden:1, hp:74, angrep:9, forsvar:28, fart:3, hoyde:4.0,
    fakta:'Bjørka vokser høyest av alle trær i Norge og setter tregrensa i fjellet.',
    trekk:[{n:'RISKVAST',s:13},{n:'SEVJEFLOM',s:10},{n:'NEVERSKJOLD',s:11}],
    vox:{ type:'lauvtre', hoy:12, kronR:4, lov:0x5c9440, lov2:0x71a84e,
      stamme:0xe4e0d4, flekk:0x2e2a26 } },

  /* ---------------------------------------------------------- KYSTEN */
  { id:'hubro', navn:'HUBRO', sci:'Bubo bubo', kind:'dyr', omrade:'kysten',
    sjelden:5, hp:70, angrep:29, forsvar:18, fart:24, hoyde:1.5,
    fakta:'Hubroen er Europas største ugle. Vingespennet når 180 cm.',
    trekk:[{n:'STUPANGREP',s:33},{n:'KLOGREP',s:25},{n:'UHU-ROP',s:13}],
    vox:{ type:'fugl', bred:6, hoy:8, dyp:5,
      kropp:0x8a6b45, bryst:0xc6a877, vinge:0x6d5436, bein:0xd0a13f,
      orer:{h:2, farge:0x6d5436}, nebb:0x2a2320, oyne:0xe8a41c, strek:0x4e3b26 } },

  { id:'havorn', navn:'HAVØRN', sci:'Haliaeetus albicilla', kind:'dyr', omrade:'kysten',
    sjelden:4, hp:76, angrep:32, forsvar:19, fart:27, hoyde:1.8,
    fakta:'Havørna har Nord-Europas største vingespenn og kan bli over 30 år gammel.',
    trekk:[{n:'FISKEGREP',s:34},{n:'VINGESLAG',s:23},{n:'SKRIK',s:14}],
    vox:{ type:'fugl', bred:7, hoy:9, dyp:5,
      kropp:0x6b5a46, bryst:0x9a8a74, vinge:0x4f4234, bein:0xe0b13c,
      nebb:0xe8c23c, oyne:0xd8c03a, strek:0xe8e4da, hale:0xf0ece2 } },

  { id:'furu', navn:'FURU', sci:'Pinus sylvestris', kind:'plante', omrade:'kysten',
    sjelden:1, hp:86, angrep:10, forsvar:32, fart:2, hoyde:4.6,
    fakta:'Furua på karrig kyst kan bli 700 år. Malmveden er nesten råtefri.',
    trekk:[{n:'KONGLEKAST',s:15},{n:'BARKSKJOLD',s:9},{n:'TJÆREDRYPP',s:12}],
    vox:{ type:'tre', form:'furu', hoy:14, radius:5,
      lov:0x3f6b33, lov2:0x4d7d3c, stamme:0x9a5f34 } },

  /* ---------------------------------------------------------- VIDDA */
  { id:'rein', navn:'REIN', sci:'Rangifer tarandus', kind:'dyr', omrade:'vidda',
    sjelden:3, hp:96, angrep:24, forsvar:24, fart:29, hoyde:2.4,
    fakta:'Reinen ser ultrafiolett lys og kan se lav og ulvepels mot snøen.',
    trekk:[{n:'FLOKKTRAMP',s:29},{n:'GEVIRFEIE',s:25},{n:'SNØGRAV',s:14}],
    vox:{ type:'quadruped', len:10, hoy:6, bred:5, ben:6,
      kropp:0x8c7a63, hode:0x7a6a56, buk:0xe0d8c8, bein:0x5c4f40,
      hale:{len:1, farge:0xe0d8c8, tupp:0xe0d8c8, bust:1},
      orer:{h:2, farge:0x7a6a56}, snute:0x4a3f33, oyne:0x120d0a,
      gevir:{spenn:9, farge:0xd8c9a8} } },

  { id:'rype', navn:'LIRYPE', sci:'Lagopus lagopus', kind:'dyr', omrade:'vidda',
    sjelden:2, hp:44, angrep:13, forsvar:12, fart:31, hoyde:1.1,
    fakta:'Lirypa har fjær helt ned på tærne. Beina virker som truger på skaren.',
    trekk:[{n:'OPPFLUKT',s:17},{n:'SKARELØP',s:13},{n:'LATTERROP',s:9}],
    vox:{ type:'fugl', bred:5, hoy:6, dyp:4,
      kropp:0xf0ece2, bryst:0xffffff, vinge:0xdcd6c8, bein:0xe8e2d4,
      nebb:0x2e2a26, oyne:0x171310, strek:0xb8a888 } },

  { id:'fjellrev', navn:'FJELLREV', sci:'Vulpes lagopus', kind:'dyr', omrade:'vidda',
    sjelden:5, hp:58, angrep:21, forsvar:16, fart:30, hoyde:1.4,
    fakta:'Fjellreven tåler 50 minusgrader. Den er blant Norges mest truede pattedyr.',
    trekk:[{n:'SNØSPRANG',s:26},{n:'ISBITT',s:19},{n:'PIPING',s:11}],
    vox:{ type:'quadruped', len:8, hoy:5, bred:5, ben:2,
      kropp:0xe6e8ea, hode:0xf2f4f6, buk:0xffffff, bein:0xcdd2d6,
      hale:{len:5, farge:0xe6e8ea, tupp:0xffffff, bust:3},
      orer:{h:2, farge:0xd6dade}, snute:0x2a2a2e, oyne:0x171114 } },

  { id:'rosslyng', navn:'RØSSLYNG', sci:'Calluna vulgaris', kind:'plante', omrade:'vidda',
    sjelden:1, hp:40, angrep:7, forsvar:17, fart:3, hoyde:1.1,
    fakta:'Røsslyng kan bli 40 år. Lyngheiene langs kysten er holdt åpne av brenning i 5000 år.',
    trekk:[{n:'LYNGTEPPE',s:12},{n:'ROTFLETT',s:10},{n:'HONNINGDUFT',s:8}],
    vox:{ type:'baer', hoy:5, blad:0x4e5f36, blad2:0x63763f, baer:0xb464a8, stilk:0x6b5a3a } },

  /* ---------------------------------------------------------- FJORDEN */
  { id:'oter', navn:'OTER', sci:'Lutra lutra', kind:'dyr', omrade:'fjorden',
    sjelden:4, hp:66, angrep:25, forsvar:17, fart:32, hoyde:1.3,
    fakta:'Oteren har 50 000 hår per kvadratcentimeter. Pelsen holder lufta og varmen inne.',
    trekk:[{n:'DYKKBITT',s:28},{n:'HALESLAG',s:20},{n:'PLASK',s:12}],
    vox:{ type:'quadruped', len:11, hoy:4, bred:4, ben:1,
      kropp:0x5c4433, hode:0x6b5240, buk:0xc0ac92, bein:0x4a3628,
      hale:{len:6, farge:0x5c4433, tupp:0x4a3628, bust:2},
      orer:{h:1, farge:0x4a3628}, snute:0xc0ac92, oyne:0x120d0a } },

  { id:'torsk', navn:'TORSK', sci:'Gadus morhua', kind:'dyr', omrade:'fjorden',
    sjelden:2, hp:52, angrep:18, forsvar:14, fart:22, hoyde:1.4,
    fakta:'Skreien svømmer 1000 km fra Barentshavet til Lofoten for å gyte hver vinter.',
    trekk:[{n:'STIMSTØT',s:21},{n:'SUGEGAP',s:16},{n:'SKREITREKK',s:11}],
    vox:{ type:'fisk', len:12, hoy:6, bred:4,
      kropp:0x8a8259, hode:0x7a7350, buk:0xe4dcc4, finne:0x6b6445,
      strek:0xd8d0b4, oyne:0x171310, skjegg:0xc0b894 } },

  { id:'steinkobbe', navn:'STEINKOBBE', sci:'Phoca vitulina', kind:'dyr', omrade:'fjorden',
    sjelden:3, hp:86, angrep:20, forsvar:25, fart:18, hoyde:1.5,
    fakta:'Steinkobben kan holde pusten i nesten en halvtime og sove under vann.',
    trekk:[{n:'KASTEBYLGE',s:24},{n:'LUFFESLAG',s:18},{n:'BJEFF',s:10}],
    vox:{ type:'sel', len:11, hoy:5, bred:5,
      kropp:0x8f9296, hode:0x9ba0a4, buk:0xd8dcdd, luffe:0x6f7276,
      snute:0x4a4d50, oyne:0x120d0a, flekker:0x5a5e62 } },

  { id:'tare', navn:'STORTARE', sci:'Laminaria hyperborea', kind:'plante', omrade:'fjorden',
    sjelden:2, hp:58, angrep:8, forsvar:22, fart:7, hoyde:2.6,
    fakta:'Tareskogen langs norskekysten er blant havets mest artsrike skoger.',
    trekk:[{n:'TANGGREP',s:14},{n:'BØLGESLAG',s:12},{n:'SLIMHINNE',s:9}],
    vox:{ type:'tare', hoy:11, blader:5, bladLen:5,
      stilk:0x6b4a22, fot:0x4a3318, blad:0x5c6b28, blad2:0x74853a } },
];

const SPECIES_BY_ID = Object.fromEntries(SPECIES.map(s => [s.id, s]));

/* ---------------------------------------------------------- varianter */
const VARIANTER = {
  albino:   { navn:'ALBINO',   bonus:1.35, sjanse:0.035 },
  melanist: { navn:'MELANIST', bonus:1.30, sjanse:0.030 },
  gyllen:   { navn:'GYLLEN',   bonus:1.50, sjanse:0.015 },
};

/* ---------------------------------------------------------- butikk */
const BUTIKK = [
  { id:'sti',    navn:'STEINSTI',    pris:80,  ikon:'&#9638;',
    desc:'Heller lagt tvers over plenen.' },
  { id:'benk',   navn:'BENK',        pris:70,  ikon:'&#9641;',
    desc:'Sitteplass ved stien.' },
  { id:'bed',    navn:'BLOMSTERBED', pris:120, ikon:'&#10047;',
    desc:'Ring av ville blomster rundt hagen.' },
  { id:'gjerde', navn:'SKIGARD',     pris:180, ikon:'&#9776;',
    desc:'Gjerde rundt alt du har samlet.' },
  { id:'lykt',   navn:'LYKTER',      pris:150, ikon:'&#9728;',
    desc:'Seks lykter langs stien.' },
  { id:'dam',    navn:'DAM',         pris:260, ikon:'&#9781;',
    desc:'Vannspeil. Vannartene flytter hit.' },
];
const BUTIKK_BY_ID = Object.fromEntries(BUTIKK.map(b => [b.id, b]));

/* ---------------------------------------------------------- sesonger */
const SESONGER = ['vaar','sommer','host','vinter'];
const SESONG_NAVN = { vaar:'VÅR', sommer:'SOMMER', host:'HØST', vinter:'VINTER' };
const SESONG_HIMMEL = { vaar:0xa8d8ef, sommer:0x9ed0ef, host:0xb0c2cc, vinter:0xc9d9e6 };
