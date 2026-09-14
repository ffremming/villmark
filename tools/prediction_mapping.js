/* Runs the real speciesmapping.js on predictions from test_end_to_end.py.
 *
 *     python tools/test_end_to_end.py --model inat21 --out /tmp/pred.json
 *     node tools/prediction_mapping.js /tmp/pred.json
 *
 * This is the last link in the chain: image -> ONNX -> top 5 -> species in the
 * game. The file name is read as the expected answer, so a file called
 * spruce.jpg must come out as SPRUCE.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const input = process.argv[2];
if (!input) {
  console.error('usage: node tools/prediction_mapping.js <predictions.json>');
  process.exit(2);
}

const ctx = { console: { warn() {}, log() {} }, window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'species.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'speciesmapping.js'), 'utf8'), ctx);
const M = vm.runInContext('SPECIESMAPPING', ctx);
const BY_ID = vm.runInContext('SPECIES_BY_ID', ctx);

const data = JSON.parse(fs.readFileSync(input, 'utf8'));
let failures = 0, total = 0;

for (const [expected, pred] of Object.entries(data.images)) {
  const answer = M.best(pred, data.source, { found: new Set() });
  const rawTop = pred[0].label.name || pred[0].label;
  const name = answer.id ? BY_ID[answer.id].name : 'NONE';
  /* The group bridge never promises a particular species, only the right
     group: an unknown fish can come out as cod or saithe. Then the group
     counts as correct. */
  const group = M.GROUP_BRIDGE.find((b) => b.ids.includes(expected));

  /* SpeciesNet knows no plants and no fungi. If it answers "blank" on a fly
     agaric, that is correct behaviour - in the real chain the image goes on
     to iNat21. So UNKNOWN SPECIES counts as correct when we test that model
     alone on something that is not an animal. */
  const isPlant = BY_ID[expected] && BY_ID[expected].kind !== 'animal';
  const outside = data.source === 'speciesnet' && isPlant;

  /* Files called _not_* are not nature at all - a laptop, a brick wall, a
     coffee cup. There UNKNOWN SPECIES is the only right answer. */
  const notNature = expected.startsWith('_not_');

  const correct = notNature || outside
    ? answer.id === null
    : answer.id === expected || (!!group && group.ids.includes(answer.id));
  total++;
  if (!correct) failures++;
  console.log(
    (correct ? (answer.id === expected ? 'ok   ' : outside ? 'ok-  ' : 'ok*  ') : 'FAIL ') +
    expected.padEnd(12) +
    '-> ' + name.padEnd(12) +
    answer.levelText.padEnd(20) +
    (answer.p * 100).toFixed(1).padStart(5) + ' %   the model said: ' + rawTop
  );
}

console.log('\n' + (total - failures) + '/' + total + ' images landed on the right species' +
  '  (ok* = right group via the group bridge, ok- = correctly rejected, the species is not in the model)');
process.exit(failures ? 1 : 0);
