/* VILLMARK - mapping from model label to a species in the library
   Both models give latin names. The ladder runs from an exact hit down to a
   very distant one, and every rung is named on screen so the player always
   sees how far the guess had to travel:

     0 exact binomial      CERTAIN
     1 same genus          NEAREST RELATIVE
     2 same family         UNCERTAIN
     3 same order          DISTANT RELATIVE
     4 same class          SIMILAR SPECIES
     5 same kingdom        SAME GROUP ONLY
     6 nothing             UNKNOWN SPECIES

   Levels 0-2 are pure taxonomy. Levels 3-5 are the wide net: they exist so
   that a picture of a horse, a duck, a beetle or a houseplant still lands on
   something in the library instead of dying as UNKNOWN. Because the evidence
   gets thinner the further down you go, the confidence floor climbs with the
   level - see MIN_P_LEVEL.

   No training, no network - just taxonomy. */

const SPECIESMAPPING = (() => {
'use strict';

/* Genus, family, order, class and kingdom for every species in SPECIES. The
   sci field gives the binomial, but the ranks must live here because the
   models rank on them. */
const TAXONOMY = {
  fox:             { genus:'vulpes',       family:'canidae',         order:'carnivora',       cls:'mammalia',       kingdom:'animalia' },
  squirrel:        { genus:'sciurus',      family:'sciuridae',       order:'rodentia',        cls:'mammalia',       kingdom:'animalia' },
  bear:            { genus:'ursus',        family:'ursidae',         order:'carnivora',       cls:'mammalia',       kingdom:'animalia' },
  wolf:            { genus:'canis',        family:'canidae',         order:'carnivora',       cls:'mammalia',       kingdom:'animalia' },
  hare:            { genus:'lepus',        family:'leporidae',       order:'lagomorpha',      cls:'mammalia',       kingdom:'animalia' },
  lynx:            { genus:'lynx',         family:'felidae',         order:'carnivora',       cls:'mammalia',       kingdom:'animalia' },
  wolverine:       { genus:'gulo',         family:'mustelidae',      order:'carnivora',       cls:'mammalia',       kingdom:'animalia' },
  moose:           { genus:'alces',        family:'cervidae',        order:'artiodactyla',    cls:'mammalia',       kingdom:'animalia' },
  eagleowl:        { genus:'bubo',         family:'strigidae',       order:'strigiformes',    cls:'aves',           kingdom:'animalia' },
  seaeagle:        { genus:'haliaeetus',   family:'accipitridae',    order:'accipitriformes', cls:'aves',           kingdom:'animalia' },
  reindeer:        { genus:'rangifer',     family:'cervidae',        order:'artiodactyla',    cls:'mammalia',       kingdom:'animalia' },
  ptarmigan:       { genus:'lagopus',      family:'phasianidae',     order:'galliformes',     cls:'aves',           kingdom:'animalia' },
  arcticfox:       { genus:'vulpes',       family:'canidae',         order:'carnivora',       cls:'mammalia',       kingdom:'animalia' },
  otter:           { genus:'lutra',        family:'mustelidae',      order:'carnivora',       cls:'mammalia',       kingdom:'animalia' },
  cod:             { genus:'gadus',        family:'gadidae',         order:'gadiformes',      cls:'actinopterygii', kingdom:'animalia' },
  harbourseal:     { genus:'phoca',        family:'phocidae',        order:'carnivora',       cls:'mammalia',       kingdom:'animalia' },
  badger:          { genus:'meles',        family:'mustelidae',      order:'carnivora',       cls:'mammalia',       kingdom:'animalia' },
  pinemarten:      { genus:'martes',       family:'mustelidae',      order:'carnivora',       cls:'mammalia',       kingdom:'animalia' },
  roedeer:         { genus:'capreolus',    family:'cervidae',        order:'artiodactyla',    cls:'mammalia',       kingdom:'animalia' },
  reddeer:         { genus:'cervus',       family:'cervidae',        order:'artiodactyla',    cls:'mammalia',       kingdom:'animalia' },
  capercaillie:    { genus:'tetrao',       family:'phasianidae',     order:'galliformes',     cls:'aves',           kingdom:'animalia' },
  raven:           { genus:'corvus',       family:'corvidae',        order:'passeriformes',   cls:'aves',           kingdom:'animalia' },
  stoat:           { genus:'mustela',      family:'mustelidae',      order:'carnivora',       cls:'mammalia',       kingdom:'animalia' },
  lemming:         { genus:'lemmus',       family:'cricetidae',      order:'rodentia',        cls:'mammalia',       kingdom:'animalia' },
  dipper:          { genus:'cinclus',      family:'cinclidae',       order:'passeriformes',   cls:'aves',           kingdom:'animalia' },
  arcticchar:      { genus:'salvelinus',   family:'salmonidae',      order:'salmoniformes',   cls:'actinopterygii', kingdom:'animalia' },
  beaver:          { genus:'castor',       family:'castoridae',      order:'rodentia',        cls:'mammalia',       kingdom:'animalia' },
  redthroatedloon: { genus:'gavia',        family:'gaviidae',        order:'gaviiformes',     cls:'aves',           kingdom:'animalia' },
  trout:           { genus:'salmo',        family:'salmonidae',      order:'salmoniformes',   cls:'actinopterygii', kingdom:'animalia' },
  hedgehog:        { genus:'erinaceus',    family:'erinaceidae',     order:'eulipotyphla',    cls:'mammalia',       kingdom:'animalia' },
  puffin:          { genus:'fratercula',   family:'alcidae',         order:'charadriiformes', cls:'aves',           kingdom:'animalia' },
  kittiwake:       { genus:'rissa',        family:'laridae',         order:'charadriiformes', cls:'aves',           kingdom:'animalia' },
  herring:         { genus:'clupea',       family:'clupeidae',       order:'clupeiformes',    cls:'actinopterygii', kingdom:'animalia' },
  muskox:          { genus:'ovibos',       family:'bovidae',         order:'artiodactyla',    cls:'mammalia',       kingdom:'animalia' },
  goldenplover:    { genus:'pluvialis',    family:'charadriidae',    order:'charadriiformes', cls:'aves',           kingdom:'animalia' },
  greyseal:        { genus:'halichoerus',  family:'phocidae',        order:'carnivora',       cls:'mammalia',       kingdom:'animalia' },
  porpoise:        { genus:'phocoena',     family:'phocoenidae',     order:'cetacea',         cls:'mammalia',       kingdom:'animalia' },
  salmon:          { genus:'salmo',        family:'salmonidae',      order:'salmoniformes',   cls:'actinopterygii', kingdom:'animalia' },
  saithe:          { genus:'pollachius',   family:'gadidae',         order:'gadiformes',      cls:'actinopterygii', kingdom:'animalia' },

  spruce:          { genus:'picea',        family:'pinaceae',        order:'pinales',         cls:'pinopsida',      kingdom:'plantae' },
  pine:            { genus:'pinus',        family:'pinaceae',        order:'pinales',         cls:'pinopsida',      kingdom:'plantae' },
  birch:           { genus:'betula',       family:'betulaceae',      order:'fagales',         cls:'magnoliopsida',  kingdom:'plantae' },
  hepatica:        { genus:'hepatica',     family:'ranunculaceae',   order:'ranunculales',    cls:'magnoliopsida',  kingdom:'plantae' },
  lingonberry:     { genus:'vaccinium',    family:'ericaceae',       order:'ericales',        cls:'magnoliopsida',  kingdom:'plantae' },
  heather:         { genus:'calluna',      family:'ericaceae',       order:'ericales',        cls:'magnoliopsida',  kingdom:'plantae' },
  cloudberry:      { genus:'rubus',        family:'rosaceae',        order:'rosales',         cls:'magnoliopsida',  kingdom:'plantae' },
  flyagaric:       { genus:'amanita',      family:'amanitaceae',     order:'agaricales',      cls:'agaricomycetes', kingdom:'fungi' },
  chanterelle:     { genus:'cantharellus', family:'cantharellaceae', order:'cantharellales',  cls:'agaricomycetes', kingdom:'fungi' },
  kelp:            { genus:'laminaria',    family:'laminariaceae',   order:'laminariales',    cls:'phaeophyceae',   kingdom:'chromista' },

  aspen:           { genus:'populus',      family:'salicaceae',      order:'malpighiales',    cls:'magnoliopsida',  kingdom:'plantae' },
  bilberry:        { genus:'vaccinium',    family:'ericaceae',       order:'ericales',        cls:'magnoliopsida',  kingdom:'plantae' },
  woodanemone:     { genus:'anemone',      family:'ranunculaceae',   order:'ranunculales',    cls:'magnoliopsida',  kingdom:'plantae' },
  porcini:         { genus:'boletus',      family:'boletaceae',      order:'boletales',       cls:'agaricomycetes', kingdom:'fungi' },
  deadlywebcap:    { genus:'cortinarius',  family:'cortinariaceae',  order:'agaricales',      cls:'agaricomycetes', kingdom:'fungi' },
  blacktrumpet:    { genus:'craterellus',  family:'cantharellaceae', order:'cantharellales',  cls:'agaricomycetes', kingdom:'fungi' },
  rowan:           { genus:'sorbus',       family:'rosaceae',        order:'rosales',         cls:'magnoliopsida',  kingdom:'plantae' },
  juniper:         { genus:'juniperus',    family:'cupressaceae',    order:'pinales',         cls:'pinopsida',      kingdom:'plantae' },
  mountainavens:   { genus:'dryas',        family:'rosaceae',        order:'rosales',         cls:'magnoliopsida',  kingdom:'plantae' },
  ladysslipper:    { genus:'cypripedium',  family:'orchidaceae',     order:'asparagales',     cls:'liliopsida',     kingdom:'plantae' },
  sundew:          { genus:'drosera',      family:'droseraceae',     order:'caryophyllales',  cls:'magnoliopsida',  kingdom:'plantae' },
  cottongrass:     { genus:'eriophorum',   family:'cyperaceae',      order:'poales',          cls:'liliopsida',     kingdom:'plantae' },
  orangebolete:    { genus:'leccinum',     family:'boletaceae',      order:'boletales',       cls:'agaricomycetes', kingdom:'fungi' },
  greyalder:       { genus:'alnus',        family:'betulaceae',      order:'fagales',         cls:'magnoliopsida',  kingdom:'plantae' },
  goatwillow:      { genus:'salix',        family:'salicaceae',      order:'malpighiales',    cls:'magnoliopsida',  kingdom:'plantae' },
  oak:             { genus:'quercus',      family:'fagaceae',        order:'fagales',         cls:'magnoliopsida',  kingdom:'plantae' },
  yew:             { genus:'taxus',        family:'taxaceae',        order:'pinales',         cls:'pinopsida',      kingdom:'plantae' },
  crowberry:       { genus:'empetrum',     family:'ericaceae',       order:'ericales',        cls:'magnoliopsida',  kingdom:'plantae' },
  dwarfcornel:     { genus:'cornus',       family:'cornaceae',       order:'cornales',        cls:'magnoliopsida',  kingdom:'plantae' },
  dwarfbirch:      { genus:'betula',       family:'betulaceae',      order:'fagales',         cls:'magnoliopsida',  kingdom:'plantae' },
  sugarkelp:       { genus:'saccharina',   family:'laminariaceae',   order:'laminariales',    cls:'phaeophyceae',   kingdom:'chromista' },
  knottedwrack:    { genus:'ascophyllum',  family:'fucaceae',        order:'fucales',         cls:'phaeophyceae',   kingdom:'chromista' },
  eelgrass:        { genus:'zostera',      family:'zosteraceae',     order:'alismatales',     cls:'liliopsida',     kingdom:'plantae' },
};

/* Hepatica used to be called Anemone hepatica. FloraSense and iNat21 both use
   the names interchangeably, so we accept either. */
const SYNONYMS = {
  'anemone hepatica': 'hepatica nobilis',
  'hepatica triloba': 'hepatica nobilis',
  'betula alba':      'betula pubescens',
  'cervus tarandus':  'rangifer tarandus',
};

/* The two models do not use the same names for the higher ranks. SpeciesNet
   follows Google's taxonomy, iNat21 follows iNaturalist's, and both carry
   older names that are still in wide use. Everything is folded onto the name
   used in TAXONOMY before it is looked up. */
const ORDER_SYNONYMS = {
  cetartiodactyla: 'artiodactyla',   /* SpeciesNet keeps deer and whales in one order */
  insectivora:     'eulipotyphla',
  soricomorpha:    'eulipotyphla',
  erinaceomorpha:  'eulipotyphla',
  cathartiformes:  'accipitriformes',
  cupressales:     'pinales',
  taxales:         'pinales',
  coniferales:     'pinales',
  cyperales:       'poales',
  orchidales:      'asparagales',
  salicales:       'malpighiales',
  urticales:       'rosales',
};
const CLASS_SYNONYMS = {
  teleostei:          'actinopterygii',
  osteichthyes:       'actinopterygii',
  actinopteri:        'actinopterygii',
  magnoliophyta:      'magnoliopsida',
  dicotyledoneae:     'magnoliopsida',
  monocotyledoneae:   'liliopsida',
  coniferopsida:      'pinopsida',
  pinophyta:          'pinopsida',
  homobasidiomycetes: 'agaricomycetes',
  hymenomycetes:      'agaricomycetes',
};
const KINGDOM_SYNONYMS = {
  metazoa:        'animalia',
  protozoa:       'chromista',
  chromalveolata: 'chromista',
  protista:       'chromista',
  viridiplantae:  'plantae',
};

/* Labels that are not species. SpeciesNet returns these often. */
const NOT_A_SPECIES = new Set(['blank','animal','human','vehicle','unknown','no cv result']);

/* Hand-written bridges, checked after family and before the wide net.
   A bridge exists where taxonomy alone gives a poor answer:

     - Five species have zero coverage in both models: cod and saithe, because
       SpeciesNet has no fish at all and iNat21 has no Gadiformes, and the three
       brown algae, because no model carries Phaeophyceae. Without a bridge they
       are impossible to catch. Those two bridges answer at level 2, as before -
       they are the only route to those five species.
     - Whole groups the library has no order for at all: horses, ducks, falcons,
       sea lions, dolphins. Left to the class net a horse becomes any mammal at
       all; the bridge sends it to the big deer instead.

   Each bridge names the level it answers at, so the screen stays honest.
   Candidates are chosen by the same rule as everywhere else: a species the
   player is missing ahead of one they have, then the least rare. */
const GROUP_BRIDGE = [
  /* fish and algae no model can place */
  { ids:['cod','saithe'], level:2, classes:['actinopterygii','teleostei'] },
  { ids:['kelp','sugarkelp','knottedwrack'], level:2,
    phyla:['rhodophyta','chlorophyta','ochrophyta'],
    classes:['phaeophyceae','florideophyceae','ulvophyceae'],
    orders:['laminariales','fucales'],
    kingdoms:['chromista'] },

  /* whales and dolphins -> the porpoise. iNat keeps Cetacea inside
     Artiodactyla, so without this a dolphin would come out as a roe deer. */
  { ids:['porpoise'], level:3, orders:['cetacea'],
    families:['delphinidae','monodontidae','balaenopteridae','balaenidae',
              'physeteridae','kogiidae','ziphiidae','eschrichtiidae','iniidae'] },

  /* eared seals and the walrus -> the true seals */
  { ids:['harbourseal','greyseal'], level:3,
    families:['otariidae','odobenidae'] },

  /* hoofed animals with no family in the library - horse, rhino, camel, pig,
     giraffe, elephant, hippo -> the big deer and the musk ox */
  { ids:['moose','reddeer','reindeer','muskox'], level:4,
    orders:['perissodactyla','proboscidea','hyracoidea'],
    families:['equidae','rhinocerotidae','tapiridae','elephantidae','giraffidae',
              'camelidae','suidae','tayassuidae','hippopotamidae','tragulidae',
              'antilocapridae'] },

  /* ducks, geese, swans, grebes, herons, cormorants, cranes, petrels
     -> the water birds */
  { ids:['redthroatedloon','kittiwake','puffin'], level:4,
    orders:['anseriformes','podicipediformes','pelecaniformes','suliformes',
            'ciconiiformes','gruiformes','phoenicopteriformes',
            'procellariiformes','sphenisciformes','phaethontiformes'] },

  /* falcons and vultures -> the birds of prey */
  { ids:['seaeagle','eagleowl'], level:4, orders:['falconiformes'] },
];

const norm = s => String(s || '')
  .toLowerCase()
  .replace(/_/g, ' ')
  .replace(/[×x]\s+/g, '')
  .replace(/\s+/g, ' ')
  .trim();

/** normalize a rank name and fold the old names onto the current one */
const rankOf = (table, value) => { const v = norm(value); return table[v] || v; };

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
const ORDER        = new Map();   // "carnivora"     -> [id, ...]
const CLASS        = new Map();   // "mammalia"      -> [id, ...]
const KINGDOM      = new Map();   // "animalia"      -> [id, ...]
const BINOMIAL_IDS = new Set();   // species ids that actually exist in the game

function push(map, key, id){
  if(!key) return;
  if(!map.has(key)) map.set(key, []);
  map.get(key).push(id);
}

for(const sp of (typeof SPECIES !== 'undefined' ? SPECIES : [])){
  const t = TAXONOMY[sp.id];
  if(!t){ console.warn('SPECIESMAPPING: missing taxonomy for', sp.id); continue; }
  BINOMIAL.set(binomialOf(sp.sci), sp.id);
  BINOMIAL_IDS.add(sp.id);
  push(GENUS,   t.genus,   sp.id);
  push(FAMILY,  t.family,  sp.id);
  push(ORDER,   t.order,   sp.id);
  push(CLASS,   t.cls,     sp.id);
  push(KINGDOM, t.kingdom, sp.id);
}

/* When several species share a rank (spruce/pine, lingonberry/heather,
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
   Empty fields mean a higher taxonomic level, or a non-animal.
   The format carries no kingdom, but the model knows animals only, so any
   label that has a rank on it is an animal. */
function parseSpeciesNet(label){
  const f = String(label).split(';');
  if(f.length < 7) return { common: norm(label) };
  const [, taxClass, order, family, genus, species, common] = f.map(norm);
  const anyRank = taxClass || order || family || genus;
  return {
    binomial: genus && species ? (SYNONYMS[genus + ' ' + species] || genus + ' ' + species) : '',
    genus,
    family,
    order:    rankOf(ORDER_SYNONYMS, order),
    taxClass: rankOf(CLASS_SYNONYMS, taxClass),
    kingdom:  anyRank ? 'animalia' : '',
    common,
  };
}

/* iNat21: the export script writes {name, genus, family, order, class, phylum,
   kingdom} per class. Falls back to a plain name string if someone feeds in a
   simple list. */
function parseInat(label){
  if(label && typeof label === 'object'){
    return {
      binomial: binomialOf(label.name),
      genus: norm(label.genus) || binomialOf(label.name).split(' ')[0],
      family: norm(label.family),
      order: rankOf(ORDER_SYNONYMS, label.order),
      taxClass: rankOf(CLASS_SYNONYMS, label.class || label.taxClass),
      phylum: norm(label.phylum),
      kingdom: rankOf(KINGDOM_SYNONYMS, label.kingdom),
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

const LEVEL_TEXT = [
  'CERTAIN',            // 0 exact binomial
  'NEAREST RELATIVE',   // 1 same genus
  'UNCERTAIN',          // 2 same family, and the two coverage bridges
  'DISTANT RELATIVE',   // 3 same order
  'SIMILAR SPECIES',    // 4 same class, and the group bridges
  'SAME GROUP ONLY',    // 5 same kingdom
  'UNKNOWN SPECIES',    // 6 nothing
];
const NO_MATCH = LEVEL_TEXT.length - 1;

function bridgeHit(bridge, p){
  return !!((bridge.families && bridge.families.includes(p.family))  ||
            (bridge.orders   && bridge.orders.includes(p.order))     ||
            (bridge.classes  && bridge.classes.includes(p.taxClass)) ||
            (bridge.phyla    && bridge.phyla.includes(p.phylum))     ||
            (bridge.kingdoms && bridge.kingdoms.includes(p.kingdom)));
}

/* Returns {id, level, levelText, latin, common, from} or null for non-species.
   found is the player's collection, used to break ties from genus downwards.
   `from` is the model's own name for what it saw. The screen shows it as
   MAPPED FROM whenever the level is worse than CERTAIN. */
function lookup(label, source, found){
  const p = parseLabel(label, source);
  if(NOT_A_SPECIES.has(p.common) && !p.binomial) return null;

  const latin = p.binomial || p.family || p.common;
  const answer = (id, level) => ({
    id, level, levelText: LEVEL_TEXT[level], latin, common: p.common,
    from: p.binomial || p.common || p.family || p.order || p.taxClass || '',
  });

  if(p.binomial && BINOMIAL.has(p.binomial)) return answer(BINOMIAL.get(p.binomial), 0);
  if(p.genus   && GENUS.has(p.genus))        return answer(leastRare(GENUS.get(p.genus), found), 1);
  if(p.family  && FAMILY.has(p.family))      return answer(leastRare(FAMILY.get(p.family), found), 2);

  for(const bridge of GROUP_BRIDGE){
    if(!bridgeHit(bridge, p)) continue;
    const present = bridge.ids.filter(id => BINOMIAL_IDS.has(id));
    if(present.length) return answer(leastRare(present, found), bridge.level);
  }

  /* The wide net. Only reached when nothing above matched, and every rung here
     needs a high confidence to count - see MIN_P_LEVEL. */
  if(p.order    && ORDER.has(p.order))     return answer(leastRare(ORDER.get(p.order), found), 3);
  if(p.taxClass && CLASS.has(p.taxClass))  return answer(leastRare(CLASS.get(p.taxClass), found), 4);
  if(p.kingdom  && KINGDOM.has(p.kingdom)) return answer(leastRare(KINGDOM.get(p.kingdom), found), 5);

  return answer(null, NO_MATCH);
}

/* The lowest probability accepted, per level. Weaker evidence demands higher
   confidence: an exact species name at 12 % is worth more than a family guess
   at 12 %, and a guess that knows nothing but the kingdom must be near certain
   about that much.

   The numbers are measured, not guessed. The model has no "nothing here" exit,
   so a picture of a PC always gives an answer - just a weak one. Measured on
   eight pictures of a car, a keyboard, a desk, a coffee cup and a brick wall,
   every hit landed between 1.4 % and 12.5 %, and the only ones that reached a
   species at all sat at 5-6 % (car -> WOLF, desk -> EAGLE OWL, keyboard ->
   SAITHE). Real finds landed at 46-99 %, with one exception: birch hit exactly
   at 12.5 %.

   That is why the floor for an exact species hit sits low and the floor for
   guesses sits high. Fine-grained models with 10,000 classes spread the
   probability, so an exact name is strong evidence in itself. The floors for
   levels 3-5 sit far above everything measured on the junk pictures, so the
   wide net catches real animals and plants and not furniture. */
const MIN_P_LEVEL = [0.10, 0.25, 0.40, 0.50, 0.60, 0.72];

/* Walks the top 5 and takes the best hit, not just the first one.
   A certain candidate in position 3 beats a family guess in position 1.
   predictions = [{label, p}, ...] sorted descending on p. */
function best(predictions, source, opt){
  opt = opt || {};
  const minP = opt.minP || 0.01;
  let best = null;
  for(const pred of predictions){
    if(pred.p < minP) continue;
    const hit = lookup(pred.label, source, opt.found);
    if(!hit || hit.level === NO_MATCH) continue;
    if(pred.p < MIN_P_LEVEL[hit.level]) continue;
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
    id: null, level: NO_MATCH, levelText: LEVEL_TEXT[NO_MATCH], source,
    latin: p.binomial || p.common || '', common: p.common || '',
    from: p.binomial || p.common || '', p: top ? top.p : 0,
  };
}

return { lookup, best, parseLabel, binomialOf, TAXONOMY, LEVEL_TEXT, NO_MATCH,
         NOT_A_SPECIES, GROUP_BRIDGE, MIN_P_LEVEL };
})();

if(typeof window !== 'undefined') window.SPECIESMAPPING = SPECIESMAPPING;
