/* Kjorer artsmapping.js utenfor nettleseren mot ekte labelformater. */
const fs = require('fs');
const vm = require('vm');
const path = require('path').resolve(__dirname, '..') + '/';

const ctx = { console, window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path + 'species.js', 'utf8'), ctx, { filename: 'species.js' });
vm.runInContext(fs.readFileSync(path + 'artsmapping.js', 'utf8'), ctx, { filename: 'artsmapping.js' });

const M = vm.runInContext('ARTSMAPPING', ctx);
const SPECIES = vm.runInContext('SPECIES', ctx);
let feil = 0;
function sjekk(navn, faktisk, ventet) {
  const ok = JSON.stringify(faktisk) === JSON.stringify(ventet);
  if (!ok) { feil++; console.log('FEIL ' + navn + ': fikk ' + JSON.stringify(faktisk) + ' ventet ' + JSON.stringify(ventet)); }
  else console.log('ok   ' + navn + ' -> ' + JSON.stringify(faktisk));
}

/* --- SpeciesNet-format: uuid;class;order;family;genus;species;common name --- */
const sn = (s) => [{ label: s, p: 0.9 }];

sjekk('rev eksakt',
  pick(M.beste(sn('abc;mammalia;carnivora;canidae;vulpes;vulpes;red fox'), 'speciesnet')),
  ['rev', 0]);

sjekk('fjellrev eksakt',
  pick(M.beste(sn('abc;mammalia;carnivora;canidae;vulpes;lagopus;arctic fox'), 'speciesnet')),
  ['fjellrev', 0]);

sjekk('ukjent vulpes -> slekt',
  pick(M.beste(sn('abc;mammalia;carnivora;canidae;vulpes;zerda;fennec fox'), 'speciesnet')),
  ['rev', 1]);

sjekk('ukjent canidae -> familie',
  pick(M.beste(sn('abc;mammalia;carnivora;canidae;nyctereutes;procyonoides;raccoon dog'), 'speciesnet')),
  ['rev', 2]);

sjekk('blank -> ukjent',
  pick(M.beste(sn(';;;;;;blank'), 'speciesnet')),
  [null, 3]);

sjekk('human -> ukjent',
  pick(M.beste(sn(';;;;;;human'), 'speciesnet')),
  [null, 3]);

sjekk('familieniva uten art',
  pick(M.beste(sn('abc;mammalia;carnivora;ursidae;;;bear family'), 'speciesnet')),
  ['bjorn', 2]);

/* --- iNat21-format: beriket objekt fra export_inat21.py --- */
const inat = (name, genus, family, kingdom) =>
  [{ label: { name, genus, family, kingdom: kingdom || 'Plantae' }, p: 0.8 }];

sjekk('gran eksakt', pick(M.beste(inat('Picea abies', 'Picea', 'Pinaceae'), 'inat21')), ['gran', 0]);
sjekk('fluesopp eksakt', pick(M.beste(inat('Amanita muscaria', 'Amanita', 'Amanitaceae', 'Fungi'), 'inat21')), ['fluesopp', 0]);
sjekk('kantarell eksakt', pick(M.beste(inat('Cantharellus cibarius', 'Cantharellus', 'Cantharellaceae', 'Fungi'), 'inat21')), ['kantarell', 0]);
sjekk('molte eksakt', pick(M.beste(inat('Rubus chamaemorus', 'Rubus', 'Rosaceae'), 'inat21')), ['molte', 0]);
sjekk('annen Picea -> slekt', pick(M.beste(inat('Picea glauca', 'Picea', 'Pinaceae'), 'inat21')), ['gran', 1]);
sjekk('annen Pinaceae -> familie', pick(M.beste(inat('Abies alba', 'Abies', 'Pinaceae'), 'inat21')), ['gran', 2]);
sjekk('blaveis-synonym', pick(M.beste(inat('Anemone hepatica', 'Anemone', 'Ranunculaceae'), 'inat21')), ['blaveis', 0]);
sjekk('helt fremmed', pick(M.beste(inat('Zea mays', 'Zea', 'Poaceae'), 'inat21')), [null, 3]);

/* --- autornavn i latinske navn, slik FloraSense og PlantNet skriver dem --- */
sjekk('autornavn strippes',
  pick(M.beste([{ label: 'Betula_pubescens_Ehrh_', p: 0.7 }], 'inat21')),
  ['bjork', 0]);
sjekk('autornavn med parentes',
  pick(M.beste([{ label: 'Picea abies (L.) H.Karst.', p: 0.7 }], 'inat21')),
  ['gran', 0]);

/* --- topp-5: sikkert treff lenger nede slaar familiegjetning overst --- */
const blandet = [
  { label: { name: 'Abies alba', genus: 'Abies', family: 'Pinaceae' }, p: 0.40 },
  { label: { name: 'Betula pendula', genus: 'Betula', family: 'Betulaceae' }, p: 0.30 },
  { label: { name: 'Betula pubescens', genus: 'Betula', family: 'Betulaceae' }, p: 0.20 },
];
sjekk('topp5 velger eksakt treff', pick(M.beste(blandet, 'inat21')), ['bjork', 0]);

/* --- for lav sannsynlighet skal ignoreres --- */
sjekk('under minP ignoreres',
  pick(M.beste([{ label: { name: 'Picea abies', genus: 'Picea', family: 'Pinaceae' }, p: 0.01 }], 'inat21')),
  [null, 3]);

/* --- sjeldenhet avgjor naar flere arter deler familie --- */
console.log('\nEricaceae-kandidater:', SPECIES.filter(s => ['tyttebaer', 'rosslyng'].includes(s.id)).map(s => s.id + ':' + s.sjelden).join(' '));
sjekk('Ericaceae -> minst sjeldne (rosslyng har sjelden:1)',
  pick(M.beste(inat('Erica carnea', 'Erica', 'Ericaceae'), 'inat21')),
  ['rosslyng', 2]);

function pick(r) { return [r.id, r.niva]; }

console.log(feil ? '\n' + feil + ' FEIL' : '\nalle tester bestatt');
process.exit(feil ? 1 : 0);
