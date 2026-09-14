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
