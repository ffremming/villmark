/* VILLMARK - mapping fra modellabel til art i biblioteket
   Begge modellene gir latinske navn. Fire nivaaer:
     0 eksakt binomial  1 samme slekt  2 samme familie  3 ingen match
   Ingen trening, ingen nett - bare taksonomi. */

const ARTSMAPPING = (() => {
'use strict';

/* Slekt og familie for hver art i SPECIES. sci-feltet gir binomialet,
   men slekt og familie maa staa her fordi modellene rangerer paa dem. */
const TAKSONOMI = {
  rev:        { genus:'vulpes',       family:'canidae' },
  ekorn:      { genus:'sciurus',      family:'sciuridae' },
  bjorn:      { genus:'ursus',        family:'ursidae' },
  ulv:        { genus:'canis',        family:'canidae' },
  hare:       { genus:'lepus',        family:'leporidae' },
  gaupe:      { genus:'lynx',         family:'felidae' },
  jerv:       { genus:'gulo',         family:'mustelidae' },
  elg:        { genus:'alces',        family:'cervidae' },
  hubro:      { genus:'bubo',         family:'strigidae' },
  havorn:     { genus:'haliaeetus',   family:'accipitridae' },
  rein:       { genus:'rangifer',     family:'cervidae' },
  rype:       { genus:'lagopus',      family:'phasianidae' },
  fjellrev:   { genus:'vulpes',       family:'canidae' },
  oter:       { genus:'lutra',        family:'mustelidae' },
  torsk:      { genus:'gadus',        family:'gadidae' },
  steinkobbe: { genus:'phoca',        family:'phocidae' },
  grevling:   { genus:'meles',        family:'mustelidae' },
  mar:        { genus:'martes',       family:'mustelidae' },
  radyr:      { genus:'capreolus',    family:'cervidae' },
  hjort:      { genus:'cervus',       family:'cervidae' },
  storfugl:   { genus:'tetrao',       family:'phasianidae' },
  ravn:       { genus:'corvus',       family:'corvidae' },
  royskatt:   { genus:'mustela',      family:'mustelidae' },
  lemen:      { genus:'lemmus',       family:'cricetidae' },
  fossekall:  { genus:'cinclus',      family:'cinclidae' },
  roye:       { genus:'salvelinus',   family:'salmonidae' },
  bever:      { genus:'castor',       family:'castoridae' },
  smalom:     { genus:'gavia',        family:'gaviidae' },
  orret:      { genus:'salmo',        family:'salmonidae' },
  piggsvin:   { genus:'erinaceus',    family:'erinaceidae' },
  lunde:      { genus:'fratercula',   family:'alcidae' },
  krykkje:    { genus:'rissa',        family:'laridae' },
  sild:       { genus:'clupea',       family:'clupeidae' },
  moskus:     { genus:'ovibos',       family:'bovidae' },
  heilo:      { genus:'pluvialis',    family:'charadriidae' },
  havert:     { genus:'halichoerus',  family:'phocidae' },
  nise:       { genus:'phocoena',     family:'phocoenidae' },
  laks:       { genus:'salmo',        family:'salmonidae' },
  sei:        { genus:'pollachius',   family:'gadidae' },

  gran:       { genus:'picea',        family:'pinaceae' },
  furu:       { genus:'pinus',        family:'pinaceae' },
  bjork:      { genus:'betula',       family:'betulaceae' },
  blaveis:    { genus:'hepatica',     family:'ranunculaceae' },
  tyttebaer:  { genus:'vaccinium',    family:'ericaceae' },
  rosslyng:   { genus:'calluna',      family:'ericaceae' },
  molte:      { genus:'rubus',        family:'rosaceae' },
  fluesopp:   { genus:'amanita',      family:'amanitaceae' },
  kantarell:  { genus:'cantharellus', family:'cantharellaceae' },
  tare:       { genus:'laminaria',    family:'laminariaceae' },

  osp:          { genus:'populus',      family:'salicaceae' },
  blabaer:      { genus:'vaccinium',    family:'ericaceae' },
  hvitveis:     { genus:'anemone',      family:'ranunculaceae' },
  steinsopp:    { genus:'boletus',      family:'boletaceae' },
  giftslorsopp: { genus:'cortinarius',  family:'cortinariaceae' },
  trompetsopp:  { genus:'craterellus',  family:'cantharellaceae' },
  rogn:         { genus:'sorbus',       family:'rosaceae' },
  einer:        { genus:'juniperus',    family:'cupressaceae' },
  reinrose:     { genus:'dryas',        family:'rosaceae' },
  marisko:      { genus:'cypripedium',  family:'orchidaceae' },
  soldogg:      { genus:'drosera',      family:'droseraceae' },
  myrull:       { genus:'eriophorum',   family:'cyperaceae' },
  rodskrubb:    { genus:'leccinum',     family:'boletaceae' },
  graor:        { genus:'alnus',        family:'betulaceae' },
  selje:        { genus:'salix',        family:'salicaceae' },
  eik:          { genus:'quercus',      family:'fagaceae' },
  barlind:      { genus:'taxus',        family:'taxaceae' },
  krekling:     { genus:'empetrum',     family:'ericaceae' },
  skrubbaer:    { genus:'cornus',       family:'cornaceae' },
  dvergbjork:   { genus:'betula',       family:'betulaceae' },
  sukkertare:   { genus:'saccharina',   family:'laminariaceae' },
  grisetang:    { genus:'ascophyllum',  family:'fucaceae' },
  alegras:      { genus:'zostera',      family:'zosteraceae' },
};

/* Blaaveis het Anemone hepatica for. FloraSense og iNat21 bruker begge
   navn om hverandre, saa vi godtar begge. */
const SYNONYMER = {
  'anemone hepatica': 'hepatica nobilis',
  'hepatica triloba': 'hepatica nobilis',
  'betula alba':      'betula pubescens',
  'cervus tarandus':  'rangifer tarandus',
};

/* Labels som ikke er arter. SpeciesNet returnerer disse ofte. */
const IKKE_ART = new Set(['blank','animal','human','vehicle','unknown','no cv result']);

/* Fem arter har null dekning i begge modellene:
     torsk, sei   - SpeciesNet har ingen fisk i det hele tatt, og iNat21 har
                    183 fiskearter men ingen Gadiformes
     tare, sukkertare, grisetang
                  - ingen brunalger noe sted. iNat21 har elleve andre
                    makroalger (Ulva, Chondrus, Corallina, Codium ...)
   Uten en bro er de umulige aa fange. Broen fanger opp hoyere taksonomiske
   niva og lander paa en av kandidatene, alltid som USIKKER, saa spilleren
   ser at det var en gjetning.

   Broen sjekkes etter slekt og familie. En laks gir derfor Salmo salar
   eksakt og naar aldri fiskebroen; bare fisk ingen av modellene plasserer
   havner der. Kandidatene velges med samme regel som ellers: en art
   spilleren mangler foran en han har, deretter minst sjeldne. */
const GRUPPEBRO = [
  { ider:['torsk','sei'], klasser:['actinopterygii','teleostei'] },
  { ider:['tare','sukkertare','grisetang'],
    fyla:['rhodophyta','chlorophyta','ochrophyta'],
    klasser:['phaeophyceae','florideophyceae','ulvophyceae'],
    ordener:['laminariales','fucales'] },
];

const norm = s => String(s || '')
  .toLowerCase()
  .replace(/_/g, ' ')
  .replace(/[×x]\s+/g, '')
  .replace(/\s+/g, ' ')
  .trim();

/* Latinske navn i modellene har ofte autornavn paa slutten:
   "Picea abies (L.) H.Karst." -> "picea abies".
   Vi tar de to forste ordene som bare inneholder bokstaver. */
function binomialAv(navn){
  const ord = norm(navn).split(' ').filter(o => /^[a-zæøå.-]+$/.test(o));
  if(ord.length < 2) return ord[0] || '';
  const bi = ord[0] + ' ' + ord[1].replace(/\.$/, '');
  return SYNONYMER[bi] || bi;
}

/* Indekser bygges naar SPECIES finnes. species.js lastes for denne fila. */
const BINOMIAL    = new Map();   // "vulpes vulpes" -> id
const SLEKT       = new Map();   // "vulpes"        -> [id, ...]
const FAMILIE     = new Map();   // "canidae"       -> [id, ...]
const BINOMIAL_ID = new Set();   // artsid-er som faktisk finnes i spillet

for(const sp of (typeof SPECIES !== 'undefined' ? SPECIES : [])){
  const t = TAKSONOMI[sp.id];
  if(!t){ console.warn('ARTSMAPPING: mangler taksonomi for', sp.id); continue; }
  BINOMIAL.set(binomialAv(sp.sci), sp.id);
  BINOMIAL_ID.add(sp.id);
  if(!SLEKT.has(t.genus))    SLEKT.set(t.genus, []);
  if(!FAMILIE.has(t.family)) FAMILIE.set(t.family, []);
  SLEKT.get(t.genus).push(sp.id);
  FAMILIE.get(t.family).push(sp.id);
}

/* Naar flere arter deler slekt eller familie (gran/furu, tyttebaer/rosslyng,
   rev/fjellrev) maa en av dem velges.

   Forst: en art spilleren mangler slaar en han alt har. Uten den regelen
   ville fjellrev vaert umulig - ingen av modellene kjenner Vulpes lagopus,
   saa fjellrev naas bare paa slektsniva, og der ville rev alltid vunnet.
   Deretter: minst sjeldne. En bom paa "ursidae" skal ikke dele ut spillets
   sjeldneste kort. */
function minstSjeldne(ider, funnet){
  if(ider.length === 1) return ider[0];
  const tab = typeof SPECIES_BY_ID !== 'undefined' ? SPECIES_BY_ID : {};
  const har = id => !!(funnet && funnet.has && funnet.has(id));
  return ider.slice().sort((a,b) =>
    (har(a) - har(b)) || ((tab[a]?.sjelden || 9) - (tab[b]?.sjelden || 9))
  )[0];
}

/* --- parsing av de to labelformatene ------------------------------------ */

/* SpeciesNet: "uuid;class;order;family;genus;species;common name"
   Tomme felter betyr hoyere taksonomisk niva eller ikke-dyr. */
function parseSpeciesNet(label){
  const f = String(label).split(';');
  if(f.length < 7) return { felles: norm(label) };
  const [, klasse, orden, familie, slekt, art, felles] = f.map(norm);
  return {
    binomial: slekt && art ? (SYNONYMER[slekt + ' ' + art] || slekt + ' ' + art) : '',
    genus: slekt, family: familie, order: orden, klasse, felles,
  };
}

/* iNat21: eksportskriptet skriver {name, genus, family, kingdom} per klasse.
   Faller tilbake til ren navnestreng om noen mater inn en enkel liste. */
function parseInat(label){
  if(label && typeof label === 'object'){
    return {
      binomial: binomialAv(label.name),
      genus: norm(label.genus) || binomialAv(label.name).split(' ')[0],
      family: norm(label.family),
      order: norm(label.order),
      klasse: norm(label.class || label.klasse),
      phylum: norm(label.phylum),
      rike: norm(label.kingdom),
      felles: norm(label.common_name || label.name),
    };
  }
  const bi = binomialAv(label);
  return { binomial: bi, genus: bi.split(' ')[0], family: '', felles: norm(label) };
}

function parseLabel(label, kilde){
  return kilde === 'speciesnet' ? parseSpeciesNet(label) : parseInat(label);
}

/* --- selve oppslaget ----------------------------------------------------- */

const NIVA_TEKST = ['SIKKER', 'NÆRMESTE SLEKTNING', 'USIKKER', 'UKJENT ART'];

/* Returnerer {id, niva, nivaTekst, latin, felles} eller null for ikke-arter.
   funnet er spillerens samling, brukt til aa bryte uavgjort paa slekt og familie. */
function slaaOpp(label, kilde, funnet){
  const p = parseLabel(label, kilde);
  if(IKKE_ART.has(p.felles) && !p.binomial) return null;

  const latin = p.binomial || p.family || p.felles;
  const svar = (id, niva) => ({ id, niva, nivaTekst: NIVA_TEKST[niva], latin, felles: p.felles });

  if(p.binomial && BINOMIAL.has(p.binomial)) return svar(BINOMIAL.get(p.binomial), 0);
  if(p.genus   && SLEKT.has(p.genus))        return svar(minstSjeldne(SLEKT.get(p.genus), funnet), 1);
  if(p.family  && FAMILIE.has(p.family))     return svar(minstSjeldne(FAMILIE.get(p.family), funnet), 2);

  for(const bro of GRUPPEBRO){
    if((bro.klasser && bro.klasser.includes(p.klasse)) ||
       (bro.ordener && bro.ordener.includes(p.order))  ||
       (bro.fyla    && bro.fyla.includes(p.phylum))){
      const finnes = bro.ider.filter(id => BINOMIAL_ID.has(id));
      if(finnes.length) return svar(minstSjeldne(finnes, funnet), 2);
    }
  }
  return svar(null, 3);
}

/* Laveste sannsynlighet som godtas, per niva. Svakere bevis krever hoyere
   sikkerhet: et eksakt artsnavn paa 12 % er verdt mer enn en familiegjetning
   paa 12 %.

   Tallene er malt, ikke gjettet. Modellen har ingen "ingenting her"-utgang,
   saa et bilde av en PC gir alltid et svar - bare et svakt et. Malt paa aatte
   bilder av bil, tastatur, skrivebord, kaffekopp og murvegg laa alle treffene
   mellom 1,4 % og 12,5 %, og de eneste som naadde helt opp til en art laa paa
   5-6 % (bil -> ULV, skrivebord -> HUBRO, tastatur -> SEI). Ekte funn laa paa
   46-99 %, med ett unntak: bjork traff eksakt paa 12,5 %.

   Derfor staar gulvet for eksakt artstreff lavt og gulvet for gjetninger
   hoyt. Finkornede modeller med 10 000 klasser sprer sannsynligheten, saa et
   eksakt navn er i seg selv sterkt bevis. */
const MIN_P_NIVA = [0.10, 0.25, 0.40];

/* Gaar gjennom topp-5 og tar det beste treffet, ikke bare det forste.
   En sikker treff-kandidat paa plass 3 slaar en familiegjetning paa plass 1.
   predikasjoner = [{label, p}, ...] sortert synkende paa p. */
function beste(predikasjoner, kilde, opt){
  opt = opt || {};
  const minP = opt.minP || 0.01;
  let best = null;
  for(const pred of predikasjoner){
    if(pred.p < minP) continue;
    const treff = slaaOpp(pred.label, kilde, opt.funnet);
    if(!treff || treff.niva === 3) continue;
    if(pred.p < MIN_P_NIVA[treff.niva]) continue;
    if(!best || treff.niva < best.niva || (treff.niva === best.niva && pred.p > best.p)){
      best = { ...treff, p: pred.p, kilde };
    }
    if(best.niva === 0) break;   // kan ikke bli bedre
  }
  if(best) return best;

  /* Ingen treff. Vis likevel hva modellen faktisk trodde. */
  const topp = predikasjoner[0];
  const p = topp ? parseLabel(topp.label, kilde) : {};
  return {
    id: null, niva: 3, nivaTekst: NIVA_TEKST[3], kilde,
    latin: p.binomial || p.felles || '', felles: p.felles || '', p: topp ? topp.p : 0,
  };
}

return { slaaOpp, beste, parseLabel, binomialAv, TAKSONOMI, NIVA_TEKST, IKKE_ART, GRUPPEBRO, MIN_P_NIVA };
})();

if(typeof window !== 'undefined') window.ARTSMAPPING = ARTSMAPPING;
