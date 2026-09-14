/* VILLMARK - ARTSARTIKLER
   Lang tekst om hver art: innledning, nokkeltall, avsnitt og funfacts.
   Feltet fakta i species.js er ettlinjeren pa detaljskjermen. Her ligger
   det grundige stoffet som LES MER apner.

   Alle felt er rene tekststrenger. Panelet tegnes nederst i fila og
   apnes med ARTIKKEL.vis(artsId). */

const ARTIKLER = {

/* ============================================================ GRANSKOGEN */
rev: {
  intro:'Reven er Norges vanligste rovdyr og finnes fra fjæra til over tregrensa. Den klarer seg overalt fordi den spiser omtrent alt, og fordi den tar sjansen på å bo tett på mennesker.',
  tall:[
    ['KROPP','45–90 cm, hale 30–55 cm'],
    ['VEKT','3–10 kg'],
    ['LEVETID','3–5 år i naturen'],
    ['MAT','smågnagere, fugl, egg, insekter, bær, åtsler'],
    ['HVOR','hele landet, opp i lavfjellet'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Reven jakter mest i skumringen og om natta, og bruker hørselen mer enn synet. Den peiler lyden av en mus under snøen, reiser seg på bakbeina og stuper rett ned gjennom skaren med snuten først. Om vinteren lever den av gnagere og åtsler, om sommeren av alt fra meitemark til blåbær. Tispa føder 4–6 valper i april, og begge foreldrene bærer mat til hiet.'},
    { t:'KJENN DEN IGJEN',
      b:'Rustrød pels, hvit buk, svarte sokker og en tung hale med hvit tupp. Sporet ligger i en nesten rett snor over snøen, fordi reven setter bakfoten i sporet fra framfoten. Hundespor siksakker til sidene, revespor gjør det ikke.'},
    { t:'MENNESKE OG ART',
      b:'Reven følger oss. Den rasker i søppel i byen og legger valper under hytteverandaen. På 1970- og 80-tallet slo reveskabb ut store deler av bestanden i Sør-Norge, men den tok seg inn igjen på noen tiår. Reven kan bære dvergbendelorm, så bær og sopp bør skylles før de spises rå.'},
  ],
  funfacts:[
    'En rev som museslår sikter helst nord–sør. Forskere tror den bruker jordmagnetfeltet som siktemiddel.',
    'Reven har over tjue ulike lyder. Skrikene du hører på vinternatta er paring, ikke slåsskamp.',
    'Halen virker som balansestang i svingene, og som teppe over snuten når reven sover ute i kuldegrader.',
    'Valpene er gråbrune de første ukene. Rødfargen kommer først i juni.',
  ],
},

ekorn: {
  intro:'Ekornet er skogens gartner. Det gjemmer frø på tusenvis av småsteder og glemmer nok av dem til at nye trær vokser opp der det gikk.',
  tall:[
    ['KROPP','20–25 cm, hale 15–20 cm'],
    ['VEKT','250–350 g'],
    ['LEVETID','3–5 år'],
    ['MAT','granfrø, furufrø, nøtter, sopp, knopper, egg'],
    ['HVOR','barskog og blandingsskog i hele landet'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Ekornet går ikke i vinterdvale. Det ligger i bolet i de hardeste kuldeperiodene og lever av nedgravde lagre. Gode konglesesonger gir mange unger, dårlige år gir nesten ingen. Bolet er en tett kule av kvist og bast høyt inne ved stammen, og en ekornfamilie holder flere bol i bruk samtidig.'},
    { t:'KJENN DEN IGJEN',
      b:'Rødbrun sommerpels, gråbrun vinterpels med tydelige dusker på ørene. Finner du en kongle med bare spolen igjen, har ekornet spist. Kryssnebb legger kongleskjellene ut til sidene i stedet for å gnage dem av.'},
    { t:'MENNESKE OG ART',
      b:'Ekornet er et av de få viltdyra folk ser på nært hold hver uke. Det kommer gjerne til fôringsbrett, men nøtter med skall er bedre kost enn brød. Arten er fredet utenom fastsatt jakttid.'},
  ],
  funfacts:[
    'Ekornet kan vri bakfoten nesten helt bakover og hekte klørne i barken. Derfor klarer det å løpe ned et tre med hodet først.',
    'Halen er styre i lufta. Et ekorn tar hopp på over fire meter mellom trekroner.',
    'Det henger sopp til tørk i tregreiner. Tørr sopp muggner ikke i vinterlageret.',
    'Fortennene vokser hele livet og slites ned mot kongler og nøtteskall.',
  ],
},

bjorn: {
  intro:'Brunbjørnen er Norges største rovdyr, men den lever mest av planter. Ni av ti matbiter er bær, urter, gras og maur. Den er sky og trekker unna folk når den får sjansen.',
  tall:[
    ['KROPP','1,5–2,2 m, skulderhøyde rundt 1 m'],
    ['VEKT','hann 100–320 kg, binne 60–200 kg'],
    ['LEVETID','20–30 år'],
    ['MAT','bær, urter, maur, åtsler, elgkalv, sau'],
    ['HVOR','grensetraktene mot Sverige, Finland og Russland'],
    ['STATUS','sterkt truet i Norge'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Bjørnen eter seg opp gjennom høsten og legger på seg titalls kilo fett, mest fra blåbær. Så graver den hi under en rotvelt eller i en steinur og ligger i vinterdvale fra november til april. I hiet faller hjerterytmen fra rundt 40 til under 10 slag i minuttet. Den drikker ikke, spiser ikke og later ikke vannet på hele vinteren.'},
    { t:'KJENN DEN IGJEN',
      b:'Tung kropp, høy skulderpukkel og korte ører. Bakfotsporet er langt og ser nesten menneskelig ut, med fem tær og klomerker foran putene. Bjørnen legger ofte avføring full av blåbærskall langs stier i august.'},
    { t:'MENNESKE OG ART',
      b:'Norge har rundt 150 bjørner, og de fleste er hanner på vandring fra nabolanda. Binner med unger er det bestanden vokser av, og de er det færrest av. Konflikten står om sau og bikuber, og bjørnen forvaltes med rovviltsoner og lisensfelling.'},
  ],
  funfacts:[
    'Binna føder midt i vinterdvalen. Ungene er på 300–500 gram, blinde og nakne, og dier mens mora sover videre.',
    'Bjørnen lukter bedre enn en sporhund og kan kjenne et åtsel på flere kilometer.',
    'Den kan nå 50 km/t i kort spurt, også nedover bratte bakker.',
    'Bjørner gnir rygg mot faste gnitrær. Håret som blir igjen brukes til DNA-telling av bestanden.',
  ],
},

ulv: {
  intro:'Ulven er hundens ville stamfar og lever i familieflokker med foreldrepar og årsvalper. Ingen art i Norge utløser sterkere strid mellom vern og beitenæring.',
  tall:[
    ['KROPP','1–1,5 m, skulderhøyde 70–85 cm'],
    ['VEKT','30–55 kg'],
    ['LEVETID','8–13 år'],
    ['MAT','elg, rådyr, hjort, bever, sau'],
    ['HVOR','ulvesonen i Innlandet og Viken, streifdyr ellers'],
    ['STATUS','kritisk truet i Norge'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Flokken er én familie: et foreldrepar, valpene fra i år og ofte noen fra i fjor. Ungdyra vandrer ut i ett- til toårsalderen og kan gå over tusen kilometer for å finne ledig land og en make. En flokk i Skandinavia tar mest elg, rundt hundre dyr i året, og kalver utgjør størstedelen.'},
    { t:'KJENN DEN IGJEN',
      b:'Grågul pels, høye bein, rett hale og et smalere bryst enn en schäfer. Sporet er større enn hundespor og ligger i rett linje, og flokken går ofte i hverandres spor så det ser ut som ett dyr har passert.'},
    { t:'MENNESKE OG ART',
      b:'Ulven var utryddet i Norge på 1960-tallet. Dagens skandinaviske bestand går tilbake til noen få innvandrede dyr fra Finland og Russland, og innavl er derfor et reelt problem. Stortinget styrer bestanden med bestandsmål og ulvesone, og lisensfelling avgjøres hver vinter.'},
  ],
  funfacts:[
    'Et ulvehyl bærer over 10 km i stille vinterluft. Flokken hyler i ulike toner samtidig, så den høres større ut enn den er.',
    'Ulven kan gå i trav i timevis og dekke 50 km på ett døgn.',
    'Bare foreldreparet får valper. De andre i flokken hjelper med å passe kullet.',
    'Alle hunderaser fra chihuahua til grand danois stammer fra ulv som ble tam for rundt 15 000 år siden.',
  ],
},

gran: {
  intro:'Grana er Norges viktigste tømmertre og selve granskogen. Den tåler skygge som ungtre, skyter opp når naboene faller, og former mørke, tette skoger.',
  tall:[
    ['HØYDE','25–40 m, enkelttrær over 45 m'],
    ['ALDER','200–400 år'],
    ['NÅLER','korte, stive, firkantede i tverrsnitt'],
    ['VOKSESTED','frisk, næringsrik skogsjord i lavlandet'],
    ['BRUK','bygningstømmer, papir, tonewood i instrumenter'],
    ['STATUS','livskraftig, plantet i stor skala'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Grana har flatt rotsystem tett under bakken. Det gir rask vekst på god jord, men gjør treet utsatt for vindfall i storm. Konglene henger nedover, i motsetning til hos edelgran, og slipper frøene om vinteren. Et godt konglear kommer med noen års mellomrom og styrer både ekorn- og kryssnebbbestanden.'},
    { t:'KJENN DEN IGJEN',
      b:'Spiss topp, greiner i tydelige etasjer og hengende kongler på 10–15 cm. Nålene sitter rundt hele kvisten og stikker i handa. Furu har derimot nåler i par og lysere, skjellete bark øverst.'},
    { t:'MENNESKE OG ART',
      b:'Grana kom østfra og ble vanlig i Norge for et par tusen år siden. Den er plantet tett i norsk skogbruk gjennom hele 1900-tallet, og står for hovedtyngden av avvirkningen. Granbarkbillen kan drepe svekkede trær i store flekker etter tørkesomrer.'},
  ],
  funfacts:[
    'Old Tjikko i Dalarna er en gran med rotsystem datert til rundt 9 550 år. Stammen er ung, røttene er eldgamle.',
    'Resonansgran med jevne, smale årringer brukes i fioliner og gitarer. Den vokser sakte i kalde, høytliggende lier.',
    'Granskudd er spiselige om våren og har mye C-vitamin.',
    'En gran kan ha over 100 000 nåler. Hver nål lever 5–7 år før den felles.',
  ],
},

fluesopp: {
  intro:'Rød fluesopp er soppen alle kjenner igjen: knallrød hatt med hvite flekker. Den er giftig, men også en samarbeidspartner for trærne den står under.',
  tall:[
    ['HATT','8–20 cm i diameter'],
    ['SESONG','august–oktober'],
    ['VOKSESTED','under bjørk og gran på sur jord'],
    ['GIFT','ibotensyre og muskimol'],
    ['SLEKTNINGER','hvit fluesopp og grønn fluesopp er dødelige'],
    ['STATUS','livskraftig og vanlig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Soppen du ser er bare fruktlegemet. Under bakken ligger et nett av sopptråder som vokser sammen med finrøttene til bjørk og gran. Treet gir sukker, soppen gir vann og mineraler tilbake. Derfor kan rød fluesopp ikke dyrkes på et brett; den må ha en levende trerot å leve med.'},
    { t:'KJENN DEN IGJEN',
      b:'Rød til oransje hatt med hvite vorter, hvite skiver, hvit ring på stilken og en tydelig knoll nederst. Vortene er rester av slørhinna og kan vaskes bort av regn, så en gammel fluesopp kan være helt glatt og rød.'},
    { t:'MENNESKE OG ART',
      b:'Rød fluesopp gir forgiftning med kvalme, forvirring og rus, sjelden død hos voksne. Den ble brukt i ritualer i Nord-Sibir, og navnet kommer av at soppbiter i melk ble satt fram som fluegift. Den skal ikke spises, heller ikke etter avkoking.'},
  ],
  funfacts:[
    'Reinsdyr oppsøker rød fluesopp og spiser den frivillig.',
    'Giften brytes ikke ned av tørking, men endrer form: ibotensyre blir muskimol, som virker sterkere.',
    'Den røde hatten er rund som en kule når soppen bryter jorda, og flater ut som en tallerken etter noen dager.',
    'Fluesoppslekta Amanita rommer både de vanligste dødelige soppene i Norge og flere gode matsopper.',
  ],
},

kantarell: {
  intro:'Kantarellen er den tryggeste og mest ettertraktede matsoppen i norsk skog. Den lukter aprikos, og plukkeplassene holdes hemmelige i generasjoner.',
  tall:[
    ['HATT','3–10 cm, trakt med bølget kant'],
    ['SESONG','juli–oktober'],
    ['VOKSESTED','mose og lyng under gran, furu og bjørk'],
    ['FARGE','eggeplommegul hele veien gjennom'],
    ['FORVEKSLING','falsk kantarell er ufarlig, men smakløs'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Kantarellen lever i symbiose med trerøtter, akkurat som fluesoppen. Derfor finnes det ingen kantarelldyrking; all kantarell i butikken er plukket i skog. Den kommer igjen på samme flekk år etter år så lenge skogbunnen ikke blir ødelagt, og en god plass kan holde i flere tiår.'},
    { t:'KJENN DEN IGJEN',
      b:'Jevnt gul over hele soppen, også inni når du bryter den. Under hatten sitter ikke skiver, men butte ribber som går et stykke ned på stilken. Kjøttet er fast og trevlete, og lukta minner om aprikos.'},
    { t:'MENNESKE OG ART',
      b:'Kantarell skal stekes tørt først, så vannet damper av før smøret går inn. Plukk med kniv eller vri den forsiktig løs; skogbunnen tar skade av rotet raking. Allemannsretten gir fri soppsanking i utmark i hele landet, med egne regler i Nordland, Troms og Finnmark for multer.'},
  ],
  funfacts:[
    'Aprikoslukta kommer av duftstoffer som forsvinner ved lang koking. Rask steking beholder dem.',
    'Kantarell har mye D-vitamin for å være et grønnsakalternativ, og vitaminet øker i sollys.',
    'Første nattefrost stopper sesongen. Soppen blir bløt og mørk.',
    'Falsk kantarell har ekte skiver og oransje farge, og vokser oftest i strøfall og på stubber.',
  ],
},

grevling: {
  intro:'Grevlingen er en gravemaskin med pels. Den bor i store gangsystemer som går i arv mellom generasjoner, og lever mest av meitemark.',
  tall:[
    ['KROPP','60–90 cm, hale 12–20 cm'],
    ['VEKT','10–20 kg, tyngst om høsten'],
    ['LEVETID','5–10 år'],
    ['MAT','meitemark, insekter, røtter, bær, egg, åtsler'],
    ['HVOR','Sør- og Midt-Norge, opp til Nordland'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Grevlingen er nattaktiv og går sakte og systematisk over samme beitesløyfe natt etter natt. Meitemark utgjør hovedkosten, og en enkelt grevling kan ta flere hundre mark på en god, fuktig natt. Om vinteren går den i dvaleliknende ro i hiet, men den sover ikke sammenhengende som bjørnen; den kommer ut i mildværsperioder.'},
    { t:'KJENN DEN IGJEN',
      b:'Lav, bred kropp, grå pels og et hvitt hode med to svarte striper gjennom øynene. Sporet har fem tær med lange gravekløyer foran. Grevlingen graver små trakter i plener når den leter etter larver, og legger avføring i egne gropper ved hiet.'},
    { t:'MENNESKE OG ART',
      b:'Grevlingen har flyttet inn i byer og hyttefelt og lever godt på kompost og fallfrukt. Den er fredet utenom jakttid. Grevlingen kan bære revens skabb og bør ikke mates, for fôring gjør at flere dyr samles på ett sted.'},
  ],
  funfacts:[
    'Et grevlinghi kan ha over hundre meter ganger og flere titalls innganger, og enkelte hi har vært i bruk i over hundre år.',
    'Grevlingen tar med tørt gras og mose inn som sengetøy, og drar det ut i sola for lufting.',
    'Den har forsinket fosterutvikling: paring skjer om sommeren, men fosteret starter først å vokse i desember.',
    'Grevling og rev bruker av og til det samme hiet samtidig, i hver sin gang.',
  ],
},

mar: {
  intro:'Måren er skogens akrobat. Den jakter i trekronene, tar ekorn på deres eget felt, og er en av de vanskeligste artene å få øye på i norsk natur.',
  tall:[
    ['KROPP','45–55 cm, hale 20–25 cm'],
    ['VEKT','1–2 kg'],
    ['LEVETID','8–10 år'],
    ['MAT','ekorn, smågnagere, fugl, egg, bær, insekter'],
    ['HVOR','barskog og blandingsskog i hele landet'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Måren jakter mest i skumring og natt, og beveger seg like godt oppe i trærne som på bakken. Den bruker hule trær, gamle hakkespettbol og ekornbol som hvileplass, og har flere i bruk i reviret. Kosten skifter med sesongen: smågnagere og fugl om vinteren, bær og insekter om sommeren.'},
    { t:'KJENN DEN IGJEN',
      b:'Slank, mørkebrun kropp med lang busket hale og en gulhvit flekk på strupen. Sporet viser fem tær og ligger ofte i par, fordi måren hopper. Sportegn på snø som plutselig slutter ved en trestamme, er nesten alltid mår.'},
    { t:'MENNESKE OG ART',
      b:'Måren ble jaktet hardt for pelsen og var fåtallig i mange områder, men bestanden er god i dag. Den forveksles ofte med husmåren, som ikke finnes i Norge. Gammel skog med hule trær er viktig for arten, og flatehogst fjerner hvileplassene.'},
  ],
  funfacts:[
    'Måren hopper fire meter mellom greiner og kan snu seg i lufta.',
    'Den kan vri anklene slik at klørne peker bakover, og løpe ned stammer med hodet først.',
    'Paring skjer i juli, men ungene kommer først i april. Fosteret ligger i hvile gjennom vinteren.',
    'Strupeflekken er ulik fra dyr til dyr og kan brukes til å skille individer på viltkamera.',
  ],
},

radyr: {
  intro:'Rådyret er det minste hjortedyret i Norge og det som lever nærmest oss. Det beiter i hagekanter og skogbryn, og er mer alene enn i flokk.',
  tall:[
    ['KROPP','skulderhøyde 65–80 cm'],
    ['VEKT','20–30 kg'],
    ['LEVETID','8–12 år'],
    ['MAT','urter, skudd, knopper, sopp, bær, kornåker'],
    ['HVOR','sørlige halvdel av landet, nordover langs kysten'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Rådyret er en finsmaker som velger næringsrike skudd og urter framfor grovt kvist. Derfor greier det seg dårlig i dype snøvintre, når maten blir utilgjengelig. Bukken har revir om sommeren og feier geviret mot ungtrær. Kidene fødes i mai og ligger helt stille alene i graset mens rådyrgeita beiter i nærheten.'},
    { t:'KJENN DEN IGJEN',
      b:'Rødbrun sommerdrakt, gråbrun vinterdrakt og et tydelig hvitt speil bak. Bukken har et lite gevir med få tagger. Rådyret bjeffer hest når det blir skremt, en lyd mange tror kommer fra en hund.'},
    { t:'MENNESKE OG ART',
      b:'Rådyret er blant de mest jaktede viltartene og et vanlig syn i boligfelt. Kid som ligger alene i graset er ikke forlatt og skal ikke røres. Store snømengder, gaupe og løse hunder er de viktigste dødsårsakene utenom jakt og bilpåkjørsler.'},
  ],
  funfacts:[
    'Rådyret har forlenget drektighet. Det befruktede egget hviler i livmora fra juli til desember før det fester seg.',
    'Kid har hvite flekker de første ukene, som brytes opp mot lys og skygge i graset.',
    'Rådyr kan hoppe over to meter høyt fra stående.',
    'Bukken feller geviret om høsten, ikke om vinteren som elg og hjort.',
  ],
},

storfugl: {
  intro:'Storfuglen er Norges største skogsfugl. Tiuren speller i grålysningen på leikplasser som har vært i bruk i generasjoner.',
  tall:[
    ['VINGESPENN','tiur opptil 125 cm'],
    ['VEKT','tiur 3,5–5 kg, røy 1,5–2,5 kg'],
    ['LEVETID','5–10 år'],
    ['MAT','furunåler om vinteren, bær, skudd, insekter om sommeren'],
    ['HVOR','eldre barskog i hele landet'],
    ['STATUS','livskraftig, men leikplasser går tapt ved hogst'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Storfuglen lever av furunåler hele vinteren, en kost så grov at fuglen trenger svært lange blindtarmer for å bryte den ned. Om våren samles tiurene på leiken før daggry og spiller mot hverandre mens røyene velger. Kyllingene lever av insekter de første ukene og er helt avhengige av fuktige myrkanter med mye liv.'},
    { t:'KJENN DEN IGJEN',
      b:'Tiuren er nesten svart med grønnskimrende bryst, rød hudkam over øyet og hvitt nebb. Røya er brunspettet og halvparten så stor. Spillet består av klikk, en kork-lyd og et hveselignende sleip på slutten.'},
    { t:'MENNESKE OG ART',
      b:'Leikplasser ligger i eldre skog og forsvinner ved flatehogst, og det er hovedgrunnen til lokal tilbakegang. Jakt drives på høsten, mens leiken er fredet. Storfugl kolliderer også ofte med skogsbilveiers gjerder og kraftlinjer.'},
  ],
  funfacts:[
    'Tiuren hører nesten ingenting i sluttfasen av spillet. Det er derfor jegere og fotografer kan snike seg nærmere akkurat da.',
    'Storfugl har fjærbremmer på tærne om vinteren som fungerer som truger på løssnø.',
    'Fuglen svelger småstein som ligger i kråsen og maler nåler og kvist.',
    'En leikplass kan ha vært i bruk av storfugl i over hundre år.',
  ],
},

ravn: {
  intro:'Ravnen er en av verdens smarteste fugler. Den lager verktøy, planlegger framover og lever i par som holder sammen i tiår.',
  tall:[
    ['VINGESPENN','120–150 cm'],
    ['VEKT','0,8–1,5 kg'],
    ['LEVETID','15–20 år i naturen'],
    ['MAT','åtsler, egg, smågnagere, avfall, bær'],
    ['HVOR','hele landet, fra ytterste kyst til høyfjell'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Ravnen er åtseleter og følger rovdyr og jegere. Den hekker tidlig, ofte i februar og mars, i bergvegger eller høye trær, slik at ungene er store når vårens åtsler dukker opp. Unge ravner flyr i flokk, mens voksne par holder revir hele året og forsvarer det mot alle andre ravner.'},
    { t:'KJENN DEN IGJEN',
      b:'Stor, helsvart fugl med kraftig nebb, tydelig strupeskjegg og kileformet hale. I flukt stuper og ruller den i lek. Ropet er et dypt korrk, ikke kråkas skarpe skrik.'},
    { t:'MENNESKE OG ART',
      b:'Ravnen har vært både ansett som ulykkesfugl og som Odins følgesvenn. Den kan jaktes i deler av året fordi den tar lam og egg, men bestanden er solid i hele landet. I byer og på fyllplasser lever den godt på det vi kaster.'},
  ],
  funfacts:[
    'Ravner husker enkeltmennesker i årevis og skiller mellom personer som har vært greie og ikke.',
    'De gjemmer mat og later som de gjemmer den andre steder når andre ravner ser på.',
    'Ravneunger leker med pinner, kongler og snø uten annen hensikt enn leken selv.',
    'Ravnen kan herme lyder, også menneskestemmer, omtrent som en papegøye.',
  ],
},

osp: {
  intro:'Ospa er det treet som skjelver. Bladene står på flate stilker og rører seg i minste vinddrag, og treet er et av de viktigste for artsmangfoldet i skogen.',
  tall:[
    ['HØYDE','15–25 m'],
    ['ALDER','60–100 år, kloner mye eldre'],
    ['VOKSESTED','solrike lier, skogkanter, brannflater'],
    ['BARK','glatt, grønngrå, sprekker med alderen'],
    ['BRUK','fyrstikker, sponplater, badstuebenker'],
    ['STATUS','livskraftig, men beites hardt av elg'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Ospa sprer seg mest med rotskudd. En hel ospelund kan derfor være én plante med felles rotsystem, og skuddene kommer tett når moretreet skades eller felles. Den krever mye lys og kommer inn tidlig etter brann og hogst. Veden råtner lett, og det er nettopp derfor treet er så verdifullt for andre arter.'},
    { t:'KJENN DEN IGJEN',
      b:'Runde blad med bølget kant på en stilk som er flat på tvers, så bladet vipper sidelengs. Barken er grønngrå og glatt på unge trær. Ospa lyser gult i lia i september, tidligere enn bjørka.'},
    { t:'MENNESKE OG ART',
      b:'Elgen beiter osp hardere enn nesten noe annet, og i områder med mye elg kommer ospeskudd aldri opp i trehøyde. Gammel osp med hull er bolig for hakkespetter, ugler, flaggermus og et stort antall insekter og lavarter. Osp er også tradisjonell badstuved fordi den ikke blir brennhet å ta på.'},
  ],
  funfacts:[
    'Den flate bladstilken er grunnen til at ospa rasler mens andre trær står stille.',
    'Hvitryggspetten hakker helst i død osp, og er direkte avhengig av at slike trær får stå.',
    'Osperot kan sende opp skudd flere titalls meter fra moretreet.',
    'Fyrstikker ble laget av osp fordi veden er lys, seig og brenner uten å sprute.',
  ],
},

blabaer: {
  intro:'Blåbærlyng er selve gulvet i norsk barskog. Den dekker enorme arealer, mater alt fra bjørn til rype, og fyller bøtter hver august.',
  tall:[
    ['HØYDE','15–40 cm'],
    ['BLOMSTRING','mai–juni'],
    ['BÆR','blå med blått fruktkjøtt, modne juli–september'],
    ['VOKSESTED','barskog og fjellbjørkeskog på middels jord'],
    ['BRUK','saft, syltetøy, rå på turen'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Blåbær er en lav busk som sprer seg med jordstengler, slik at store felt er få individer. Den lever i samspill med sopp i røttene, som henter næring i den sure skogsjorda. Blomstene er små og henger ned som grønnrosa klokker, og humler er de viktigste pollinerne. Frost under blomstringen ødelegger avlingen for hele sesongen.'},
    { t:'KJENN DEN IGJEN',
      b:'Grønne kantede stengler, tynne blad som felles om høsten, og bær som er blå helt inn. Blokkebær ser like ut på utsiden, men har lyst, grønnhvitt fruktkjøtt og blad med hel, blågrønn overflate.'},
    { t:'MENNESKE OG ART',
      b:'Blåbær er kanskje det viktigste enkeltbæret i norsk natur, både for folk og dyr. Bjørn spiser titalls kilo i uka på høsten, og rypekyllinger lever av insektene i lyngen. Fri plukking i utmark gjelder over hele landet.'},
  ],
  funfacts:[
    'Blåbærlyng dekker rundt en fjerdedel av norsk skogbunn.',
    'Fargestoffene heter antocyaner, og det er de som farger tunga blå.',
    'Ett blåbærfelt kan være over hundre år gammelt selv om hver stengel bare lever noen år.',
    'Dyrkede amerikanske blåbær har lyst fruktkjøtt. De norske er blå tvers igjennom.',
  ],
},

steinsopp: {
  intro:'Steinsoppen er den matsoppen alle vil finne. Den er fast, nøtteaktig og nesten umulig å forveksle med noe farlig.',
  tall:[
    ['HATT','8–25 cm, brun og hvelvet'],
    ['SESONG','juli–oktober'],
    ['VOKSESTED','under gran, furu, bjørk og eik'],
    ['UNDERSIDE','rør, hvite når soppen er ung, gulgrønne senere'],
    ['BRUK','stekt fersk, tørket til kraft og saus'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Steinsoppen lever i symbiose med trerøtter og kan derfor ikke dyrkes. Den kommer i pulser etter regn og varme, ofte i de samme flekkene år etter år. Unge eksemplarer er faste som poteter, mens gamle blir bløte og fulle av larver. Sjekk alltid stilken; markene starter nedenfra.'},
    { t:'KJENN DEN IGJEN',
      b:'Brun hatt, tykk lys stilk med fint hvitt nettmønster øverst, og rør i stedet for skiver under hatten. Kjøttet er hvitt og skifter ikke farge i snittet. Gallerørsopp ser lik ut, men smaker bittert og har rosa rør.'},
    { t:'MENNESKE OG ART',
      b:'Steinsopp er handelsvare i store deler av Europa og plukkes kommersielt i Norge i mindre skala. Den tørkes lett i skiver og gir intens smak i kraft. Skjær soppen i to i skogen, så lar du de markspiste stå igjen og sprer sporene mens du går.'},
  ],
  funfacts:[
    'Rørene løsner lett fra hatten som et svampelag. Det skiller rørsopp fra alle skivesopper.',
    'Én steinsopp kan veie over et kilo.',
    'Tørking konsentrerer smaken kraftig, og tørket steinsopp gir mer smak enn fersk.',
    'Steinsoppen har mange lokale navn i Norge, blant annet karljohan.',
  ],
},

giftslorsopp: {
  intro:'Spiss giftslørsopp er den farligste soppen i norsk natur. Den smaker ikke vondt, gir ingen symptomer med en gang, og ødelegger nyrene.',
  tall:[
    ['HATT','3–8 cm, spiss pukkel, rødbrun'],
    ['SESONG','august–oktober'],
    ['VOKSESTED','fuktig barskog med mose, ofte blåbærlyng'],
    ['GIFT','orellanin'],
    ['LATENSTID','2–3 uker før symptomer'],
    ['STATUS','vanlig i norsk granskog'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Slørsoppene er en stor slekt med flere hundre arter i Norge, og flere av dem er giftige. Spiss giftslørsopp vokser i mosen i fuktig barskog og ser helt uskyldig ut. Navnet slørsopp kommer av spindelvevaktige tråder mellom hattekant og stilk på unge sopper, som forsvinner når soppen blir eldre.'},
    { t:'KJENN DEN IGJEN',
      b:'Rødbrun til kanelbrun hatt med tydelig spiss pukkel, rustbrune skiver og gule bånd på stilken. Den kan forveksles med rødbrune matsopper som kantarell i dårlig lys og med trakter i mose. Er du i tvil, la den stå.'},
    { t:'MENNESKE OG ART',
      b:'Giften orellanin ødelegger nyrene, og det spesielle er den lange forsinkelsen: de første symptomene kommer etter to til tre uker, når soppen for lengst er glemt. Behandling kan kreve dialyse eller nyretransplantasjon. Kokt eller stekt gjør ingen forskjell; giften tåler varme.'},
  ],
  funfacts:[
    'Fordi symptomene kommer så sent, har folk spist flere måltider av soppen før de blir syke.',
    'Orellanin ble først identifisert etter en stor forgiftning i Polen på 1950-tallet.',
    'Slørsoppslekta Cortinarius har over 300 arter i Norge og er den mest artsrike soppslekta vi har.',
    'Regelen blant sopplukkere er enkel: la alle brune sopper med rustfargede skiver stå.',
  ],
},

trompetsopp: {
  intro:'Svart trompetsopp står i tette flokker i løvskogsbunnen, men er nesten usynlig. Har du først sett én, ser du plutselig hundre.',
  tall:[
    ['HØYDE','5–12 cm'],
    ['SESONG','august–oktober'],
    ['VOKSESTED','kalkrik løvskog, ofte under bøk, eik og hassel'],
    ['FORM','hul trakt, gråsvart, uten skiver'],
    ['BRUK','tørking, saus, tilbehør til vilt'],
    ['STATUS','livskraftig i sørlige strøk'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Trompetsoppen lever i symbiose med løvtrær og trives på kalkrik jord. Den er hul hele veien fra hattekant og ned i stilken, som et lite horn. Fargen gjør den til den mest oversette matsoppen vi har, og mange finner den først når de setter seg ned for å hvile.'},
    { t:'KJENN DEN IGJEN',
      b:'Gråsvart til brunsvart trakt med bølget kant og glatt til svakt rynket underside uten skiver. Den lukter svakt og godt. Ingen giftige arter ligner nevneverdig, noe som gjør den til en trygg nybegynnersopp hvis du først finner den.'},
    { t:'MENNESKE OG ART',
      b:'Trompetsopp tørkes lett og males til pulver som gir mørk, kraftig smak i saus. Den kalles også de fattiges trøffel i deler av Europa. Sesongen er kort og knyttet til rike løvskoger, så plassene er få og verdt å merke seg.'},
  ],
  funfacts:[
    'Soppen er hul helt ned i stilken, som en tynn trakt uten bunn.',
    'Den er så mørk at erfarne plukkere leter etter hullene i skogbunnen, ikke etter soppen selv.',
    'Tørket trompetsopp holder aromaen i flere år.',
    'Slekta er nær i slekt med kantarellen, selv om de ser helt ulike ut.',
  ],
},

hvitveis: {
  intro:'Hvitveisen dekker skogbunnen i hvitt i mai, i de få ukene mellom snøsmelting og løvsprett. Den er vakker og svakt giftig på samme tid.',
  tall:[
    ['HØYDE','10–25 cm'],
    ['BLOMSTRING','april–juni'],
    ['VOKSESTED','løvskog, hagemark, bekkedaler'],
    ['SPREDNING','jordstengel, noen centimeter i året'],
    ['GIFT','protoanemonin, irriterer hud og slimhinner'],
    ['STATUS','livskraftig og svært vanlig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Hvitveisen er en vårplante som gjør hele årets arbeid på noen uker. Den blomstrer, setter frø og visner ned før trekronene stenger lyset ute, og lever resten av året som jordstengel under bakken. Bestanden kryper bare noen centimeter i året, så et stort hvitveisteppe har stått der i hundrevis av år.'},
    { t:'KJENN DEN IGJEN',
      b:'Seks til åtte hvite blomsterblad, ofte med rosa anstrøk på undersiden, og tre dypt fliket blad i krans under blomsten. Blomsten følger sola og lukker seg i regn. Blåveisen kommer noen uker tidligere og har hele, trelappede blad.'},
    { t:'MENNESKE OG ART',
      b:'Hvitveis er ikke mat. Hele planten inneholder protoanemonin, som svir i munnen og kan gi hudirritasjon. Tørket plantemateriale er ufarlig, men fersk hvitveis skal ikke spises. Et tett hvitveisteppe er et tegn på gammel, urørt løvskogsbunn.'},
  ],
  funfacts:[
    'Et hvitveisfelt sprer seg så sakte at botanikere bruker det til å anslå hvor lenge skogen har fått stå i fred.',
    'Blomsten har ingen kronblad. Det hvite er begerblad som har tatt over jobben.',
    'Planten er i slekt med soleie og blåveis, og alle tre deler den samme giftstoffgruppen.',
    'Hvitveisen lukker seg om natta og i regnvær for å beskytte pollenet.',
  ],
},

/* ============================================================ FJELLET */
hare: {
  intro:'Hara skifter til kritthvit vinterpels og blir nesten usynlig på snøen. Den har ingen vern annet enn farten og evnen til å sitte helt stille.',
  tall:[
    ['KROPP','45–60 cm'],
    ['VEKT','2,5–4 kg'],
    ['LEVETID','3–5 år'],
    ['MAT','gras og urter om sommeren, kvist og bark om vinteren'],
    ['HVOR','hele landet, fra kysten til høyfjellet'],
    ['STATUS','nær truet'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Hara er i aktivitet om natta og ligger i dagleie under en busk eller i en snøgrop om dagen. Den setter ingen bo og graver ingen ganger; ungene fødes med pels og åpne øyne og er på beina med en gang. Om vinteren gnager hara bark av rogn, osp og selje, og kan barke av ungtrær helt rundt.'},
    { t:'KJENN DEN IGJEN',
      b:'Hvit vinterpels med svarte ørespisser, grå-brun sommerpels. Bakfotsporet er langt og bredt og setter seg foran framføttene når hara hopper. Sporloypa går i tydelige sett med fire avtrykk, og hara gjør plutselige sidesprang for å bryte sporet bak seg.'},
    { t:'MENNESKE OG ART',
      b:'Hara er tradisjonelt jaktet med harehund over hele landet. Bestanden har gått ned i mange områder, og arten står nå som nær truet. Mildere vintre er en del av problemet: en hvit hare på brun bakke blir lett tatt av rev og rovfugl.'},
  ],
  funfacts:[
    'Pelsskiftet styres av daglengden, ikke av snøen. Derfor står hara hvit på bar bakke i snøfattige vintre.',
    'Hara kan nå 60–70 km/t og svinger brått for å riste av rovdyr.',
    'Den spiser sin egen bløte nattavføring på nytt for å få ut mer næring av barken. Det kalles refeksjon.',
    'Bakbeina er lange nok til at hara løper raskest oppover bakke.',
  ],
},

gaupe: {
  intro:'Gaupa er Norges eneste ville kattedyr. Den er nattaktiv, ensom og så sky at de fleste aldri får se en, selv i områder der den er vanlig.',
  tall:[
    ['KROPP','80–130 cm, skulderhøyde 60–75 cm'],
    ['VEKT','hann 18–25 kg, hunn 13–20 kg'],
    ['LEVETID','10–15 år'],
    ['MAT','rådyr, rein, hare, rype, sau'],
    ['HVOR','skog og fjellskog i store deler av landet'],
    ['STATUS','sterkt truet i Norge'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Gaupa lister seg inntil byttet og tar det i et kort sprang, i stedet for å jage. Et voksent rådyr rekker et par uker, og gaupa dekker restene med snø eller kvist og kommer tilbake. Reviret er stort, fra noen hundre til over tusen kvadratkilometer, og hunnen har ungene hos seg gjennom første vinter.'},
    { t:'KJENN DEN IGJEN',
      b:'Kort hale med svart tupp, lange øredusker og kinnskjegg. Beina er høye og labbene uvanlig brede. Sporet er rundt, uten klomerker, og på størrelse med en manns håndflate i lett snø.'},
    { t:'MENNESKE OG ART',
      b:'Gaupa forvaltes mot et bestandsmål på 65 årlige familiegrupper i Norge, og kvotejakt i februar og mars styrer bestanden. Konflikten handler om sau og tamrein. Bestanden har ligget under målet flere år på rad.'},
  ],
  funfacts:[
    'De brede labbene virker som truger. Gaupa bærer seg oppe på skare der rådyret synker gjennom.',
    'Øredusker er ikke hår for pynt: de antas å skjerpe retningshørselen.',
    'Gaupa ser om natta med rundt seks ganger mindre lys enn et menneske trenger.',
    'En gaupe kan hoppe to meter rett opp fra stående.',
  ],
},

jerv: {
  intro:'Jerven er Europas største mårdyr og fjellets matlagerspesialist. Den vandrer enormt, tåler all slags vær og finner mat der andre rovdyr gir opp.',
  tall:[
    ['KROPP','65–105 cm, hale 15–25 cm'],
    ['VEKT','hann 12–18 kg, hunn 9–13 kg'],
    ['LEVETID','8–12 år'],
    ['MAT','åtsler, rein, sau, smågnagere, rype'],
    ['HVOR','høyfjell og fjellskog, mest i nord og langs svenskegrensa'],
    ['STATUS','sterkt truet i Norge'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Jerven er mest åtseleter og følger etter gaupe, ulv og rein. Den legger kjøtt i lagre i steinur og snøfonner der kulda holder det spiselig i månedsvis. Hiet graves i dype snøfonner, og ungene fødes i februar og mars. Derfor er jerven avhengig av at snøen ligger utover våren.'},
    { t:'KJENN DEN IGJEN',
      b:'Mørk brun pels med lysere bånd langs sidene, kraftig hode, korte bein og tung, buet rygg. Sporet er stort for kroppen og viser fem tær. Jerven går ofte i en karakteristisk skrå galopp med tre spor i gruppe.'},
    { t:'MENNESKE OG ART',
      b:'Jerven tar sau og tamrein, særlig lam og kalv, og er dermed midt i rovviltkonflikten. Bestandsmålet i Norge er 39 årlige ynglinger, kontrollert med hiuttak og lisensfelling. Kortere vintre og mindre vårsnø er en langsiktig trussel mot hiene.'},
  ],
  funfacts:[
    'Jervens kjever knuser frosne bein. Den har en egen kinntann som står på tvers og gir ekstra bitekraft.',
    'Én jerv kan patruljere over 1 000 kvadratkilometer.',
    'Jervepels er rimfri fordi hårene er hule og fuktighet ikke fester seg. Derfor ble den brukt som kanting rundt hetter.',
    'Det latinske navnet Gulo gulo betyr rett og slett fråtser.',
  ],
},

blaveis: {
  intro:'Blåveisen er vårens første blå flekk i skogbunnen. Den blomstrer før løvet kommer, mens lyset fortsatt slipper helt ned til bakken.',
  tall:[
    ['HØYDE','5–15 cm'],
    ['BLOMSTRING','mars–mai, før løvsprett'],
    ['VOKSESTED','kalkrik, næringsrik løvskog'],
    ['BLAD','tre lappede blad som overvintrer grønne'],
    ['GIFT','svakt giftig, kan irritere hud'],
    ['STATUS','livskraftig, men fredet i flere fylker'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Blåveisen er en flerårig urt med kraftig jordstengel som samler opplagsnæring hele sommeren. Derfor kan den blomstre så tidlig: energien er lagret fra året før. Blomsterfargen varierer fra blå til lilla, og hvite eksemplarer finnes. Fargen er faktisk blad, ikke kronblad; det er begerbladene som er blå.'},
    { t:'KJENN DEN IGJEN',
      b:'Seks til ti blå blomsterblad på en hårete stilk, og tre trekantede blad som lever gjennom vinteren under snøen. Den vokser i tette tepper i sørvendte lier, ofte sammen med hvitveis, som kommer noen uker senere og er hvit.'},
    { t:'MENNESKE OG ART',
      b:'Blåveisen krever kalk i jorda og er derfor en god indikator på rik skog med mange andre arter. Den er fredet i flere fylker, og bestandene tåler ikke at folk graver den opp til hagen. Plantevev inneholder protoanemonin og skal ikke spises.'},
  ],
  funfacts:[
    'Maur sprer frøene. Frøene har et fettrikt vedheng maurene tar med til bolet, og frøet blir liggende igjen.',
    'Blomsten lukker seg i regn og om natta og åpner seg når sola varmer.',
    'Bladene overvintrer grønne under snøen, klare for å starte fotosyntesen med en gang snøen går.',
    'Plantefamilien er soleiefamilien, den samme som smørblomst og ballblom.',
  ],
},

royskatt: {
  intro:'Røyskatten er et lite rovdyr med enormt temperament. Den jakter smågnagere i deres egne ganger under snøen, og blir kritthvit om vinteren.',
  tall:[
    ['KROPP','22–32 cm, hale 6–12 cm'],
    ['VEKT','150–400 g'],
    ['LEVETID','3–5 år'],
    ['MAT','mus, lemen, fuglunger, egg, insekter'],
    ['HVOR','hele landet, fra kyst til høyfjell'],
    ['STATUS','livskraftig, men svinger med smågnagerne'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Røyskatten er smal nok til å følge etter mus og lemen inn i gangene deres. Den må spise ofte fordi den lange, tynne kroppen mister varme raskt, og den jakter derfor både dag og natt. Bestanden følger gnagerårene: i toppår yngler den kraftig, i bunnår forsvinner den nesten fra landskapet.'},
    { t:'KJENN DEN IGJEN',
      b:'Lang, smal kropp, korte bein og svart halespiss hele året. Sommerdrakta er brun med hvit underside, vinterdrakta helt hvit. Snømusa er mindre og har ikke svart halespiss.'},
    { t:'MENNESKE OG ART',
      b:'Hvit røyskattpels heter hermelin og var statussymbol i europeiske kongekåper, kjent nettopp på de svarte halespissene. I dag jaktes arten lite. Røyskatt går gjerne inn i uthus og hytter etter mus og gjør stort sett nytte for seg.'},
  ],
  funfacts:[
    'Den svarte halespissen antas å lure rovfugler: de hogger etter den svarte flekken og bommer på kroppen.',
    'Røyskatten kan drepe bytte som er flere ganger større enn den selv, som hare og rype.',
    'Den har forsinket fosterutvikling og bærer på befruktede egg i nesten ti måneder.',
    'En røyskatt må spise rundt en fjerdedel av sin egen kroppsvekt hver dag.',
  ],
},

lemen: {
  intro:'Lemenet er fjellets mest omtalte smådyr. Hvert tredje til fjerde år eksploderer bestanden, og hele fjellets dyreliv endrer seg med den.',
  tall:[
    ['KROPP','10–15 cm'],
    ['VEKT','40–110 g'],
    ['LEVETID','1–2 år'],
    ['MAT','moser, gras, starr, lyngskudd'],
    ['HVOR','fjellet i hele landet, ned i fjellbjørkeskogen'],
    ['STATUS','livskraftig, men bestanden svinger ekstremt'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Lemenet lever av mose, som nesten ingen andre pattedyr klarer å bruke, og er aktivt hele vinteren i gangsystemer mellom snø og bakke. Der yngler det også, og i gode vintre med stabil, isolerende snø kan bestanden mangedobles før snøen går. Da er fjellet plutselig fullt av lemen, og de sprer seg i alle retninger.'},
    { t:'KJENN DEN IGJEN',
      b:'Liten, rund gnager med kort hale og et påfallende mønster i svart, gult og brunt. Lemenet gjemmer seg ikke: det reiser seg, piper og går til angrep på støvler og hundesnuter.'},
    { t:'MENNESKE OG ART',
      b:'Lemenår styrer hele fjelløkologien. Fjellrev, jerv, røyskatt, fjellvåk og snøugle yngler godt når det er lemen, og nesten ikke ellers. Historien om at lemen begår selvmord i sjøen er en myte: de drukner under vandringer fordi de forsøker å krysse vann.'},
  ],
  funfacts:[
    'Lemenet er en av få arter som yngler under snøen midt på vinteren.',
    'Fargene er sannsynligvis et varselsignal, på samme måte som hos vepser.',
    'En lemenhunn kan få flere kull i året og være drektig igjen dagen etter fødsel.',
    'I toppår kan det være over hundre lemen per hektar i gode områder.',
  ],
},

fossekall: {
  intro:'Fossekallen er Norges nasjonalfugl, og den eneste spurvefuglen i verden som dykker. Den går på bunnen av iskalde elver og leter etter larver.',
  tall:[
    ['KROPP','17–20 cm'],
    ['VEKT','55–75 g'],
    ['LEVETID','3–7 år'],
    ['MAT','vårfluelarver, døgnfluelarver, småfisk'],
    ['HVOR','strie elver og bekker i hele landet'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Fossekallen svømmer under vann med vingene og bruker strømmen til å presse seg ned mot bunnen, der den snur stein etter larver. Den holder seg i åpent vann hele vinteren og trekker bare så langt som isen tvinger den. Reiret er en mosekule med sideinngang, ofte plassert bak en foss eller under en bru.'},
    { t:'KJENN DEN IGJEN',
      b:'Kompakt, mørk brun fugl med skarpt avgrenset hvitt bryst. Den sitter på en stein midt i strykene og neier med hele kroppen. Flukten er rett og rask, lavt over vannflaten.'},
    { t:'MENNESKE OG ART',
      b:'Fossekallen ble kåret til nasjonalfugl i 1963. Den er følsom for forsuring og for vassdragsregulering som tørrlegger elveleier, men har hatt framgang etter at sur nedbør gikk ned. Kunstige reirkasser under bruer brukes aktivt av arten.'},
  ],
  funfacts:[
    'Fossekallen har tett, oljet fjærdrakt og uvanlig mye hemoglobin i blodet, slik at den takler kaldt vann og dykk.',
    'Den har en hudklaff som stenger neseborene når den går under.',
    'Fossekallen kan gå på elvebunnen i strøm som ville feid en voksen person over ende.',
    'Ungen hopper i elva og svømmer før den kan fly.',
  ],
},

roye: {
  intro:'Røya lever nordligere enn noen annen ferskvannsfisk i verden. Den står i fjellvann som bare er isfrie noen få uker i året.',
  tall:[
    ['LENGDE','20–50 cm, sjelden over 70 cm'],
    ['VEKT','0,2–2 kg, storrøye betydelig mer'],
    ['LEVETID','10–20 år'],
    ['MAT','krepsdyr, insektlarver, småfisk'],
    ['HVOR','kalde innsjøer og fjellvann, sjørøye i nord'],
    ['STATUS','livskraftig, men mange bestander er overtette'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Røya trives i kaldt, oksygenrikt vann og står dypt om sommeren. Den gyter på grus om høsten, og i mange fjellvann blir bestanden så tett at all fisken forblir småvokst. I nord går sjørøya ut i havet om sommeren og tilbake til ferskvann for å overvintre, i motsetning til laks og sjøørret som kan bli ute lenger.'},
    { t:'KJENN DEN IGJEN',
      b:'Slank laksefisk med små skjell, lyse flekker på mørk bunn og hvit forkant på bryst-, buk- og gattfinnene. I gytedrakt blir buken kraftig oransje til rød. Ørreten har mørke flekker på lys bunn, altså motsatt mønster.'},
    { t:'MENNESKE OG ART',
      b:'Røye er en viktig matfisk i innlandet og i nord, og er samtidig et forvaltningsproblem der bestandene er overtette. Da anbefales kraftig beskatning med garn for at fisken skal vokse seg større. Røya er også følsom for oppvarming: den trenger kaldt dypvann om sommeren.'},
  ],
  funfacts:[
    'Røya finnes i innsjøer helt opp på Svalbard, lenger nord enn noen annen ferskvannsfisk.',
    'I samme vann kan det finnes to former av røye, en småvokst i strandsonen og en storvokst på dypet.',
    'Den kan gyte på flere meters dyp på grusbunn langt fra land.',
    'Røya tåler vann på under fire grader året rundt, temperaturer der de fleste andre fisker knapt beveger seg.',
  ],
},

rogn: {
  intro:'Rogna vokser der andre trær gir opp, helt opp mot tregrensa. Om høsten henger den full av røde bær som fôrer trosteflokkene på trekk.',
  tall:[
    ['HØYDE','5–15 m'],
    ['ALDER','60–100 år'],
    ['BLOMSTRING','mai–juni, hvite skjermer'],
    ['VOKSESTED','skogkanter, lier, fjellbjørkeskog'],
    ['BRUK','rognebærgelé, prydtre, elgbeite'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Rogna er et lystre som kommer inn i kanter og åpninger. Bærene spises av trost, silkehale og dompap, og frøene spres med fugleskitten, gjerne langt fra moretreet. Derfor dukker rognespirer opp i berghyller og takrenner. Rogna har store bærår med flere års mellomrom, akkurat som gran og furu har konglear.'},
    { t:'KJENN DEN IGJEN',
      b:'Blad som er delt i mange småblad langs en midtstilk, hvite blomsterskjermer i juni og klaser av oransjerøde bær i august. Barken er glatt og grå. Asal og rogn er i slekt, men asalen har hele, udelte blad.'},
    { t:'MENNESKE OG ART',
      b:'Rognebær er sure og bitre rå, men blir god gelé til vilt når de plukkes etter frost. Rogn er sammen med osp og selje de tre viktigste beitetrærne for elg, forkortet ROS, og de blir ofte helt nedbeitet i elgrike områder. I folketro var rogn et vernetre mot troll og uvær.'},
  ],
  funfacts:[
    'Ordtaket sier at rognebærår gir snørik vinter. Sammenhengen finnes ikke, men mange år med mye bær følger etter en varm og tørr forsommer.',
    'Rogn vokser høyere til fjells enn nesten alle andre løvtrær utenom bjørk.',
    'Frøet trenger å passere gjennom en fugl eller å ligge ute en vinter før det spirer godt.',
    'Bærene inneholder parasorbinsyre, som brytes ned av frost og koking.',
  ],
},

einer: {
  intro:'Eineren er bartreet som har spredd seg lengst av alle. Den vokser fra kysten til høyfjellet, fra Middelhavet til Arktis, og kan bli over tusen år.',
  tall:[
    ['HØYDE','1–5 m, krypende former i fjellet'],
    ['ALDER','opptil over 1 000 år'],
    ['NÅLER','stikkende, i kranser av tre'],
    ['KONGLEBÆR','modner på 2–3 år'],
    ['BRUK','krydder, gin, røyking av mat, einerlåg'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Eineren er nøysom og vokser i beitemark, på berg, i lynghei og i fjellet. Den har hann- og hunnplanter hver for seg, og bare hunnplanten setter bær. Bærene er egentlig kongler med sammenvokste skjell, og de bruker to til tre år på å modne, så du finner grønne og blå bær på samme busk.'},
    { t:'KJENN DEN IGJEN',
      b:'Stive, stikkende nåler i kranser av tre, med en lys stripe på oversiden. Formen varierer fra søyle til flat matte, avhengig av vind og beite. Lukten av knuste bær er søtlig og harpiksaktig.'},
    { t:'MENNESKE OG ART',
      b:'Einerbær gir smaken i gin og i kraft til vilt og kål. Einerlåg, altså avkok av einer, ble brukt til å vaske treredskaper og ølkar fordi den både lukter godt og hemmer bakterier. Einerrøyk brukes fortsatt til å røyke kjøtt og fisk.'},
  ],
  funfacts:[
    'Eineren har det videste naturlige utbredelsesområdet av alle bartrær i verden.',
    'Krypende einer i fjellet kan være flere hundre år gammel og likevel bare være knehøy.',
    'Bare hunnbuskene har bær, så halvparten av einerne du ser vil aldri gi krydder.',
    'Veden er svært tett og lukter kraftig, og ble brukt til smørformer og kar.',
  ],
},

reinrose: {
  intro:'Reinrosa er fjellets pionér. Den kom inn rett etter istiden, vokser på kalkrik grunn, og har gitt navn til en hel klimaperiode.',
  tall:[
    ['HØYDE','5–15 cm, krypende matter'],
    ['BLOMSTRING','juni–august'],
    ['BLOMST','åtte hvite kronblad rundt gul midte'],
    ['VOKSESTED','kalkrik rabbe og grus i fjellet'],
    ['SPESIELT','blomsten følger sola'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Reinrosa danner lave, tette matter på vindutsatte rabber der snøen blåser bort. Den krever kalk i grunnen og er derfor en tydelig indikator på rik fjellnatur med mange sjeldne arter. Blomsten er formet som en liten parabol og vender seg etter sola gjennom dagen, slik at midten varmes opp og frøene modner raskere i det korte fjellsommeren.'},
    { t:'KJENN DEN IGJEN',
      b:'Åtte hvite kronblad, gul midte og små, rynkete blad som er mørkegrønne over og hvitfiltede under. Etter blomstringen blir frøene til en snurret, sølvskimrende dusk som sitter lenge.'},
    { t:'MENNESKE OG ART',
      b:'Reinrosa er brukt som symbol på norsk fjellnatur og finnes i logoer og emblemer. Den vokser sakte, og en matte kan være flere tiår gammel; tråkk i kalkrabber gir skade som tar lang tid å gro. Den har også rotknoller med bakterier som binder nitrogen fra lufta.'},
  ],
  funfacts:[
    'Den kalde perioden Yngre dryas er oppkalt etter reinrosa, Dryas octopetala, fordi pollen fra planten finnes i lag fra den tiden.',
    'Blomsten varmer opp sin egen midte flere grader over lufttemperaturen ved å følge sola.',
    'Frøduskene skrus opp og fungerer som små propeller i vinden.',
    'Reinrose er blant de første plantene som koloniserer grus foran breer som trekker seg tilbake.',
  ],
},

marisko: {
  intro:'Marisko er Norges største orkidé og en av de mest oppsiktsvekkende plantene i landet. Den lurer biller ned i en gul sko de bare slipper ut forbi pollenet.',
  tall:[
    ['HØYDE','25–50 cm'],
    ['BLOMSTRING','juni'],
    ['BLOMST','gul sko med brunrøde flikeblad'],
    ['VOKSESTED','kalkrik, lysåpen skog og kratt'],
    ['ALDER','kan bli flere tiår gammel'],
    ['STATUS','fredet i Norge'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Marisko vokser på kalkgrunn i lysåpen løv- og furuskog, oftest i spredte, små forekomster. Frøene er som støv og har ingen næring med seg, så de er helt avhengige av at en bestemt sopp i jorda mater spiren. Derfor kan det gå ti år eller mer fra frø til første blomst, og en plante som blir gravd opp dør.'},
    { t:'KJENN DEN IGJEN',
      b:'Ingen annen norsk plante ligner. En oppblåst, gul, skoformet leppe med fire brunrøde, vridde blomsterblad rundt, på en stengel med brede, tydelig ribbede blad. Blomstringen varer bare et par uker i juni.'},
    { t:'MENNESKE OG ART',
      b:'Marisko er fredet, og plukking eller oppgraving er forbudt. Trusselen er gjengroing, hogst og at folk tar med planter hjem. Flere av de kjente lokalitetene holdes hemmelige nettopp av den grunn.'},
  ],
  funfacts:[
    'Billen som lander i skoen finner bare én vei ut, en smal passasje der den må stryke forbi først arret og så pollenet.',
    'Blomsten gir ingen nektar. Den lokker med duft og farge og lurer insektet helt.',
    'Frøene er blant de minste i planteriket, nesten som støv, og spres med vinden.',
    'En marisko-plante kan stå på samme sted og blomstre i flere tiår.',
  ],
},

/* ============================================================ MYRA */
elg: {
  intro:'Elgen er skogens konge og Norges største landdyr. En voksen okse veier mer enn et lite piano og likevel går den nesten lydløst i tett skog.',
  tall:[
    ['KROPP','skulderhøyde 1,6–2,1 m'],
    ['VEKT','okse 350–600 kg, ku 250–400 kg'],
    ['LEVETID','10–15 år'],
    ['MAT','kvist av rogn, osp og selje, bjørk, vierarter, vannplanter'],
    ['HVOR','skog i hele landet unntatt ytre kyst'],
    ['STATUS','livskraftig, rundt 120 000 dyr'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Elgen beiter kvist og skudd og spiser 20–30 kilo i døgnet. Om sommeren står den gjerne i myr og vann og eter vannplanter, som gir salter den mangler ellers. Brunsten går i september og oktober, og oksene kjemper med geviret. Kalvene kommer i mai og følger kua til hun jager dem vekk året etter.'},
    { t:'KJENN DEN IGJEN',
      b:'Høy skulder, hengende mule og hudflik under halsen som kalles hakelapp. Oksen har gevir fra våren til vinteren, kua aldri. Sporet er hjerteformet og opptil 15 cm langt, og elgen legger avføring i store hauger av tørre pellets.'},
    { t:'MENNESKE OG ART',
      b:'Elgjakta er landets største jaktarrangement, med rundt 30 000 dyr felt i året, og elgkjøtt er en viktig del av norsk matkultur. Elg på vei og jernbane fører til mange kollisjoner hver vinter, særlig i snørike år når dyra følger brøytede spor.'},
  ],
  funfacts:[
    'Oksen feller geviret hver vinter og bygger det opp igjen på én sommer. Et stort gevir veier over 20 kilo.',
    'Elgen svømmer godt og kan krysse flere kilometer åpent vann.',
    'De lange beina gjør at elgen kan vasse gjennom snø som stopper hjort og rådyr.',
    'Elgkalven kan løpe fra en voksen person når den er noen dager gammel.',
  ],
},

tyttebaer: {
  intro:'Tyttebæret er den seigeste bæret i norsk natur. Bladene er grønne hele vinteren, og bæret kan stå på lyngen under snøen til våren uten å råtne.',
  tall:[
    ['HØYDE','5–30 cm'],
    ['BLOMSTRING','mai–juli'],
    ['BÆR','røde, faste, modne i august–september'],
    ['VOKSESTED','furuskog, lyngmark, fjellhei'],
    ['BRUK','syltetøy, rårørt, tilbehør til vilt'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Tyttebær er en liten, vintergrønn busk som sprer seg med jordstengler under mosen. En hel tyttebærmatte kan derfor være én plante, mange tiår gammel. Den trives på mager, sur jord der lite annet vokser, og nyter godt av sopptråder i røttene som henter næring for den.'},
    { t:'KJENN DEN IGJEN',
      b:'Blanke, mørkegrønne, tykke blad med krøllet kant og lysere underside. Bæra sitter i klaser og er faste og røde hele veien inn. Blokkebær og skinntryte er blå eller matte og bløtere.'},
    { t:'MENNESKE OG ART',
      b:'Tyttebær er tradisjonelt norsk mat til kjøtt og vilt, og kan røres med sukker uten koking. Det holder seg fordi bæret inneholder benzosyre, et naturlig konserveringsmiddel. Fri plukking i utmark gjelder i hele landet.'},
  ],
  funfacts:[
    'Tyttebær i vann på kjølig sted holder seg friske i årevis. Benzosyra gjør jobben helt alene.',
    'Bær som har stått under snøen gjennom vinteren kalles vintertytte og er søtere, fordi frosten bryter ned syre.',
    'Plantefamilien er lyngfamilien, samme som blåbær, røsslyng og krekling.',
    'Ett kilo tyttebær kan kreve at du plukker fra flere kvadratmeter lyng i et dårlig år, og fra en halv i et godt.',
  ],
},

molte: {
  intro:'Molta kalles myras gull, og av god grunn: den gir dårlig avling de fleste år, og et fullt spann er noe folk husker.',
  tall:[
    ['HØYDE','10–25 cm'],
    ['BLOMSTRING','juni–juli'],
    ['BÆR','gule til oransje, modne juli–august'],
    ['VOKSESTED','myr og fuktig fjellhei'],
    ['BRUK','moltekrem, syltetøy, rårørt'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Molta har hann- og hunnplanter hver for seg, og bare hunnplanten setter bær. Derfor svikter avlinga så ofte: det må være nok hannplanter i nærheten, insekter som flyr i kaldt vær, og ingen nattefrost under blomstringen. Plantene henger sammen i jordstengler nede i torva og kan dekke store flater.'},
    { t:'KJENN DEN IGJEN',
      b:'Ett enkelt, rynket, håndlappet blad per stengel og én hvit blomst. Bæret er sammensatt av få store delfrukter, hardt og rødt før det er modent, og bløtt og gyllent når det er klart.'},
    { t:'MENNESKE OG ART',
      b:'I Nordland, Troms og Finnmark kan grunneier forby plukking av molte, og der du ikke har lov å bære den med deg, kan du likevel spise den på stedet. Ellers i landet gjelder vanlig allemannsrett i utmark. Umodne molter skal ikke plukkes; de modner ikke etterpå.'},
  ],
  funfacts:[
    'Molte har mer C-vitamin enn appelsin, og benzosyre nok til å holde seg lenge i kjølig vann.',
    'Nordområdene har verdens beste molteforekomster, og bær fra Finnmark har vært handelsvare i hundrevis av år.',
    'Bæret er lyst når det er modent. De fleste bær gjør det motsatte.',
    'Én nattefrost i juni kan slå ut hele årets moltesesong i et helt myrområde.',
  ],
},

bjork: {
  intro:'Bjørka er treet som står ytterst. Den setter tregrensa i fjellet, tar over etter brann og hogst, og har fulgt norsk byggeskikk i tusen år.',
  tall:[
    ['HØYDE','10–25 m, krypende ved tregrensa'],
    ['ALDER','60–150 år'],
    ['ARTER','hengebjørk og dunbjørk, med fjellbjørk som underart'],
    ['VOKSESTED','over hele landet, fra kyst til tregrense'],
    ['BRUK','ved, never, neverstikke, bjørkesaft'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Bjørka er et pionertre. Frøene er små og lette, spres langt med vinden og spirer på åpen mineraljord. Den vokser fort i lyset, men tåler ikke skygge, så gran overtar etter noen tiår der klimaet tillater det. I fjellet er det bjørka som blir stående igjen og danner den karakteristiske krokete fjellbjørkeskogen.'},
    { t:'KJENN DEN IGJEN',
      b:'Hvit bark med svarte sprekker, og hengende greiner hos hengebjørk. Bladene er trekantede med tannet kant. Fjellbjørka er lav, flerstammet og vridd av vind og snø.'},
    { t:'MENNESKE OG ART',
      b:'Never fra bjørk råtner nesten ikke og var tettesjiktet i torvtak i hundrevis av år. Bjørkeved er standard brensel i norske ovner. Bjørkepollen er den vanligste allergikilden i norsk vår, og bjørkesaft tappes om våren når sevja stiger.'},
  ],
  funfacts:[
    'Bjørka vokser høyest av alle trær i Norge og setter tregrensa, som ligger over 1 200 meter i indre Sør-Norge.',
    'Bjørkemåler kan spise skogen nesten bladløs i utbruddår i Nord-Norge. Trærne setter ofte nye blad samme sommer.',
    'Kvae og olje i never gjør at den brenner selv når den er våt. Derfor er never klassisk opptenning.',
    'Ei voksen bjørk kan slippe flere millioner frø i ett år.',
  ],
},

bever: {
  intro:'Beveren er det eneste dyret utenom mennesket som bygger om hele landskapet. Dammene den lager skaper våtmark der hundrevis av andre arter flytter inn.',
  tall:[
    ['KROPP','75–100 cm, hale 25–35 cm'],
    ['VEKT','15–30 kg'],
    ['LEVETID','10–20 år'],
    ['MAT','bark, kvist, vannplanter, urter'],
    ['HVOR','vassdrag i store deler av Sør- og Midt-Norge'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Beveren feller løvtrær med tennene og bruker dem både til mat og til byggverk. Den demmer opp bekken for å få dypt nok vann foran hytta, slik at inngangen ligger under vann og er utilgjengelig for rev og gaupe. Om høsten legger familien et matlager av kvist under vann, som de henter fra gjennom isen hele vinteren.'},
    { t:'KJENN DEN IGJEN',
      b:'Stor, brun gnager med flat, skjellkledd hale og svømmehud på bakbeina. Sportegn er tydeligere enn dyret: timeglassformede stubber, avgnagd bark, flytende kvistlagre og selve dammen. Beveren smeller halen i vannet som varsel før den dykker.'},
    { t:'MENNESKE OG ART',
      b:'Beveren var nesten utryddet i Europa på 1800-tallet, og en av de siste bestandene overlevde i Telemark. Norske bevere er senere brukt til å bygge opp bestanden i Sverige og flere andre land. I dag er konflikten motsatt: oversvømte jorder, veier og skog krever forvaltning og lokal jakt.'},
  ],
  funfacts:[
    'Fortennene er oransje av jern i emaljen, som gjør dem hardere. De vokser hele livet og slipes skarpe mot hverandre.',
    'Beveren kan holde pusten i rundt 15 minutter.',
    'Bevergjel, et sekret fra kjertler, ble i århundrer brukt i medisin og parfyme.',
    'En beverdam kan holde tilbake så mye vann at den demper flomtopper nedstrøms.',
  ],
},

smalom: {
  intro:'Smålommen hekker på små myrtjern der det ikke finnes fisk, og flyr derfor til havet hver gang ungen skal ha mat.',
  tall:[
    ['KROPP','55–70 cm'],
    ['VINGESPENN','100–120 cm'],
    ['VEKT','1–2 kg'],
    ['MAT','fisk, hentet i sjøen eller i større vann'],
    ['HVOR','myrtjern og småvann, mest i Nord-Norge og fjellet'],
    ['STATUS','livskraftig, men sårbar for forstyrrelse i hekketida'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Smålommen er den minste av lommene og den eneste som kan lette fra et lite vann. Derfor hekker den på bittesmå tjern som ikke har fisk, og flyr opptil flere mil til sjøen eller til større innsjøer for å hente mat til ungen. Reiret ligger helt i vannkanten, for fuglen kan nesten ikke gå på land.'},
    { t:'KJENN DEN IGJEN',
      b:'Slank vannfugl med tynt, oppadbøyd nebb og rustrød strupeflekk i sommerdrakt. Den ligger dypt i vannet og dykker uten plask. Ropet er et klagende, jodlende skrik som bærer langt over myra.'},
    { t:'MENNESKE OG ART',
      b:'Beina sitter helt bakerst på kroppen, perfekt for svømming og elendig for gange. Fuglen forlater derfor reiret ved minste forstyrrelse, og eggene blir raskt tatt av måke eller kråke. Hold god avstand til lomtjern i juni og juli.'},
  ],
  funfacts:[
    'Smålommen er den eneste lommen som klarer å lette rett opp fra et lite tjern. De andre trenger lang rullebane på vann.',
    'Den kan fly flere mil hver vei for én fisk til ungen.',
    'Ungene ligger på ryggen til foreldrene de første dagene.',
    'Om vinteren står smålommen i sjøen langs kysten i grå og hvit vinterdrakt uten den røde strupen.',
  ],
},

orret: {
  intro:'Ørreten finnes i nesten alle vassdrag i Norge, fra små fjellbekker til fjorden. Bekkeørret, innsjøørret og sjøørret er én og samme art.',
  tall:[
    ['LENGDE','15–60 cm, storørret betydelig mer'],
    ['VEKT','0,1–2 kg vanlig, over 10 kg i storørretvann'],
    ['LEVETID','5–15 år'],
    ['MAT','insekter, krepsdyr, småfisk'],
    ['HVOR','elver, bekker, innsjøer og fjorder i hele landet'],
    ['STATUS','livskraftig, enkelte bestander truet'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Ørreten gyter om høsten i rennende vann, der hunnen graver en grop i grusen og dekker eggene til. Ungfisken står på standplasser i strømmen og forsvarer dem. Noen individer blir stående i bekken hele livet, andre vandrer ut i innsjøen eller til sjøen og vokser mye raskere der maten er bedre.'},
    { t:'KJENN DEN IGJEN',
      b:'Kraftig laksefisk med mørke flekker på lysere bunn, ofte med røde prikker og lys ring rundt. Halen er rett avskåret eller svakt innbuktet. Laksen har V-formet hale, slankere halerot og flekker mest over sidelinja.'},
    { t:'MENNESKE OG ART',
      b:'Ørreten er den viktigste sportsfisken i norsk innland og en bærebjelke i fritidsfisket. Forsuring slo ut mange bestander på Sørlandet på 1900-tallet, men kalking har hentet flere tilbake. Vandringshindre som kulverter og terskler er i dag en større trussel enn fiske.'},
  ],
  funfacts:[
    'Ørreten kjenner igjen hjemmebekken på lukt og finner tilbake dit for å gyte.',
    'Sjøørret og bekkeørret kan være søsken. Hva de blir, avgjøres av vekst og forhold, ikke av arv alene.',
    'Ørretyngel har tydelige mørke fingermerker langs siden, kalt parrmerker.',
    'Storørret i vann som Mjøsa og Randsfjorden lever av krøkle og kan bli over ti kilo.',
  ],
},

soldogg: {
  intro:'Soldoggen er en kjøttetende plante i norsk myr. Den fanger insekter i klissete dråper fordi torva mangler nitrogen.',
  tall:[
    ['HØYDE','5–20 cm i blomst'],
    ['BLOMSTRING','juli–august'],
    ['BLAD','runde, med røde kjertelhår og klebrige dråper'],
    ['VOKSESTED','torvmyr og fuktig sandbunn'],
    ['BYTTE','mygg, knott og andre småinsekter'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Myrvann er surt og nesten fritt for nitrogen. Soldoggen løser det ved å hente nitrogenet fra dyr i stedet for fra jorda. Bladene er dekket av røde hår med en klar, klissete dråpe i enden. Når et insekt setter seg fast, bøyer hårene og etter hvert hele bladet seg sakte rundt byttet, og planten skiller ut fordøyelsesvæske.'},
    { t:'KJENN DEN IGJEN',
      b:'Små rosetter tett nede i torvmosen, med runde blad på lange stilker og dråper som glitrer i sola. Blomsterstilken er høy og tynn, og de hvite blomstene åpner seg bare noen timer midt på dagen.'},
    { t:'MENNESKE OG ART',
      b:'Soldogg har vært brukt i folkemedisin mot hoste. Den er helt avhengig av intakt myr, så grøfting og torvuttak fjerner både planten og resten av myrsamfunnet. Myr er også et av Norges viktigste karbonlagre, og et argument for vern som er større enn én art.'},
  ],
  funfacts:[
    'Dråpene på bladene er ikke dugg, men et seigt slim planten skiller ut selv. De tørker ikke i sol.',
    'Et blad bruker timer på å bøye seg rundt byttet, og dager på å fordøye det.',
    'Én plante kan fange flere hundre insekter i løpet av en sommer.',
    'Charles Darwin skrev en hel bok om kjøttetende planter, og soldogg var hovedeksempelet.',
  ],
},

myrull: {
  intro:'Myrull er de hvite duskene som lyser over myra i juli. Dusken er ikke blomst, men frøull som vinden skal ta med seg.',
  tall:[
    ['HØYDE','20–60 cm'],
    ['BLOMSTRING','mai–juni, dusker i juli'],
    ['VOKSESTED','våt myr, sump og grøftekanter'],
    ['FAMILIE','starrfamilien, ikke gras'],
    ['BRUK','veke, dyner og puter i eldre tid'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Myrull vokser i vannmettet torv og har luftkanaler i stengelen som fører oksygen ned til røttene. Den blomstrer tidlig og uanselig, og det er først når frøene modner at de lange, hvite hårene folder seg ut. Duskene gir frøene vindbæring, og en myr kan sende ull flere kilometer i en kuling.'},
    { t:'KJENN DEN IGJEN',
      b:'Duskmyrull har flere dusker per stengel som henger til sidene, mens torvmyrull har én rett opp. Bladene er smale og kantede, og stenglene står rett opp fra tuer eller flater i den våteste delen av myra.'},
    { t:'MENNESKE OG ART',
      b:'Ulla ble samlet og brukt til veker i oljelamper og som fyll i puter, men hårene er for korte og glatte til å spinnes til tråd. Myrull er en god indikator på myr som fortsatt er våt; på grøftet myr forsvinner den raskt.'},
  ],
  funfacts:[
    'Dusken er frøull, ikke blomst. Selve blomstringen er grønn og lite synlig og skjer flere uker tidligere.',
    'Myrull tilhører starrfamilien og er i slekt med starr og sivaks, ikke med gras.',
    'Røttene henter oksygen gjennom luftkanaler i stengelen, som et snorkelsystem.',
    'Under andre verdenskrig ble myrull prøvd brukt som erstatning for bomull.',
  ],
},

rodskrubb: {
  intro:'Rødskrubben er lett å kjenne igjen og god å spise. Den skifter farge til blåsvart i snittflaten i løpet av minutter.',
  tall:[
    ['HATT','5–20 cm, oransjerød'],
    ['SESONG','juli–oktober'],
    ['VOKSESTED','under osp og bjørk, ofte i fuktig skog'],
    ['STILK','hvit med mørke skjell'],
    ['BRUK','stekt, i gryte, tørket'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Rødskrubben er en rørsopp som lever i symbiose med osp og bjørk. Den kommer i pulser etter regn og kan stå i store mengder i fuktige år. Kjøttet er fastere enn hos den nære slektningen brunskrubb, og soppen holder bedre formen i panna.'},
    { t:'KJENN DEN IGJEN',
      b:'Oransjerød, tørr hatt, rør i stedet for skiver, og hvit stilk dekket av mørke, ru skjell. Snittflaten går fra hvit til rosa, deretter grå og til slutt blåsvart. Ingen giftig sopp i Norge ligner nevneverdig.'},
    { t:'MENNESKE OG ART',
      b:'Rødskrubb er en god og vanlig matsopp som tåler transport dårlig; den bør tas hjem i kurv og stekes samme dag. Fargeskiftet er ufarlig og påvirker ikke smaken, bare utseendet. Soppen skal alltid varmebehandles godt.'},
  ],
  funfacts:[
    'Fargeskiftet skyldes at stoffer i soppen reagerer med oksygen når kjøttet blir utsatt for luft.',
    'Rødskrubb kan bli over 20 cm over hatten og veie flere hundre gram.',
    'Skrubbene heter så fordi stilken er ru som en skrubb å ta på.',
    'Soppen blir nesten svart i gryta, men smaken er mild og nøtteaktig.',
  ],
},

graor: {
  intro:'Gråora gjødsler sin egen mark. Bakterier i rotknollene binder nitrogen fra lufta, og derfor vokser den i ren sand og grus langs elver.',
  tall:[
    ['HØYDE','10–20 m'],
    ['ALDER','50–80 år'],
    ['VOKSESTED','flommark, elvekanter, fuktig raviner'],
    ['BLOMSTRING','mars–april, før løvsprett'],
    ['BRUK','ved til røyking, treskoblokker, kulisser'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Gråora lever i samarbeid med bakterier i knoller på røttene. Bakteriene binder nitrogen fra lufta, treet får gjødsel, og jorda under en oreskog blir raskt næringsrik. Derfor er gråorskog blant de mest produktive naturtypene vi har, med tett feltsjikt av høge urter. Ora tåler også oversvømmelse og etablerer seg først på nye grusører.'},
    { t:'KJENN DEN IGJEN',
      b:'Grå, glatt bark, matte blad med spiss tupp og små, forvedede rakler som blir sittende på treet som bittesmå kongler gjennom vinteren. Svartor har blad med butt eller innskåret tupp og står enda våtere.'},
    { t:'MENNESKE OG ART',
      b:'Gråorheggeskog langs elver er en viktig og ofte truet naturtype, presset av kanalisering og jordbruk. Oreved er bløt og lite verdt som tømmer, men er tradisjonell ved til røyking av fisk og kjøtt. Trevirket er også svært motstandsdyktig mot råte under vann.'},
  ],
  funfacts:[
    'Nitrogenet ora binder blir liggende i jorda og gjødsler nabotrærne også.',
    'Venezia står på pæler av or, som har holdt i hundrevis av år fordi de står helt under vann.',
    'Oreveden blir oransjerød i snittflaten kort tid etter at treet er felt.',
    'Ora blomstrer før snøen er borte, og pollenet er en tidlig allergikilde.',
  ],
},

selje: {
  intro:'Selja blomstrer før alt annet. Gåsungene gir humledronningene den første maten om våren, og avgjør om humlebolet i det hele tatt kommer i gang.',
  tall:[
    ['HØYDE','5–12 m'],
    ['BLOMSTRING','mars–mai, før løvsprett'],
    ['VOKSESTED','skogkanter, bekkedaler, skrotemark'],
    ['BLAD','brede, rynkete, gråfiltede under'],
    ['BRUK','bikubeplante, elgbeite, seljefløyte'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Selja har hann- og hunntrær hver for seg. Hanntrærne har de gule, pollenrike gåsungene, hunntrærne de grønnere. Blomstringen kommer før løvet, på et tidspunkt da nesten ingen andre planter har åpnet, og den er derfor avgjørende for humler, bier og tidlige sommerfugler. Frøene er små med hvit ull og spres med vinden i mai.'},
    { t:'KJENN DEN IGJEN',
      b:'Brede, rynkete blad med grå filt på undersiden, og store, sølvgrå gåsunger i mars og april. Selja er en av flere vierarter, men har bredest blad av dem alle.'},
    { t:'MENNESKE OG ART',
      b:'Selje er en av de tre viktigste beitetrærne for elg sammen med rogn og osp. Barken ble brukt til å lage seljefløyte om våren, når sevja stiger og barken løsner fra veden. I hage og kulturlandskap er selje en av de mest verdifulle plantene for pollinerende insekter.'},
  ],
  funfacts:[
    'En humledronning som våkner for tidlig og ikke finner selje i blomst, klarer sjelden å starte bol.',
    'Gåsungene er blomster, ikke knopper. De gule er pollenbærende hannblomster.',
    'Selje slår lett rot fra en frisk kvist stukket i fuktig jord.',
    'Seljefløyte lages bare i de få ukene barken lar seg vri løs fra veden.',
  ],
},

/* ============================================================ KYSTEN */
hubro: {
  intro:'Hubroen er Europas største ugle og et rovdyr på vinger. Den ruger i bergvegger langs kysten, og ropet bærer kilometervis over mørke fjorder.',
  tall:[
    ['VINGESPENN','155–180 cm'],
    ['VEKT','1,5–4 kg, hunnen størst'],
    ['LEVETID','15–20 år i naturen'],
    ['MAT','hare, rotte, måke, and, rype, pinnsvin'],
    ['HVOR','kyststrøk og indre dalstrøk, mest Vestlandet og Nordland'],
    ['STATUS','sterkt truet, rundt 450–700 par'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Hubroen jakter i skumringen og natta, fra en utkikkspost i berget. Den tar større bytte enn noen annen norsk ugle, opp til hare og gås. Reiret er en ren skrape på en berghylle, uten redemateriale, og brukes om igjen i mange år. Ungene forlater hylla før de kan fly og klatrer rundt i bergsida i ukesvis.'},
    { t:'KJENN DEN IGJEN',
      b:'Enorm, tønneformet ugle med oransje øyne og tydelige fjærhorn. Ropet er et dypt, tostavet uh-hu som gjentas med jevne mellomrom. Den ses sjelden på dagen, men kråker og måker avslører den ved å mobbe.'},
    { t:'MENNESKE OG ART',
      b:'Hubroen ble skutt som skadedyr til den ble fredet i 1971, og bestanden har aldri hentet seg helt inn. Strømgjerder og kraftlinjer er en betydelig dødsårsak: fuglen setter seg på stolpetoppen og treffer to faser. Isolering av stolper er derfor et konkret bevaringstiltak.'},
  ],
  funfacts:[
    'Ropet bærer flere kilometer i stille kystnatt, og hannen svarer hunnen i dypere toneleie.',
    'Vingefjærene har myke kanter som bryter luftvirvlene. Hubroen flyr nesten lydløst tross størrelsen.',
    'Hubroen kan snu hodet rundt 270 grader fordi den har dobbelt så mange nakkevirvler som et menneske.',
    'Hunnen er tyngre enn hannen, som hos de fleste rovfugler og ugler.',
  ],
},

havorn: {
  intro:'Havørna har Nord-Europas største vingespenn og er Norges mest imponerende fugl i lufta. Landet vårt huser en betydelig del av hele Europas bestand.',
  tall:[
    ['VINGESPENN','200–250 cm'],
    ['VEKT','3,5–7 kg, hunnen størst'],
    ['LEVETID','20–30 år, opptil over 30'],
    ['MAT','fisk, sjøfugl, åtsler'],
    ['HVOR','kysten fra Rogaland til Finnmark, tettest i Nordland og Troms'],
    ['STATUS','livskraftig, rundt 3 500–4 000 par'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Havørna jakter mest fisk nær overflaten og tar sjøfugl når anledningen byr seg. Den er også en effektiv åtseleter om vinteren. Reiret er en diger risbolle i et tre eller på en berghylle, og paret bygger på det hvert år til det kan veie flere hundre kilo. Ett til to unger vokser opp i året.'},
    { t:'KJENN DEN IGJEN',
      b:'Brede, rette vinger som en planke, kort kileformet hale og massivt gult nebb hos voksne fugler. Ungfugler er mørkere med brun hale og får full voksendrakt først etter fire til fem år.'},
    { t:'MENNESKE OG ART',
      b:'Havørna var nesten borte fra Sør-Norge på grunn av forfølgelse og ble fredet i 1968. Etter det har bestanden vokst kraftig, og norske fugler er brukt til å bygge opp bestanden i Skottland og Irland. Kollisjoner med vindturbiner og ulovlig avliving er dagens hovedproblem.'},
  ],
  funfacts:[
    'Norge har rundt 40 prosent av Europas havørnbestand.',
    'Havørna stjeler gjerne fangst fra andre fugler i stedet for å jakte selv. Det kalles kleptoparasittisme.',
    'Ørna ser skarpere enn oss og kan skille en fisk i overflaten på flere hundre meters hold.',
    'Et gammelt havørnreir kan bli over to meter bredt og har vært i bruk i flere tiår.',
  ],
},

furu: {
  intro:'Furua er treet som blir stående der ingenting annet greier seg. Den vokser i sprekker i svaberg, tåler tørke og vind, og kan bli flere hundre år gammel.',
  tall:[
    ['HØYDE','15–30 m, lavere og kroket på kysten'],
    ['ALDER','200–700 år'],
    ['NÅLER','i par, 4–7 cm lange'],
    ['VOKSESTED','mager, tørr og sandig jord, berg og myrkant'],
    ['BRUK','bygningstømmer, båt, tjære, stavkirker'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Furua sender pålerot rett ned og sidegreiner ut, og finner vann der grana ikke kommer til. Den krever lys hele livet, så furuskog er åpen og lys i bunnen, med lyng og lav. På karrig kystberg vokser furua ekstremt sakte, blir liten og kroket, men lever tilsvarende lenge.'},
    { t:'KJENN DEN IGJEN',
      b:'Rødbrun, flakete bark øverst på stammen og grov, grå skorpebark nederst. Nålene sitter to og to i en skjede. Konglene er kortere og mer kompakte enn granas, og furukronen er uryddig og brer seg utover med alderen.'},
    { t:'MENNESKE OG ART',
      b:'Malmfuru med tett, kvaerik kjerneved er nesten råtefri og ble brukt i stavkirker, naust og båtbygging. Tjære utvunnet i tjæremiler av furustubber tettet båter og tak i hundrevis av år. I dag er furu hovedvirket i norsk konstruksjonstrelast sammen med gran.'},
  ],
  funfacts:[
    'Furu på karrig kyst kan bli 700 år. De eldste furuene i Norge står på steder ingen har brydd seg med å hogge.',
    'Kvaen tetter sår i barken og virker bakteriedrepende. Den har vært brukt til sårsalve.',
    'En gammel, død furu som står tørr kalles kjelke eller tyristubbe, og veden er tent med ett fyrstikk.',
    'Furunåler holder i to til fire år, så treet er grønt hele vinteren men bytter nåler jevnt.',
  ],
},

hjort: {
  intro:'Hjorten er Norges mest tallrike store hjortedyr og selve symbolet på vestlandsnaturen. Brølet i september bærer over hele dalen.',
  tall:[
    ['KROPP','skulderhøyde 1,1–1,5 m'],
    ['VEKT','hann 120–230 kg, hunn 70–120 kg'],
    ['LEVETID','10–15 år'],
    ['MAT','gras, urter, lauv, skudd, innmark'],
    ['HVOR','Vestlandet og Midt-Norge, i spredning østover'],
    ['STATUS','livskraftig, bestanden har vokst kraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Hjorten beiter mer gras og urter enn elgen og trekker mellom sommerbeite i høyden og vinterbeite nede i liene. Brunsten går i september og oktober. Da samler de største hjortene et harem av koller og brøler for å holde konkurrenter unna, og kampene kan bli harde. Kalvene kommer i juni.'},
    { t:'KJENN DEN IGJEN',
      b:'Gråbrun vinterpels, rødbrun sommerpels og et gulhvitt speil bak. Hannen har greinete gevir som felles hver vår. Hjorten er mellom rådyr og elg i størrelse, med lengre hals og mer gras-beitende profil enn elgen.'},
    { t:'MENNESKE OG ART',
      b:'Hjortejakta er den største jakta i Norge målt i antall felte dyr, med titusenvis felt hvert år. Beiteskader på innmark og eng er en betydelig konflikt på Vestlandet, og trafikkulykker øker der bestanden er tett.'},
  ],
  funfacts:[
    'Brølet er lavfrekvent og bærer langt. Dypere brøl signaliserer større kropp, og hjorter vurderer hverandre på lyden før de går til kamp.',
    'Geviret kan veie over ti kilo og bygges opp på under fire måneder.',
    'Hjorten svømmer godt og krysser fjorder mellom beiteområder.',
    'Kalven har hvite flekker som forsvinner utover første høsten.',
  ],
},

piggsvin: {
  intro:'Piggsvinet er nattens hagevandrer. Det ruller seg til en pigget ball, går i ordentlig vinterdvale, og går tilbake i antall i Norge.',
  tall:[
    ['KROPP','20–30 cm'],
    ['VEKT','0,6–1,5 kg, tyngst før dvale'],
    ['LEVETID','3–7 år'],
    ['MAT','biller, meitemark, larver, snegler, åtsler'],
    ['HVOR','Sør-Norge og langs kysten til Trøndelag'],
    ['STATUS','går tilbake, rødlistet i Norge'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Piggsvinet er nattaktivt og går flere kilometer på en natt på jakt etter insekter og mark. Om høsten spiser det seg opp og går i ekte vinterdvale fra oktober til april, med kroppstemperatur ned mot noen få grader. Dvalereiret bygges av løv under en busk, i en vedstabel eller under en terrasse.'},
    { t:'KJENN DEN IGJEN',
      b:'Ingen forveksling er mulig. Ryggen er dekket av pigger, buken er hårete, og dyret triller seg sammen når det blir truet. Om natta høres det som kraftig rasling i løvet, langt mer bråkete enn størrelsen tilsier.'},
    { t:'MENNESKE OG ART',
      b:'Piggsvinet er presset av trafikk, robotklippere, nettinggjerder og hager uten løv og kratt. Det kan hjelpes med en løvhaug i et hjørne, en passasje under gjerdet og ingen klipping etter mørkets frembrudd. Melk skal ikke settes ut; piggsvin tåler ikke laktose.'},
  ],
  funfacts:[
    'Et piggsvin har rundt 6 000 pigger, og de er omdannede hår.',
    'En egen ringmuskel langs ryggen trekker piggdekket sammen som en snurpepose når dyret ruller seg.',
    'I dvale kan hjertet gå ned fra rundt 190 til under 20 slag i minuttet.',
    'Piggsvin som veier under 600 gram i oktober overlever sjelden vinteren.',
  ],
},

lunde: {
  intro:'Lunden er den mest kjente sjøfuglen i Norge, med sitt fargede nebb og oppreiste gange. Koloniene på Røst har hatt dramatisk svikt i ungeproduksjonen.',
  tall:[
    ['KROPP','28–30 cm'],
    ['VINGESPENN','50–60 cm'],
    ['VEKT','350–500 g'],
    ['MAT','sil og tobis, småsild, krepsdyr'],
    ['HVOR','sjøfuglkolonier fra Rogaland til Finnmark'],
    ['STATUS','rødlistet, kraftig tilbakegang'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Lunden graver reirganger i torvjord på bratte øyskråninger, eller bruker sprekker i ur. Hvert par får én unge i året, og begge foreldrene bærer småfisk inn til gangen. Utenom hekketida lever lunden hele året ute på åpent hav, og da mister den også fargene på nebbet.'},
    { t:'KJENN DEN IGJEN',
      b:'Svart rygg, hvit buk, hvitt ansikt og et høyt, trekantet nebb i rødt, gult og blågrått i sommerdrakt. Den flyr med raske vingeslag lavt over sjøen og lander klossete. På land står den oppreist på oransje svømmeføtter.'},
    { t:'MENNESKE OG ART',
      b:'Lundekolonien på Røst var en gang blant Europas største. Svikt i tilgangen på sil og tobis har gitt år på år uten at ungene overlever, og bestanden er sterkt redusert. Årsakene henger sammen med endringer i havet og i næringskjeden, ikke med jakt.'},
  ],
  funfacts:[
    'Lunden bærer et titalls småfisk på tvers i nebbet samtidig. Pigger i ganen og en bevegelig overkjeve holder fangsten på plass mens den åpner for flere.',
    'Nebbets sterke farger er sesongpynt. Ytterlagene felles etter hekkesesongen og nebbet blir mindre og mattere.',
    'Lunden bruker vingene til å svømme under vann og kan dykke over 40 meter.',
    'Ungen forlater gangen alene om natta og finner veien ut til havet uten foreldrene.',
  ],
},

krykkje: {
  intro:'Krykkja er måken som hekker på loddrette berghyller, ofte midt i byer som Vardø og Tromsø. Den har hatt en av de kraftigste bestandsnedgangene av alle norske fugler.',
  tall:[
    ['KROPP','38–40 cm'],
    ['VINGESPENN','90–105 cm'],
    ['VEKT','350–500 g'],
    ['MAT','småfisk og krepsdyr fra overflaten'],
    ['HVOR','sjøfuglkolonier langs kysten, mest i nord'],
    ['STATUS','sterkt truet'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Krykkja bygger reir av tang, gras og skitt på smale hyller i loddrette vegger, der rev og mink ikke kommer til. Den henter mat i overflaten på åpent hav og kan fly langt fra kolonien på næringssøk. Om vinteren trekker den ut i Nord-Atlanteren og kommer ikke til land før neste vår.'},
    { t:'KJENN DEN IGJEN',
      b:'Liten, elegant måke med rent gult nebb uten rød flekk, svarte vingespisser som ser dyppet i blekk ut, og korte, svarte bein. Ropet er et tydelig kriti-veik som har gitt fuglen navnet.'},
    { t:'MENNESKE OG ART',
      b:'Bestanden har falt over 80 prosent siden 1980-tallet, og hovedårsaken knyttes til mindre og dårligere tilgjengelig mat i havet. Flere kolonier har flyttet inn i byer, der bygninger erstatter berghyller, noe som gir konflikt med beboere. Kunstige krykkjehotell er prøvd ut flere steder i nord.'},
  ],
  funfacts:[
    'Krykkja er den mest tallrike måkearten i verden, men går likevel kraftig tilbake.',
    'Den henter nesten all mat fra de øverste metrene av vannet og kan ikke dykke dypt etter fisk som har trukket ned.',
    'Ungene sitter helt stille på den smale hylla i ukevis. De har sterkere klør enn andre måkeunger.',
    'I motsetning til de fleste måker følger ikke krykkja fiskebåter og søppelplasser i særlig grad.',
  ],
},

sild: {
  intro:'Silda har formet norsk historie mer enn nesten noen annen art. Stimene teller milliarder, og når de forsvant, ble hele kystsamfunn lagt ned.',
  tall:[
    ['LENGDE','25–40 cm'],
    ['VEKT','100–400 g'],
    ['LEVETID','opptil 20 år'],
    ['MAT','raudåte og annet dyreplankton'],
    ['HVOR','Norskehavet og kysten, gyting på Møre og i Lofoten'],
    ['STATUS','norsk vårgytende sild er forvaltet med kvoter'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Norsk vårgytende sild beiter i Norskehavet om sommeren, overvintrer i fjorder og dyphavsområder, og gyter på bunnen langs kysten om vinteren og våren. Eggene klebes til grus og stein, og larvene driver nordover med strømmen til Barentshavet. Silda er selve mellomleddet i havets næringskjede: den spiser plankton og blir spist av torsk, sei, sjøfugl og hval.'},
    { t:'KJENN DEN IGJEN',
      b:'Sølvblank, slank fisk med én ryggfinne og kjølformet buk. Skjellene løsner lett. Brisling er mindre og har skarpere bukkjøl, makrell har stripete rygg og to ryggfinner.'},
    { t:'MENNESKE OG ART',
      b:'Sildefisket bygde byer og eksportnæringer langs hele kysten. Bestanden kollapset på slutten av 1960-tallet etter hardt fiske, og var nær utradert. Streng regulering fra 1970-tallet bygde den opp igjen, og gjenoppbyggingen regnes som en av de store suksessene i norsk fiskeriforvaltning.'},
  ],
  funfacts:[
    'En sildestim kan telle milliarder av individer og snu som én kropp når en predator kommer.',
    'Silda holder stimen samlet ved hjelp av sidelinja, som registrerer trykkbølger fra naboene.',
    'En hunnsild gyter titusenvis av egg, og de klebes fast til bunnen i stedet for å flyte.',
    'Silda kommuniserer også med lyd fra svømmeblæra, en slags høyfrekvent klikking.',
  ],
},

eik: {
  intro:'Eika er det rikeste treet vi har. En gammel eik kan huse over tusen arter, og enkelte trær er eldre enn husene rundt dem.',
  tall:[
    ['HØYDE','20–35 m'],
    ['ALDER','400–1 000 år'],
    ['VOKSESTED','varme, næringsrike lier på Sør- og Vestlandet'],
    ['FRUKT','nøtter, altså eikenøtter, i september'],
    ['BRUK','skipsbygging, tønner, gulv, møbler'],
    ['STATUS','livskraftig, hule eiker er utvalgt naturtype'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Eika vokser sakte og blir enormt gammel. Med alderen får den døde greiner, hulrom og løs bark, og det er nettopp da den blir viktigst: hulrommene fylles av mold der biller, sopp og fugler lever. Eikenøttene spres av nøtteskrike og ekorn, som graver dem ned som vinterlager og glemmer en del av dem.'},
    { t:'KJENN DEN IGJEN',
      b:'Blad med runde fliker og svært kort stilk, nøtter på lang stilk hos sommereik. Barken er grov og dypt oppsprukket på gamle trær. Kronen er bred og kroket når treet har vokst fritt.'},
    { t:'MENNESKE OG ART',
      b:'Eik var strategisk råstoff i seilskutetida og ble hogd hardt til flåtebygging. I dag er hule eiker med omkrets over to meter en utvalgt naturtype med eget vern, fordi de bærer et stort antall sjeldne arter. Et enkelt gammelt tre kan derfor være mer verdifullt enn hele skogen rundt.'},
  ],
  funfacts:[
    'En gammel eik kan huse over tusen arter insekter, lav og sopp, mange av dem finnes ikke andre steder.',
    'Eika bruker 40–60 år før den setter sine første nøtter.',
    'Eikenøtter er giftige for hester og sau i større mengder, men er viktig mat for villsvin og fugl.',
    'Garvestoffer i eikeved gjør at tønner gir smak til whisky, vin og konjakk.',
  ],
},

barlind: {
  intro:'Barlinden er et bartre uten kongler og med giftige nåler. Veden ga Europas beste langbuer, og et stoff fra treet ble til kreftmedisin.',
  tall:[
    ['HØYDE','5–15 m, ofte flerstammet'],
    ['ALDER','flere hundre år, europeiske trær over 1 000'],
    ['VOKSESTED','skyggefulle, frostfrie lier langs kysten'],
    ['FRØ','i et rødt, bløtt bærlignende frøbeger'],
    ['GIFT','taksin i nåler, ved og frø'],
    ['STATUS','fredet i Norge'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Barlinden er et skyggetre som vokser ekstremt sakte og tåler å stå under andre trær i hundrevis av år. Den lager ingen kongler; frøet sitter i stedet i et rødt, bløtt beger som fugler spiser og sprer. Arten er vintergrønn og krever mildt kystklima uten harde frostperioder.'},
    { t:'KJENN DEN IGJEN',
      b:'Mørke, flate nåler i to rader langs kvisten, uten stikk. Barken er rødbrun og flasser i flak. De røde frøbegerne i august og september gjør treet umulig å forveksle.'},
    { t:'MENNESKE OG ART',
      b:'Barlind og kristtorn er fredet i Norge, og trærne kan ikke hogges eller skades. Hele planten er giftig for både folk og husdyr, unntatt det røde fruktkjøttet rundt frøet; selve frøet er giftig. Fra barlindbark ble cellegiften taxol først utvunnet, og den er i dag en standardbehandling mot flere kreftformer.'},
  ],
  funfacts:[
    'Engelske langbuer ble laget av barlind, fordi veden har hard kjerne og elastisk yteved som gir naturlig fjæring.',
    'Fuglen spiser det røde begeret og slipper frøet ufordøyd. Frøet er giftig, begeret er det ikke.',
    'Barlind kan sette nye skudd fra gammel stamme og rot, og et tre kan fornye seg selv i tusen år.',
    'Én mundfull nåler kan være dødelig for hest og storfe.',
  ],
},

/* ============================================================ VIDDA */
rein: {
  intro:'Reinen er viddas flokkdyr og den eneste hjorteart der begge kjønn har gevir. Norge har de siste bestandene av villrein i Europa.',
  tall:[
    ['KROPP','skulderhøyde 1–1,4 m'],
    ['VEKT','bukk 90–150 kg, simle 60–100 kg'],
    ['LEVETID','10–15 år'],
    ['MAT','lav om vinteren, gras, urter og sopp om sommeren'],
    ['HVOR','høyfjell fra Setesdal til Finnmark'],
    ['STATUS','villrein er nær truet'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Reinen trekker i flokk over store avstander mellom sommerbeite og vinterbeite. Om vinteren graver den seg ned til lav gjennom snøen, og laven vokser bare 2–5 millimeter i året, så et nedbeitet område trenger tiår for å komme tilbake. Kalvene kommer i mai, og hele flokken kalver innenfor få dager.'},
    { t:'KJENN DEN IGJEN',
      b:'Brede, spredte hover, tydelig lys hals og gevir hos både bukk og simle. Hovene klikker hørbart når reinen går, fordi en sene glir over en knokkel i foten. Flokken beveger seg som én enhet og skifter retning samlet.'},
    { t:'MENNESKE OG ART',
      b:'Tamrein er grunnlaget for samisk reindrift, og villrein finnes i egne fjellområder der Hardangervidda er det største. Veier, hytter, kraftlinjer og ferdsel kutter trekkveier i biter, og det er hovedgrunnen til at villreinen er nær truet. Skrantesjuke ble påvist i Nordfjella i 2016, og hele delbestanden ble tatt ut.'},
  ],
  funfacts:[
    'Reinen ser ultrafiolett lys. Lav, urin og ulvepels lyser mørkt mot snøen i UV, som usynlig skrift for oss.',
    'Snuten er en varmeveksler. Innpustet luft varmes av utpustet luft, så dyret sparer både varme og fuktighet.',
    'Klovene blir brede og myke om sommeren og harde med skarpe kanter om vinteren, for å hakke gjennom skare.',
    'Reinen er den eneste hjorteart der simla også bærer gevir, og hun beholder sitt gjennom vinteren.',
  ],
},

rype: {
  intro:'Lirypa er fjellets vinterfugl. Den blir hvit som snøen, sover i snøhuler og er samtidig Norges mest jaktede fuglevilt.',
  tall:[
    ['KROPP','35–40 cm'],
    ['VEKT','450–700 g'],
    ['LEVETID','2–4 år'],
    ['MAT','bjørke- og vierknopper om vinteren, bær og skudd ellers'],
    ['HVOR','fjellbjørkeskog, vierkratt og lavfjell i hele landet'],
    ['STATUS','nær truet'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Rypa lever av knopper og skudd hele vinteren, og graver seg inn i snøen for å holde varmen om natta. Reiret er en grop i bakken, og kyllingene er på beina og finner mat selv med en gang. Rypebestanden svinger kraftig med smågnagerår: i lemenår tar rovdyr og rovfugl gnagere i stedet for rypekyllinger.'},
    { t:'KJENN DEN IGJEN',
      b:'Helt hvit vinterdrakt med svart hale, og brunflekket sommerdrakt. Hannen har røde vorter over øynene i spillperioden og en hes, rullende latter som ropelyd. Fjellrypa er mer grå og holder seg høyere til fjells.'},
    { t:'MENNESKE OG ART',
      b:'Rypejakt fra 10. september er en stor del av norsk jakttradisjon og friluftsliv. Bestandsnedgangen over flere tiår har ført til kortere sesonger, kvoter og lokale jaktstopp. Klimaendringer som gir mindre stabilt snødekke slår hardt ut for en fugl som er hvit i seks måneder.'},
  ],
  funfacts:[
    'Rypa har fjær helt ned på tærne. Beina blir truger som holder den oppe på løssnø.',
    'Snøhulen er varmere enn lufta utenfor, og rypa kan sitte i ro gjennom uvær i flere døgn.',
    'Blindtarmene er uvanlig store fordi de må bryte ned trevlete knopper og kvist.',
    'Rypa skifter drakt tre ganger i året, ikke to som de fleste fugler.',
  ],
},

fjellrev: {
  intro:'Fjellreven er Norges mest utsatte pattedyr og et av verdens best isolerte. Den tåler femti minusgrader og lever på snaufjellet året rundt.',
  tall:[
    ['KROPP','50–65 cm, hale 30 cm'],
    ['VEKT','3–5 kg'],
    ['LEVETID','3–6 år'],
    ['MAT','lemen og markmus, rypekyllinger, egg, åtsler'],
    ['HVOR','høyfjell i Sør-Norge og nordover, spredte bestander'],
    ['STATUS','sterkt truet'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Fjellreven lever av smågnagere og følger lemenårene. I toppår kan et kull være på over ti valper, i bunnår yngler den ikke i det hele tatt. Hiene ligger i grusrygger over tregrensa og brukes om igjen av generasjon etter generasjon. Om vinteren følger den jerv og ulv og lever på restene av deres bytte.'},
    { t:'KJENN DEN IGJEN',
      b:'Liten, rund rev med kort snute, små ører og kraftig hvit vinterpels. Sommerdrakta er brun og tynn og ser nesten ut som et annet dyr. Noen individer har blåfarget vinterpels i stedet for hvit.'},
    { t:'MENNESKE OG ART',
      b:'Fjellreven var nesten borte i Skandinavia rundt år 2000. Avlsstasjonen på Sæterfjellet i Oppdal har siden satt ut valper i fjellområder, kombinert med vinterfôring og uttak av rødrev. Bestanden har tatt seg tydelig opp, men er fortsatt avhengig av aktive tiltak.'},
  ],
  funfacts:[
    'Fjellreven har den best isolerende pelsen av alle pattedyr. Den begynner ikke å bruke energi på å holde varmen før det er rundt 40 minusgrader.',
    'Korte ører og kort snute er ikke tilfeldig: mindre overflate gir mindre varmetap.',
    'Rødreven er den store konkurrenten. Den trekker oppover i fjellet når klimaet mildner og tar hiene.',
    'I gode lemenår kan ett kull ha 14–19 valper, flest av alle rovdyr i verden.',
  ],
},

rosslyng: {
  intro:'Røsslyngen er lyngheias hovedplante og selve fargen på norsk kystlandskap i august. Den har formet både beitebruk og byggeskikk langs kysten.',
  tall:[
    ['HØYDE','20–60 cm'],
    ['BLOMSTRING','juli–september'],
    ['ALDER','opptil 40 år'],
    ['VOKSESTED','kystlynghei, myrkant, furuskog, fjellhei'],
    ['BRUK','lynghonning, sauefôr, taktekking, sopelime'],
    ['STATUS','livskraftig, men kystlynghei er truet naturtype'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Røsslyng vokser på sur, mager jord og klarer det fordi sopptråder i røttene henter nitrogen den ellers ikke får. Den blomstrer i slutten av sommeren, når nesten alt annet er ferdig, og gir dermed sent trekk til bier. Gamle lyngplanter blir forvedet og gir dårlig beite, så heia må holdes ung.'},
    { t:'KJENN DEN IGJEN',
      b:'Tett, forgreinet busk med små, nålaktige blad i fire rader og mengder av små rosa til lilla klokkeblomster langs stengelen. Klokkelyng har større, tydelige klokker og vokser fuktigere.'},
    { t:'MENNESKE OG ART',
      b:'Lyngheiene langs kysten er holdt åpne av beite og lyngbrenning i rundt 5 000 år. Når bruken slutter, vokser heia igjen med einer, bjørk og sitkagran, og kystlynghei står nå som truet naturtype. Skjøtsel med sau og kontrollert brenning er det som holder landskapet i gang.'},
  ],
  funfacts:[
    'Lynghonning er så tykk at den må røres løs før den renner. Den er tiksotrop: fast i ro, flytende i bevegelse.',
    'Én røsslyngplante kan produsere flere hundre tusen frø i året, og frøene ligger levende i jorda i tiår.',
    'Navnet sopelime kommer av at lyngkvister bundet i bunt ble brukt som kost.',
    'Lyngbrenning gjøres om vinteren eller tidlig vår, når torva er fuktig og bare det tørre over brenner.',
  ],
},

moskus: {
  intro:'Moskusen er et istidsdyr som fortsatt går på Dovrefjell. Flokken stiller seg i ring med hornene ut når den blir truet, et forsvar som virket mot ulv i tusenvis av år.',
  tall:[
    ['KROPP','skulderhøyde 1,2–1,5 m'],
    ['VEKT','okse 250–400 kg, ku 180–250 kg'],
    ['LEVETID','12–20 år'],
    ['MAT','gras, starr, lyng, vier'],
    ['HVOR','Dovrefjell, utsatt bestand'],
    ['STATUS','innført bestand på rundt 200 dyr'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Moskusen er bygget for kulde og går ute på vidda hele vinteren. Den beiter på vindblåste rabber der snøen er tynn, og sparer energi ved å bevege seg lite. Kalvene fødes i april og mai, midt i vinterens siste uker, og holder varmen tett inntil kua. Okser kjemper om kuene i august ved å løpe mot hverandre og smelle pannene sammen.'},
    { t:'KJENN DEN IGJEN',
      b:'Massiv, mørk kropp med lang pels som henger nesten ned til bakken, og brede horn som møtes i en hjelm over pannen. Selv om den ser ut som en okse, er moskusen nærmere i slekt med sau og geit.'},
    { t:'MENNESKE OG ART',
      b:'Moskus ble satt ut på Dovre fra Grønland i 1930- og 1940-årene og har siden holdt seg der. Dyra virker rolige, men er raske og farlige når de føler seg trengt. Anbefalt avstand er minst 200 meter, og flere personer er skadet av moskus som ble presset av fotografer.'},
  ],
  funfacts:[
    'Underullen heter qiviut og er varmere enn sau per gram. Den felles i store flak om våren og kan samles i terrenget.',
    'Moskusen er nærmere i slekt med geit og sau enn med okser, tross navnet.',
    'Dovreflokken stammer fra noen få dyr hentet fra Øst-Grønland.',
    'En moskus kan sprinte i over 50 km/t, langt raskere enn et menneske.',
  ],
},

heilo: {
  intro:'Heiloen er viddas fløyte. Den trillende tonen over lyngen er lyden av norsk høyfjell om sommeren.',
  tall:[
    ['KROPP','26–29 cm'],
    ['VINGESPENN','65–75 cm'],
    ['VEKT','150–220 g'],
    ['MAT','insekter, meitemark, larver, bær'],
    ['HVOR','høyfjell og myr i hele landet'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Heiloen hekker på åpen fjellhei og myr, i en enkel grop i bakken med fire spettede egg. Ungene finner maten selv fra første dag. Om høsten trekker arten sørover til Vest-Europa og Nord-Afrika, ofte i store flokker sammen med vipe. Om våren kommer den tidlig tilbake, gjerne før snøen har sluppet fjellet helt.'},
    { t:'KJENN DEN IGJEN',
      b:'Gullspettet rygg, svart ansikt og buk i sommerdrakt, avgrenset av en hvit stripe langs siden. Om vinteren er den langt lysere under. Lokketonen er en klar, litt vemodig fløyte på to toner.'},
    { t:'MENNESKE OG ART',
      b:'Heiloen tåler ferdsel dårlig i hekketida og forlater reiret ved forstyrrelse. Arten er knyttet til åpen fjellhei, og gjengroing i lavere strøk presser den oppover. Den er samtidig en av de mest tallrike vadefuglene i norsk fjell.'},
  ],
  funfacts:[
    'Heiloen halter med utslått vinge og later som den er skadet for å lokke rovdyr bort fra reiret.',
    'Fuglen er en av de raskeste flyverne blant vadefugler og kan holde over 80 km/t på trekk.',
    'Ungene er dunkledde og løper fra reiret få timer etter klekking.',
    'Heilo og vipe flokker seg sammen på jorder om høsten før trekket sørover.',
  ],
},

krekling: {
  intro:'Kreklingen dekker vidda i svarte, tette matter. Den bruker kjemi mot naboplantene, og bæret er mat for både fugl og folk.',
  tall:[
    ['HØYDE','10–30 cm, krypende'],
    ['BLOMSTRING','april–juni, små og uanselige'],
    ['BÆR','svarte, saftige, modne fra august'],
    ['VOKSESTED','fjellhei, furumo, kystlynghei'],
    ['BRUK','saft, syltetøy, blandet med andre bær'],
    ['STATUS','livskraftig og svært vanlig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Krekling er en vintergrønn dvergbusk som brer seg i matter over store arealer. Den skiller ut stoffer som hemmer spiring hos andre planter, og kan derfor dominere vidda nesten alene i flere tiår. Mattene brytes opp av brann, som gir andre arter en sjanse igjen. Bladene er smale og rullet sammen for å spare vann i vind og kulde.'},
    { t:'KJENN DEN IGJEN',
      b:'Tette, mørke matter av korte, nålaktige blad langs krypende stengler, og svarte, blanke bær rett på stengelen. Bæret smaker vannaktig og mildt, uten den syrligheten blåbær og tyttebær har.'},
    { t:'MENNESKE OG ART',
      b:'Krekling er en viktig vinterkost for rype og en del av det tradisjonelle bærgrunnlaget i nord, ofte blandet med andre bær for smakens skyld. Der kreklingmattene dominerer, blir rekrutteringen av bjørk og annen vegetasjon dårligere, og det påvirker hele beitegrunnlaget i fjellet.'},
  ],
  funfacts:[
    'Kreklingen driver kjemisk krigføring: stoffer fra bladene hemmer spiring og soppsamarbeid hos konkurrentene.',
    'En sammenhengende kreklingmatte kan være over hundre år gammel.',
    'Bæret inneholder mye fargestoff og brukes til å gi farge til saft av andre bær.',
    'Krekling finnes både på Svalbard og i Sør-Norge, og også på den sørlige halvkule.',
  ],
},

skrubbaer: {
  intro:'Skrubbæret lurer øyet. Det som ser ut som fire hvite kronblad er egentlig blad, og den ekte blomsten er den lille svarte klasen i midten.',
  tall:[
    ['HØYDE','10–25 cm'],
    ['BLOMSTRING','juni–juli'],
    ['BÆR','røde, modne i august'],
    ['VOKSESTED','fjellhei, fuktig lyngmark, kystnær hei'],
    ['FAMILIE','kornellfamilien'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Skrubbæret er en liten flerårig plante som sprer seg med utløpere under mosen. Den svarte klasen i midten er en samling ekte blomster, og de fire hvite flikene rundt er høyblad som gjør det hele synlig for insekter. Planten trives i fuktig, kjølig lyngmark og finnes både i fjellet og ned mot kysten i nord.'},
    { t:'KJENN DEN IGJEN',
      b:'Fire brede blad i kors på stengelen og den karakteristiske hvite firkanten med svart midte. Etter blomstringen kommer små, klare røde bær i klase.'},
    { t:'MENNESKE OG ART',
      b:'Bærene er spiselige, men melne og nesten uten smak, og har vært brukt som drøye i grøt og i blandinger. Planten er i slekt med kornelltrærne som dyrkes i hager. Den tåler tråkk dårlig og forsvinner raskt fra stinære partier.'},
  ],
  funfacts:[
    'Blomsten åpner seg eksplosivt: når et insekt berører den, spretter pollenbærerne opp og kaster pollen på besøkeren.',
    'De hvite kronbladene er egentlig høyblad, altså omdannede blad.',
    'Planten kalles også hønsebær i deler av landet.',
    'Skrubbær finnes både i Skandinavia og i Nord-Amerika og Øst-Asia.',
  ],
},

dvergbjork: {
  intro:'Dvergbjørka er et helt tre i miniatyr. Den holder seg under snødekket om vinteren og slipper unna frostbrann og vind.',
  tall:[
    ['HØYDE','20–80 cm, sjelden over en meter'],
    ['BLAD','runde, 5–15 mm, med butt tannet kant'],
    ['VOKSESTED','myr, fjellhei, tundra'],
    ['UTBREDELSE','fjellet i hele landet, nordlige strøk'],
    ['BRUK','beite for rein og rype'],
    ['STATUS','livskraftig, i spredning med varmere klima'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Dvergbjørka vokser lavt og tett, akkurat lavt nok til å være dekket av snø hele vinteren. Snøen isolerer mot de verste temperaturene og mot uttørking i vind, som er den virkelige trusselen i fjellet. Den tåler surt og vått, og er derfor vanlig både på myr og på tørre rabber der snøen legger seg.'},
    { t:'KJENN DEN IGJEN',
      b:'Små, nesten runde blad med butte tenner langs kanten, på stive, forgreinede, brune kvister. Om høsten farges mattene knallrøde og oransje og setter farge på hele vidda.'},
    { t:'MENNESKE OG ART',
      b:'Dvergbjørk er viktig vinterbeite for rype, som lever av knopper og skudd. Med varmere klima brer dvergbjørk og vier seg oppover og utover i fjellet, en prosess som kalles forbusking av tundraen, og som endrer beitene for både rein og fugl.'},
  ],
  funfacts:[
    'Dvergbjørka er i slekt med vanlig bjørk og lager de samme raklene, bare i miniformat.',
    'Den kan bli flere tiår gammel selv om den bare er knehøy.',
    'Røde dvergbjørkmatter er en stor del av høstfargene på vidda.',
    'Arten finnes helt til Svalbard, der den kryper langs bakken i noen få centimeters høyde.',
  ],
},

/* ============================================================ FJORDEN */
oter: {
  intro:'Oteren er et mårdyr som har flyttet inn i sjøen. Den fisker i fjæra, hviler på land, og trenger ferskvann å skylle pelsen i for å holde varmen.',
  tall:[
    ['KROPP','60–90 cm, hale 30–45 cm'],
    ['VEKT','6–12 kg'],
    ['LEVETID','5–10 år'],
    ['MAT','fisk, krabbe, skjell, sjøfugl'],
    ['HVOR','kysten fra Vestlandet til Finnmark, ferskvann i innlandet'],
    ['STATUS','i framgang etter kraftig nedgang'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Oteren jakter i dykk på et halvt til ett minutt og tar fisk nær bunnen. Den er mest aktiv i skumringen og natta, og har flere hvileplasser i huler og under røtter langs strandsonen. Ungene fødes i hi og lærer å svømme av mora; de er faktisk redde for vann i starten.'},
    { t:'KJENN DEN IGJEN',
      b:'Lang, strømlinjeformet kropp, tykk halerot og svømmehud mellom tærne. På land går den med krum rygg og lav profil. Sportegn er glidespor i snø og gjørme, og ekskrementer med fiskebein og skjellrester på faste steiner.'},
    { t:'MENNESKE OG ART',
      b:'Oteren ble jaktet for pelsen og nesten utryddet i Sør-Norge, og ble fredet i 1982. Den er på vei tilbake nordfra. Den største dødsårsaken i dag er drukning i fiskeredskap: teiner og ruser uten sperre tar oter hvert år.'},
  ],
  funfacts:[
    'Oteren har rundt 50 000 hår per kvadratcentimeter. Pelsen holder et luftlag inntil huden, så huden blir aldri våt.',
    'Saltvann ødelegger isolasjonen. Kystoter må skylle seg i ferskvann jevnlig, og tilgang på bekker styrer hvor den kan bo.',
    'Værhårene kjenner trykkbølger fra fisk i mørkt vann, så oteren jakter uten å se byttet.',
    'Oteren spiser 1–1,5 kilo fisk om dagen, rundt 15 prosent av egen kroppsvekt.',
  ],
},

torsk: {
  intro:'Torsken er Norges viktigste fisk, økonomisk og historisk. Skreien som gyter i Lofoten hver vinter er grunnlaget for tørrfisk, handelsbyer og hele kystsamfunn.',
  tall:[
    ['LENGDE','vanligvis 40–100 cm, sjelden over 150 cm'],
    ['VEKT','2–10 kg vanlig, rekord over 50 kg'],
    ['LEVETID','opptil 20–25 år'],
    ['MAT','lodde, sild, reker, krabbe, småfisk'],
    ['HVOR','Barentshavet, Norskehavet og langs hele kysten'],
    ['STATUS','skrei er i god forfatning, kysttorsk i sør er svak'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Nordøstarktisk torsk vokser opp i Barentshavet og svømmer hver vinter sørover for å gyte. Egg og larver driver nordover med kyststrømmen tilbake til oppvekstområdene, så hele livssyklusen er en runddans i havet. Kysttorsken blir derimot stort sett på plass i én fjord hele livet, og er en egen, mer utsatt bestand.'},
    { t:'KJENN DEN IGJEN',
      b:'Tre ryggfinner, tydelig skjeggtråd under kjeven, lys sidelinje og overbitt. Kysttorsk er ofte mørkere og rødbrun, skrei lysere og sølvgrå. Sei har rett sidelinje og underbitt, hyse har svart flekk over brystfinnen.'},
    { t:'MENNESKE OG ART',
      b:'Tørrfisk fra Lofoten har vært eksportvare siden vikingtid, og var Norges største handelsvare i middelalderen. I dag styres fisket med kvoter fastsatt i samarbeid med Russland. Kysttorsken sør for Stad er så svak at det er innført egne fredningsområder og begrensninger.'},
  ],
  funfacts:[
    'Skreien svømmer 800–1 000 km fra Barentshavet til Lofoten hver vinter for å gyte.',
    'En stor hunntorsk gyter flere millioner egg, fordelt over mange porsjoner gjennom noen uker.',
    'Alderen leses av øresteinene, som har årringer omtrent som et tre.',
    'Torsken bruker svømmeblæra til å lage trommelyd under gytingen.',
  ],
},

steinkobbe: {
  intro:'Steinkobben er selen du ser på skjærene når det er fjære. Den er stasjonær, nysgjerrig og lever hele livet innenfor noen få titalls kilometer.',
  tall:[
    ['LENGDE','1,3–1,8 m'],
    ['VEKT','65–150 kg'],
    ['LEVETID','25–35 år'],
    ['MAT','fisk som sei, torsk, sild og flyndre'],
    ['HVOR','hele kysten, i kolonier på skjær og sandbanker'],
    ['STATUS','forvaltet med kvoter, norsk bestand rundt 7 000 dyr'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Steinkobben hviler, soler seg og skifter hår på faste skjær som kommer opp ved fjære sjø, og går på vannet når det flør. Den dykker gjerne til 50–100 meter etter fisk. Ungene fødes i juni og juli på land, og til forskjell fra grønlandssel kan de svømme nesten med en gang.'},
    { t:'KJENN DEN IGJEN',
      b:'Rundt hode med kort, katteaktig snute og V-formede nesebor. Havert er større, med langt, rett hodeprofil og parallelle nesebor. Steinkobben ligger ofte i banan-stilling med hode og bakkropp løftet.'},
    { t:'MENNESKE OG ART',
      b:'Steinkobbe konkurrerer med fiskeriene og er vert for kveisparasitten, og derfor er det jaktkvoter. Bestanden ble kraftig redusert av virusepidemier i Nord-Europa i 1988 og 2002. Selunger som ligger alene på land er som regel ikke forlatt, og skal ikke flyttes.'},
  ],
  funfacts:[
    'Steinkobben kan holde pusten i nesten en halvtime og sove under vann mellom pust.',
    'Under dykk faller pulsen kraftig og blodet styres til hjerne og hjerte. Det kalles dykkerefleksen.',
    'Værhårene kjenner virvlene en fisk legger etter seg, så selen kan spore bytte i mørke.',
    'Flekkmønsteret er unikt for hvert dyr, og brukes til å kjenne igjen individer i kolonier.',
  ],
},

tare: {
  intro:'Tareskogen er havets regnskog. Stortare danner metershøye skoger på bunnen langs hele kysten, og gir husrom til tusenvis av arter.',
  tall:[
    ['HØYDE','1–3 m, enkelte over 4 m'],
    ['ALDER','10–20 år'],
    ['VOKSESTED','bølgeutsatt hardbunn ned til 20–30 m dyp'],
    ['VEKST','nytt blad hver vår, gammelt blad felles'],
    ['BRUK','alginat, gjødsel, fôr, mat'],
    ['STATUS','livskraftig i sør, beitet ned av kråkeboller i nord'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Stortare har en fot som klorer seg fast i berget, en stiv stilk og et flikete blad øverst. Den er ikke en plante men en brunalge, og henter all næring fra sjøvannet rundt seg. Hver vår lages et nytt blad i skjøten mellom stilk og gammelt blad, og det gamle rives av i vinterstormene.'},
    { t:'KJENN DEN IGJEN',
      b:'Grovt, mørkt olivenbrunt blad delt i brede fliker, og en ru stilk som ofte er dekket av små alger og dyr. Sukkertare har glatt, krusete blad uten delte fliker og står roligere til.'},
    { t:'MENNESKE OG ART',
      b:'Tare høstes med trål langs kysten og brukes til alginat, som finnes i alt fra iskrem til tannkrem og sårbandasje. I Nordland, Troms og Finnmark har nedbeiting fra kråkeboller lagt store tareskoger øde i flere tiår; i sør er skogene i bedre stand. Tare er også et voksende felt innen dyrking av mat og fôr.'},
  ],
  funfacts:[
    'Tareskogen langs norskekysten er blant havets mest artsrike naturtyper. Én tareplante kan huse over hundre arter.',
    'Stortarens fot kan holde igjen i bølger som slår med flere tonn kraft.',
    'Alginat fra tare gjør at iskrem ikke blir kornete og at sårbandasjer holder fukt.',
    'Tare vokser raskere enn nesten alle landplanter, og binder store mengder CO2 mens den gjør det.',
  ],
},

havert: {
  intro:'Haverten er den største selen som yngler i Norge. Hannen kan bli tre meter lang, og ungene fødes hvite på land om høsten.',
  tall:[
    ['LENGDE','hunn 1,8–2 m, hann 2,3–3 m'],
    ['VEKT','hunn 150–200 kg, hann 250–350 kg'],
    ['LEVETID','25–35 år'],
    ['MAT','sei, torsk, steinbit, flatfisk'],
    ['HVOR','kolonier fra Rogaland til Finnmark, tettest i Froan og Lofoten'],
    ['STATUS','forvaltet med kvoter'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Haverten samles i kolonier på skjær og holmer om høsten for å føde. Ungene har hvit ullpels de første ukene og kan ikke svømme; de ligger på land og dier en melk med svært høyt fettinnhold, og vokser flere kilo i døgnet. Etter at mora forlater dem, skifter de pels og går på sjøen selv. Voksne haverter dykker dypt og jakter fisk nær bunnen.'},
    { t:'KJENN DEN IGJEN',
      b:'Langt, rett hodeprofil uten tydelig panne, og nesebor som står parallelt. Steinkobben er mindre, har rundt hode med kort snute og V-formede nesebor. Hannen har kraftig, rynket hals.'},
    { t:'MENNESKE OG ART',
      b:'Havert konkurrerer med fiskeriene og er hovedvert for kveisparasitten som finnes i torskefisk. Derfor er det kvotejakt. Kolonier er sårbare for forstyrrelse i yngletida om høsten, når ungene ligger forsvarsløse på land.'},
  ],
  funfacts:[
    'Havertungen tar på seg over to kilo i døgnet på melk som inneholder rundt 50 prosent fett.',
    'Hannene kjemper om plassene i kolonien og har arr og fortykket hud på halsen etter bitt.',
    'Haverten kan dykke over 200 meter og bli nede i 20 minutter.',
    'Norge har to selarter som yngler langs fastlandskysten: havert og steinkobbe.',
  ],
},

nise: {
  intro:'Nisa er verdens minste tannhval og den vanligste hvalen i norske farvann. Den finner fisk med klikkelyder langt over det vi kan høre.',
  tall:[
    ['LENGDE','1,4–1,9 m'],
    ['VEKT','50–70 kg'],
    ['LEVETID','10–20 år'],
    ['MAT','sild, sil, torskefisk, brisling'],
    ['HVOR','hele kysten, ofte inne i fjorder og nær land'],
    ['STATUS','livskraftig, men bifangst i garn er et problem'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Nisa lever i små grupper på to til fire dyr og holder seg gjerne på grunt vann nær kysten. Den har en høy stoffskiftefart og må spise nesten kontinuerlig, rundt 10 prosent av kroppsvekten daglig. Ungen fødes om sommeren og følger mora i omtrent et år. Nisa hopper sjelden og er lett å overse: du ser en liten trekantfinne rulle over overflaten og så er den borte.'},
    { t:'KJENN DEN IGJEN',
      b:'Liten, mørk hval med rund snute uten nebb og en lav, trekantet ryggfinne. Delfiner har tydelig nebb og høy, buet finne. Nisa viser aldri halen når den dykker.'},
    { t:'MENNESKE OG ART',
      b:'Den største trusselen er bifangst: nisa vikler seg inn i bunngarn og drukner. Flere tusen dyr regnes å gå tapt hvert år i norske farvann. Akustiske pingere på garn og endrede fiskemetoder er de mest aktuelle tiltakene.'},
  ],
  funfacts:[
    'Nisa lager klikkelyder over 100 kHz, langt over menneskets hørselsgrense, og bruker ekkoet til å se med lyd.',
    'De høyfrekvente lydene er trolig en måte å unngå spekkhoggere på, som ikke hører så høyt.',
    'Nisa må puste flere ganger i minuttet og kan ikke sove som oss. Halve hjernen hviler om gangen.',
    'Den svømmer ofte langt inn i fjorder og opp i elvemunninger etter fisk.',
  ],
},

laks: {
  intro:'Laksen vokser seg stor i havet og finner tilbake til sin egen elv for å gyte. Villaksen er både nasjonalsymbol og forvaltningskonflikt.',
  tall:[
    ['LENGDE','50–120 cm'],
    ['VEKT','1–20 kg, storlaks over 10 kg'],
    ['LEVETID','4–8 år'],
    ['MAT','krepsdyr og fisk i havet, insekter som ungfisk'],
    ['HVOR','over 400 norske lakseelver, beiteområder i Nord-Atlanteren'],
    ['STATUS','mange bestander er svekket eller truet'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Laksen klekkes i elva og lever der i to til fem år som ungfisk. Så forvandler den seg til smolt, blir sølvblank og vandrer ut i havet, helt til områdene ved Færøyene og Grønland. Etter ett til tre år i havet vender den tilbake til den samme elva den kom fra, og gyter på grus om høsten. Mange dør etter gyting, men noen overlever og gyter flere ganger.'},
    { t:'KJENN DEN IGJEN',
      b:'Slank, sølvblank fisk med V-formet hale, smal halerot og svarte flekker mest over sidelinja. Sjøørreten er mer kvadratisk i halen, tykkere i haleroten og har flekker også under sidelinja. I gytedrakt blir hannlaksen mørk med krok på underkjeven.'},
    { t:'MENNESKE OG ART',
      b:'Villaksen er presset av lakselus og rømt oppdrettslaks som gyter i elvene og blander seg genetisk med villfisken, i tillegg til parasitten Gyrodactylus salaris, vannkraft og forsuring. Norge har en stor andel av verdens gjenværende atlantiske villaks, og elvefisket er strengt regulert med kvoter og fangstrapportering.'},
  ],
  funfacts:[
    'Laksen finner tilbake til hjemmeelva på lukt, og feiler svært sjelden.',
    'Den kan hoppe flere meter opp i fossestryk for å komme videre oppover elva.',
    'I havet vokser laksen mange ganger raskere enn den gjorde i elva, fordi maten er helt annerledes.',
    'Ungfisken i elva har tydelige mørke merker langs siden og ser ikke ut som laks i det hele tatt.',
  ],
},

sei: {
  intro:'Seien er torskefisken som går i stim og jakter i overflaten. Den står under kaikanter langs hele kysten og er den første fisken mange fanger.',
  tall:[
    ['LENGDE','40–100 cm, opptil 130 cm'],
    ['VEKT','1–10 kg, storsei mer'],
    ['LEVETID','opptil 20 år'],
    ['MAT','sild, sil, krill, småfisk'],
    ['HVOR','hele kysten og Norskehavet'],
    ['STATUS','forvaltet med kvoter, bestandene er i god forfatning'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Seien vokser opp i tareskog og på grunt vann nær land, der småseien står i stim. Etter hvert trekker den dypere og lenger ut. Voksen sei jakter aktivt i stim og driver sildestimer opp mot overflaten, ofte sammen med sjøfugl som utnytter det samme byttet. Gytingen skjer på vinteren langs Mørekysten og i Lofoten.'},
    { t:'KJENN DEN IGJEN',
      b:'Mørk rygg, sølvgrå sider, rett og lys sidelinje og underbitt, altså underkjeven stikker fram. Torsken har overbitt, buet lys sidelinje og skjeggtråd. Lyren har større øyne og kraftig buet sidelinje.'},
    { t:'MENNESKE OG ART',
      b:'Sei er en av de viktigste kommersielle artene i Norge og selges både fersk, saltet og som fiskekaker og farse. For fritidsfiskere er småsei ofte den første fangsten på en pilk fra brygga. Fisket reguleres med kvoter og redskapsbegrensninger.'},
  ],
  funfacts:[
    'Seien går i store stimer under kaikanten og jager sild opp i overflata, ofte med måker rett over.',
    'Ung sei kalles pale eller mort i mange deler av landet.',
    'Seien svømmer raskere enn torsken og jakter aktivt i vannmassene i stedet for langs bunnen.',
    'Store seistimer kan ses fra land som mørke flekker som beveger seg under overflaten.',
  ],
},

sukkertare: {
  intro:'Sukkertaren er den myke, krusete taren i fjæra. Den har forsvunnet fra store deler av Sørlandet, og er samtidig i ferd med å bli en dyrket ressurs.',
  tall:[
    ['LENGDE','1–3 m'],
    ['ALDER','2–4 år'],
    ['VOKSESTED','skjermet hardbunn ned til 20–30 m'],
    ['BLAD','udelt, krusete, uten fliker'],
    ['BRUK','mat, fôr, gjødsel, biodrivstoff'],
    ['STATUS','sterkt redusert på Sør- og Vestlandet'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Sukkertaren fester seg med en liten rotlignende fot og vokser i skjermede områder der bølgene ikke slår for hardt. Den vokser raskest på vinteren og våren når vannet er kaldt og næringsrikt. Varmt sommervann, nedslamming og begroing er tre ting den tåler dårlig, og alle tre har økt langs sørlandskysten.'},
    { t:'KJENN DEN IGJEN',
      b:'Ett langt, udelt blad med krusete kanter og en kort stilk. Stortaren er stivere, har en høy, ru stilk og et blad som er delt i brede fliker.'},
    { t:'MENNESKE OG ART',
      b:'Store sukkertareskoger langs Skagerrak er erstattet av trådalger og slam, og tapet er anslått til opp mot 80 prosent i deler av området. Samtidig dyrkes sukkertare kommersielt på tau langs kysten, til mat, fôr og industri, fordi den vokser raskt uten gjødsel eller ferskvann.'},
  ],
  funfacts:[
    'Det hvite belegget på tørket sukkertare er mannitol, et sukkeralkohol. Det er derfor den heter sukkertare.',
    'Sukkertare kan vokse flere centimeter i døgnet i gode perioder.',
    'Den dyrkes på tau i sjøen og krever verken gjødsel, ferskvann eller landareal.',
    'I Japan er nær slektninger av sukkertare grunnlaget for dashi, den klassiske kraften.',
  ],
},

grisetang: {
  intro:'Grisetangen er den lange, seige tangen i fjæra med luftblærer på rekke. Hver blære er ett år, så du kan lese alderen rett av planten.',
  tall:[
    ['LENGDE','0,5–2 m'],
    ['ALDER','10–15 år, enkelte eldre'],
    ['VOKSESTED','skjermet fjære, mellom flo og fjære'],
    ['BLÆRER','én ny per år langs hovedgreina'],
    ['BRUK','tangmel, gjødsel, fôrtilsetning'],
    ['STATUS','livskraftig'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Grisetang lever i tidevannssonen og ligger tørt hver gang det er fjære. Den tåler både uttørking, frost og saltsvingninger, og er derfor helt dominerende i skjermede fjærer. Luftblærene løfter tangen opp mot lyset når vannet stiger. Under tangmattene finnes et helt dyresamfunn av snegler, tanglus, krabber og yngel som bruker den som skjul.'},
    { t:'KJENN DEN IGJEN',
      b:'Lange, flate, olivenbrune remser uten midtribbe, med enkeltstående luftblærer med jevne mellomrom. Blæretang har blærer i par og tydelig midtribbe i remsa.'},
    { t:'MENNESKE OG ART',
      b:'Grisetang høstes langs kysten og tørkes til tangmel, som brukes i dyrefôr og gjødsel. Høsting må skje med omtanke, for planten vokser sakte og bruker mange år på å bygge seg opp igjen. Tangbeltet er samtidig et av de mest artsrike miljøene i fjæra.'},
  ],
  funfacts:[
    'Grisetang setter én luftblære i året. Teller du blærene langs hovedgreina, teller du år.',
    'Planter med over femti blærer er vanlige, altså tang som er eldre enn mange av dem som plukker den.',
    'Tangen kan miste over halvparten av vanninnholdet ved fjære og likevel komme seg helt når vannet kommer tilbake.',
    'Under tangmattene er temperaturen mye stabilere enn utenfor, og der overlever småkryp både frost og sol.',
  ],
},

alegras: {
  intro:'Ålegras er ikke tang, men en blomsterplante som har flyttet ut i havet. Engene den danner er barnehage for torskeyngel og et stort karbonlager.',
  tall:[
    ['LENGDE','30–100 cm'],
    ['BLOMSTRING','sommer, under vann'],
    ['VOKSESTED','bløtbunn på 1–10 m dyp i skjermede bukter'],
    ['SPREDNING','jordstengler og frø'],
    ['ROLLE','oppvekstområde for fiskeyngel'],
    ['STATUS','engene er en truet naturtype flere steder'],
  ],
  avsnitt:[
    { t:'SLIK LEVER DEN',
      b:'Ålegras har røtter, stengler, blomster og frø, akkurat som landplanter, men hele livsløpet foregår under vann. Pollenet er langt og trådformet og driver med strømmen fra blomst til blomst. Plantene binder sammen bløtbunnen med jordstengler, demper bølger og hindrer erosjon, og danner tette enger der yngel kan gjemme seg.'},
    { t:'KJENN DEN IGJEN',
      b:'Lange, smale, gressgrønne blad som bøyer seg med strømmen, festet i sand eller mudder. I motsetning til tang står ålegras i bløt bunn og ikke på stein, og bladene er tydelig grønne, ikke brune.'},
    { t:'MENNESKE OG ART',
      b:'Ålegrasenger er blant de mest verdifulle grunne naturtypene vi har, og de er presset av mudring, utfylling, brygger, ankring og nedslamming. Tapet rammer torskeyngel og annen fisk direkte. Restaurering av enger prøves ut flere steder langs kysten.'},
  ],
  funfacts:[
    'Ålegras lagrer karbon i bunnsedimentet langt raskere per kvadratmeter enn en skog på land gjør i jorda.',
    'Pollenet er trådformet og flyter med strømmen, en av få planter i verden som pollineres under vann.',
    'Tørket ålegras ble brukt som isolasjon i vegger og som madrassfyll, og holder seg i over hundre år.',
    'En ålegraseng kan bestå av kloner som har levd i flere hundre år.',
  ],
},

};

/* ==========================================================================
   PANELET
   LES MER apner et ark over skjermen. Innholdet tegnes fra ARTIKLER, og all
   tekst gaar gjennom esc() slik at ingen datastreng kan bryte oppmerkingen.
   ========================================================================== */
const ARTIKKEL = (() => {
'use strict';

const $  = s => document.querySelector(s);
const VM = () => window.VM || null;

const esc = s => String(s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;');

function har(id){ return !!ARTIKLER[id]; }

function tegn(a, sp){
  const deler = [];

  deler.push(`<p class="art-intro">${esc(a.intro)}</p>`);

  if(a.tall && a.tall.length){
    deler.push(`<h4 class="art-bolk">NØKKELTALL</h4>
      <dl class="art-tall">${a.tall.map(([n,v]) =>
        `<div class="art-tall-rad"><dt>${esc(n)}</dt><dd>${esc(v)}</dd></div>`
      ).join('')}</dl>`);
  }

  for(const av of (a.avsnitt || [])){
    deler.push(`<h4 class="art-bolk">${esc(av.t)}</h4>
      <p class="art-tekst">${esc(av.b)}</p>`);
  }

  if(a.funfacts && a.funfacts.length){
    deler.push(`<h4 class="art-bolk art-bolk-gull">FUNFACTS</h4>
      <ul class="art-fakta">${a.funfacts.map(f =>
        `<li>${esc(f)}</li>`).join('')}</ul>`);
  }

  deler.push(`<p class="art-fot">${esc(sp.kind === 'dyr' ? 'DYR' : 'PLANTE')}
    &middot; ${esc((AREAS.find(o => o.id === sp.omrade) || {}).navn || '')}
    &middot; ${'★'.repeat(sp.sjelden)}</p>`);

  return deler.join('');
}

function vis(id){
  const sp = SPECIES_BY_ID[id];
  const a  = ARTIKLER[id];
  if(!sp || !a) return;
  let navn = sp.navn;
  try { navn = VM().visningsNavn(id); } catch(e){}
  $('#artNavn').textContent = navn;
  $('#artSci').textContent  = sp.sci;
  const rull = $('#artRull');
  rull.innerHTML = tegn(a, sp);
  rull.scrollTop = 0;
  const ark = $('#artArk');
  ark.hidden = false;
  ark.classList.remove('inn'); void ark.offsetWidth; ark.classList.add('inn');
}

function lukk(){ $('#artArk').hidden = true; }
function erApen(){ return !$('#artArk').hidden; }

/* ---------------------------------------------------------- hendelser
   Knappene bærer artsId i data-mer. Detaljskjermen og kartkortet setter
   den selv naar de tegnes. */
document.addEventListener('click', e => {
  const knapp = e.target.closest('[data-mer]');
  if(knapp){
    const id = knapp.dataset.mer;
    if(!id || !har(id)) return;
    VM()?.LYD?.klikk(); VM()?.dirr?.(12);
    vis(id);
    return;
  }
  if(e.target.closest('#artLukk') || e.target.closest('#artArkBak')){
    VM()?.LYD?.klikk();
    lukk();
  }
});
document.addEventListener('keydown', e => {
  if(e.key === 'Escape' && erApen()) lukk();
});

return { vis, lukk, har, erApen };
})();

/* const-navn havner ikke pa window. Kartet og app.js sjekker window.ARTIKKEL,
   sa den maa legges ut eksplisitt. */
window.ARTIKKEL = ARTIKKEL;
