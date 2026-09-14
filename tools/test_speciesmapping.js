/* Runs speciesmapping.js outside the browser against the real label formats. */
const fs = require('fs');
const vm = require('vm');
const path = require('path').resolve(__dirname, '..') + '/';

const ctx = { console, window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path + 'species.js', 'utf8'), ctx, { filename: 'species.js' });
vm.runInContext(fs.readFileSync(path + 'speciesmapping.js', 'utf8'), ctx, { filename: 'speciesmapping.js' });

const M = vm.runInContext('SPECIESMAPPING', ctx);
const SPECIES = vm.runInContext('SPECIES', ctx);
let failures = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) { failures++; console.log('FAIL ' + name + ': got ' + JSON.stringify(actual) + ' expected ' + JSON.stringify(expected)); }
  else console.log('ok   ' + name + ' -> ' + JSON.stringify(actual));
}

/* --- SpeciesNet format: uuid;class;order;family;genus;species;common name --- */
const sn = (s) => [{ label: s, p: 0.9 }];

check('fox exact',
  pick(M.best(sn('abc;mammalia;carnivora;canidae;vulpes;vulpes;red fox'), 'speciesnet')),
  ['fox', 0]);

check('arctic fox exact',
  pick(M.best(sn('abc;mammalia;carnivora;canidae;vulpes;lagopus;arctic fox'), 'speciesnet')),
  ['arcticfox', 0]);

check('unknown vulpes -> genus',
  pick(M.best(sn('abc;mammalia;carnivora;canidae;vulpes;zerda;fennec fox'), 'speciesnet')),
  ['fox', 1]);

check('unknown canidae -> family',
  pick(M.best(sn('abc;mammalia;carnivora;canidae;nyctereutes;procyonoides;raccoon dog'), 'speciesnet')),
  ['fox', 2]);

check('blank -> unknown',
  pick(M.best(sn(';;;;;;blank'), 'speciesnet')),
  [null, M.NO_MATCH]);

check('human -> unknown',
  pick(M.best(sn(';;;;;;human'), 'speciesnet')),
  [null, M.NO_MATCH]);

check('family level without a species',
  pick(M.best(sn('abc;mammalia;carnivora;ursidae;;;bear family'), 'speciesnet')),
  ['bear', 2]);

/* --- iNat21 format: enriched object from export_inat21.py --- */
const inat = (name, genus, family, kingdom) =>
  [{ label: { name, genus, family, kingdom: kingdom || 'Plantae' }, p: 0.8 }];

check('spruce exact', pick(M.best(inat('Picea abies', 'Picea', 'Pinaceae'), 'inat21')), ['spruce', 0]);
check('fly agaric exact', pick(M.best(inat('Amanita muscaria', 'Amanita', 'Amanitaceae', 'Fungi'), 'inat21')), ['flyagaric', 0]);
check('chanterelle exact', pick(M.best(inat('Cantharellus cibarius', 'Cantharellus', 'Cantharellaceae', 'Fungi'), 'inat21')), ['chanterelle', 0]);
check('cloudberry exact', pick(M.best(inat('Rubus chamaemorus', 'Rubus', 'Rosaceae'), 'inat21')), ['cloudberry', 0]);
check('another Picea -> genus', pick(M.best(inat('Picea glauca', 'Picea', 'Pinaceae'), 'inat21')), ['spruce', 1]);
check('another Pinaceae -> family', pick(M.best(inat('Abies alba', 'Abies', 'Pinaceae'), 'inat21')), ['spruce', 2]);
check('hepatica synonym', pick(M.best(inat('Anemone hepatica', 'Anemone', 'Ranunculaceae'), 'inat21')), ['hepatica', 0]);
/* Maize shares no genus, family or order with anything in the library, but it
   is still a plant, so the wide net catches it at kingdom level. */
check('completely foreign -> kingdom', M.best(inat('Zea mays', 'Zea', 'Poaceae'), 'inat21').level, 5);

/* --- author names inside latin names, the way FloraSense and PlantNet write them --- */
check('author name is stripped',
  pick(M.best([{ label: 'Betula_pubescens_Ehrh_', p: 0.7 }], 'inat21')),
  ['birch', 0]);
