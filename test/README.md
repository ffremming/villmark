# Tests

Six standalone test files. No dependencies outside Node and Chrome.

## `deck.test.js`

Runs `species.js` and `cards.js` in a `vm` context and covers the deck the lawn
builds: that the level sits in the card id and can be read back out, that a
level card is built on the first lookup and then stays, that the cost rises
with the level and stops at the top of the curve, that only specimens actually
placed become cards, that deselecting works, and that the machine brings as
many cards as you do.

```sh
node test/deck.test.js
```

## `store.test.js`

Runs `store.js` in a `vm` context with a fake `localStorage`. Covers that a
lawn comes back the way it was saved, that the uid counters clear everything on
the lawn, that broken or unknown saves are thrown away without touching the
lawn, and that nothing is written while you are standing on another player's
lawn. Also covers the deck: that the uids come back, that a uid which no longer
exists is weeded out, and that a lawn saved before the deck editor gets
everything it owns in the deck.

```sh
node test/store.test.js
```

## `protocol.test.js`

Runs two card-game engines in separate `vm` contexts and lets them play a whole
battle against each other through a stubbed network layer. Verifies that the
board is mirrored, that the guest's hand stays hidden, that actions and
questions get through both ways, and that both sides end with the same result.
The two sides get a lawn each, so it also tests that the guest's deck reaches
the host, and that the host builds the guest's level cards itself from the card
id.

```sh
node test/protocol.test.js
```

The animation pauses of the engine are removed in the sandbox, so a full battle
takes seconds.

## `browser.test.js`

Opens the game in three tabs of a real Chrome and drives them over the DevTools
protocol. Covers the lobby: the player list, the choice between visiting and
challenging, the challenge itself, the mark next to the name, accepting, and
that both parties end up in the same battle with a mirrored turn. Also covers
visiting: that the guest sees the host's lawn, that the lawn is marked as a
guest lawn, and that the guest gets its own lawn back on the way out. Finally
that the lawn is written to `localStorage` and comes back after the page is
reloaded. Also checks that the solo battle against the machine still works.

Covers the deck editor in the lobby: that an empty lawn closes the battle and
says why, that every species placed gets a slot of its own, that a card can be
taken out and put back in, and that the battle is played with the lawn — not
with the plan deck.

```sh
node test/browser.test.js
```

Uses `?fake-net`, that is, `BroadcastChannel` between tabs. Needs no Supabase
account.

## `scan.test.js`

Opens the game in Chrome and drives the scanner. Covers that the scanner never
guesses: without a model or a camera the frame says why it got no answer, it
shows no percentage, and no species is set. Also covers `SCAN AGAIN`, which
takes the frame back to its starting position and throws the species away, and
`GIVE ME A RANDOM ONE`, which gives a species marked as a draw — with no
percentage and without the word `CERTAIN` — and which only ends up in the
collection once you press `ACCEPT MATCH`.

```sh
node test/scan.test.js
```

## `camera.test.js`

Covers the memory rule the scanner lives by on a phone: the camera must not be
running while the models are. An iPhone ran out of memory and WebKit killed the
tab right after the answer came up. So `SCAN` copies one scaled-down frame,
shuts the camera off, and puts the still in the viewfinder until `SCAN AGAIN`
brings the camera back.

Runs with Chrome's fake camera, and stubs `CLASSIFIER.classify` — a real scan
would pull 45 MB from Hugging Face.

The last checks open a second tab with `navigator.deviceMemory` forced to 2, so
`classify.js` computes `LOW_MEMORY` the way it does on a phone, and cover that
SpeciesNet stays off there: 112 MB of fp16 has no wasm kernels and the run died
inside inference on an iPhone.

```sh
node test/camera.test.js
```

## `supabase.test.js`

The same flow, but against a real Supabase. Starts two separate Chrome
profiles, since the session and the name live in `localStorage`: two tabs in
the same browser would share an identity and never see each other in the lobby.

```sh
node test/supabase.test.js
```

Requires `window.VILLMARK_NET` in `index.html` to hold real keys, and anonymous
sign-in to be switched on in the project. Without the keys the test skips
itself instead of failing. Every run creates a couple of anonymous users in the
project.

## Common

All six print `All ... passed` and exit with code 0 when they are green. The
browser tests need Google Chrome at `/Applications/Google Chrome.app`, start a
local file server themselves, and clean up their browser processes even when
they fail halfway through.
