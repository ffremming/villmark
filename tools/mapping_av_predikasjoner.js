/* Kjorer den ekte artsmapping.js paa predikasjoner fra test_ende_til_ende.py.
 *
 *     python tools/test_ende_til_ende.py --modell inat21 --ut /tmp/pred.json
 *     node tools/mapping_av_predikasjoner.js /tmp/pred.json
 *
 * Dette er siste ledd i kjeden: bilde -> ONNX -> topp-5 -> art i spillet.
 * Filnavnet tolkes som fasit, saa en fil som heter gran.jpg skal gi GRAN.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROT = path.resolve(__dirname, '..');
const inn = process.argv[2];
if (!inn) {
  console.error('bruk: node tools/mapping_av_predikasjoner.js <predikasjoner.json>');
  process.exit(2);
}

const ctx = { console: { warn() {}, log() {} }, window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROT, 'species.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(ROT, 'artsmapping.js'), 'utf8'), ctx);
const M = vm.runInContext('ARTSMAPPING', ctx);
const BY_ID = vm.runInContext('SPECIES_BY_ID', ctx);

const data = JSON.parse(fs.readFileSync(inn, 'utf8'));
let feil = 0, sum = 0;

for (const [fasit, pred] of Object.entries(data.bilder)) {
  const svar = M.beste(pred, data.kilde, { funnet: new Set() });
  const toppRa = pred[0].label.name || pred[0].label;
  const navn = svar.id ? BY_ID[svar.id].navn : 'INGEN';
  /* Gruppebroen lover aldri en bestemt art, bare riktig gruppe: en ukjent
     fisk kan bli torsk eller sei. Da teller gruppen som riktig. */
  const gruppe = M.GRUPPEBRO.find((b) => b.ider.includes(fasit));
  const riktig = svar.id === fasit || (!!gruppe && gruppe.ider.includes(svar.id));
  sum++;
  if (!riktig) feil++;
  console.log(
    (riktig ? (svar.id === fasit ? 'ok   ' : 'ok*  ') : 'FEIL ') +
    fasit.padEnd(12) +
    '-> ' + navn.padEnd(12) +
    svar.nivaTekst.padEnd(20) +
    (svar.p * 100).toFixed(1).padStart(5) + ' %   modellen sa: ' + toppRa
  );
}

console.log('\n' + (sum - feil) + '/' + sum + ' bilder landet paa riktig art (ok* = riktig gruppe via gruppebro)');
process.exit(feil ? 1 : 0);
