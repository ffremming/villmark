/* Dekningsrapport: hver art i species.js mot begge modellenes labellister.
 *
 *     node tools/dekning.js
 *
 * Kjor denne hver gang species.js far nye arter. Den sier hvilke arter som
 * treffes eksakt, hvilke som bare naas paa slekt eller familie, og hvilke
 * som ingen modell kjenner - de siste trenger en gruppebro i artsmapping.js
 * eller de blir umulige aa fange i ekte modus.
 *
 * Labellistene hentes fra nett og caches i systemets temp-mappe.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');

const ROT = path.resolve(__dirname, '..');
const HURTIG = os.tmpdir();

const SN_LABELS =
  'https://raw.githubusercontent.com/google/cameratrapai/main/data/model_package/' +
  'always_crop_99710272_22x8_v12_epoch_00148.labels.txt';
const INAT_VAL = 'https://ml-inat-competition-datasets.s3.amazonaws.com/2021/val.json.tar.gz';

async function hent(url, filnavn) {
  const sti = path.join(HURTIG, filnavn);
  if (fs.existsSync(sti)) return fs.readFileSync(sti);
  process.stderr.write('henter ' + filnavn + ' ...\n');
  const svar = await fetch(url);
  if (!svar.ok) throw new Error(url + ' -> HTTP ' + svar.status);
  const buf = Buffer.from(await svar.arrayBuffer());
  fs.writeFileSync(sti, buf);
  return buf;
}

/* Minimal tar-leser: vi trenger bare den forste .json-fila i arkivet. */
function jsonFraTarGz(buf) {
  const tar = zlib.gunzipSync(buf);
  let pek = 0;
  while (pek + 512 <= tar.length) {
    const navn = tar.toString('utf8', pek, pek + 100).replace(/\0.*$/, '');
    const storrelse = parseInt(tar.toString('utf8', pek + 124, pek + 136).replace(/\0.*$/, '').trim(), 8) || 0;
    const start = pek + 512;
    if (navn.endsWith('.json')) return JSON.parse(tar.toString('utf8', start, start + storrelse));
    pek = start + Math.ceil(storrelse / 512) * 512;
  }
  throw new Error('fant ingen .json i arkivet');
}

function lastSpill() {
  const ctx = { console: { warn() {}, log() {} }, window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROT, 'species.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROT, 'artsmapping.js'), 'utf8'), ctx);
  return {
    SPECIES: vm.runInContext('SPECIES', ctx),
    TAKSONOMI: vm.runInContext('ARTSMAPPING.TAKSONOMI', ctx),
    GRUPPEBRO: vm.runInContext('ARTSMAPPING.GRUPPEBRO', ctx),
  };
}

/* Bindestrek normaliseres bort paa begge sider, ellers bommer
   "Vaccinium vitis-idaea" paa seg selv. */
const nokkel = (s) => String(s || '').toLowerCase().replace(/-/g, ' ').trim();

function nivaFor(sci, familie, arter, slekter, familier) {
  const s = nokkel(sci);
  if (arter.has(s)) return 0;
  if (slekter.has(s.split(' ')[0])) return 1;
  if (familie && familier.has(familie)) return 2;
  return 3;
}

(async () => {
  const { SPECIES, TAKSONOMI, GRUPPEBRO } = lastSpill();

  const snRader = (await hent(SN_LABELS, 'villmark_sn_labels.txt'))
    .toString('utf8')
    .split('\n')
    .map((l) => l.trim().toLowerCase())
    .filter(Boolean)
    .map((l) => l.split(';'));
  const snArt = new Set(snRader.filter((f) => f[4] && f[5]).map((f) => nokkel(f[4] + ' ' + f[5])));
  const snSlekt = new Set(snRader.map((f) => f[4]).filter(Boolean));
  const snFam = new Set(snRader.map((f) => f[3]).filter(Boolean));

  const kategorier = jsonFraTarGz(await hent(INAT_VAL, 'villmark_inat21_val.tar.gz')).categories;
  const inArt = new Set(kategorier.map((c) => nokkel(c.name)));
  const inSlekt = new Set(kategorier.map((c) => (c.genus || '').toLowerCase()).filter(Boolean));
  const inFam = new Set(kategorier.map((c) => (c.family || '').toLowerCase()).filter(Boolean));

  const broDekker = new Set(GRUPPEBRO.flatMap((b) => b.ider));
  const NAVN = ['eksakt', 'slekt', 'familie', 'ingen'];
  const tell = { sn: [0, 0, 0, 0], in: [0, 0, 0, 0], best: [0, 0, 0, 0] };
  const svake = [];
  const uten = [];

  for (const sp of SPECIES) {
    const fam = (TAKSONOMI[sp.id] || {}).family || '';
    const a = nivaFor(sp.sci, fam, snArt, snSlekt, snFam);
    const b = nivaFor(sp.sci, fam, inArt, inSlekt, inFam);
    const best = Math.min(a, b);
    tell.sn[a]++;
    tell.in[b]++;
    tell.best[best]++;
    if (best === 3) uten.push(sp);
    else if (best > 0) svake.push([sp, best]);
  }

  console.log('arter i species.js: ' + SPECIES.length);
  console.log('                    eksakt  slekt  familie  ingen');
  const rad = (navn, t) => console.log(navn.padEnd(18) + t.map((n) => String(n).padStart(6)).join('   '));
  rad('SpeciesNet', tell.sn);
  rad('iNat21', tell.in);
  rad('beste av de to', tell.best);

  console.log('\nnaas bare paa slekt eller familie (' + svake.length + '):');
  for (const [sp, n] of svake) console.log('  ' + sp.id.padEnd(14) + NAVN[n].padEnd(8) + sp.sci);

  console.log('\ningen dekning i noen modell (' + uten.length + '):');
  let mangler = 0;
  for (const sp of uten) {
    const dekket = broDekker.has(sp.id);
    if (!dekket) mangler++;
    console.log('  ' + sp.id.padEnd(14) + (dekket ? 'gruppebro' : 'UFANGBAR ').padEnd(12) + sp.sci);
  }

  if (mangler) {
    console.log('\n' + mangler + ' art(er) kan ikke fanges i ekte modus. Legg dem i GRUPPEBRO i artsmapping.js.');
    process.exit(1);
  }
  console.log('\nalle arter er fangbare');
})();
