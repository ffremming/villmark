/* Runs species.js and cards.js in a vm context and checks the deck that the
   lawn builds: the level-carrying card ids, the cost ladder they climb, and
   which specimens are allowed to become cards at all. */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROT = path.join(__dirname, '..');
const les = f => fs.readFileSync(path.join(ROT, f), 'utf8');

let feil = 0;
const sjekk = (ok, hva) => { if(!ok){ feil++; console.log('FEIL: ' + hva); } else console.log('ok  - ' + hva); };

/* ---------------------------------------------------------- harness */
/* const-ene i de to filene ligger i skriptets eget skop, ikke paa
   kontekstobjektet, saa siste uttrykk gir oss taket paa dem. */
const ctx = vm.createContext({ console, Math, JSON, Set, Map, Array, Object, Number, isFinite });
const K = vm.runInContext(les('species.js') + '\n' + les('cards.js') + `
;({ SPECIES, SPECIES_BY_ID, KORTBASE, LEDERE, REGLER, KOSTKURVE,
    kortAv, kortIdFor, delKortId, kortKost, kortKraft,
    byggDekkStokk, dekkbareEksemplarer, dekkMinst, byggAiStokk, byggStokk,
    fyllStokk });`, ctx);

const ex = (uid, art, niva, x) =>
  ({ uid, art, niva, variant:null, x: x === undefined ? 0 : x, z: x === undefined ? 0 : x });

/* ---------------------------------------------------------- card ids */
{
  sjekk(K.kortIdFor('rev', 1) === 'rev', 'nivaa 1 beholder den bare arts-id-en');
  sjekk(K.kortIdFor('rev', 3) === 'rev@3', 'hoyere nivaa henger paa id-en');

  const a = K.delKortId('rev');
  const b = K.delKortId('rev@4');
  sjekk(a.artId === 'rev' && a.niva === 1, 'en bar arts-id leses som nivaa 1');
  sjekk(b.artId === 'rev' && b.niva === 4, 'nivaaet leses ut igjen');

  sjekk(K.kortAv('rev') === K.KORTBASE.rev, 'nivaa 1 kommer rett fra kortbasen');
  sjekk(K.kortAv('rev@3').artId === 'rev' && K.kortAv('rev@3').niva === 3,
    'et nivaakort bygges ved forste oppslag');
  sjekk(K.kortAv('rev@3') === K.kortAv('rev@3'),
    'og blir liggende, saa to oppslag gir samme kort');
  sjekk(K.kortAv('finnesikke@2') === undefined, 'ukjent art gir ingen kort');
  sjekk(K.kortAv('finnesikke') === undefined, 'ukjent id gir ingen kort');
}

/* ---------------------------------------------------------- the cost ladder */
{
  const sp = K.SPECIES_BY_ID.rev;
  const kost = n => K.kortKost(sp, n);
  sjekk(kost(1) === K.KORTBASE.rev.kost, 'nivaa 1 koster det kortbasen sier');

  let synker = false, forrige = kost(1);
  for(let n = 2; n <= 12; n++){
    if(kost(n) < forrige) synker = true;
    forrige = kost(n);
  }
  sjekk(!synker, 'kosten faller aldri naar nivaaet stiger');

  const tak = K.KOSTKURVE[K.KOSTKURVE.length - 1][1];
  sjekk(kost(40) === tak, 'stigen stopper paa den dyreste kosten');
  sjekk(K.kortKraft(sp, 40) > K.kortKraft(sp, 1), 'et hoyt nivaa gir mer kraft');
  sjekk(K.kortKraft(sp, 40) === K.kortKraft(sp, 80),
    'over taket gir nivaaet ikke mer kraft');

  /* et VERN staar to hakk over kraftkurven - det skal ogsaa gjelde
     nivaakortene, ellers blir et oppgradert VERN svakere enn et nytt */
  const vern = K.SPECIES.find(s => K.KORTBASE[s.id].nokler.includes('VERN'));
  sjekk(K.kortAv(K.kortIdFor(vern.id, 3)).kraft
      > K.kortAv(vern.id).kraft, 'et oppgradert VERN beholder paaslaget sitt');
}

