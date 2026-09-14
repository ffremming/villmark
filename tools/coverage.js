/* Coverage report: every species in species.js against the label lists of both
 * models.
 *
 *     node tools/coverage.js
 *
 * Run this every time species.js gains new species. It says which species are
 * hit exactly, which are only reached at genus or family level, and which no
 * model knows at all - the last group needs a group bridge in
 * speciesmapping.js or they become impossible to catch in real mode.
 *
 * The label lists are fetched from the network and cached in the system temp
 * folder.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const CACHE = os.tmpdir();

const SN_LABELS =
  'https://raw.githubusercontent.com/google/cameratrapai/main/data/model_package/' +
  'always_crop_99710272_22x8_v12_epoch_00148.labels.txt';
const INAT_VAL = 'https://ml-inat-competition-datasets.s3.amazonaws.com/2021/val.json.tar.gz';

async function fetchCached(url, filename) {
  const file = path.join(CACHE, filename);
  if (fs.existsSync(file)) return fs.readFileSync(file);
  process.stderr.write('fetching ' + filename + ' ...\n');
  const answer = await fetch(url);
  if (!answer.ok) throw new Error(url + ' -> HTTP ' + answer.status);
  const buf = Buffer.from(await answer.arrayBuffer());
  fs.writeFileSync(file, buf);
  return buf;
}

/* Minimal tar reader: we only need the first .json file in the archive. */
function jsonFromTarGz(buf) {
  const tar = zlib.gunzipSync(buf);
  let cursor = 0;
  while (cursor + 512 <= tar.length) {
    const name = tar.toString('utf8', cursor, cursor + 100).replace(/\0.*$/, '');
    const size = parseInt(tar.toString('utf8', cursor + 124, cursor + 136).replace(/\0.*$/, '').trim(), 8) || 0;
    const start = cursor + 512;
    if (name.endsWith('.json')) return JSON.parse(tar.toString('utf8', start, start + size));
    cursor = start + Math.ceil(size / 512) * 512;
  }
  throw new Error('found no .json in the archive');
}

function loadGame() {
  const ctx = { console: { warn() {}, log() {} }, window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'species.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'speciesmapping.js'), 'utf8'), ctx);
  return {
    SPECIES: vm.runInContext('SPECIES', ctx),
    TAXONOMY: vm.runInContext('SPECIESMAPPING.TAXONOMY', ctx),
    GROUP_BRIDGE: vm.runInContext('SPECIESMAPPING.GROUP_BRIDGE', ctx),
  };
}

/* Hyphens are normalized away on both sides, otherwise
   "Vaccinium vitis-idaea" misses itself. */
const key = (s) => String(s || '').toLowerCase().replace(/-/g, ' ').trim();

function levelFor(sci, family, species, genera, families) {
  const s = key(sci);
  if (species.has(s)) return 0;
  if (genera.has(s.split(' ')[0])) return 1;
  if (family && families.has(family)) return 2;
  return 3;
}

(async () => {
  const { SPECIES, TAXONOMY, GROUP_BRIDGE } = loadGame();

  const snRows = (await fetchCached(SN_LABELS, 'villmark_sn_labels.txt'))
    .toString('utf8')
    .split('\n')
    .map((l) => l.trim().toLowerCase())
    .filter(Boolean)
    .map((l) => l.split(';'));
  const snSpecies = new Set(snRows.filter((f) => f[4] && f[5]).map((f) => key(f[4] + ' ' + f[5])));
  const snGenus = new Set(snRows.map((f) => f[4]).filter(Boolean));
  const snFamily = new Set(snRows.map((f) => f[3]).filter(Boolean));

  const categories = jsonFromTarGz(await fetchCached(INAT_VAL, 'villmark_inat21_val.tar.gz')).categories;
  const inSpecies = new Set(categories.map((c) => key(c.name)));
  const inGenus = new Set(categories.map((c) => (c.genus || '').toLowerCase()).filter(Boolean));
  const inFamily = new Set(categories.map((c) => (c.family || '').toLowerCase()).filter(Boolean));

  const bridged = new Set(GROUP_BRIDGE.flatMap((b) => b.ids));
  const LABELS = ['exact', 'genus', 'family', 'none'];
  const count = { sn: [0, 0, 0, 0], in: [0, 0, 0, 0], best: [0, 0, 0, 0] };
  const weak = [];
  const without = [];

  for (const sp of SPECIES) {
    const fam = (TAXONOMY[sp.id] || {}).family || '';
    const a = levelFor(sp.sci, fam, snSpecies, snGenus, snFamily);
    const b = levelFor(sp.sci, fam, inSpecies, inGenus, inFamily);
    const best = Math.min(a, b);
    count.sn[a]++;
    count.in[b]++;
    count.best[best]++;
    if (best === 3) without.push(sp);
    else if (best > 0) weak.push([sp, best]);
  }

  console.log('species in species.js: ' + SPECIES.length);
  console.log('                    exact  genus  family    none');
  const row = (name, t) => console.log(name.padEnd(18) + t.map((n) => String(n).padStart(6)).join('   '));
  row('SpeciesNet', count.sn);
  row('iNat21', count.in);
  row('best of the two', count.best);

  console.log('\nreached only at genus or family level (' + weak.length + '):');
  for (const [sp, n] of weak) console.log('  ' + sp.id.padEnd(14) + LABELS[n].padEnd(8) + sp.sci);

  console.log('\nno coverage in any model (' + without.length + '):');
  let missing = 0;
  for (const sp of without) {
    const covered = bridged.has(sp.id);
    if (!covered) missing++;
    console.log('  ' + sp.id.padEnd(14) + (covered ? 'group bridge' : 'UNCATCHABLE ').padEnd(14) + sp.sci);
  }

  if (missing) {
    console.log('\n' + missing + ' species cannot be caught in real mode. Put them in GROUP_BRIDGE in speciesmapping.js.');
    process.exit(1);
  }
  console.log('\nevery species is catchable');
})();