check('author name in brackets',
  pick(M.best([{ label: 'Picea abies (L.) H.Karst.', p: 0.7 }], 'inat21')),
  ['spruce', 0]);

/* --- top 5: a certain hit further down beats a family guess at the top --- */
const mixed = [
  { label: { name: 'Abies alba', genus: 'Abies', family: 'Pinaceae' }, p: 0.40 },
  { label: { name: 'Betula pendula', genus: 'Betula', family: 'Betulaceae' }, p: 0.30 },
  { label: { name: 'Betula pubescens', genus: 'Betula', family: 'Betulaceae' }, p: 0.20 },
];
check('top 5 picks the exact hit', pick(M.best(mixed, 'inat21')), ['birch', 0]);

/* --- too low a probability must be ignored --- */
check('below minP is ignored',
  pick(M.best([{ label: { name: 'Picea abies', genus: 'Picea', family: 'Pinaceae' }, p: 0.01 }], 'inat21')),
  [null, M.NO_MATCH]);

/* --- rarity decides when several species share a family --- */
const ericaceae = SPECIES.filter(s => (M.TAXONOMY[s.id] || {}).family === 'ericaceae');
const expectedEricaceae = ericaceae.slice().sort((a, b) => a.rarity - b.rarity)[0].id;
console.log('\nEricaceae candidates:', ericaceae.map(s => s.id + ':' + s.rarity).join(' '));
check('Ericaceae -> the least rare of the ones that exist',
  pick(M.best(inat('Erica carnea', 'Erica', 'Ericaceae'), 'inat21')),
  [expectedEricaceae, 2]);


/* --- group bridge: species no model covers --- */
const withRank = (name, fields) => [{ label: Object.assign({ name }, fields), p: 0.6 }];

check('unknown fish -> gadid (UNCERTAIN)',
  pick(M.best(withRank('Perca fluviatilis', { genus: 'Perca', family: 'Percidae', class: 'Actinopterygii' }), 'inat21')),
  ['saithe', 2]);

check('salmon hits exactly, not the bridge',
  pick(M.best(withRank('Salmo salar', { genus: 'Salmo', family: 'Salmonidae', class: 'Actinopterygii' }), 'inat21')),
  ['salmon', 0]);

check('another salmonid -> family, not the bridge',
  pick(M.best(withRank('Oncorhynchus mykiss', { genus: 'Oncorhynchus', family: 'Salmonidae', class: 'Actinopterygii' }), 'inat21')),
  ['trout', 2]);

check('red alga -> kelp and wrack (UNCERTAIN)',
  pick(M.best(withRank('Chondrus crispus', { genus: 'Chondrus', family: 'Gigartinaceae', phylum: 'Rhodophyta' }), 'inat21')),
  ['sugarkelp', 2]);

check('green alga -> kelp and wrack',
  pick(M.best(withRank('Ulva lactuca', { genus: 'Ulva', family: 'Ulvaceae', phylum: 'Chlorophyta' }), 'inat21')),
  ['sugarkelp', 2]);

/* --- the collection breaks the tie: arctic fox is only reached once fox is taken --- */
check('Vulpes without fox in the collection -> fox',
  pick(M.best(withRank('Vulpes zerda', { genus: 'Vulpes', family: 'Canidae' }), 'inat21', { found: new Set() })),
  ['fox', 1]);

check('Vulpes with fox already taken -> arctic fox',
  pick(M.best(withRank('Vulpes zerda', { genus: 'Vulpes', family: 'Canidae' }), 'inat21', { found: new Set(['fox']) })),
  ['arcticfox', 1]);

/* --- white-tailed eagle: SpeciesNet reaches only genus, iNat21 hits exactly --- */
check('SpeciesNet sea eagle only at genus level',
  pick(M.best(sn('abc;aves;accipitriformes;accipitridae;haliaeetus;leucocephalus;bald eagle'), 'speciesnet')),
  ['seaeagle', 1]);
