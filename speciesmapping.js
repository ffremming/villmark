/* VILLMARK - mapping from model label to a species in the library
   Both models give latin names. Four levels:
     0 exact binomial  1 same genus  2 same family  3 no match
   No training, no network - just taxonomy. */

const SPECIESMAPPING = (() => {
'use strict';

/* Genus and family for every species in SPECIES. The sci field gives the
   binomial, but genus and family must live here because the models rank on them. */
const TAXONOMY = {
  fox:             { genus:'vulpes',       family:'canidae' },
  squirrel:        { genus:'sciurus',      family:'sciuridae' },
  bear:            { genus:'ursus',        family:'ursidae' },
  wolf:            { genus:'canis',        family:'canidae' },
  hare:            { genus:'lepus',        family:'leporidae' },
  lynx:            { genus:'lynx',         family:'felidae' },
  wolverine:       { genus:'gulo',         family:'mustelidae' },
  moose:           { genus:'alces',        family:'cervidae' },
  eagleowl:        { genus:'bubo',         family:'strigidae' },
  seaeagle:        { genus:'haliaeetus',   family:'accipitridae' },
  reindeer:        { genus:'rangifer',     family:'cervidae' },
  ptarmigan:       { genus:'lagopus',      family:'phasianidae' },
  arcticfox:       { genus:'vulpes',       family:'canidae' },
  otter:           { genus:'lutra',        family:'mustelidae' },
  cod:             { genus:'gadus',        family:'gadidae' },
  harbourseal:     { genus:'phoca',        family:'phocidae' },
  badger:          { genus:'meles',        family:'mustelidae' },
  pinemarten:      { genus:'martes',       family:'mustelidae' },
  roedeer:         { genus:'capreolus',    family:'cervidae' },
  reddeer:         { genus:'cervus',       family:'cervidae' },
  capercaillie:    { genus:'tetrao',       family:'phasianidae' },
  raven:           { genus:'corvus',       family:'corvidae' },
  stoat:           { genus:'mustela',      family:'mustelidae' },
  lemming:         { genus:'lemmus',       family:'cricetidae' },
  dipper:          { genus:'cinclus',      family:'cinclidae' },
  arcticchar:      { genus:'salvelinus',   family:'salmonidae' },
  beaver:          { genus:'castor',       family:'castoridae' },
  redthroatedloon: { genus:'gavia',        family:'gaviidae' },
  trout:           { genus:'salmo',        family:'salmonidae' },
  hedgehog:        { genus:'erinaceus',    family:'erinaceidae' },
  puffin:          { genus:'fratercula',   family:'alcidae' },
  kittiwake:       { genus:'rissa',        family:'laridae' },
  herring:         { genus:'clupea',       family:'clupeidae' },
  muskox:          { genus:'ovibos',       family:'bovidae' },
  goldenplover:    { genus:'pluvialis',    family:'charadriidae' },
  greyseal:        { genus:'halichoerus',  family:'phocidae' },
  porpoise:        { genus:'phocoena',     family:'phocoenidae' },
  salmon:          { genus:'salmo',        family:'salmonidae' },
  saithe:          { genus:'pollachius',   family:'gadidae' },

  spruce:          { genus:'picea',        family:'pinaceae' },
  pine:            { genus:'pinus',        family:'pinaceae' },
  birch:           { genus:'betula',       family:'betulaceae' },
  hepatica:        { genus:'hepatica',     family:'ranunculaceae' },
  lingonberry:     { genus:'vaccinium',    family:'ericaceae' },
  heather:         { genus:'calluna',      family:'ericaceae' },
  cloudberry:      { genus:'rubus',        family:'rosaceae' },
  flyagaric:       { genus:'amanita',      family:'amanitaceae' },
  chanterelle:     { genus:'cantharellus', family:'cantharellaceae' },
  kelp:            { genus:'laminaria',    family:'laminariaceae' },

  aspen:           { genus:'populus',      family:'salicaceae' },
  bilberry:        { genus:'vaccinium',    family:'ericaceae' },
  woodanemone:     { genus:'anemone',      family:'ranunculaceae' },
  porcini:         { genus:'boletus',      family:'boletaceae' },
  deadlywebcap:    { genus:'cortinarius',  family:'cortinariaceae' },
  blacktrumpet:    { genus:'craterellus',  family:'cantharellaceae' },
  rowan:           { genus:'sorbus',       family:'rosaceae' },
  juniper:         { genus:'juniperus',    family:'cupressaceae' },
  mountainavens:   { genus:'dryas',        family:'rosaceae' },
  ladysslipper:    { genus:'cypripedium',  family:'orchidaceae' },
  sundew:          { genus:'drosera',      family:'droseraceae' },
  cottongrass:     { genus:'eriophorum',   family:'cyperaceae' },
  orangebolete:    { genus:'leccinum',     family:'boletaceae' },
  greyalder:       { genus:'alnus',        family:'betulaceae' },
  goatwillow:      { genus:'salix',        family:'salicaceae' },
  oak:             { genus:'quercus',      family:'fagaceae' },
  yew:             { genus:'taxus',        family:'taxaceae' },
  crowberry:       { genus:'empetrum',     family:'ericaceae' },
  dwarfcornel:     { genus:'cornus',       family:'cornaceae' },
  dwarfbirch:      { genus:'betula',       family:'betulaceae' },
  sugarkelp:       { genus:'saccharina',   family:'laminariaceae' },
  knottedwrack:    { genus:'ascophyllum',  family:'fucaceae' },
  eelgrass:        { genus:'zostera',      family:'zosteraceae' },
};

/* Hepatica used to be called Anemone hepatica. FloraSense and iNat21 both use
   the names interchangeably, so we accept either. */
const SYNONYMS = {
  'anemone hepatica': 'hepatica nobilis',
  'hepatica triloba': 'hepatica nobilis',
  'betula alba':      'betula pubescens',
  'cervus tarandus':  'rangifer tarandus',
};

/* Labels that are not species. SpeciesNet returns these often. */
const NOT_A_SPECIES = new Set(['blank','animal','human','vehicle','unknown','no cv result']);

/* Five species have zero coverage in both models:
     cod, saithe  - SpeciesNet has no fish at all, and iNat21 has 183 fish
                    species but no Gadiformes
     kelp, sugarkelp, knottedwrack
                  - no brown algae anywhere. iNat21 has eleven other
                    macroalgae (Ulva, Chondrus, Corallina, Codium ...)
   Without a bridge they are impossible to catch. The bridge picks up higher
   taxonomic levels and lands on one of the candidates, always as UNCERTAIN,
   so the player sees that it was a guess.

   The bridge is checked after genus and family. A salmon therefore gives
   Salmo salar exactly and never reaches the fish bridge; only fish that
   neither model can place end up there. Candidates are chosen by the same
   rule as elsewhere: a species the player is missing ahead of one they have,
   then the least rare. */
const GROUP_BRIDGE = [
  { ids:['cod','saithe'], classes:['actinopterygii','teleostei'] },
  { ids:['kelp','sugarkelp','knottedwrack'],
    phyla:['rhodophyta','chlorophyta','ochrophyta'],
    classes:['phaeophyceae','florideophyceae','ulvophyceae'],
    orders:['laminariales','fucales'] },
];

const norm = s => String(s || '')
  .toLowerCase()
  .replace(/_/g, ' ')
  .replace(/[×x]\s+/g, '')
  .replace(/\s+/g, ' ')
  .trim();

/* Latin names in the models often carry an author suffix:
   "Picea abies (L.) H.Karst." -> "picea abies".
   We take the first two words that contain letters only. */
function binomialOf(name){
  const words = norm(name).split(' ').filter(o => /^[a-zæøå.-]+$/.test(o));
  if(words.length < 2) return words[0] || '';
  const bi = words[0] + ' ' + words[1].replace(/\.$/, '');
  return SYNONYMS[bi] || bi;
}

/* Indexes are built once SPECIES exists. species.js loads before this file. */
const BINOMIAL     = new Map();   // "vulpes vulpes" -> id
const GENUS        = new Map();   // "vulpes"        -> [id, ...]
const FAMILY       = new Map();   // "canidae"       -> [id, ...]
const BINOMIAL_IDS = new Set();   // species ids that actually exist in the game

for(const sp of (typeof SPECIES !== 'undefined' ? SPECIES : [])){
  const t = TAXONOMY[sp.id];
  if(!t){ console.warn('SPECIESMAPPING: missing taxonomy for', sp.id); continue; }
  BINOMIAL.set(binomialOf(sp.sci), sp.id);
  BINOMIAL_IDS.add(sp.id);
  if(!GENUS.has(t.genus))   GENUS.set(t.genus, []);
  if(!FAMILY.has(t.family)) FAMILY.set(t.family, []);
  GENUS.get(t.genus).push(sp.id);
  FAMILY.get(t.family).push(sp.id);
}

/* When several species share a genus or family (spruce/pine, lingonberry/heather,
   fox/arctic fox) one of them has to be chosen.

   First: a species the player is missing beats one they already have. Without
   that rule the arctic fox would be impossible - neither model knows Vulpes
   lagopus, so the arctic fox is only reachable at genus level, and there the
   fox would always win. Then: the least rare. A miss on "ursidae" should not
   hand out the rarest card in the game. */
function leastRare(ids, found){
  if(ids.length === 1) return ids[0];
  const tab = typeof SPECIES_BY_ID !== 'undefined' ? SPECIES_BY_ID : {};
  const has = id => !!(found && found.has && found.has(id));
  return ids.slice().sort((a,b) =>
    (has(a) - has(b)) || ((tab[a]?.rarity || 9) - (tab[b]?.rarity || 9))
  )[0];
}

/* --- parsing of the two label formats ----------------------------------- */

/* SpeciesNet: "uuid;class;order;family;genus;species;common name"
   Empty fields mean a higher taxonomic level, or a non-animal. */
function parseSpeciesNet(label){
  const f = String(label).split(';');
  if(f.length < 7) return { common: norm(label) };
  const [, taxClass, order, family, genus, species, common] = f.map(norm);
  return {
    binomial: genus && species ? (SYNONYMS[genus + ' ' + species] || genus + ' ' + species) : '',
    genus, family, order, taxClass, common,
  };
}

/* iNat21: the export script writes {name, genus, family, kingdom} per class.
   Falls back to a plain name string if someone feeds in a simple list. */
function parseInat(label){
  if(label && typeof label === 'object'){
    return {
      binomial: binomialOf(label.name),
      genus: norm(label.genus) || binomialOf(label.name).split(' ')[0],
      family: norm(label.family),
      order: norm(label.order),
      taxClass: norm(label.class || label.taxClass),
      phylum: norm(label.phylum),
      kingdom: norm(label.kingdom),
      common: norm(label.common_name || label.name),
    };
  }
  const bi = binomialOf(label);
  return { binomial: bi, genus: bi.split(' ')[0], family: '', common: norm(label) };
}

function parseLabel(label, source){
  return source === 'speciesnet' ? parseSpeciesNet(label) : parseInat(label);
}

/* --- the lookup itself --------------------------------------------------- */

const LEVEL_TEXT = ['CERTAIN', 'NEAREST RELATIVE', 'UNCERTAIN', 'UNKNOWN SPECIES'];

/* Returns {id, level, levelText, latin, common} or null for non-species.
   found is the player's collection, used to break ties on genus and family. */
function lookup(label, source, found){
  const p = parseLabel(label, source);
  if(NOT_A_SPECIES.has(p.common) && !p.binomial) return null;

  const latin = p.binomial || p.family || p.common;
  const answer = (id, level) => ({ id, level, levelText: LEVEL_TEXT[level], latin, common: p.common });

  if(p.binomial && BINOMIAL.has(p.binomial)) return answer(BINOMIAL.get(p.binomial), 0);
  if(p.genus   && GENUS.has(p.genus))        return answer(leastRare(GENUS.get(p.genus), found), 1);
  if(p.family  && FAMILY.has(p.family))      return answer(leastRare(FAMILY.get(p.family), found), 2);

  for(const bridge of GROUP_BRIDGE){
    if((bridge.classes && bridge.classes.includes(p.taxClass)) ||
       (bridge.orders  && bridge.orders.includes(p.order))     ||
       (bridge.phyla   && bridge.phyla.includes(p.phylum))){
      const present = bridge.ids.filter(id => BINOMIAL_IDS.has(id));
      if(present.length) return answer(leastRare(present, found), 2);
    }
  }
  return answer(null, 3);
}

/* Walks the top 5 and takes the best hit, not just the first one.
   A certain candidate in position 3 beats a family guess in position 1.
   predictions = [{label, p}, ...] sorted descending on p. */
function best(predictions, source, opt){
  opt = opt || {};
  const minP = opt.minP || 0.04;
  let best = null;
  for(const pred of predictions){
    if(pred.p < minP) continue;
    const hit = lookup(pred.label, source, opt.found);
    if(!hit || hit.level === 3) continue;
    if(!best || hit.level < best.level || (hit.level === best.level && pred.p > best.p)){
      best = { ...hit, p: pred.p, source };
    }
    if(best.level === 0) break;   // cannot get any better
  }
  if(best) return best;

  /* No hit. Show what the model actually thought anyway. */
  const top = predictions[0];
  const p = top ? parseLabel(top.label, source) : {};
  return {
    id: null, level: 3, levelText: LEVEL_TEXT[3], source,
    latin: p.binomial || p.common || '', common: p.common || '', p: top ? top.p : 0,
  };
}

return { lookup, best, parseLabel, binomialOf, TAXONOMY, LEVEL_TEXT, NOT_A_SPECIES, GROUP_BRIDGE };
})();

if(typeof window !== 'undefined') window.SPECIESMAPPING = SPECIESMAPPING;
