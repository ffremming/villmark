# Tester

Tre selvstendige testfiler. Ingen avhengigheter utenfor Node og Chrome.

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
Dekker lobbyen: spillerlista, utfordring, merket ved navnet, godkjenning, og at
begge parter havner i samme kamp med speilvendt tur. Sjekker også at
enspillerkampen mot maskinen fortsatt virker.

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

Alle tre skriver `Alle ... gikk gjennom` og avslutter med kode 0 når de er
grønne. Nettlesertestene krever Google Chrome på `/Applications/Google Chrome.app`,
starter en lokal filtjener selv, og rydder bort nettleserprosessene sine også
når de feiler underveis.