check('iNat21 sea eagle exact',
  pick(M.best(withRank('Haliaeetus albicilla', { genus: 'Haliaeetus', family: 'Accipitridae' }), 'inat21')),
  ['seaeagle', 0]);

/* --- the wide net: order, class and kingdom ------------------------------ */
/* p has to clear MIN_P_LEVEL, which climbs with the level, so these use a high
   confidence on purpose. */
const at = (p, name, fields) => [{ label: Object.assign({ name }, fields), p }];

check('unknown carnivore -> the order',
  M.best(at(0.8, 'Crocuta crocuta',
    { genus: 'Crocuta', family: 'Hyaenidae', order: 'Carnivora', class: 'Mammalia',
      kingdom: 'Animalia' }), 'inat21').level,
  3);

check('bat -> mammal, class level',
  M.best(at(0.8, 'Myotis myotis',
    { genus: 'Myotis', family: 'Vespertilionidae', order: 'Chiroptera', class: 'Mammalia',
      kingdom: 'Animalia' }), 'inat21').level,
  4);

check('beetle -> kingdom level only',
  M.best(at(0.9, 'Lucanus cervus',
    { genus: 'Lucanus', family: 'Lucanidae', order: 'Coleoptera', class: 'Insecta',
      kingdom: 'Animalia' }), 'inat21').level,
  5);

check('a weak wide-net guess is thrown away',
  pick(M.best(at(0.45, 'Lucanus cervus',
    { genus: 'Lucanus', family: 'Lucanidae', order: 'Coleoptera', class: 'Insecta',
      kingdom: 'Animalia' }), 'inat21')),
  [null, M.NO_MATCH]);

/* --- the group bridges --------------------------------------------------- */
check('dolphin -> porpoise, not a deer',
  pick(M.best(at(0.8, 'Delphinus delphis',
    { genus: 'Delphinus', family: 'Delphinidae', order: 'Artiodactyla', class: 'Mammalia',
      kingdom: 'Animalia' }), 'inat21')),
  ['porpoise', 3]);

check('sea lion -> a true seal',
  M.best(at(0.8, 'Zalophus californianus',
    { genus: 'Zalophus', family: 'Otariidae', order: 'Carnivora', class: 'Mammalia',
      kingdom: 'Animalia' }), 'inat21').id.slice(-4),
  'seal');

check('horse -> a big hoofed animal',
  M.best(at(0.8, 'Equus caballus',
    { genus: 'Equus', family: 'Equidae', order: 'Perissodactyla', class: 'Mammalia',
      kingdom: 'Animalia' }), 'inat21').level,
  4);

check('mallard -> a water bird',
  M.best(at(0.8, 'Anas platyrhynchos',
    { genus: 'Anas', family: 'Anatidae', order: 'Anseriformes', class: 'Aves',
      kingdom: 'Animalia' }), 'inat21').level,
  4);

/* SpeciesNet writes cetartiodactyla where iNat writes artiodactyla */
check('SpeciesNet order name is folded onto ours',
  pick(M.best(sn('abc;mammalia;cetartiodactyla;giraffidae;giraffa;camelopardalis;giraffe'), 'speciesnet')),
  [M.best(sn('abc;mammalia;artiodactyla;giraffidae;giraffa;camelopardalis;giraffe'), 'speciesnet').id, 4]);

/* --- MAPPED FROM: the screen has to be able to name what the model saw ---- */
check('an exact hit needs no mapped-from line',
  M.best(inat('Picea abies', 'Picea', 'Pinaceae'), 'inat21').level, 0);
check('a mapped hit carries the model name',
  M.best(inat('Abies alba', 'Abies', 'Pinaceae'), 'inat21').from, 'abies alba');
check('a SpeciesNet hit carries its own name',
  M.best(sn('abc;mammalia;carnivora;canidae;nyctereutes;procyonoides;raccoon dog'), 'speciesnet').from,
  'nyctereutes procyonoides');

function pick(r) { return [r.id, r.level]; }

console.log(failures ? '\n' + failures + ' FAILURES' : '\nall tests passed');
process.exit(failures ? 1 : 0);