/* ---------------------------------------------------------- what may be a card */
{
  const plen = [
    ex(1, 'rev',   1),
    ex(2, 'rev',   3),
    ex(3, 'ekorn', 1),
    ex(4, 'bjorn', 1, null),      // ikke satt ut enda
    { uid:5, art:'finnesikke', niva:1, variant:null, x:0, z:0 },
  ];

  const ute = K.dekkbareEksemplarer(plen);
  sjekk(ute.length === 3, 'bare eksemplarer som staar ute teller');
  sjekk(!ute.some(e => e.uid === 4), 'et eksemplar som venter paa aa bli satt ut er ikke med');
  sjekk(!ute.some(e => e.uid === 5), 'en art som ikke finnes kastes');

  const alt = K.byggDekkStokk(plen, null);
  sjekk(alt.join(',') === 'rev,rev@3,ekorn',
    'uten valg blir alt som staar ute til kort, hvert paa sitt nivaa');

  const valgt = K.byggDekkStokk(plen, new Set([1, 3]));
  sjekk(valgt.join(',') === 'rev,ekorn', 'et fravalgt eksemplar blir ikke kort');
  sjekk(K.byggDekkStokk(plen, new Set()).length === 0, 'et tomt valg gir et tomt dekk');
  sjekk(K.byggDekkStokk([], null).length === 0, 'en tom plen gir et tomt dekk');
  sjekk(K.byggDekkStokk(undefined, null).length === 0, 'ingen plen gir et tomt dekk');

  /* to eksemplarer av samme art paa samme nivaa er to like kort: kopitaket
     fra planstokken gjelder ikke her */
  const seksRev = K.byggDekkStokk([1,2,3,4,5,6].map(u => ex(u, 'rev', 1)), null);
  sjekk(seksRev.length === 6 && seksRev.every(id => id === 'rev'),
    'seks rever paa plenen er seks rev-kort, uansett kopitaket');

  /* hvert kort i dekket maa kunne slaas opp igjen */
  sjekk(alt.every(id => K.kortAv(id)), 'hvert kort i dekket finnes i kortbasen');
}

/* ---------------------------------------------------------- deck size */
{
  for(const leder of K.LEDERE){
    const minst = K.dekkMinst(leder);
    sjekk(minst > leder.liv + K.REGLER.apningshand,
      'minstedekket mot ' + leder.navn + ' har kort igjen etter hand og liv');
  }
  const mest = K.LEDERE.reduce((a,b) => a.liv > b.liv ? a : b);
  const minst = K.LEDERE.reduce((a,b) => a.liv < b.liv ? a : b);
  sjekk(K.dekkMinst(mest) >= K.dekkMinst(minst),
    'en leder med flere liv krever et storre dekk');
}

/* ---------------------------------------------------------- the machine */
{
  const leder = K.LEDERE[0];
  for(const n of [1, 14, 50, 137]){
    const ai = K.byggAiStokk(leder, n);
    sjekk(ai.length === n, 'maskinen stiller med ' + n + ' kort naar du gjor det');
    sjekk(ai.every(id => K.kortAv(id)), 'alle maskinens kort finnes (' + n + ')');
  }
  sjekk(K.byggAiStokk(leder, 137).length > K.byggStokk(leder).length,
    'planstokken forlenges naar plenen din er stoerre enn den');
}

/* ---------------------------------------------------------- padding */
{
  sjekk(K.fyllStokk(['rev'], 14).length === 14 &&
        K.fyllStokk(['rev'], 14).every(id => id === 'rev'),
    'ett kort gaar rundt om igjen til stokken er stor nok');
  sjekk(K.fyllStokk(['rev','hare'], 5).join(',') === 'rev,hare,rev,hare,rev',
    'flere kort gaar rundt i samme rekkefolge');
  sjekk(K.fyllStokk(['rev','hare','gran'], 2).join(',') === 'rev,hare',
    'en for stor kilde klippes ned');
  sjekk(K.fyllStokk([], 14).length === 0, 'tom kilde gir tom stokk');
  sjekk(K.fyllStokk(['rev'], 0).length === 0, 'null kort gir tom stokk');
}

console.log(feil ? '\n' + feil + ' dekksjekker feilet' : '\nAlle dekksjekker gikk gjennom');
process.exit(feil ? 1 : 0);
