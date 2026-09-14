# Tester

Fem selvstendige testfiler. Ingen avhengigheter utenfor Node og Chrome.

## `dekk.test.js`

Kjører `species.js` og `cards.js` i en `vm`-kontekst og dekker kortstokken som
plenen bygger: at nivået ligger i kort-id-en og kan leses ut igjen, at et
nivåkort bygges ved første oppslag og blir liggende, at kosten stiger med
nivået og stopper på toppen av kurven, at bare eksemplarer som faktisk står
ute blir kort, at fravalg virker, og at maskinen stiller med like mange kort
som du gjør.

```sh
node test/dekk.test.js
```

## `store.test.js`

Kjører `store.js` i en `vm`-kontekst med en påtatt `localStorage`. Dekker at en
plen kommer tilbake slik den ble lagret, at uid-tellerne klarer alt som står på
plenen, at ødelagt eller ukjent lagring kastes uten å røre plenen, og at
ingenting skrives mens du står på en annen spillers plen. Dekker også dekket:
at uid-ene kommer tilbake, at en uid som ikke finnes lenger blir luket bort,
og at en plen lagret før dekkvelgeren får alt den eier i dekket.

```sh
node test/store.test.js
```

## `protokoll.test.js`

Kjører to kortspillmotorer i hver sin `vm`-kontekst og lar dem spille en hel
kamp mot hverandre gjennom et stubbet nettlag. Verifiserer speilvending av
brettet, at gjestens hånd holdes skjult, at handlinger og spørsmål kommer fram
begge veier, og at begge sider ender med samme resultat.

```sh
node test/protokoll.test.js
```

Motorens animasjonspauser fjernes i sandkassen, så en full kamp tar sekunder.

## `nettleser.test.js`

Åpner spillet i tre faner i ekte Chrome og styrer dem over DevTools-protokollen.
Dekker lobbyen: spillerlista, valget mellom å besøke og å utfordre, utfordring,
merket ved navnet, godkjenning, og at begge parter havner i samme kamp med
speilvendt tur. Dekker også besøk: at gjesten ser verten sin plen, at plenen er
merket som gjesteplen, og at gjesten får sin egen plen tilbake når hen går ut.
Til slutt at plenen skrives til `localStorage` og kommer tilbake etter at sida
lastes på nytt. Sjekker også at enspillerkampen mot maskinen fortsatt virker.

```sh
node test/nettleser.test.js
```

Bruker `?fake-nett`, altså `BroadcastChannel` mellom faner. Trenger ingen
Supabase-konto.

## `supabase.test.js`

Samme flyt, men mot ekte Supabase. Starter to atskilte Chrome-profiler, siden
økt og navn ligger i `localStorage`: to faner i samme nettleser ville delt
identitet og aldri sett hverandre i lobbyen.

```sh
node test/supabase.test.js
```

Krever at `window.VILLMARK_NETT` i `index.html` har ekte nøkler, og at anonym
innlogging er slått på i prosjektet. Mangler nøklene, hopper testen over seg
selv i stedet for å feile. Hver kjøring lager et par anonyme brukere i
prosjektet.

## Felles

Alle fire skriver `Alle ... gikk gjennom` og avslutter med kode 0 når de er
grønne. Nettlesertestene krever Google Chrome på `/Applications/Google Chrome.app`,
starter en lokal filtjener selv, og rydder bort nettleserprosessene sine også
når de feiler underveis.
