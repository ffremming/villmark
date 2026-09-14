/* VILLMARK - SPECIES ARTICLES
   The long text about each species: intro, key figures, sections and funfacts.
   The fact field in species.js is the one-liner on the detail screen. This file
   holds the thorough material that READ MORE opens.

   Every field is a plain text string. The panel is drawn at the bottom of the
   file and opened with ARTICLE.show(speciesId). */

const ARTICLES = {

/* ============================================================ SPRUCE FOREST */
fox: {
  intro:'The fox is Norway\'s most common predator and is found from the shoreline to above the tree line. It gets by everywhere because it eats almost anything, and because it takes the chance of living close to people.',
  facts:[
    ['BODY','45–90 cm, tail 30–55 cm'],
    ['WEIGHT','3–10 kg'],
    ['LIFESPAN','3–5 years in the wild'],
    ['DIET','small rodents, birds, eggs, insects, berries, carrion'],
    ['RANGE','the whole country, up into the low mountains'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The fox hunts mostly at dusk and at night, and uses its hearing more than its sight. It pinpoints the sound of a mouse under the snow, rises on its hind legs and dives straight down through the crust snout first. In winter it lives on rodents and carrion, in summer on everything from earthworms to bilberries. The vixen gives birth to 4–6 cubs in April, and both parents carry food to the den.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Rust-red fur, white belly, black socks and a heavy tail with a white tip. The trail lies in an almost straight line across the snow, because the fox places its hind foot in the print from the front foot. Dog tracks zigzag to the sides; fox tracks do not.'},
    { title:'PEOPLE AND SPECIES',
      body:'The fox follows us. It rummages through rubbish in town and puts its cubs under the cabin veranda. In the 1970s and 80s fox mange wiped out large parts of the population in southern Norway, but it recovered over a few decades. The fox can carry the fox tapeworm, so berries and mushrooms should be rinsed before they are eaten raw.'},
  ],
  funfacts:[
    'A fox pouncing on mice prefers to aim north–south. Researchers believe it uses the earth\'s magnetic field to line up the shot.',
    'The fox has more than twenty different calls. The screams you hear on a winter night are mating, not fighting.',
    'The tail works as a balancing pole in the turns, and as a blanket over the snout when the fox sleeps out in sub-zero temperatures.',
    'The cubs are grey-brown for their first weeks. The red colour only comes in June.',
  ],
},

squirrel: {
  intro:'The red squirrel is the forest\'s gardener. It hides seeds in thousands of small places and forgets enough of them that new trees grow up where it passed.',
  facts:[
    ['BODY','20–25 cm, tail 15–20 cm'],
    ['WEIGHT','250–350 g'],
    ['LIFESPAN','3–5 years'],
    ['DIET','spruce seeds, pine seeds, nuts, fungi, buds, eggs'],
    ['RANGE','coniferous and mixed forest throughout the country'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The squirrel does not hibernate. It lies in the drey during the hardest cold spells and lives off buried stores. Good cone seasons give many young, poor years give almost none. The drey is a dense ball of twigs and bast high up against the trunk, and a squirrel family keeps several dreys in use at the same time.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Red-brown summer coat, grey-brown winter coat with clear tufts on the ears. If you find a cone with only the core left, a squirrel has been eating. Crossbills bend the cone scales out to the sides instead of gnawing them off.'},
    { title:'PEOPLE AND SPECIES',
      body:'The squirrel is one of the few wild animals people see at close range every week. It happily comes to feeding trays, but nuts in the shell are better food than bread. The species is protected outside the set hunting season.'},
  ],
  funfacts:[
    'The squirrel can twist its hind foot almost all the way backwards and hook its claws into the bark. That is why it can run down a tree head first.',
    'The tail is a rudder in the air. A squirrel makes jumps of over four metres between tree crowns.',
    'It hangs mushrooms up to dry in tree branches. Dry mushrooms do not go mouldy in the winter store.',
    'The front teeth grow all through life and are worn down against cones and nutshells.',
  ],
},

bear: {
  intro:'The brown bear is Norway\'s largest predator, but it lives mostly on plants. Nine out of ten mouthfuls are berries, herbs, grass and ants. It is shy and moves away from people whenever it gets the chance.',
  facts:[
    ['BODY','1.5–2.2 m, shoulder height around 1 m'],
    ['WEIGHT','male 100–320 kg, female 60–200 kg'],
    ['LIFESPAN','20–30 years'],
    ['DIET','berries, herbs, ants, carrion, moose calves, sheep'],
    ['RANGE','the border districts towards Sweden, Finland and Russia'],
    ['STATUS','endangered in Norway'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The bear eats its way through the autumn and puts on tens of kilos of fat, mostly from bilberries. Then it digs a den under an upturned root plate or in a boulder scree and lies in hibernation from November to April. In the den the heart rate falls from around 40 to under 10 beats a minute. It does not drink, does not eat and does not pass water all winter.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Heavy body, high shoulder hump and short ears. The hind footprint is long and looks almost human, with five toes and claw marks in front of the pads. The bear often leaves droppings full of bilberry skins along paths in August.'},
    { title:'PEOPLE AND SPECIES',
      body:'Norway has around 150 bears, and most of them are males wandering in from the neighbouring countries. Females with cubs are what the population grows from, and they are the fewest. The conflict is about sheep and beehives, and the bear is managed with predator zones and licensed culling.'},
  ],
  funfacts:[
    'The female gives birth in the middle of hibernation. The cubs weigh 300–500 grams, are blind and naked, and suckle while the mother sleeps on.',
    'The bear has a better nose than a tracking dog and can pick up a carcass several kilometres away.',
    'It can reach 50 km/h in a short sprint, downhill on steep slopes as well.',
    'Bears rub their backs against regular rubbing trees. The hair left behind is used for DNA counts of the population.',
  ],
},

wolf: {
  intro:'The wolf is the dog\'s wild ancestor and lives in family packs with a parent pair and that year\'s pups. No species in Norway sets off a fiercer fight between conservation and grazing interests.',
  facts:[
    ['BODY','1–1.5 m, shoulder height 70–85 cm'],
    ['WEIGHT','30–55 kg'],
    ['LIFESPAN','8–13 years'],
    ['DIET','moose, roe deer, red deer, beaver, sheep'],
    ['RANGE','the wolf zone in Innlandet and Viken, roaming animals elsewhere'],
    ['STATUS','critically endangered in Norway'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The pack is one family: a parent pair, this year\'s pups and often a few from last year. The young disperse at one to two years old and may travel over a thousand kilometres to find free land and a mate. A pack in Scandinavia takes mostly moose, around a hundred animals a year, and calves make up the bulk of them.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Grey-yellow fur, long legs, a straight tail and a narrower chest than a German shepherd. The track is larger than a dog track and lies in a straight line, and the pack often walks in each other\'s prints, so it looks as though a single animal has passed.'},
    { title:'PEOPLE AND SPECIES',
      body:'The wolf was wiped out in Norway in the 1960s. Today\'s Scandinavian population goes back to a handful of animals that came in from Finland and Russia, and inbreeding is therefore a real problem. Parliament steers the population with population targets and a wolf zone, and licensed culling is decided every winter.'},
  ],
  funfacts:[
    'A wolf howl carries over 10 km in still winter air. The pack howls in different tones at once, so it sounds bigger than it is.',
    'The wolf can trot for hours on end and cover 50 km in a day.',
    'Only the parent pair have pups. The others in the pack help look after the litter.',
    'Every dog breed from chihuahua to great dane descends from wolves that were tamed around 15 000 years ago.',
  ],
},

spruce: {
  intro:'The Norway spruce is Norway\'s most important timber tree and the spruce forest itself. It tolerates shade as a young tree, shoots up when its neighbours fall, and shapes dark, dense forests.',
  facts:[
    ['HEIGHT','25–40 m, single trees over 45 m'],
    ['AGE','200–400 years'],
    ['NEEDLES','short, stiff, square in cross-section'],
    ['HABITAT','moist, nutrient-rich forest soil in the lowlands'],
    ['USES','construction timber, paper, tonewood in instruments'],
    ['STATUS','least concern, planted on a large scale'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The spruce has a flat root system just below the surface. That gives fast growth on good soil, but leaves the tree exposed to windthrow in a storm. The cones hang downwards, unlike those of the silver fir, and release their seeds in winter. A good cone year comes every few years and steers both the squirrel and the crossbill population.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Pointed top, branches in clear tiers and hanging cones of 10–15 cm. The needles sit all around the twig and prick the hand. Pine, by contrast, has needles in pairs and lighter, scaly bark at the top.'},
    { title:'PEOPLE AND SPECIES',
      body:'The spruce came from the east and became common in Norway a couple of thousand years ago. It has been planted densely in Norwegian forestry all through the 1900s, and accounts for the bulk of the harvest. The spruce bark beetle can kill weakened trees across large patches after dry summers.'},
  ],
  funfacts:[
    'Old Tjikko in Dalarna is a spruce with a root system dated to around 9 550 years. The trunk is young, the roots are ancient.',
    'Resonance spruce with even, narrow annual rings is used in violins and guitars. It grows slowly on cold, high-lying hillsides.',
    'Spruce shoots are edible in spring and contain a lot of vitamin C.',
    'A spruce can carry over 100 000 needles. Each needle lives 5–7 years before it is shed.',
  ],
},

flyagaric: {
  intro:'The fly agaric is the mushroom everyone recognises: a bright red cap with white flecks. It is poisonous, but also a partner to the trees it stands under.',
  facts:[
    ['CAP','8–20 cm in diameter'],
    ['SEASON','August–October'],
    ['HABITAT','under birch and spruce on acid soil'],
    ['TOXIN','ibotenic acid and muscimol'],
    ['RELATIVES','the destroying angel and the death cap are deadly'],
    ['STATUS','least concern and common'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The mushroom you see is only the fruiting body. Under the ground lies a net of fungal threads that grow together with the fine roots of birch and spruce. The tree gives sugar, the fungus gives water and minerals back. That is why the fly agaric cannot be grown on a tray; it has to have a living tree root to live with.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Red to orange cap with white warts, white gills, a white ring on the stem and a clear bulb at the base. The warts are the remains of the veil and can be washed off by rain, so an old fly agaric can be completely smooth and red.'},
    { title:'PEOPLE AND SPECIES',
      body:'The fly agaric causes poisoning with nausea, confusion and intoxication, and rarely death in adults. It was used in rituals in northern Siberia, and the name comes from pieces of the mushroom in milk being set out as fly poison. It must not be eaten, not even after boiling.'},
  ],
  funfacts:[
    'Reindeer seek out the fly agaric and eat it willingly.',
    'The toxin is not broken down by drying, but changes form: ibotenic acid becomes muscimol, which acts more strongly.',
    'The red cap is round as a ball when the mushroom breaks through the soil, and flattens out like a plate after a few days.',
    'The Amanita genus holds both the most common deadly mushrooms in Norway and several good edible ones.',
  ],
},

chanterelle: {
  intro:'The chanterelle is the safest and most sought-after edible mushroom in the Norwegian forest. It smells of apricot, and picking spots are kept secret for generations.',
  facts:[
    ['CAP','3–10 cm, funnel with a wavy edge'],
    ['SEASON','July–October'],
    ['HABITAT','moss and heather under spruce, pine and birch'],
    ['COLOUR','egg-yolk yellow all the way through'],
    ['LOOKALIKES','the false chanterelle is harmless, but tasteless'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The chanterelle lives in symbiosis with tree roots, exactly like the fly agaric. That is why there is no chanterelle farming; every chanterelle in the shops has been picked in the forest. It returns to the same patch year after year as long as the forest floor is not damaged, and a good spot can last for decades.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Evenly yellow all over, inside as well when you break it open. Under the cap there are no gills, but blunt ridges that run some way down the stem. The flesh is firm and fibrous, and the smell is reminiscent of apricot.'},
    { title:'PEOPLE AND SPECIES',
      body:'Chanterelles should be fried dry first, so the water steams off before the butter goes in. Pick with a knife or twist them gently loose; the forest floor is damaged by rough raking. The right of public access gives free mushroom picking in uncultivated land throughout the country, with separate rules for cloudberries in Nordland, Troms and Finnmark.'},
  ],
  funfacts:[
    'The apricot smell comes from aromatic compounds that disappear with long boiling. Quick frying keeps them.',
    'Chanterelles hold a lot of vitamin D for a vegetable alternative, and the vitamin increases in sunlight.',
    'The first night frost ends the season. The mushroom turns soft and dark.',
    'The false chanterelle has true gills and an orange colour, and grows most often in leaf litter and on stumps.',
  ],
},

badger: {
  intro:'The badger is a digging machine with fur. It lives in large tunnel systems that are handed down between generations, and lives mostly on earthworms.',
  facts:[
    ['BODY','60–90 cm, tail 12–20 cm'],
    ['WEIGHT','10–20 kg, heaviest in autumn'],
    ['LIFESPAN','5–10 years'],
    ['DIET','earthworms, insects, roots, berries, eggs, carrion'],
    ['RANGE','southern and central Norway, up to Nordland'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The badger is nocturnal and walks slowly and systematically along the same foraging loop night after night. Earthworms make up the bulk of its food, and a single badger can take several hundred worms on a good, damp night. In winter it settles into a torpor-like rest in the sett, but it does not sleep right through like the bear; it comes out during mild spells.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Low, broad body, grey fur and a white head with two black stripes through the eyes. The track has five toes with long digging claws at the front. The badger digs small funnels in lawns when it hunts for larvae, and leaves its droppings in separate pits by the sett.'},
    { title:'PEOPLE AND SPECIES',
      body:'The badger has moved into towns and cabin areas and lives well on compost and windfall fruit. It is protected outside the hunting season. The badger can carry the fox\'s mange and should not be fed, because feeding makes several animals gather in one place.'},
  ],
  funfacts:[
    'A badger sett can hold over a hundred metres of tunnels and several dozen entrances, and some setts have been in use for over a hundred years.',
    'The badger carries dry grass and moss inside as bedding, and drags it out into the sun to air.',
    'It has delayed embryo development: mating happens in summer, but the embryo only starts to grow in December.',
    'Badger and fox sometimes use the same sett at the same time, each in their own tunnel.',
  ],
},

pinemarten: {
  intro:'The pine marten is the forest\'s acrobat. It hunts in the tree crowns, takes squirrels on their own ground, and is one of the hardest species to catch sight of in Norwegian nature.',
  facts:[
    ['BODY','45–55 cm, tail 20–25 cm'],
    ['WEIGHT','1–2 kg'],
    ['LIFESPAN','8–10 years'],
    ['DIET','squirrels, small rodents, birds, eggs, berries, insects'],
    ['RANGE','coniferous and mixed forest throughout the country'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The marten hunts mostly at dusk and at night, and moves just as well up in the trees as on the ground. It uses hollow trees, old woodpecker holes and squirrel dreys as resting places, and keeps several in use within its territory. The diet shifts with the season: small rodents and birds in winter, berries and insects in summer.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Slim, dark brown body with a long bushy tail and a yellowish-white patch on the throat. The track shows five toes and often lies in pairs, because the marten bounds. Tracks in the snow that suddenly stop at a tree trunk are almost always marten.'},
    { title:'PEOPLE AND SPECIES',
      body:'The marten was hunted hard for its fur and was scarce in many districts, but the population is healthy today. It is often confused with the beech marten, which is not found in Norway. Old forest with hollow trees is important for the species, and clear-felling removes the resting places.'},
  ],
  funfacts:[
    'The marten jumps four metres between branches and can turn in mid-air.',
    'It can twist its ankles so the claws point backwards, and run down trunks head first.',
    'Mating happens in July, but the young only arrive in April. The embryo lies dormant through the winter.',
    'The throat patch differs from animal to animal and can be used to tell individuals apart on wildlife cameras.',
  ],
},

roedeer: {
  intro:'The roe deer is the smallest deer in Norway and the one that lives closest to us. It grazes along garden edges and forest margins, and is more often alone than in a herd.',
  facts:[
    ['BODY','shoulder height 65–80 cm'],
    ['WEIGHT','20–30 kg'],
    ['LIFESPAN','8–12 years'],
    ['DIET','herbs, shoots, buds, fungi, berries, grain fields'],
    ['RANGE','the southern half of the country, northwards along the coast'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The roe deer is a fussy eater that picks nutrient-rich shoots and herbs over coarse twigs. That is why it copes badly in winters with deep snow, when the food becomes unreachable. The buck holds a territory in summer and frays his antlers against young trees. The fawns are born in May and lie completely still and alone in the grass while the doe grazes nearby.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Red-brown summer coat, grey-brown winter coat and a clear white rump patch behind. The buck has small antlers with few points. The roe deer barks hoarsely when it is startled, a sound many people take for a dog.'},
    { title:'PEOPLE AND SPECIES',
      body:'The roe deer is among the most hunted game species and a common sight in residential areas. Fawns lying alone in the grass have not been abandoned and must not be touched. Deep snow, lynx and loose dogs are the most important causes of death apart from hunting and road collisions.'},
  ],
  funfacts:[
    'The roe deer has an extended pregnancy. The fertilised egg rests in the womb from July to December before it implants.',
    'Fawns have white spots for their first weeks, which break up against the light and shadow in the grass.',
    'Roe deer can jump over two metres high from standing.',
    'The buck sheds his antlers in autumn, not in winter like moose and red deer.',
  ],
},

capercaillie: {
  intro:'The capercaillie is Norway\'s largest forest bird. The cock displays at first light on lekking grounds that have been in use for generations.',
  facts:[
    ['WINGSPAN','cock up to 125 cm'],
    ['WEIGHT','cock 3.5–5 kg, hen 1.5–2.5 kg'],
    ['LIFESPAN','5–10 years'],
    ['DIET','pine needles in winter, berries, shoots, insects in summer'],
    ['RANGE','older coniferous forest throughout the country'],
    ['STATUS','least concern, but lekking grounds are lost to logging'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The capercaillie lives on pine needles all winter, food so coarse that the bird needs extremely long caeca to break it down. In spring the cocks gather at the lek before daybreak and display against each other while the hens choose. The chicks live on insects for their first weeks and depend completely on damp bog edges teeming with life.'},
    { title:'HOW TO RECOGNISE IT',
      body:'The cock is almost black with a green-sheened breast, a red comb of skin above the eye and a white bill. The hen is brown-speckled and half the size. The display consists of clicks, a cork-pop sound and a hissing whetting note at the end.'},
    { title:'PEOPLE AND SPECIES',
      body:'Lekking grounds lie in older forest and vanish with clear-felling, and that is the main reason for local decline. Hunting takes place in autumn, while the lek is protected. Capercaillie also collide often with fences along forest roads and with power lines.'},
  ],
  funfacts:[
    'The cock hears almost nothing in the final phase of the display. That is why hunters and photographers can sneak closer at exactly that moment.',
    'Capercaillie grow feather fringes on their toes in winter that work like snowshoes on loose snow.',
    'The bird swallows small stones that sit in the gizzard and grind down needles and twigs.',
    'A lekking ground may have been used by capercaillie for over a hundred years.',
  ],
},

raven: {
  intro:'The raven is one of the world\'s cleverest birds. It makes tools, plans ahead and lives in pairs that stay together for decades.',
  facts:[
    ['WINGSPAN','120–150 cm'],
    ['WEIGHT','0.8–1.5 kg'],
    ['LIFESPAN','15–20 years in the wild'],
    ['DIET','carrion, eggs, small rodents, refuse, berries'],
    ['RANGE','the whole country, from the outermost coast to the high mountains'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The raven is a scavenger and follows predators and hunters. It breeds early, often in February and March, on cliff faces or in tall trees, so that the young are big when the spring carrion appears. Young ravens fly in flocks, while adult pairs hold a territory all year round and defend it against every other raven.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Large, all-black bird with a powerful bill, a clear throat hackle and a wedge-shaped tail. In flight it dives and rolls in play. The call is a deep kronk, not the crow\'s sharp cry.'},
    { title:'PEOPLE AND SPECIES',
      body:'The raven has been regarded both as a bird of ill omen and as Odin\'s companion. It can be hunted for part of the year because it takes lambs and eggs, but the population is solid throughout the country. In towns and at rubbish tips it lives well on what we throw away.'},
  ],
  funfacts:[
    'Ravens remember individual people for years and tell apart those who have been kind and those who have not.',
    'They hide food, and pretend to hide it somewhere else when other ravens are watching.',
    'Young ravens play with sticks, cones and snow with no purpose beyond the play itself.',
    'The raven can mimic sounds, human voices included, much like a parrot.',
  ],
},

aspen: {
  intro:'The aspen is the tree that trembles. Its leaves sit on flat stalks and move in the faintest breath of wind, and the tree is one of the most important for the diversity of species in the forest.',
  facts:[
    ['HEIGHT','15–25 m'],
    ['AGE','60–100 years, clones much older'],
    ['HABITAT','sunny hillsides, forest edges, burnt ground'],
    ['BARK','smooth, green-grey, cracks with age'],
    ['USES','matches, chipboard, sauna benches'],
    ['STATUS','least concern, but heavily browsed by moose'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The aspen spreads mostly by root suckers. A whole aspen grove can therefore be a single plant with one shared root system, and the suckers come up densely when the mother tree is damaged or felled. It needs a great deal of light and moves in early after fire and logging. The wood rots easily, and that is exactly why the tree is so valuable to other species.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Round leaves with a wavy edge on a stalk that is flattened crosswise, so the leaf tips sideways. The bark is green-grey and smooth on young trees. The aspen glows yellow on the hillside in September, earlier than the birch.'},
    { title:'PEOPLE AND SPECIES',
      body:'Moose browse aspen harder than almost anything else, and in areas with many moose aspen shoots never reach tree height. Old aspen with holes is home to woodpeckers, owls, bats and a great number of insect and lichen species. Aspen is also the traditional sauna wood because it does not become scalding hot to touch.'},
  ],
  funfacts:[
    'The flattened leaf stalk is the reason the aspen rustles while other trees stand still.',
    'The white-backed woodpecker prefers to chisel in dead aspen, and depends directly on such trees being left standing.',
    'An aspen root can send up shoots several dozen metres from the mother tree.',
    'Matches were made from aspen because the wood is pale, tough and burns without spitting.',
  ],
},

bilberry: {
  intro:'Bilberry heath is the very floor of the Norwegian coniferous forest. It covers enormous areas, feeds everything from bears to ptarmigan, and fills buckets every August.',
  facts:[
    ['HEIGHT','15–40 cm'],
    ['FLOWERING','May–June'],
    ['BERRIES','blue with blue flesh, ripe July–September'],
    ['HABITAT','coniferous forest and mountain birch forest on medium soil'],
    ['USES','cordial, jam, raw on the walk'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'Bilberry is a low shrub that spreads by rhizomes, so that large stands are only a few individuals. It lives in partnership with fungi in its roots, which fetch nutrients from the acid forest soil. The flowers are small and hang down like green-pink bells, and bumblebees are the most important pollinators. Frost during flowering ruins the crop for the whole season.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Green angular stems, thin leaves that are shed in autumn, and berries that are blue all the way through. Bog bilberry looks the same from the outside, but has pale, green-white flesh and leaves with an entire, blue-green surface.'},
    { title:'PEOPLE AND SPECIES',
      body:'The bilberry is perhaps the single most important berry in Norwegian nature, for people and animals alike. Bears eat tens of kilos a week in autumn, and ptarmigan chicks live off the insects in the heath. Free picking in uncultivated land applies throughout the country.'},
  ],
  funfacts:[
    'Bilberry heath covers around a quarter of the Norwegian forest floor.',
    'The pigments are called anthocyanins, and they are what turn the tongue blue.',
    'A single bilberry stand can be over a hundred years old even though each stem lives only a few years.',
    'Cultivated American blueberries have pale flesh. The Norwegian ones are blue right through.',
  ],
},

porcini: {
  intro:'The porcini is the edible mushroom everyone wants to find. It is firm, nutty and almost impossible to confuse with anything dangerous.',
  facts:[
    ['CAP','8–25 cm, brown and domed'],
    ['SEASON','July–October'],
    ['HABITAT','under spruce, pine, birch and oak'],
    ['UNDERSIDE','tubes, white when the mushroom is young, yellow-green later'],
    ['USES','fried fresh, dried for stock and sauce'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The porcini lives in symbiosis with tree roots and therefore cannot be cultivated. It comes in pulses after rain and warmth, often in the same patches year after year. Young specimens are as firm as potatoes, while old ones turn soft and full of larvae. Always check the stem; the maggots start from below.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Brown cap, thick pale stem with a fine white net pattern at the top, and tubes instead of gills under the cap. The flesh is white and does not change colour when cut. The bitter bolete looks alike, but tastes bitter and has pink tubes.'},
    { title:'PEOPLE AND SPECIES',
      body:'Porcini is a trade good across large parts of Europe and is picked commercially in Norway on a smaller scale. It dries easily in slices and gives an intense flavour to stock. Cut the mushroom in two out in the forest, so you leave the maggot-eaten ones behind and spread the spores as you walk.'},
  ],
  funfacts:[
    'The tubes come away from the cap easily, like a layer of sponge. That separates boletes from all the gilled mushrooms.',
    'A single porcini can weigh over a kilo.',
    'Drying concentrates the flavour strongly, and dried porcini gives more flavour than fresh.',
    'The porcini has many local names in Norway, among them karljohan.',
  ],
},

deadlywebcap: {
  intro:'The deadly webcap is the most dangerous mushroom in Norwegian nature. It does not taste bad, gives no symptoms at first, and destroys the kidneys.',
  facts:[
    ['CAP','3–8 cm, pointed umbo, red-brown'],
    ['SEASON','August–October'],
    ['HABITAT','damp coniferous forest with moss, often bilberry heath'],
    ['TOXIN','orellanine'],
    ['LATENCY','2–3 weeks before symptoms'],
    ['STATUS','common in Norwegian spruce forest'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The webcaps are a large genus with several hundred species in Norway, and a number of them are poisonous. The deadly webcap grows in the moss in damp coniferous forest and looks entirely innocent. The name webcap comes from the cobweb-like threads between the cap edge and the stem on young mushrooms, which disappear as the mushroom ages.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Red-brown to cinnamon-brown cap with a clear pointed umbo, rust-brown gills and yellow bands on the stem. It can be mistaken for red-brown edible mushrooms such as the chanterelle in poor light and for funnel caps in moss. If you are in any doubt, leave it standing.'},
    { title:'PEOPLE AND SPECIES',
      body:'The toxin orellanine destroys the kidneys, and what makes it special is the long delay: the first symptoms come after two to three weeks, when the mushroom has long been forgotten. Treatment may require dialysis or a kidney transplant. Boiling or frying makes no difference; the toxin withstands heat.'},
  ],
  funfacts:[
    'Because the symptoms come so late, people have eaten several meals of the mushroom before falling ill.',
    'Orellanine was first identified after a large poisoning incident in Poland in the 1950s.',
    'The webcap genus Cortinarius has over 300 species in Norway and is the most species-rich mushroom genus we have.',
    'The rule among mushroom pickers is simple: leave every brown mushroom with rust-coloured gills standing.',
  ],
},

blacktrumpet: {
  intro:'The black trumpet stands in dense troops on the floor of deciduous woodland, but it is almost invisible. Once you have spotted one, you suddenly see a hundred.',
  facts:[
    ['HEIGHT','5–12 cm'],
    ['SEASON','August–October'],
    ['HABITAT','lime-rich deciduous forest, often under beech, oak and hazel'],
    ['SHAPE','hollow funnel, grey-black, without gills'],
    ['USES','drying, sauce, an accompaniment to game'],
    ['STATUS','least concern in southern districts'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The black trumpet lives in symbiosis with deciduous trees and thrives on lime-rich soil. It is hollow all the way from the cap edge down into the stem, like a little horn. Its colour makes it the most overlooked edible mushroom we have, and many people first find it when they sit down to rest.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Grey-black to brown-black funnel with a wavy edge and a smooth to faintly wrinkled underside without gills. It smells faint and pleasant. No poisonous species resembles it to any real degree, which makes it a safe beginner\'s mushroom once you actually find it.'},
    { title:'PEOPLE AND SPECIES',
      body:'Black trumpets dry easily and can be ground into a powder that gives a dark, powerful flavour to sauce. It is also called the poor man\'s truffle in parts of Europe. The season is short and tied to rich deciduous woodland, so the spots are few and worth noting.'},
  ],
  funfacts:[
    'The mushroom is hollow right down into the stem, like a thin funnel with no bottom.',
    'It is so dark that experienced pickers look for the holes in the forest floor rather than for the mushroom itself.',
    'Dried black trumpet keeps its aroma for several years.',
    'The genus is closely related to the chanterelle, even though they look nothing alike.',
  ],
},

woodanemone: {
  intro:'The wood anemone covers the forest floor in white in May, in the few weeks between snowmelt and leaf burst. It is beautiful and mildly poisonous at the same time.',
  facts:[
    ['HEIGHT','10–25 cm'],
    ['FLOWERING','April–June'],
    ['HABITAT','deciduous forest, wooded pasture, stream valleys'],
    ['SPREAD','rhizome, a few centimetres a year'],
    ['TOXIN','protoanemonin, irritates skin and mucous membranes'],
    ['STATUS','least concern and very common'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The wood anemone is a spring plant that does a whole year\'s work in a few weeks. It flowers, sets seed and withers back before the tree crowns shut out the light, and lives the rest of the year as a rhizome under the ground. The stand creeps only a few centimetres a year, so a large carpet of wood anemone has stood there for hundreds of years.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Six to eight white tepals, often with a pink tinge on the underside, and three deeply lobed leaves in a whorl beneath the flower. The flower follows the sun and closes in rain. The blue anemone comes a few weeks earlier and has entire, three-lobed leaves.'},
    { title:'PEOPLE AND SPECIES',
      body:'Wood anemone is not food. The whole plant contains protoanemonin, which stings in the mouth and can cause skin irritation. Dried plant material is harmless, but fresh wood anemone must not be eaten. A dense carpet of wood anemone is a sign of an old, undisturbed deciduous woodland floor.'},
  ],
  funfacts:[
    'A stand of wood anemone spreads so slowly that botanists use it to estimate how long the forest has been left in peace.',
    'The flower has no petals. The white parts are sepals that have taken over the job.',
    'The plant is related to the buttercup and the blue anemone, and all three share the same group of toxins.',
    'The wood anemone closes at night and in rainy weather to protect its pollen.',
  ],
},

/* ============================================================ MOUNTAINS */
hare: {
  intro:'The mountain hare turns chalk white in winter and becomes almost invisible against the snow. It has no defence other than its speed and its ability to sit completely still.',
  facts:[
    ['BODY','45–60 cm'],
    ['WEIGHT','2.5–4 kg'],
    ['LIFESPAN','3–5 years'],
    ['DIET','grass and herbs in summer, twigs and bark in winter'],
    ['RANGE','the whole country, from the coast to the high mountains'],
    ['STATUS','near threatened'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The mountain hare is active at night and lies up by day under a bush or in a hollow in the snow. It builds no den and digs no tunnels; the young are born with fur and open eyes and are on their feet straight away. In winter the hare gnaws bark from rowan, aspen and goat willow, and can strip young trees all the way round.'},
    { title:'HOW TO RECOGNISE IT',
      body:'White winter coat with black ear tips, grey-brown summer coat. The hind foot print is long and broad and lands ahead of the front feet when the hare bounds. The trail runs in clear sets of four prints, and the hare makes sudden sideways leaps to break the track behind it.'},
    { title:'PEOPLE AND SPECIES',
      body:'The mountain hare has traditionally been hunted with hare hounds all over the country. The population has declined in many areas, and the species is now listed as near threatened. Milder winters are part of the problem: a white hare on brown ground is easily taken by fox and birds of prey.'},
  ],
  funfacts:[
    'The moult is governed by day length, not by the snow. That is why the hare stands white on bare ground in winters with little snow.',
    'The mountain hare can reach 60–70 km/h and swerves abruptly to shake off predators.',
    'It eats its own soft night droppings a second time to get more nourishment out of the bark. This is called refection.',
    'Its hind legs are long enough that the hare runs fastest uphill.',
  ],
},

lynx: {
  intro:'The lynx is Norway\'s only wild cat. It is nocturnal, solitary and so shy that most people never see one, even in areas where it is common.',
  facts:[
    ['BODY','80–130 cm, shoulder height 60–75 cm'],
    ['WEIGHT','male 18–25 kg, female 13–20 kg'],
    ['LIFESPAN','10–15 years'],
    ['DIET','roe deer, reindeer, hare, ptarmigan, sheep'],
    ['RANGE','forest and mountain birch forest across much of the country'],
    ['STATUS','endangered in Norway'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The lynx stalks up close to its prey and takes it in a short leap, rather than chasing it. An adult roe deer lasts a couple of weeks, and the lynx covers the remains with snow or branches and returns to them. The territory is large, from a few hundred to over a thousand square kilometres, and the female keeps her kittens with her through their first winter.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Short tail with a black tip, long ear tufts and cheek whiskers. The legs are long and the paws unusually broad. The track is round, without claw marks, and about the size of a man\'s palm in light snow.'},
    { title:'PEOPLE AND SPECIES',
      body:'The lynx is managed towards a population target of 65 annual family groups in Norway, and quota hunting in February and March controls numbers. The conflict is about sheep and semi-domesticated reindeer. The population has been below the target several years in a row.'},
  ],
  funfacts:[
    'The broad paws work like snowshoes. The lynx stays up on the crust where the roe deer breaks through.',
    'Ear tufts are not hair for show: they are thought to sharpen directional hearing.',
    'The lynx can see at night with around six times less light than a human needs.',
    'A lynx can jump two metres straight up from standing.',
  ],
},

wolverine: {
  intro:'The wolverine is Europe\'s largest member of the marten family and the mountains\' specialist in food storage. It roams enormous distances, endures any kind of weather and finds food where other predators give up.',
  facts:[
    ['BODY','65–105 cm, tail 15–25 cm'],
    ['WEIGHT','male 12–18 kg, female 9–13 kg'],
    ['LIFESPAN','8–12 years'],
    ['DIET','carrion, reindeer, sheep, small rodents, ptarmigan'],
    ['RANGE','high mountains and mountain birch forest, mostly in the north and along the Swedish border'],
    ['STATUS','endangered in Norway'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The wolverine is mainly a scavenger and follows lynx, wolves and reindeer. It stores meat in caches in boulder fields and snowdrifts where the cold keeps it edible for months. The den is dug in deep snowdrifts, and the young are born in February and March. The wolverine therefore depends on the snow lasting into spring.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Dark brown fur with lighter bands along the sides, a powerful head, short legs and a heavy, arched back. The track is large for the body and shows five toes. The wolverine often moves in a characteristic slanting gallop with three prints in a group.'},
    { title:'PEOPLE AND SPECIES',
      body:'The wolverine takes sheep and semi-domesticated reindeer, especially lambs and calves, and is therefore at the heart of the predator conflict. The population target in Norway is 39 annual litters, controlled through den removals and licensed culling. Shorter winters and less spring snow are a long-term threat to the dens.'},
  ],
  funfacts:[
    'The wolverine\'s jaws crush frozen bone. It has a special molar set crosswise that gives extra bite force.',
    'A single wolverine can patrol over 1,000 square kilometres.',
    'Wolverine fur does not gather frost because the hairs are hollow and moisture does not cling to them. That is why it was used as trim around hoods.',
    'The Latin name Gulo gulo simply means glutton.',
  ],
},

hepatica: {
  intro:'The blue anemone is the first patch of blue on the forest floor in spring. It flowers before the leaves come out, while the light still reaches all the way down to the ground.',
  facts:[
    ['HEIGHT','5–15 cm'],
    ['FLOWERING','March–May, before the trees come into leaf'],
    ['HABITAT','lime-rich, nutrient-rich deciduous woodland'],
    ['LEAVES','three lobed leaves that overwinter green'],
    ['TOXIN','mildly poisonous, can irritate the skin'],
    ['STATUS','least concern, but protected in several counties'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The blue anemone is a perennial herb with a stout rootstock that gathers reserves all summer. That is why it can flower so early: the energy was stored the year before. The flower colour varies from blue to purple, and white specimens occur. The colour is in fact leaves, not petals; it is the sepals that are blue.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Six to ten blue flower leaves on a hairy stalk, and three triangular leaves that survive the winter under the snow. It grows in dense carpets on south-facing slopes, often together with wood anemone, which comes a few weeks later and is white.'},
    { title:'PEOPLE AND SPECIES',
      body:'The blue anemone needs lime in the soil and is therefore a good indicator of rich woodland with many other species. It is protected in several counties, and the populations cannot take people digging it up for the garden. The plant tissue contains protoanemonin and must not be eaten.'},
  ],
  funfacts:[
    'Ants spread the seeds. The seeds have a fat-rich appendage that the ants carry back to the nest, and the seed itself is left behind.',
    'The flower closes in rain and at night and opens when the sun warms it.',
    'The leaves overwinter green under the snow, ready to start photosynthesis the moment the snow goes.',
    'The plant family is the buttercup family, the same one as buttercup and globeflower.',
  ],
},

stoat: {
  intro:'The stoat is a small predator with an enormous temper. It hunts small rodents in their own tunnels under the snow, and turns chalk white in winter.',
  facts:[
    ['BODY','22–32 cm, tail 6–12 cm'],
    ['WEIGHT','150–400 g'],
    ['LIFESPAN','3–5 years'],
    ['DIET','mice, lemmings, nestlings, eggs, insects'],
    ['RANGE','the whole country, from the coast to the high mountains'],
    ['STATUS','least concern, but fluctuates with the small rodents'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The stoat is slim enough to follow mice and lemmings into their tunnels. It has to eat often because its long, thin body loses heat quickly, and it therefore hunts both day and night. The population follows the rodent years: in peak years it breeds heavily, in poor years it all but disappears from the landscape.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Long, slim body, short legs and a black tail tip all year round. The summer coat is brown with a white underside, the winter coat entirely white. The weasel is smaller and has no black tail tip.'},
    { title:'PEOPLE AND SPECIES',
      body:'White stoat fur is called ermine and was a status symbol on European royal robes, recognised precisely by the black tail tips. Today the species is hunted very little. Stoats readily move into outbuildings and cabins after mice and mostly do more good than harm.'},
  ],
  funfacts:[
    'The black tail tip is thought to fool birds of prey: they strike at the black spot and miss the body.',
    'The stoat can kill prey several times its own size, such as hare and ptarmigan.',
    'It has delayed embryo development and carries fertilised eggs for almost ten months.',
    'A stoat has to eat around a quarter of its own body weight every day.',
  ],
},

lemming: {
  intro:'The Norway lemming is the most talked-about small animal in the mountains. Every three to four years the population explodes, and the whole of the mountain wildlife changes with it.',
  facts:[
    ['BODY','10–15 cm'],
    ['WEIGHT','40–110 g'],
    ['LIFESPAN','1–2 years'],
    ['DIET','mosses, grass, sedges, heather shoots'],
    ['RANGE','the mountains throughout the country, down into the mountain birch forest'],
    ['STATUS','least concern, but the population fluctuates extremely'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The lemming lives on moss, which almost no other mammal can make use of, and is active all winter in tunnel systems between the snow and the ground. It breeds there too, and in good winters with stable, insulating snow the population can multiply many times over before the snow goes. Then the mountains are suddenly full of lemmings, and they spread in all directions.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A small, round rodent with a short tail and a striking pattern in black, yellow and brown. The lemming does not hide: it rears up, squeaks and attacks boots and dogs\' noses.'},
    { title:'PEOPLE AND SPECIES',
      body:'Lemming years govern the whole ecology of the mountains. Arctic fox, wolverine, stoat, rough-legged buzzard and snowy owl breed well when there are lemmings, and hardly at all otherwise. The story that lemmings commit suicide in the sea is a myth: they drown during migrations because they try to cross water.'},
  ],
  funfacts:[
    'The lemming is one of few species that breeds under the snow in the middle of winter.',
    'The colours are probably a warning signal, in the same way as in wasps.',
    'A female lemming can have several litters in a year and be pregnant again the day after giving birth.',
    'In peak years there can be over a hundred lemmings per hectare in good areas.',
  ],
},

dipper: {
  intro:'The white-throated dipper is Norway\'s national bird, and the only songbird in the world that dives. It walks on the bottom of ice-cold rivers looking for larvae.',
  facts:[
    ['BODY','17–20 cm'],
    ['WEIGHT','55–75 g'],
    ['LIFESPAN','3–7 years'],
    ['DIET','caddisfly larvae, mayfly larvae, small fish'],
    ['RANGE','fast-flowing rivers and streams throughout the country'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The dipper swims under water with its wings and uses the current to press itself down towards the bottom, where it turns stones over in search of larvae. It stays on open water all winter and moves only as far as the ice forces it to. The nest is a ball of moss with a side entrance, often placed behind a waterfall or under a bridge.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A compact, dark brown bird with a sharply defined white breast. It perches on a stone in midstream and bobs with its whole body. The flight is straight and fast, low over the surface of the water.'},
    { title:'PEOPLE AND SPECIES',
      body:'The dipper was chosen as the national bird in 1963. It is sensitive to acidification and to river regulation that dries out riverbeds, but has recovered since acid rain declined. Artificial nest boxes under bridges are used actively by the species.'},
  ],
  funfacts:[
    'The dipper has dense, oiled plumage and unusually high haemoglobin levels in its blood, so that it can cope with cold water and diving.',
    'It has a flap of skin that closes its nostrils when it goes under.',
    'The dipper can walk on the riverbed in a current that would sweep an adult person off their feet.',
    'The chick jumps into the river and swims before it can fly.',
  ],
},

arcticchar: {
  intro:'The Arctic char lives further north than any other freshwater fish in the world. It holds in mountain lakes that are ice-free for only a few weeks a year.',
  facts:[
    ['LENGTH','20–50 cm, rarely over 70 cm'],
    ['WEIGHT','0.2–2 kg, large char considerably more'],
    ['LIFESPAN','10–20 years'],
    ['DIET','crustaceans, insect larvae, small fish'],
    ['RANGE','cold lakes and mountain tarns, sea-run char in the north'],
    ['STATUS','least concern, but many populations are overcrowded'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The char thrives in cold, oxygen-rich water and holds deep in summer. It spawns on gravel in autumn, and in many mountain lakes the population becomes so dense that all the fish stay stunted. In the north, sea-run char goes out to sea in summer and returns to fresh water to overwinter, unlike salmon and sea trout, which can stay out longer.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A slender salmonid with small scales, pale spots on a dark background and a white leading edge on the pectoral, pelvic and anal fins. In spawning dress the belly turns a strong orange to red. The trout has dark spots on a pale background, in other words the opposite pattern.'},
    { title:'PEOPLE AND SPECIES',
      body:'Char is an important food fish inland and in the north, and at the same time a management problem where populations are overcrowded. In such cases heavy netting is recommended so that the fish can grow larger. The char is also sensitive to warming: it needs cold deep water in summer.'},
  ],
  funfacts:[
    'Arctic char is found in lakes all the way up on Svalbard, further north than any other freshwater fish.',
    'Two forms of char can occur in the same lake, a stunted one in the shallows and a large-growing one in the depths.',
    'It can spawn at several metres depth on gravel bottom far from shore.',
    'The char tolerates water below four degrees all year round, temperatures at which most other fish barely move.',
  ],
},

rowan: {
  intro:'The rowan grows where other trees give up, right up towards the tree line. In autumn it hangs full of red berries that feed the thrush flocks on migration.',
  facts:[
    ['HEIGHT','5–15 m'],
    ['AGE','60–100 years'],
    ['FLOWERING','May–June, white umbels'],
    ['HABITAT','woodland edges, slopes, mountain birch forest'],
    ['USES','rowanberry jelly, ornamental tree, moose browse'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The rowan is a light-demanding tree that moves into edges and openings. The berries are eaten by thrushes, waxwings and bullfinches, and the seeds are spread in the droppings, often far from the mother tree. That is why rowan seedlings turn up on rock ledges and in gutters. The rowan has heavy berry years several years apart, just as spruce and pine have cone years.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Leaves divided into many leaflets along a central stalk, white flower umbels in June and clusters of orange-red berries in August. The bark is smooth and grey. Whitebeam and rowan are related, but the whitebeam has whole, undivided leaves.'},
    { title:'PEOPLE AND SPECIES',
      body:'Rowanberries are sour and bitter raw, but make a good jelly for game when picked after a frost. Rowan, together with aspen and goat willow, is one of the three most important browse trees for moose, and they are often browsed right down in areas rich in moose. In folk belief the rowan was a protective tree against trolls and bad weather.'},
  ],
  funfacts:[
    'The saying goes that a rowanberry year means a snowy winter. There is no such connection, but many years with heavy crops follow a warm, dry early summer.',
    'Rowan grows higher into the mountains than almost any other broadleaved tree apart from birch.',
    'The seed needs to pass through a bird, or to lie out over a winter, before it germinates well.',
    'The berries contain parasorbic acid, which is broken down by frost and by boiling.',
  ],
},

juniper: {
  intro:'The juniper is the conifer that has spread furthest of them all. It grows from the coast to the high mountains, from the Mediterranean to the Arctic, and can live for over a thousand years.',
  facts:[
    ['HEIGHT','1–5 m, creeping forms in the mountains'],
    ['AGE','up to over 1,000 years'],
    ['NEEDLES','sharp, in whorls of three'],
    ['CONE BERRIES','ripen over 2–3 years'],
    ['USES','spice, gin, smoking food, juniper infusion'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The juniper is undemanding and grows in pasture, on bare rock, in heathland and in the mountains. It has male and female plants separately, and only the female plant sets berries. The berries are really cones with fused scales, and they take two to three years to ripen, so you find green and blue berries on the same bush.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Stiff, sharp needles in whorls of three, with a pale stripe on the upper side. The shape varies from a column to a flat mat, depending on wind and grazing. The smell of crushed berries is sweetish and resinous.'},
    { title:'PEOPLE AND SPECIES',
      body:'Juniper berries give the flavour to gin and to stock for game and cabbage. Juniper infusion, that is a decoction of juniper, was used to wash wooden tools and beer vessels because it both smells good and inhibits bacteria. Juniper smoke is still used to smoke meat and fish.'},
  ],
  funfacts:[
    'The juniper has the widest natural range of any conifer in the world.',
    'Creeping juniper in the mountains can be several hundred years old and still be only knee high.',
    'Only the female bushes bear berries, so half the junipers you see will never give you a spice.',
    'The timber is very dense and strongly scented, and was used for butter moulds and vessels.',
  ],
},

mountainavens: {
  intro:'The mountain avens is the pioneer of the mountains. It moved in right after the ice age, grows on lime-rich ground, and has given its name to a whole climatic period.',
  facts:[
    ['HEIGHT','5–15 cm, creeping mats'],
    ['FLOWERING','June–August'],
    ['FLOWER','eight white petals around a yellow centre'],
    ['HABITAT','lime-rich ridges and gravel in the mountains'],
    ['NOTABLE','the flower follows the sun'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The mountain avens forms low, dense mats on wind-exposed ridges where the snow blows away. It requires lime in the ground and is therefore a clear indicator of rich mountain habitat with many rare species. The flower is shaped like a small dish and turns to follow the sun through the day, so that the centre warms up and the seeds ripen faster in the short mountain summer.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Eight white petals, a yellow centre and small, wrinkled leaves that are dark green above and white-felted underneath. After flowering the seeds turn into a twisted, silvery tuft that stays on for a long time.'},
    { title:'PEOPLE AND SPECIES',
      body:'The mountain avens is used as a symbol of Norwegian mountain nature and appears in logos and emblems. It grows slowly, and a mat can be several decades old; trampling on lime-rich ridges does damage that takes a long time to heal. It also has root nodules with bacteria that fix nitrogen from the air.'},
  ],
  funfacts:[
    'The cold period known as the Younger Dryas is named after the mountain avens, Dryas octopetala, because pollen from the plant is found in layers from that time.',
    'The flower warms its own centre several degrees above the air temperature by following the sun.',
    'The seed tufts twist up and work as small propellers in the wind.',
    'Mountain avens is among the first plants to colonise gravel in front of retreating glaciers.',
  ],
},

ladysslipper: {
  intro:'The lady\'s slipper orchid is Norway\'s largest orchid and one of the most striking plants in the country. It lures beetles down into a yellow shoe they can only leave by squeezing past the pollen.',
  facts:[
    ['HEIGHT','25–50 cm'],
    ['FLOWERING','June'],
    ['FLOWER','yellow slipper with brown-red lobed leaves'],
    ['HABITAT','lime-rich, open woodland and scrub'],
    ['AGE','can live for several decades'],
    ['STATUS','protected in Norway'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The lady\'s slipper grows on lime ground in open deciduous and pine woodland, most often in scattered, small occurrences. The seeds are like dust and carry no nourishment, so they depend entirely on a particular fungus in the soil to feed the seedling. It can therefore take ten years or more from seed to first flower, and a plant that is dug up dies.'},
    { title:'HOW TO RECOGNISE IT',
      body:'No other Norwegian plant looks like it. An inflated, yellow, shoe-shaped lip with four brown-red, twisted flower leaves around it, on a stem with broad, clearly ribbed leaves. The flowering lasts only a couple of weeks in June.'},
    { title:'PEOPLE AND SPECIES',
      body:'The lady\'s slipper is protected, and picking or digging it up is forbidden. The threats are scrub encroachment, logging and people taking plants home. Several of the known sites are kept secret for precisely that reason.'},
  ],
  funfacts:[
    'The beetle that lands in the slipper finds only one way out, a narrow passage where it has to brush first past the stigma and then past the pollen.',
    'The flower offers no nectar. It attracts with scent and colour and deceives the insect completely.',
    'The seeds are among the smallest in the plant kingdom, almost like dust, and are spread by the wind.',
    'A lady\'s slipper plant can stand in the same place and flower for several decades.',
  ],
},

/* ============================================================ THE BOG */
moose: {
  intro:'The moose is the king of the forest and Norway\'s largest land animal. A grown bull weighs more than a small piano, and still it moves almost silently through dense forest.',
  facts:[
    ['BODY','shoulder height 1.6–2.1 m'],
    ['WEIGHT','bull 350–600 kg, cow 250–400 kg'],
    ['LIFESPAN','10–15 years'],
    ['DIET','twigs of rowan, aspen and goat willow, birch, willow species, water plants'],
    ['RANGE','forest across the whole country except the outer coast'],
    ['STATUS','least concern, around 120 000 animals'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The moose browses twigs and shoots and eats 20–30 kilos a day. In summer it likes to stand in bog and water eating water plants, which give it salts it lacks otherwise. The rut runs through September and October, and the bulls fight with their antlers. The calves arrive in May and follow the cow until she drives them off the year after.'},
    { title:'HOW TO RECOGNISE IT',
      body:'High shoulder, drooping muzzle and a flap of skin under the throat called the bell. The bull carries antlers from spring to winter, the cow never. The track is heart-shaped and up to 15 cm long, and the moose leaves droppings in large heaps of dry pellets.'},
    { title:'PEOPLE AND SPECIES',
      body:'The moose hunt is the country\'s largest hunting event, with around 30 000 animals shot a year, and moose meat is an important part of Norwegian food culture. Moose on roads and railways cause many collisions every winter, especially in snowy years when the animals follow the ploughed tracks.'},
  ],
  funfacts:[
    'The bull sheds its antlers every winter and builds them up again in a single summer. A large set weighs over 20 kilos.',
    'The moose swims well and can cross several kilometres of open water.',
    'Its long legs let the moose wade through snow that stops red deer and roe deer.',
    'A moose calf can outrun a grown adult when it is a few days old.',
  ],
},

lingonberry: {
  intro:'The lingonberry is the toughest berry in Norwegian nature. The leaves stay green all winter, and the berry can sit on the heath under the snow until spring without rotting.',
  facts:[
    ['HEIGHT','5–30 cm'],
    ['FLOWERING','May–July'],
    ['BERRIES','red, firm, ripe in August–September'],
    ['HABITAT','pine forest, heathland, mountain heath'],
    ['USES','jam, stirred raw with sugar, a side dish to game'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The lingonberry is a small, evergreen shrub that spreads by rhizomes under the moss. A whole mat of lingonberry can therefore be one single plant, many decades old. It thrives on poor, acid soil where little else grows, and benefits from fungal threads in its roots that fetch nutrients for it.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Glossy, dark green, thick leaves with a curled edge and a paler underside. The berries sit in clusters and are firm and red all the way through. Bog bilberry and bog whortleberry are blue or matt and softer.'},
    { title:'PEOPLE AND SPECIES',
      body:'Lingonberry is traditional Norwegian fare with meat and game, and can be stirred with sugar without cooking. It keeps because the berry contains benzoic acid, a natural preservative. Free picking in open country applies across the whole country.'},
  ],
  funfacts:[
    'Lingonberries kept in water in a cool place stay fresh for years. The benzoic acid does the job entirely on its own.',
    'Berries that have sat under the snow through the winter are called winter lingonberries and are sweeter, because the frost breaks down the acid.',
    'The plant family is the heather family, the same as bilberry, ling and crowberry.',
    'One kilo of lingonberries can mean picking over several square metres of heath in a poor year, and over half of one in a good year.',
  ],
},

cloudberry: {
  intro:'The cloudberry is called the gold of the bog, and with good reason: it yields poorly most years, and a full bucket is something people remember.',
  facts:[
    ['HEIGHT','10–25 cm'],
    ['FLOWERING','June–July'],
    ['BERRIES','yellow to orange, ripe July–August'],
    ['HABITAT','bog and damp mountain heath'],
    ['USES','cloudberry cream, jam, stirred raw with sugar'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The cloudberry has separate male and female plants, and only the female plant sets berries. That is why the crop fails so often: there must be enough male plants nearby, insects flying in cold weather, and no night frost during flowering. The plants are joined by rhizomes down in the peat and can cover large areas.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A single wrinkled, hand-lobed leaf per stem and one white flower. The berry is made up of a few large drupelets, hard and red before it is ripe, and soft and golden when it is ready.'},
    { title:'PEOPLE AND SPECIES',
      body:'In Nordland, Troms and Finnmark the landowner may forbid cloudberry picking, and where you are not allowed to carry them away, you may still eat them on the spot. Elsewhere in the country the ordinary right of access in open country applies. Unripe cloudberries should not be picked; they do not ripen afterwards.'},
  ],
  funfacts:[
    'Cloudberries have more vitamin C than oranges, and enough benzoic acid to keep for a long time in cool water.',
    'The northern regions have the world\'s best cloudberry grounds, and berries from Finnmark have been a trade good for hundreds of years.',
    'The berry turns pale when it is ripe. Most berries do the opposite.',
    'A single night frost in June can wipe out the whole season\'s cloudberries across an entire bog.',
  ],
},

birch: {
  intro:'The birch is the tree that stands furthest out. It sets the tree line in the mountains, takes over after fire and felling, and has followed Norwegian building tradition for a thousand years.',
  facts:[
    ['HEIGHT','10–25 m, creeping at the tree line'],
    ['AGE','60–150 years'],
    ['SPECIES','silver birch and downy birch, with mountain birch as a subspecies'],
    ['HABITAT','across the whole country, from coast to tree line'],
    ['USES','firewood, birch bark, bark roofing, birch sap'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The birch is a pioneer tree. The seeds are small and light, carried far by the wind and germinating on open mineral soil. It grows fast in the light but cannot stand shade, so spruce takes over after a few decades where the climate allows it. In the mountains it is the birch that is left standing, forming the characteristic crooked mountain birch forest.'},
    { title:'HOW TO RECOGNISE IT',
      body:'White bark with black fissures, and drooping branches on silver birch. The leaves are triangular with a toothed edge. Mountain birch is low, multi-stemmed and twisted by wind and snow.'},
    { title:'PEOPLE AND SPECIES',
      body:'Birch bark hardly rots at all and was the waterproof layer in turf roofs for hundreds of years. Birch firewood is the standard fuel in Norwegian stoves. Birch pollen is the commonest allergy source in the Norwegian spring, and birch sap is tapped in spring when the sap rises.'},
  ],
  funfacts:[
    'The birch grows higher than any other tree in Norway and sets the tree line, which lies above 1 200 metres in the interior of southern Norway.',
    'The autumnal moth can strip the forest almost leafless in outbreak years in northern Norway. The trees often put out new leaves the same summer.',
    'Resin and oil in the bark make it burn even when it is wet. That is why birch bark is the classic firelighter.',
    'A mature birch can release several million seeds in a single year.',
  ],
},

beaver: {
  intro:'The beaver is the only animal besides humans that rebuilds the whole landscape. The ponds it makes create wetland where hundreds of other species move in.',
  facts:[
    ['BODY','75–100 cm, tail 25–35 cm'],
    ['WEIGHT','15–30 kg'],
    ['LIFESPAN','10–20 years'],
    ['DIET','bark, twigs, water plants, herbs'],
    ['RANGE','watercourses across much of southern and central Norway'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The beaver fells broadleaf trees with its teeth and uses them both for food and for building. It dams the stream to get water deep enough in front of the lodge that the entrance lies under water and out of reach of fox and lynx. In autumn the family lays down a food store of twigs under the water, which they fetch from through the ice all winter.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A large brown rodent with a flat, scaly tail and webbed hind feet. The signs are clearer than the animal itself: hourglass-shaped stumps, gnawed bark, floating twig stores and the dam itself. The beaver slaps its tail on the water as a warning before it dives.'},
    { title:'PEOPLE AND SPECIES',
      body:'The Eurasian beaver was almost wiped out in Europe in the 1800s, and one of the last populations survived in Telemark. Norwegian beavers were later used to build the population back up in Sweden and several other countries. Today the conflict is the opposite: flooded fields, roads and forest call for management and local hunting.'},
  ],
  funfacts:[
    'The front teeth are orange from iron in the enamel, which makes them harder. They grow throughout life and are honed sharp against each other.',
    'The beaver can hold its breath for around 15 minutes.',
    'Castoreum, a secretion from glands, was used for centuries in medicine and perfume.',
    'A beaver dam can hold back so much water that it dampens flood peaks downstream.',
  ],
},

redthroatedloon: {
  intro:'The red-throated diver breeds on small bog pools where there are no fish, and therefore flies out to the sea every time the chick needs food.',
  facts:[
    ['BODY','55–70 cm'],
    ['WINGSPAN','100–120 cm'],
    ['WEIGHT','1–2 kg'],
    ['DIET','fish, fetched from the sea or from larger lakes'],
    ['RANGE','bog pools and small lakes, mostly in northern Norway and the mountains'],
    ['STATUS','least concern, but vulnerable to disturbance in the breeding season'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The red-throated diver is the smallest of the divers and the only one that can take off from a small body of water. It therefore breeds on tiny pools that hold no fish, and flies as far as several tens of kilometres to the sea or to larger lakes to fetch food for the chick. The nest lies right at the water\'s edge, because the bird can barely walk on land.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A slender waterbird with a thin, upturned bill and a rust-red throat patch in summer plumage. It lies low in the water and dives without a splash. The call is a wailing, yodelling cry that carries far across the bog.'},
    { title:'PEOPLE AND SPECIES',
      body:'The legs sit right at the back of the body, perfect for swimming and hopeless for walking. The bird therefore leaves the nest at the slightest disturbance, and the eggs are quickly taken by a gull or a crow. Keep well clear of diver pools in June and July.'},
  ],
  funfacts:[
    'The red-throated diver is the only diver that manages to lift straight off a small pool. The others need a long runway on water.',
    'It can fly tens of kilometres each way for a single fish for the chick.',
    'The chicks ride on their parents\' backs for the first few days.',
    'In winter the red-throated diver sits out at sea along the coast in grey and white winter plumage without the red throat.',
  ],
},

trout: {
  intro:'The brown trout is found in almost every watercourse in Norway, from small mountain streams to the fjord. Stream trout, lake trout and sea trout are one and the same species.',
  facts:[
    ['LENGTH','15–60 cm, large trout considerably more'],
    ['WEIGHT','0.1–2 kg usually, over 10 kg in large-trout lakes'],
    ['LIFESPAN','5–15 years'],
    ['DIET','insects, crustaceans, small fish'],
    ['RANGE','rivers, streams, lakes and fjords across the whole country'],
    ['STATUS','least concern, some populations threatened'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The brown trout spawns in autumn in running water, where the female digs a pit in the gravel and covers the eggs over. The young fish hold stations in the current and defend them. Some individuals stay in the stream all their lives, others move out into the lake or to the sea and grow much faster where the food is better.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A sturdy salmonid with dark spots on a lighter ground, often with red dots ringed in pale. The tail is squared off or slightly notched. The salmon has a V-shaped tail, a slimmer tail root and spots mostly above the lateral line.'},
    { title:'PEOPLE AND SPECIES',
      body:'The brown trout is the most important sport fish in inland Norway and a mainstay of recreational fishing. Acidification wiped out many populations in southern Norway in the 1900s, but liming has brought several of them back. Migration barriers such as culverts and weirs are a greater threat today than fishing.'},
  ],
  funfacts:[
    'The trout recognises its home stream by smell and finds its way back there to spawn.',
    'Sea trout and stream trout can be siblings. What they become is decided by growth and conditions, not by inheritance alone.',
    'Trout fry have clear dark finger marks along the side, called parr marks.',
    'Large trout in lakes such as Mjosa and Randsfjorden live on smelt and can pass ten kilos.',
  ],
},

sundew: {
  intro:'The round-leaved sundew is a carnivorous plant in Norwegian bogs. It catches insects in sticky droplets because the peat has no nitrogen.',
  facts:[
    ['HEIGHT','5–20 cm in flower'],
    ['FLOWERING','July–August'],
    ['LEAVES','round, with red glandular hairs and sticky droplets'],
    ['HABITAT','peat bog and damp sandy ground'],
    ['PREY','mosquitoes, blackfly and other small insects'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'Bog water is acid and almost free of nitrogen. The sundew solves that by taking its nitrogen from animals instead of from the soil. The leaves are covered in red hairs with a clear, sticky droplet at the tip. When an insect gets stuck, the hairs and in time the whole leaf bend slowly around the prey, and the plant secretes digestive fluid.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Small rosettes tucked down in the sphagnum moss, with round leaves on long stalks and droplets that glitter in the sun. The flower stalk is tall and thin, and the white flowers open for only a few hours in the middle of the day.'},
    { title:'PEOPLE AND SPECIES',
      body:'Sundew has been used in folk medicine against coughs. It depends entirely on intact bog, so ditching and peat extraction remove both the plant and the rest of the bog community. Bog is also one of Norway\'s most important carbon stores, and an argument for protection that is bigger than any one species.'},
  ],
  funfacts:[
    'The droplets on the leaves are not dew, but a tough mucilage the plant secretes itself. They do not dry out in the sun.',
    'A leaf takes hours to bend around its prey, and days to digest it.',
    'A single plant can catch several hundred insects over the course of a summer.',
    'Charles Darwin wrote a whole book about carnivorous plants, and the sundew was the main example.',
  ],
},

cottongrass: {
  intro:'Cottongrass is the white tufts that glow across the bog in July. The tuft is not a flower, but seed down for the wind to carry off.',
  facts:[
    ['HEIGHT','20–60 cm'],
    ['FLOWERING','May–June, tufts in July'],
    ['HABITAT','wet bog, marsh and ditch edges'],
    ['FAMILY','the sedge family, not a grass'],
    ['USES','lamp wicks, quilts and pillows in earlier times'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'Cottongrass grows in waterlogged peat and has air channels in the stem that carry oxygen down to the roots. It flowers early and inconspicuously, and it is only when the seeds ripen that the long white hairs unfold. The tufts give the seeds wind carriage, and a bog can send cotton several kilometres in a gale.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Common cottongrass has several tufts per stem that hang out to the sides, while hare\'s-tail cottongrass has one standing straight up. The leaves are narrow and angular, and the stems stand upright from tussocks or flats in the wettest part of the bog.'},
    { title:'PEOPLE AND SPECIES',
      body:'The cotton was gathered and used for wicks in oil lamps and as filling in pillows, but the hairs are too short and smooth to be spun into thread. Cottongrass is a good indicator of bog that is still wet; on drained bog it disappears quickly.'},
  ],
  funfacts:[
    'The tuft is seed down, not a flower. The flowering itself is green and barely visible and happens several weeks earlier.',
    'Cottongrass belongs to the sedge family and is related to the sedges and club-rushes, not to the grasses.',
    'The roots draw oxygen through air channels in the stem, like a snorkel system.',
    'During the Second World War cottongrass was tried as a substitute for cotton.',
  ],
},

orangebolete: {
  intro:'The orange birch bolete is easy to recognise and good to eat. The cut surface changes colour to blue-black within minutes.',
  facts:[
    ['CAP','5–20 cm, orange-red'],
    ['SEASON','July–October'],
    ['HABITAT','under aspen and birch, often in damp forest'],
    ['STEM','white with dark scales'],
    ['USES','fried, in stews, dried'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The orange birch bolete is a pored fungus that lives in symbiosis with aspen and birch. It comes in pulses after rain and can stand in great numbers in wet years. The flesh is firmer than in its close relative the brown birch bolete, and the mushroom holds its shape better in the pan.'},
    { title:'HOW TO RECOGNISE IT',
      body:'An orange-red, dry cap, pores instead of gills, and a white stem covered in dark, rough scales. The cut surface goes from white to pink, then grey and finally blue-black. No poisonous fungus in Norway looks anything much like it.'},
    { title:'PEOPLE AND SPECIES',
      body:'The orange birch bolete is a good and common edible mushroom that travels badly; it should be carried home in a basket and fried the same day. The colour change is harmless and affects only the look, not the taste. The mushroom should always be thoroughly cooked.'},
  ],
  funfacts:[
    'The colour change happens because compounds in the fungus react with oxygen when the flesh is exposed to the air.',
    'The orange birch bolete can measure over 20 cm across the cap and weigh several hundred grams.',
    'The Norwegian name skrubb means scrubbing brush, because the stem is rough to the touch.',
    'The mushroom goes almost black in the pot, but the taste is mild and nutty.',
  ],
},

greyalder: {
  intro:'The grey alder fertilises its own ground. Bacteria in its root nodules fix nitrogen from the air, and that is why it grows in pure sand and gravel along rivers.',
  facts:[
    ['HEIGHT','10–20 m'],
    ['AGE','50–80 years'],
    ['HABITAT','floodplains, riverbanks, damp ravines'],
    ['FLOWERING','March–April, before leaf burst'],
    ['USES','wood for smoking, clog blocks, stage scenery'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The grey alder lives in partnership with bacteria in nodules on its roots. The bacteria fix nitrogen from the air, the tree gets fertiliser, and the soil under an alder wood quickly becomes rich. That makes grey alder forest one of the most productive habitat types we have, with a dense field layer of tall herbs. The alder also tolerates flooding and is the first to establish on new gravel bars.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Grey, smooth bark, matt leaves with a pointed tip, and small woody catkins that stay on the tree like tiny cones through the winter. Black alder has leaves with a blunt or notched tip and stands in even wetter ground.'},
    { title:'PEOPLE AND SPECIES',
      body:'Grey alder and bird cherry woodland along rivers is an important and often threatened habitat type, under pressure from channelling and farming. Alder wood is soft and worth little as timber, but it is the traditional wood for smoking fish and meat. The timber is also highly resistant to rot under water.'},
  ],
  funfacts:[
    'The nitrogen the alder fixes stays in the soil and fertilises the neighbouring trees as well.',
    'Venice stands on piles of alder, which have held for hundreds of years because they are entirely under water.',
    'Alder wood turns orange-red at the cut surface shortly after the tree is felled.',
    'The alder flowers before the snow is gone, and the pollen is an early allergy source.',
  ],
},

goatwillow: {
  intro:'The goat willow flowers before everything else. The pussy willow gives the bumblebee queens their first food in spring, and decides whether the bumblebee nest gets going at all.',
  facts:[
    ['HEIGHT','5–12 m'],
    ['FLOWERING','March–May, before leaf burst'],
    ['HABITAT','woodland edges, stream valleys, waste ground'],
    ['LEAVES','broad, wrinkled, grey-felted underneath'],
    ['USES','bee plant, moose browse, willow whistles'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The goat willow has separate male and female trees. The male trees carry the yellow, pollen-rich catkins, the female trees the greener ones. Flowering comes before the leaves, at a time when almost no other plant has opened, and it is therefore decisive for bumblebees, bees and early butterflies. The seeds are small with white down and are spread by the wind in May.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Broad, wrinkled leaves with grey felt on the underside, and large, silver-grey catkins in March and April. The goat willow is one of several willow species, but has the broadest leaves of them all.'},
    { title:'PEOPLE AND SPECIES',
      body:'Goat willow is one of the three most important browse trees for moose, along with rowan and aspen. The bark was used to make willow whistles in spring, when the sap rises and the bark loosens from the wood. In gardens and the cultural landscape, goat willow is one of the most valuable plants for pollinating insects.'},
  ],
  funfacts:[
    'A bumblebee queen that wakes too early and finds no goat willow in flower rarely manages to start a nest.',
    'The catkins are flowers, not buds. The yellow ones are pollen-bearing male flowers.',
    'Goat willow roots easily from a fresh twig stuck into damp soil.',
    'Willow whistles can only be made in the few weeks when the bark will twist free of the wood.',
  ],
},

/* ============================================================ THE COAST */
eagleowl: {
  intro:'The Eurasian eagle-owl is Europe\'s largest owl and a predator on wings. It nests on cliff faces along the coast, and its call carries for kilometres across dark fjords.',
  facts:[
    ['WINGSPAN','155–180 cm'],
    ['WEIGHT','1.5–4 kg, the female largest'],
    ['LIFESPAN','15–20 years in the wild'],
    ['DIET','hare, rat, gull, duck, ptarmigan, hedgehog'],
    ['RANGE','coastal districts and inland valleys, mostly western Norway and Nordland'],
    ['STATUS','endangered, around 450–700 pairs'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The eagle-owl hunts at dusk and through the night, from a lookout post on the rock face. It takes larger prey than any other Norwegian owl, up to hare and goose. The nest is a bare scrape on a rock ledge, with no nest material, and it is used again for many years. The young leave the ledge before they can fly and clamber about the cliff side for weeks.'},
    { title:'HOW TO RECOGNISE IT',
      body:'An enormous, barrel-shaped owl with orange eyes and prominent ear tufts. The call is a deep, two-syllable oo-hu repeated at even intervals. It is rarely seen by day, but crows and gulls give it away by mobbing it.'},
    { title:'PEOPLE AND SPECIES',
      body:'The eagle-owl was shot as vermin until it was protected in 1971, and the population has never fully recovered. Electric fences and power lines are a significant cause of death: the bird perches on top of a pole and touches two phases. Insulating the poles is therefore a concrete conservation measure.'},
  ],
  funfacts:[
    'The call carries several kilometres on a still coastal night, and the male answers the female in a deeper register.',
    'The wing feathers have soft edges that break up the turbulence. The eagle-owl flies almost silently despite its size.',
    'The eagle-owl can turn its head around 270 degrees because it has twice as many neck vertebrae as a human.',
    'The female is heavier than the male, as in most birds of prey and owls.',
  ],
},

seaeagle: {
  intro:'The white-tailed sea eagle has the largest wingspan in northern Europe and is Norway\'s most impressive bird in the air. Our country holds a substantial share of the entire European population.',
  facts:[
    ['WINGSPAN','200–250 cm'],
    ['WEIGHT','3.5–7 kg, the female largest'],
    ['LIFESPAN','20–30 years, up to over 30'],
    ['DIET','fish, seabirds, carrion'],
    ['RANGE','the coast from Rogaland to Finnmark, densest in Nordland and Troms'],
    ['STATUS','least concern, around 3 500–4 000 pairs'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The sea eagle hunts mostly fish near the surface and takes seabirds when the chance arises. It is also an efficient scavenger in winter. The nest is a huge bowl of sticks in a tree or on a rock ledge, and the pair adds to it every year until it can weigh several hundred kilos. One or two young are raised each year.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Broad, straight wings like a plank, a short wedge-shaped tail and a massive yellow bill in adult birds. Young birds are darker with a brown tail and do not get full adult plumage until they are four or five years old.'},
    { title:'PEOPLE AND SPECIES',
      body:'The sea eagle was almost gone from southern Norway because of persecution and was protected in 1968. Since then the population has grown strongly, and Norwegian birds have been used to build up the populations in Scotland and Ireland. Collisions with wind turbines and illegal killing are the main problem today.'},
  ],
  funfacts:[
    'Norway holds around 40 per cent of Europe\'s sea eagle population.',
    'The sea eagle readily steals the catch from other birds instead of hunting itself. This is called kleptoparasitism.',
    'The eagle sees more sharply than we do and can pick out a fish at the surface from several hundred metres away.',
    'An old sea eagle nest can grow over two metres across and has been in use for several decades.',
  ],
},

pine: {
  intro:'The Scots pine is the tree that keeps standing where nothing else manages. It grows in cracks in bare rock, tolerates drought and wind, and can live for several hundred years.',
  facts:[
    ['HEIGHT','15–30 m, lower and crooked on the coast'],
    ['AGE','200–700 years'],
    ['NEEDLES','in pairs, 4–7 cm long'],
    ['HABITAT','poor, dry and sandy soil, rock and bog edges'],
    ['USES','building timber, boats, tar, stave churches'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The pine sends a taproot straight down and side roots outwards, and finds water where the spruce cannot reach. It needs light all its life, so pine forest is open and bright at ground level, with heather and lichen. On barren coastal rock the pine grows extremely slowly and stays small and crooked, but lives correspondingly long.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Reddish-brown, flaking bark high on the trunk and coarse, grey scaly bark at the base. The needles sit two by two in a sheath. The cones are shorter and more compact than the spruce\'s, and the pine crown is untidy and spreads outwards with age.'},
    { title:'PEOPLE AND SPECIES',
      body:'Heartwood pine with dense, resin-rich core wood is almost rot-proof and was used in stave churches, boathouses and boatbuilding. Tar extracted from pine stumps in tar kilns sealed boats and roofs for hundreds of years. Today pine is the main timber in Norwegian structural lumber alongside spruce.'},
  ],
  funfacts:[
    'Pine on barren coast can reach 700 years. The oldest pines in Norway stand in places nobody has bothered to fell.',
    'The resin seals wounds in the bark and kills bacteria. It has been used as a wound salve.',
    'An old, dead pine left standing dry is called kjelke or tyristubbe, and the wood lights with a single match.',
    'Pine needles last two to four years, so the tree is green all winter but replaces its needles steadily.',
  ],
},

reddeer: {
  intro:'The red deer is Norway\'s most numerous large deer and the very symbol of nature in western Norway. The roar in September carries across the whole valley.',
  facts:[
    ['BODY','shoulder height 1.1–1.5 m'],
    ['WEIGHT','stag 120–230 kg, hind 70–120 kg'],
    ['LIFESPAN','10–15 years'],
    ['DIET','grass, herbs, leaves, shoots, farmland'],
    ['RANGE','western and central Norway, spreading eastwards'],
    ['STATUS','least concern, the population has grown strongly'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The red deer grazes more grass and herbs than the moose and moves between summer pasture high up and winter pasture down in the hillsides. The rut runs through September and October. Then the largest stags gather a harem of hinds and roar to keep rivals away, and the fights can be hard. The calves arrive in June.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Grey-brown winter coat, reddish-brown summer coat and a yellowish-white rump patch. The stag has branched antlers that are shed every spring. The red deer is between roe deer and moose in size, with a longer neck and more of a grazer\'s profile than the moose.'},
    { title:'PEOPLE AND SPECIES',
      body:'Red deer hunting is the largest hunt in Norway measured in animals shot, with tens of thousands taken every year. Browsing damage to farmland and meadows is a significant conflict in western Norway, and traffic accidents increase where the population is dense.'},
  ],
  funfacts:[
    'The roar is low-frequency and carries a long way. A deeper roar signals a bigger body, and stags size each other up by the sound before they come to blows.',
    'The antlers can weigh over ten kilos and are built up in less than four months.',
    'The red deer swims well and crosses fjords between grazing areas.',
    'The calf has white spots that fade away over its first autumn.',
  ],
},

hedgehog: {
  intro:'The hedgehog is the night\'s garden wanderer. It rolls itself into a spiny ball, goes into proper hibernation, and is declining in Norway.',
  facts:[
    ['BODY','20–30 cm'],
    ['WEIGHT','0.6–1.5 kg, heaviest before hibernation'],
    ['LIFESPAN','3–7 years'],
    ['DIET','beetles, earthworms, larvae, slugs, carrion'],
    ['RANGE','southern Norway and along the coast to Trondelag'],
    ['STATUS','declining, red-listed in Norway'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The hedgehog is nocturnal and covers several kilometres in a night hunting insects and worms. In autumn it eats itself fat and goes into true hibernation from October to April, with its body temperature down towards a few degrees. The hibernation nest is built of leaves under a bush, in a woodpile or under a decking.'},
    { title:'HOW TO RECOGNISE IT',
      body:'No confusion is possible. The back is covered in spines, the belly is hairy, and the animal curls up when it is threatened. At night it sounds like loud rustling in the leaves, far noisier than its size suggests.'},
    { title:'PEOPLE AND SPECIES',
      body:'The hedgehog is under pressure from traffic, robot mowers, wire netting fences and gardens with no leaves or scrub. It can be helped with a leaf pile in a corner, a passage under the fence and no mowing after dark. Milk should not be put out; hedgehogs cannot tolerate lactose.'},
  ],
  funfacts:[
    'A hedgehog has around 6 000 spines, and they are modified hairs.',
    'A ring muscle of its own along the back draws the spiny coat together like a purse string when the animal rolls up.',
    'In hibernation the heart can drop from around 190 to under 20 beats a minute.',
    'Hedgehogs that weigh under 600 grams in October rarely survive the winter.',
  ],
},

puffin: {
  intro:'The Atlantic puffin is the best known seabird in Norway, with its coloured bill and upright walk. The colonies on Rost have suffered a dramatic collapse in chick production.',
  facts:[
    ['BODY','28–30 cm'],
    ['WINGSPAN','50–60 cm'],
    ['WEIGHT','350–500 g'],
    ['DIET','sandeel, small herring, crustaceans'],
    ['RANGE','seabird colonies from Rogaland to Finnmark'],
    ['STATUS','red-listed, sharp decline'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The puffin digs nest burrows in peat soil on steep island slopes, or uses crevices in scree. Each pair raises a single chick a year, and both parents carry small fish in to the burrow. Outside the breeding season the puffin lives all year out on the open sea, and then it also loses the colours on its bill.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Black back, white belly, white face and a tall, triangular bill in red, yellow and blue-grey in summer plumage. It flies with rapid wingbeats low over the sea and lands clumsily. On land it stands upright on orange webbed feet.'},
    { title:'PEOPLE AND SPECIES',
      body:'The puffin colony on Rost was once among the largest in Europe. A failure in the supply of sandeel has given year after year without the chicks surviving, and the population is severely reduced. The causes are tied to changes in the sea and in the food chain, not to hunting.'},
  ],
  funfacts:[
    'The puffin carries a dozen or more small fish crosswise in its bill at once. Spines in the palate and a hinged upper mandible hold the catch in place while it opens for more.',
    'The bill\'s strong colours are seasonal decoration. The outer layers are shed after the breeding season and the bill becomes smaller and duller.',
    'The puffin uses its wings to swim underwater and can dive more than 40 metres.',
    'The chick leaves the burrow alone at night and finds its way out to sea without its parents.',
  ],
},

kittiwake: {
  intro:'The kittiwake is the gull that nests on vertical rock ledges, often in the middle of towns such as Vardo and Tromso. It has had one of the steepest population declines of all Norwegian birds.',
  facts:[
    ['BODY','38–40 cm'],
    ['WINGSPAN','90–105 cm'],
    ['WEIGHT','350–500 g'],
    ['DIET','small fish and crustaceans from the surface'],
    ['RANGE','seabird colonies along the coast, mostly in the north'],
    ['STATUS','endangered'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The kittiwake builds a nest of seaweed, grass and droppings on narrow ledges in vertical walls, where fox and mink cannot reach. It takes its food at the surface on the open sea and can fly far from the colony to find it. In winter it moves out into the North Atlantic and does not come to land before the next spring.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A small, elegant gull with a clean yellow bill and no red spot, black wingtips that look dipped in ink, and short black legs. The call is a clear kitti-waik that has given the bird its name.'},
    { title:'PEOPLE AND SPECIES',
      body:'The population has fallen by over 80 per cent since the 1980s, and the main cause is linked to less food in the sea and poorer access to it. Several colonies have moved into towns, where buildings replace rock ledges, which brings conflict with residents. Artificial kittiwake hotels have been tried out in several places in the north.'},
  ],
  funfacts:[
    'The kittiwake is the most numerous gull species in the world, but is still declining sharply.',
    'It takes almost all its food from the top few metres of the water and cannot dive deep after fish that have moved down.',
    'The chicks sit completely still on the narrow ledge for weeks. They have stronger claws than other gull chicks.',
    'Unlike most gulls, the kittiwake does not follow fishing boats and rubbish tips to any great extent.',
  ],
},

herring: {
  intro:'The herring has shaped Norwegian history more than almost any other species. The shoals number in the billions, and when they disappeared, whole coastal communities were shut down.',
  facts:[
    ['LENGTH','25–40 cm'],
    ['WEIGHT','100–400 g'],
    ['LIFESPAN','up to 20 years'],
    ['DIET','Calanus copepods and other zooplankton'],
    ['RANGE','the Norwegian Sea and the coast, spawning off More and in Lofoten'],
    ['STATUS','Norwegian spring-spawning herring is managed with quotas'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'Norwegian spring-spawning herring feeds in the Norwegian Sea in summer, overwinters in fjords and deep-water areas, and spawns on the bottom along the coast in winter and spring. The eggs stick to gravel and stone, and the larvae drift northwards with the current to the Barents Sea. The herring is the very middle link in the food chain of the sea: it eats plankton and is eaten by cod, saithe, seabirds and whales.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A silvery, slender fish with one dorsal fin and a keeled belly. The scales come off easily. Sprat is smaller and has a sharper belly keel, mackerel has a striped back and two dorsal fins.'},
    { title:'PEOPLE AND SPECIES',
      body:'The herring fishery built towns and export industries along the whole coast. The stock collapsed at the end of the 1960s after heavy fishing, and was close to being wiped out. Strict regulation from the 1970s built it up again, and the recovery counts as one of the great successes of Norwegian fisheries management.'},
  ],
  funfacts:[
    'A herring shoal can number billions of individuals and turn as one body when a predator arrives.',
    'The herring keeps the shoal together with its lateral line, which registers pressure waves from its neighbours.',
    'A female herring spawns tens of thousands of eggs, and they stick fast to the bottom instead of floating.',
    'The herring also communicates with sound from its swim bladder, a kind of high-frequency clicking.',
  ],
},

oak: {
  intro:'The oak is the richest tree we have. An old oak can house over a thousand species, and some trees are older than the houses around them.',
  facts:[
    ['HEIGHT','20–35 m'],
    ['AGE','400–1 000 years'],
    ['HABITAT','warm, nutrient-rich hillsides in southern and western Norway'],
    ['FRUIT','nuts, that is acorns, in September'],
    ['USES','shipbuilding, barrels, flooring, furniture'],
    ['STATUS','least concern, hollow oaks are a selected habitat type'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The oak grows slowly and becomes enormously old. With age it gains dead branches, cavities and loose bark, and that is exactly when it becomes most important: the cavities fill with mould where beetles, fungi and birds live. The acorns are spread by jays and squirrels, which bury them as winter stores and forget some of them.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Leaves with rounded lobes and a very short stalk, nuts on a long stalk in pedunculate oak. The bark is coarse and deeply fissured on old trees. The crown is broad and crooked when the tree has grown in the open.'},
    { title:'PEOPLE AND SPECIES',
      body:'Oak was a strategic raw material in the age of sailing ships and was felled hard for building fleets. Today hollow oaks with a girth of over two metres are a selected habitat type with protection of their own, because they carry a large number of rare species. A single old tree can therefore be worth more than the whole forest around it.'},
  ],
  funfacts:[
    'An old oak can house over a thousand species of insects, lichens and fungi, and many of them are found nowhere else.',
    'The oak takes 40–60 years before it sets its first nuts.',
    'Acorns are poisonous to horses and sheep in larger quantities, but are important food for wild boar and birds.',
    'Tannins in oak wood are why barrels give flavour to whisky, wine and cognac.',
  ],
},

yew: {
  intro:'The yew is a conifer without cones and with poisonous needles. Its timber gave Europe its best longbows, and a substance from the tree became a cancer medicine.',
  facts:[
    ['HEIGHT','5–15 m, often multi-stemmed'],
    ['AGE','several hundred years, European trees over 1 000'],
    ['HABITAT','shady, frost-free hillsides along the coast'],
    ['SEEDS','in a red, soft berry-like seed cup'],
    ['TOXIN','taxine in needles, wood and seeds'],
    ['STATUS','protected in Norway'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The yew is a shade tree that grows extremely slowly and tolerates standing under other trees for hundreds of years. It makes no cones; the seed sits instead in a red, soft cup that birds eat and spread. The species is evergreen and needs a mild coastal climate without hard spells of frost.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Dark, flat needles in two rows along the twig, with no prickle. The bark is reddish-brown and peels in flakes. The red seed cups in August and September make the tree impossible to mistake.'},
    { title:'PEOPLE AND SPECIES',
      body:'Yew and holly are protected in Norway, and the trees cannot be felled or damaged. The whole plant is poisonous to both people and livestock, except the red flesh around the seed; the seed itself is poisonous. The cytotoxic drug taxol was first extracted from yew bark, and it is today a standard treatment for several forms of cancer.'},
  ],
  funfacts:[
    'English longbows were made of yew, because the wood has a hard core and elastic sapwood that gives a natural spring.',
    'The bird eats the red cup and passes the seed undigested. The seed is poisonous, the cup is not.',
    'Yew can put out new shoots from an old trunk and root, and a tree can renew itself for a thousand years.',
    'A single mouthful of needles can be fatal to horse and cattle.',
  ],
},

/* ============================================================ THE PLATEAU */
reindeer: {
  intro:'The reindeer is the plateau\'s herd animal and the only deer species in which both sexes carry antlers. Norway has the last remaining populations of wild reindeer in Europe.',
  facts:[
    ['BODY','shoulder height 1–1.4 m'],
    ['WEIGHT','bull 90–150 kg, cow 60–100 kg'],
    ['LIFESPAN','10–15 years'],
    ['DIET','lichen in winter, grass, herbs and fungi in summer'],
    ['RANGE','high mountains from Setesdal to Finnmark'],
    ['STATUS','wild reindeer is near threatened'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'Reindeer migrate in herds over long distances between summer pasture and winter pasture. In winter they dig down through the snow to reach lichen, and lichen grows only 2–5 millimetres a year, so a grazed-out area needs decades to recover. The calves arrive in May, and the whole herd calves within a few days.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Broad, splayed hooves, a distinctly pale neck and antlers on both bulls and cows. The hooves click audibly as the reindeer walks, because a tendon slides over a bone in the foot. The herd moves as a single unit and changes direction together.'},
    { title:'PEOPLE AND SPECIES',
      body:'Herded reindeer are the foundation of Sami reindeer husbandry, and wild reindeer live in separate mountain areas, of which Hardangervidda is the largest. Roads, cabins, power lines and human traffic cut the migration routes into pieces, and that is the main reason the wild reindeer is near threatened. Chronic wasting disease was detected in Nordfjella in 2016, and the entire sub-population was culled.'},
  ],
  funfacts:[
    'Reindeer see ultraviolet light. Lichen, urine and wolf fur show up dark against the snow in UV, like writing that is invisible to us.',
    'The muzzle is a heat exchanger. Air breathed in is warmed by air breathed out, so the animal saves both heat and moisture.',
    'The hooves turn broad and soft in summer and hard with sharp edges in winter, to chop through crusted snow.',
    'The reindeer is the only deer species in which the female also carries antlers, and she keeps hers through the winter.',
  ],
},

ptarmigan: {
  intro:'The willow ptarmigan is the mountain\'s winter bird. It turns as white as the snow, sleeps in snow burrows and is at the same time Norway\'s most hunted game bird.',
  facts:[
    ['BODY','35–40 cm'],
    ['WEIGHT','450–700 g'],
    ['LIFESPAN','2–4 years'],
    ['DIET','birch and willow buds in winter, berries and shoots otherwise'],
    ['RANGE','mountain birch forest, willow scrub and low fells across the country'],
    ['STATUS','near threatened'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The ptarmigan lives on buds and shoots all winter, and digs into the snow to keep warm at night. The nest is a hollow in the ground, and the chicks are on their feet and finding food for themselves straight away. The ptarmigan population swings sharply with the rodent years: in lemming years predators and birds of prey take rodents instead of ptarmigan chicks.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Pure white winter plumage with a black tail, and brown-speckled summer plumage. The male has red wattles above the eyes during the display season and a hoarse, rolling laugh as its call. The rock ptarmigan is greyer and keeps higher up in the mountains.'},
    { title:'PEOPLE AND SPECIES',
      body:'Ptarmigan hunting from 10 September is a large part of Norwegian hunting tradition and outdoor life. The decline in numbers over several decades has led to shorter seasons, quotas and local hunting bans. Climate change that makes the snow cover less stable hits hard for a bird that is white for six months.'},
  ],
  funfacts:[
    'The ptarmigan has feathers right down to its toes. The feet become snowshoes that hold it up on loose snow.',
    'The snow burrow is warmer than the air outside, and the ptarmigan can sit still through a storm for several days.',
    'The caeca are unusually large because they have to break down fibrous buds and twigs.',
    'The ptarmigan changes plumage three times a year, not twice like most birds.',
  ],
},

arcticfox: {
  intro:'The Arctic fox is Norway\'s most endangered mammal and one of the best insulated animals in the world. It tolerates fifty degrees below zero and lives on the bare mountain all year round.',
  facts:[
    ['BODY','50–65 cm, tail 30 cm'],
    ['WEIGHT','3–5 kg'],
    ['LIFESPAN','3–6 years'],
    ['DIET','lemmings and field voles, ptarmigan chicks, eggs, carrion'],
    ['RANGE','high mountains in southern Norway and northwards, scattered populations'],
    ['STATUS','endangered'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The Arctic fox lives on small rodents and follows the lemming years. In peak years a litter can number more than ten cubs; in poor years it does not breed at all. The dens lie in gravel ridges above the tree line and are used again by generation after generation. In winter it follows wolverine and wolf and lives on the remains of their kills.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A small, round fox with a short muzzle, small ears and a thick white winter coat. The summer coat is brown and thin and looks almost like a different animal. Some individuals have a blue winter coat instead of a white one.'},
    { title:'PEOPLE AND SPECIES',
      body:'The Arctic fox was almost gone from Scandinavia around the year 2000. The breeding station at Saeterfjellet in Oppdal has since released cubs into mountain areas, combined with winter feeding and the removal of red fox. The population has clearly recovered, but still depends on active measures.'},
  ],
  funfacts:[
    'The Arctic fox has the best insulating fur of any mammal. It does not start spending energy on keeping warm until it is around 40 degrees below zero.',
    'Short ears and a short muzzle are no accident: less surface area means less heat loss.',
    'The red fox is the big competitor. It moves up into the mountains as the climate grows milder and takes over the dens.',
    'In good lemming years a single litter can have 14–19 cubs, the most of any predator in the world.',
  ],
},

heather: {
  intro:'Heather is the main plant of the heathland and the very colour of the Norwegian coastal landscape in August. It has shaped both grazing practice and building traditions along the coast.',
  facts:[
    ['HEIGHT','20–60 cm'],
    ['FLOWERING','July–September'],
    ['AGE','up to 40 years'],
    ['HABITAT','coastal heathland, bog edges, pine forest, mountain heath'],
    ['USES','heather honey, sheep fodder, thatching, besoms'],
    ['STATUS','least concern, but coastal heathland is a threatened habitat type'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'Heather grows on acidic, poor soil and manages it because fungal threads in the roots fetch nitrogen it would otherwise not get. It flowers at the end of summer, when almost everything else has finished, and so gives bees a late nectar flow. Old heather plants turn woody and give poor grazing, so the heath has to be kept young.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A dense, branched shrub with small, needle-like leaves in four rows and masses of small pink to purple bell flowers along the stem. Cross-leaved heath has larger, more distinct bells and grows in wetter ground.'},
    { title:'PEOPLE AND SPECIES',
      body:'The heathlands along the coast have been kept open by grazing and heather burning for around 5 000 years. When that use stops, the heath grows over with juniper, birch and Sitka spruce, and coastal heathland now stands as a threatened habitat type. Management with sheep and controlled burning is what keeps the landscape going.'},
  ],
  funfacts:[
    'Heather honey is so thick that it has to be stirred loose before it will run. It is thixotropic: solid at rest, liquid in motion.',
    'A single heather plant can produce several hundred thousand seeds a year, and the seeds stay alive in the soil for decades.',
    'The Norwegian name sopelime comes from heather twigs bound into a bundle being used as a broom.',
    'Heather burning is done in winter or early spring, when the peat is damp and only the dry material above it burns.',
  ],
},

muskox: {
  intro:'The muskox is an ice age animal that still walks on Dovrefjell. The herd forms a ring with the horns facing outwards when it is threatened, a defence that worked against wolves for thousands of years.',
  facts:[
    ['BODY','shoulder height 1.2–1.5 m'],
    ['WEIGHT','bull 250–400 kg, cow 180–250 kg'],
    ['LIFESPAN','12–20 years'],
    ['DIET','grass, sedge, heather, willow'],
    ['RANGE','Dovrefjell, introduced population'],
    ['STATUS','introduced population of around 200 animals'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The muskox is built for cold and stays out on the plateau all winter. It grazes on wind-blown ridges where the snow is thin, and saves energy by moving little. The calves are born in April and May, in the last weeks of winter, and keep warm pressed close to the cow. Bulls fight over the cows in August by running at each other and slamming their foreheads together.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A massive, dark body with long hair that hangs almost to the ground, and broad horns that meet in a helmet across the forehead. Although it looks like an ox, the muskox is more closely related to sheep and goats.'},
    { title:'PEOPLE AND SPECIES',
      body:'Muskoxen were released on Dovre from Greenland in the 1930s and 1940s and have stayed there ever since. The animals seem calm, but they are fast and dangerous when they feel cornered. The recommended distance is at least 200 metres, and several people have been injured by muskoxen that were pushed too far by photographers.'},
  ],
  funfacts:[
    'The underwool is called qiviut and is warmer than sheep wool per gram. It is shed in large sheets in spring and can be gathered out in the terrain.',
    'The muskox is more closely related to goats and sheep than to oxen, despite the name.',
    'The Dovre herd descends from a handful of animals brought from East Greenland.',
    'A muskox can sprint at over 50 km/h, far faster than a human.',
  ],
},

goldenplover: {
  intro:'The European golden plover is the flute of the plateau. The trilling note over the heather is the sound of the Norwegian high mountains in summer.',
  facts:[
    ['BODY','26–29 cm'],
    ['WINGSPAN','65–75 cm'],
    ['WEIGHT','150–220 g'],
    ['DIET','insects, earthworms, larvae, berries'],
    ['RANGE','high mountains and bogs across the country'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The golden plover breeds on open mountain heath and bog, in a simple hollow in the ground with four speckled eggs. The chicks find food for themselves from the first day. In autumn the species migrates south to western Europe and North Africa, often in large flocks together with lapwing. In spring it comes back early, often before the snow has fully released the mountains.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A gold-speckled back, black face and belly in summer plumage, bordered by a white stripe along the side. In winter it is far paler underneath. The call is a clear, slightly plaintive whistle on two notes.'},
    { title:'PEOPLE AND SPECIES',
      body:'The golden plover tolerates human traffic poorly in the breeding season and leaves the nest when disturbed. The species is tied to open mountain heath, and scrub encroachment lower down pushes it upwards. At the same time it is one of the most numerous waders in the Norwegian mountains.'},
  ],
  funfacts:[
    'The golden plover limps with a drooping wing and pretends to be injured to lure predators away from the nest.',
    'The bird is one of the fastest fliers among waders and can hold more than 80 km/h on migration.',
    'The chicks are covered in down and run from the nest a few hours after hatching.',
    'Golden plovers and lapwings flock together in fields in autumn before the migration south.',
  ],
},

crowberry: {
  intro:'Crowberry covers the plateau in black, dense mats. It uses chemistry against its neighbouring plants, and the berry is food for birds and people alike.',
  facts:[
    ['HEIGHT','10–30 cm, creeping'],
    ['FLOWERING','April–June, small and inconspicuous'],
    ['BERRIES','black, juicy, ripe from August'],
    ['HABITAT','mountain heath, pine heath, coastal heathland'],
    ['USES','juice, jam, mixed with other berries'],
    ['STATUS','least concern and very common'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'Crowberry is an evergreen dwarf shrub that spreads in mats over large areas. It gives off substances that inhibit germination in other plants, and can therefore dominate the plateau almost alone for decades. The mats are broken up by fire, which gives other species a chance again. The leaves are narrow and rolled up to save water in wind and cold.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Dense, dark mats of short, needle-like leaves along creeping stems, and black, glossy berries sitting straight on the stem. The berry tastes watery and mild, without the sharpness that bilberry and lingonberry have.'},
    { title:'PEOPLE AND SPECIES',
      body:'Crowberry is important winter food for ptarmigan and part of the traditional berry supply in the north, often mixed with other berries for the sake of the flavour. Where the crowberry mats dominate, birch and other vegetation recruit more poorly, and that affects the whole grazing base in the mountains.'},
  ],
  funfacts:[
    'Crowberry wages chemical warfare: substances from the leaves inhibit germination and fungal partnerships in its competitors.',
    'A continuous crowberry mat can be more than a hundred years old.',
    'The berry contains a lot of pigment and is used to give colour to juice made from other berries.',
    'Crowberry grows both on Svalbard and in southern Norway, and in the southern hemisphere as well.',
  ],
},

dwarfcornel: {
  intro:'The dwarf cornel fools the eye. What looks like four white petals are really leaves, and the true flower is the little black cluster in the middle.',
  facts:[
    ['HEIGHT','10–25 cm'],
    ['FLOWERING','June–July'],
    ['BERRIES','red, ripe in August'],
    ['HABITAT','mountain heath, damp heathland, coastal heath'],
    ['FAMILY','the dogwood family'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The dwarf cornel is a small perennial plant that spreads by runners beneath the moss. The black cluster in the middle is a gathering of true flowers, and the four white lobes around it are bracts that make the whole thing visible to insects. The plant thrives in damp, cool heathland and grows both in the mountains and down towards the coast in the north.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Four broad leaves in a cross on the stem and the characteristic white square with a black centre. After flowering come small, bright red berries in a cluster.'},
    { title:'PEOPLE AND SPECIES',
      body:'The berries are edible, but mealy and almost tasteless, and have been used as a filler in porridge and in mixtures. The plant is related to the dogwood trees grown in gardens. It tolerates trampling poorly and disappears quickly from ground close to paths.'},
  ],
  funfacts:[
    'The flower opens explosively: when an insect touches it, the stamens spring up and throw pollen over the visitor.',
    'The white petals are really bracts, that is, modified leaves.',
    'In parts of the country the plant is also called honsebaer, hen berry.',
    'The dwarf cornel grows both in Scandinavia and in North America and East Asia.',
  ],
},

dwarfbirch: {
  intro:'The dwarf birch is a whole tree in miniature. It keeps below the snow cover in winter and escapes frost burn and wind.',
  facts:[
    ['HEIGHT','20–80 cm, rarely over a metre'],
    ['LEAVES','round, 5–15 mm, with a bluntly toothed edge'],
    ['HABITAT','bog, mountain heath, tundra'],
    ['DISTRIBUTION','the mountains across the country, northern districts'],
    ['USES','grazing for reindeer and ptarmigan'],
    ['STATUS','least concern, spreading with a warmer climate'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The dwarf birch grows low and dense, just low enough to stay covered by snow all winter. The snow insulates against the worst temperatures and against drying out in the wind, which is the real threat in the mountains. It tolerates acidic and wet ground, and is therefore common both on bogs and on dry ridges where the snow settles.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Small, almost round leaves with blunt teeth along the edge, on stiff, branched, brown twigs. In autumn the mats turn bright red and orange and give colour to the whole plateau.'},
    { title:'PEOPLE AND SPECIES',
      body:'Dwarf birch is important winter grazing for ptarmigan, which live on buds and shoots. With a warmer climate, dwarf birch and willow spread upwards and outwards in the mountains, a process known as shrubification of the tundra, which changes the grazing for both reindeer and birds.'},
  ],
  funfacts:[
    'The dwarf birch is related to the common birch and makes the same catkins, only in miniature format.',
    'It can live for several decades even though it is only knee-high.',
    'Red dwarf birch mats are a large part of the autumn colours on the plateau.',
    'The species grows all the way to Svalbard, where it creeps along the ground a few centimetres high.',
  ],
},

/* ============================================================ THE FJORD */
otter: {
  intro:'The otter is a mustelid that has moved into the sea. It fishes in the shore zone, rests on land, and needs fresh water to rinse its fur in to stay warm.',
  facts:[
    ['BODY','60–90 cm, tail 30–45 cm'],
    ['WEIGHT','6–12 kg'],
    ['LIFESPAN','5–10 years'],
    ['DIET','fish, crab, shellfish, seabirds'],
    ['RANGE','the coast from western Norway to Finnmark, fresh water inland'],
    ['STATUS','recovering after a sharp decline'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The otter hunts in dives of half a minute to a minute and takes fish near the bottom. It is most active at dusk and at night, and has several resting places in burrows and under roots along the shore zone. The cubs are born in a den and learn to swim from their mother; they are actually afraid of water to begin with.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A long, streamlined body, a thick tail base and webbing between the toes. On land it moves with an arched back and a low profile. Field signs are slide marks in snow and mud, and droppings with fish bones and shell fragments on regular rocks.'},
    { title:'PEOPLE AND SPECIES',
      body:'The otter was hunted for its fur and almost wiped out in southern Norway, and was protected in 1982. It is on its way back from the north. The biggest cause of death today is drowning in fishing gear: pots and fyke nets without a guard take otters every year.'},
  ],
  funfacts:[
    'The otter has around 50,000 hairs per square centimetre. The fur holds a layer of air against the skin, so the skin never gets wet.',
    'Salt water ruins the insulation. Coastal otters have to rinse in fresh water regularly, and access to streams governs where they can live.',
    'The whiskers pick up pressure waves from fish in dark water, so the otter hunts without seeing its prey.',
    'The otter eats 1–1.5 kilos of fish a day, around 15 per cent of its own body weight.',
  ],
},

cod: {
  intro:'The cod is Norway\'s most important fish, economically and historically. The skrei, the Arctic cod that spawns in Lofoten every winter, is the basis for stockfish, trading towns and entire coastal communities.',
  facts:[
    ['LENGTH','usually 40–100 cm, rarely over 150 cm'],
    ['WEIGHT','2–10 kg is normal, record over 50 kg'],
    ['LIFESPAN','up to 20–25 years'],
    ['DIET','capelin, herring, shrimp, crab, small fish'],
    ['RANGE','the Barents Sea, the Norwegian Sea and along the whole coast'],
    ['STATUS','the skrei is in good shape, coastal cod in the south is weak'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'North-east Arctic cod grow up in the Barents Sea and swim south every winter to spawn. Eggs and larvae drift north with the coastal current back to the nursery areas, so the whole life cycle is one long round dance in the sea. Coastal cod, by contrast, mostly stay put in a single fjord all their lives, and form a separate, more vulnerable stock.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Three dorsal fins, a clear barbel under the chin, a pale lateral line and an overbite. Coastal cod are often darker and reddish brown, skrei paler and silver-grey. Saithe have a straight lateral line and an underbite, haddock a black blotch above the pectoral fin.'},
    { title:'PEOPLE AND SPECIES',
      body:'Stockfish from Lofoten has been an export product since the Viking Age, and was Norway\'s biggest trade commodity in the Middle Ages. Today the fishery is run with quotas set in cooperation with Russia. Coastal cod south of Stad is so weak that separate protected areas and restrictions have been introduced.'},
  ],
  funfacts:[
    'The skrei swims 800–1,000 km from the Barents Sea to Lofoten every winter to spawn.',
    'A large female cod spawns several million eggs, spread over many batches across a few weeks.',
    'Age is read from the otoliths, which have annual rings much like a tree.',
    'The cod uses its swim bladder to make a drumming sound during spawning.',
  ],
},

harbourseal: {
  intro:'The harbour seal is the seal you see on the skerries at low tide. It is sedentary, curious and lives its whole life within a few tens of kilometres.',
  facts:[
    ['LENGTH','1.3–1.8 m'],
    ['WEIGHT','65–150 kg'],
    ['LIFESPAN','25–35 years'],
    ['DIET','fish such as saithe, cod, herring and flounder'],
    ['RANGE','the whole coast, in colonies on skerries and sandbanks'],
    ['STATUS','managed with quotas, Norwegian population around 7,000 animals'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The harbour seal rests, basks and moults on fixed skerries that emerge at low tide, and takes to the water when the tide comes in. It readily dives to 50–100 metres after fish. The pups are born on land in June and July, and unlike harp seals they can swim almost straight away.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A round head with a short, cat-like muzzle and V-shaped nostrils. The grey seal is larger, with a long, straight head profile and parallel nostrils. The harbour seal often lies in a banana pose with head and hindquarters lifted.'},
    { title:'PEOPLE AND SPECIES',
      body:'Harbour seals compete with the fisheries and host the cod worm parasite, and that is why there are hunting quotas. The population was heavily reduced by virus epidemics in northern Europe in 1988 and 2002. Seal pups lying alone on land are usually not abandoned, and should not be moved.'},
  ],
  funfacts:[
    'The harbour seal can hold its breath for almost half an hour and sleep under water between breaths.',
    'During a dive the pulse drops sharply and the blood is directed to the brain and the heart. This is called the diving reflex.',
    'The whiskers sense the eddies a fish leaves behind, so the seal can track prey in the dark.',
    'The spot pattern is unique to each animal, and is used to recognise individuals in the colonies.',
  ],
},

kelp: {
  intro:'The kelp forest is the sea\'s rainforest. Cuvie forms forests metres tall on the seabed along the whole coast, and gives house room to thousands of species.',
  facts:[
    ['HEIGHT','1–3 m, some over 4 m'],
    ['AGE','10–20 years'],
    ['HABITAT','wave-exposed hard bottom down to 20–30 m depth'],
    ['GROWTH','a new blade every spring, the old blade shed'],
    ['USES','alginate, fertiliser, feed, food'],
    ['STATUS','least concern in the south, grazed down by sea urchins in the north'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'Cuvie has a holdfast that claws onto the rock, a stiff stipe and a split blade at the top. It is not a plant but a brown alga, and takes all its nourishment from the seawater around it. Every spring a new blade is made at the joint between the stipe and the old blade, and the old one is torn off in the winter storms.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A coarse, dark olive-brown blade divided into broad straps, and a rough stipe that is often covered with small algae and animals. Sugar kelp has a smooth, crinkled blade with no divisions and stands more still.'},
    { title:'PEOPLE AND SPECIES',
      body:'Kelp is harvested by trawl along the coast and used for alginate, which is found in everything from ice cream to toothpaste and wound dressings. In Nordland, Troms and Finnmark, grazing by sea urchins has laid large kelp forests waste for several decades; in the south the forests are in better condition. Kelp is also a growing field within the cultivation of food and feed.'},
  ],
  funfacts:[
    'The kelp forest along the Norwegian coast is among the most species-rich habitats in the sea. A single kelp plant can house over a hundred species.',
    'The holdfast of the cuvie can hold on in waves that strike with several tonnes of force.',
    'Alginate from kelp keeps ice cream from going grainy and helps wound dressings hold moisture.',
    'Kelp grows faster than almost all land plants, and binds large amounts of CO2 while it does so.',
  ],
},

greyseal: {
  intro:'The grey seal is the largest seal that breeds in Norway. The male can reach three metres, and the pups are born white on land in the autumn.',
  facts:[
    ['LENGTH','female 1.8–2 m, male 2.3–3 m'],
    ['WEIGHT','female 150–200 kg, male 250–350 kg'],
    ['LIFESPAN','25–35 years'],
    ['DIET','saithe, cod, wolffish, flatfish'],
    ['RANGE','colonies from Rogaland to Finnmark, densest in Froan and Lofoten'],
    ['STATUS','managed with quotas'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'Grey seals gather in colonies on skerries and islets in the autumn to give birth. The pups have a white woolly coat for the first few weeks and cannot swim; they lie on land and suckle a milk with a very high fat content, and put on several kilos a day. Once the mother leaves them, they moult and take to the sea themselves. Adult grey seals dive deep and hunt fish near the bottom.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A long, straight head profile with no clear forehead, and nostrils that run parallel. The harbour seal is smaller, with a round head, a short muzzle and V-shaped nostrils. The male has a heavy, wrinkled neck.'},
    { title:'PEOPLE AND SPECIES',
      body:'Grey seals compete with the fisheries and are the main host of the cod worm parasite found in cod fish. Hence the quota hunt. Colonies are vulnerable to disturbance in the breeding season in the autumn, when the pups lie defenceless on land.'},
  ],
  funfacts:[
    'A grey seal pup puts on over two kilos a day on milk that contains around 50 per cent fat.',
    'The males fight over the places in the colony and carry scars and thickened skin on the neck from bites.',
    'The grey seal can dive over 200 metres and stay down for 20 minutes.',
    'Norway has two seal species that breed along the mainland coast: the grey seal and the harbour seal.',
  ],
},

porpoise: {
  intro:'The harbour porpoise is the world\'s smallest toothed whale and the commonest whale in Norwegian waters. It finds fish with clicks far above what we can hear.',
  facts:[
    ['LENGTH','1.4–1.9 m'],
    ['WEIGHT','50–70 kg'],
    ['LIFESPAN','10–20 years'],
    ['DIET','herring, sandeel, cod fish, sprat'],
    ['RANGE','the whole coast, often well inside fjords and close to land'],
    ['STATUS','least concern, but bycatch in nets is a problem'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The porpoise lives in small groups of two to four animals and tends to keep to shallow water near the coast. It has a high metabolic rate and has to eat almost continuously, around 10 per cent of its body weight a day. The calf is born in summer and follows its mother for about a year. The porpoise rarely leaps and is easy to overlook: you see a small triangular fin roll across the surface and then it is gone.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A small, dark whale with a rounded snout and no beak, and a low, triangular dorsal fin. Dolphins have a clear beak and a tall, curved fin. The porpoise never shows its tail when it dives.'},
    { title:'PEOPLE AND SPECIES',
      body:'The biggest threat is bycatch: porpoises get tangled in bottom-set nets and drown. Several thousand animals are reckoned to be lost every year in Norwegian waters. Acoustic pingers on nets and changed fishing methods are the most realistic measures.'},
  ],
  funfacts:[
    'The porpoise makes clicks above 100 kHz, far above the limit of human hearing, and uses the echo to see with sound.',
    'The high-frequency sounds are probably a way of avoiding killer whales, which do not hear that high.',
    'The porpoise has to breathe several times a minute and cannot sleep the way we do. Half the brain rests at a time.',
    'It often swims far into fjords and up into river mouths after fish.',
  ],
},

salmon: {
  intro:'The salmon grows big at sea and finds its way back to its own river to spawn. Wild salmon is both a national symbol and a management conflict.',
  facts:[
    ['LENGTH','50–120 cm'],
    ['WEIGHT','1–20 kg, large salmon over 10 kg'],
    ['LIFESPAN','4–8 years'],
    ['DIET','crustaceans and fish at sea, insects as a juvenile'],
    ['RANGE','over 400 Norwegian salmon rivers, feeding grounds in the North Atlantic'],
    ['STATUS','many stocks are weakened or threatened'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The salmon hatches in the river and lives there as a juvenile for two to five years. Then it turns into a smolt, goes silver and migrates out to sea, all the way to the waters off the Faroes and Greenland. After one to three years at sea it returns to the same river it came from, and spawns on gravel in the autumn. Many die after spawning, but some survive and spawn more than once.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A slim, silvery fish with a V-shaped tail, a narrow tail base and black spots mostly above the lateral line. The sea trout has a squarer tail, a thicker tail base and spots below the lateral line as well. In spawning dress the male salmon turns dark with a hook on the lower jaw.'},
    { title:'PEOPLE AND SPECIES',
      body:'Wild salmon are under pressure from salmon lice and escaped farmed salmon that spawn in the rivers and mix genetically with the wild fish, on top of the parasite Gyrodactylus salaris, hydropower and acidification. Norway holds a large share of the world\'s remaining Atlantic wild salmon, and river fishing is strictly regulated with quotas and catch reporting.'},
  ],
  funfacts:[
    'The salmon finds its way back to its home river by smell, and very rarely gets it wrong.',
    'It can leap several metres up waterfalls to get further up the river.',
    'At sea the salmon grows many times faster than it did in the river, because the food is completely different.',
    'The juveniles in the river have clear dark marks along the side and do not look like salmon at all.',
  ],
},

saithe: {
  intro:'The saithe is the cod fish that travels in shoals and hunts at the surface. It stands under the quaysides along the whole coast and is the first fish many people catch.',
  facts:[
    ['LENGTH','40–100 cm, up to 130 cm'],
    ['WEIGHT','1–10 kg, big saithe more'],
    ['LIFESPAN','up to 20 years'],
    ['DIET','herring, sandeel, krill, small fish'],
    ['RANGE','the whole coast and the Norwegian Sea'],
    ['STATUS','managed with quotas, the stocks are in good shape'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'The saithe grows up in kelp forest and in shallow water near land, where the small saithe stand in shoals. In time it moves deeper and further out. Adult saithe hunt actively in shoals and drive herring shoals up towards the surface, often together with seabirds working the same prey. Spawning takes place in winter along the More coast and in Lofoten.'},
    { title:'HOW TO RECOGNISE IT',
      body:'A dark back, silver-grey sides, a straight, pale lateral line and an underbite, that is, the lower jaw juts out. The cod has an overbite, a curved pale lateral line and a barbel. The pollack has bigger eyes and a strongly curved lateral line.'},
    { title:'PEOPLE AND SPECIES',
      body:'Saithe is one of the most important commercial species in Norway and is sold fresh, salted and as fishcakes and mince. For recreational anglers, small saithe is often the first catch on a jig from the jetty. The fishery is regulated with quotas and gear restrictions.'},
  ],
  funfacts:[
    'The saithe travels in big shoals under the quayside and chases herring up to the surface, often with gulls right above.',
    'Young saithe is called pale or mort in many parts of the country.',
    'The saithe swims faster than the cod and hunts actively in open water instead of along the bottom.',
    'Big saithe shoals can be seen from land as dark patches moving under the surface.',
  ],
},

sugarkelp: {
  intro:'Sugar kelp is the soft, crinkled kelp of the shore zone. It has disappeared from large parts of southern Norway, and is at the same time on its way to becoming a cultivated resource.',
  facts:[
    ['LENGTH','1–3 m'],
    ['AGE','2–4 years'],
    ['HABITAT','sheltered hard bottom down to 20–30 m'],
    ['BLADE','undivided, crinkled, without straps'],
    ['USES','food, feed, fertiliser, biofuel'],
    ['STATUS','strongly reduced in southern and western Norway'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'Sugar kelp attaches with a small root-like holdfast and grows in sheltered areas where the waves do not strike too hard. It grows fastest in winter and spring when the water is cold and rich in nutrients. Warm summer water, siltation and fouling are three things it tolerates badly, and all three have increased along the coast of southern Norway.'},
    { title:'HOW TO RECOGNISE IT',
      body:'One long, undivided blade with crinkled edges and a short stipe. Cuvie is stiffer, has a tall, rough stipe and a blade divided into broad straps.'},
    { title:'PEOPLE AND SPECIES',
      body:'Large sugar kelp forests along Skagerrak have been replaced by filamentous algae and silt, and the loss is estimated at up to 80 per cent in parts of the area. At the same time sugar kelp is grown commercially on ropes along the coast, for food, feed and industry, because it grows fast without fertiliser or fresh water.'},
  ],
  funfacts:[
    'The white coating on dried sugar kelp is mannitol, a sugar alcohol. That is why it is called sugar kelp.',
    'Sugar kelp can grow several centimetres a day in good periods.',
    'It is grown on ropes in the sea and needs neither fertiliser, fresh water nor land area.',
    'In Japan, close relatives of sugar kelp are the basis for dashi, the classic stock.',
  ],
},

knottedwrack: {
  intro:'Knotted wrack is the long, tough wrack in the shore zone with air bladders in a row. Each bladder is one year, so you can read the age straight off the plant.',
  facts:[
    ['LENGTH','0.5–2 m'],
    ['AGE','10–15 years, some older'],
    ['HABITAT','sheltered shore, between high and low water'],
    ['BLADDERS','one new one a year along the main frond'],
    ['USES','seaweed meal, fertiliser, feed additive'],
    ['STATUS','least concern'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'Knotted wrack lives in the tidal zone and lies dry every time the tide is out. It tolerates drying out, frost and swings in salinity, and is therefore completely dominant on sheltered shores. The air bladders lift the wrack up towards the light when the water rises. Under the wrack mats there is a whole animal community of snails, sea slaters, crabs and fry that use it as cover.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Long, flat, olive-brown straps with no midrib, with single air bladders at even intervals. Bladder wrack has bladders in pairs and a clear midrib down the strap.'},
    { title:'PEOPLE AND SPECIES',
      body:'Knotted wrack is harvested along the coast and dried into seaweed meal, which is used in animal feed and fertiliser. Harvesting has to be done with care, because the plant grows slowly and takes many years to build itself up again. The wrack belt is at the same time one of the most species-rich environments on the shore.'},
  ],
  funfacts:[
    'Knotted wrack sets one air bladder a year. Count the bladders along the main frond and you are counting years.',
    'Plants with over fifty bladders are common, in other words wrack older than many of the people picking it.',
    'The wrack can lose over half its water content at low tide and still recover completely when the water comes back.',
    'Under the wrack mats the temperature is far more stable than outside, and small creatures there survive both frost and sun.',
  ],
},

eelgrass: {
  intro:'Eelgrass is not a wrack but a flowering plant that has moved out into the sea. The meadows it forms are a nursery for cod fry and a large carbon store.',
  facts:[
    ['LENGTH','30–100 cm'],
    ['FLOWERING','summer, under water'],
    ['HABITAT','soft bottom at 1–10 m depth in sheltered bays'],
    ['SPREAD','rhizomes and seeds'],
    ['ROLE','nursery area for fish fry'],
    ['STATUS','the meadows are a threatened habitat in several places'],
  ],
  sections:[
    { title:'HOW IT LIVES',
      body:'Eelgrass has roots, stems, flowers and seeds, exactly like land plants, but the whole life cycle takes place under water. The pollen is long and thread-like and drifts with the current from flower to flower. The plants bind the soft bottom together with rhizomes, dampen waves and prevent erosion, and form dense meadows where fry can hide.'},
    { title:'HOW TO RECOGNISE IT',
      body:'Long, narrow, grass-green blades that bend with the current, anchored in sand or mud. Unlike wrack, eelgrass stands in soft bottom and not on rock, and the blades are clearly green, not brown.'},
    { title:'PEOPLE AND SPECIES',
      body:'Eelgrass meadows are among the most valuable shallow habitats we have, and they are under pressure from dredging, infilling, jetties, anchoring and siltation. The loss hits cod fry and other fish directly. Restoration of meadows is being trialled in several places along the coast.'},
  ],
  funfacts:[
    'Eelgrass stores carbon in the bottom sediment far faster per square metre than a forest on land does in the soil.',
    'The pollen is thread-like and floats with the current, one of the few plants in the world that are pollinated under water.',
    'Dried eelgrass was used as insulation in walls and as mattress stuffing, and lasts over a hundred years.',
    'An eelgrass meadow can consist of clones that have lived for several hundred years.',
  ],
},


};

/* ==========================================================================
   THE PANEL
   READ MORE slides a sheet over the screen. The content is drawn from ARTICLES,
   and every piece of text goes through esc() so that no data string can break
   the markup.
   ========================================================================== */
const ARTICLE = (() => {
'use strict';

const $  = s => document.querySelector(s);
const VM = () => window.VM || null;

const esc = s => String(s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;');

function has(id){ return !!ARTICLES[id]; }

function draw(a, sp){
  const parts = [];

  parts.push(`<p class="article-intro">${esc(a.intro)}</p>`);

  if(a.facts && a.facts.length){
    parts.push(`<h4 class="article-heading">KEY FIGURES</h4>
      <dl class="article-facts">${a.facts.map(([n,v]) =>
        `<div class="article-facts-row"><dt>${esc(n)}</dt><dd>${esc(v)}</dd></div>`
      ).join('')}</dl>`);
  }

  for(const sec of (a.sections || [])){
    parts.push(`<h4 class="article-heading">${esc(sec.title)}</h4>
      <p class="article-section">${esc(sec.body)}</p>`);
  }

  if(a.funfacts && a.funfacts.length){
    parts.push(`<h4 class="article-heading article-heading-gold">FUNFACTS</h4>
      <ul class="article-funfacts">${a.funfacts.map(f =>
        `<li class="article-funfact">${esc(f)}</li>`).join('')}</ul>`);
  }

  parts.push(`<p class="article-foot">${esc(sp.kind === 'animal' ? 'ANIMAL' : 'PLANT')}
    &middot; ${esc((AREAS.find(o => o.id === sp.area) || {}).name || '')}
    &middot; ${'★'.repeat(sp.rarity)}</p>`);

  return parts.join('');
}

function show(id){
  const sp = SPECIES_BY_ID[id];
  const a  = ARTICLES[id];
  if(!sp || !a) return;
  let name = sp.name;
  try { name = VM().displayName(id); } catch(e){}
  $('#speciesSheetName').textContent = name;
  $('#speciesSheetSci').textContent  = sp.sci;
  const scroll = $('#speciesSheetScroll');
  scroll.innerHTML = draw(a, sp);
  scroll.scrollTop = 0;
  const sheet = $('#speciesSheet');
  sheet.hidden = false;
  sheet.classList.remove('in'); void sheet.offsetWidth; sheet.classList.add('in');
}

function close(){ $('#speciesSheet').hidden = true; }
function isOpen(){ return !$('#speciesSheet').hidden; }

/* ---------------------------------------------------------------- events
   The buttons carry the species id in data-more. The detail screen and the
   map card set it themselves as they are drawn. */
document.addEventListener('click', e => {
  const button = e.target.closest('[data-more]');
  if(button){
    const id = button.dataset.more;
    if(!id || !has(id)) return;
    VM()?.SOUND?.click(); VM()?.vibrate?.(12);
    show(id);
    return;
  }
  if(e.target.closest('#speciesSheetClose') || e.target.closest('#speciesSheetBack')){
    VM()?.SOUND?.click();
    close();
  }
});
document.addEventListener('keydown', e => {
  if(e.key === 'Escape' && isOpen()) close();
});

return { show, close, has, isOpen };
})();

/* const names do not land on window. The map and app.js check window.ARTICLE,
   so it has to be exposed explicitly. */
window.ARTICLE = ARTICLE;
