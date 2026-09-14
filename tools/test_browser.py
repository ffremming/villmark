"""Kjorer hele skannekjeden i en ekte nettleser.

    python tools/test_nettleser.py

Dette er den eneste testen som prover det klassifiser.js faktisk gjor paa en
telefon: laste onnxruntime-web fra CDN, kjore modellen i en worker med
numThreads = 1, tegne bildet i en canvas og lese pikslene ut igjen.
Feil i layout, normalisering eller labelrekkefolge som Python-testene ikke
ser - fordi de regner i numpy og ikke i canvas - dukker opp her.

Krever playwright:
    pip install playwright && playwright install chromium

Serverer repoet paa 127.0.0.1, som er en secure context, saa Cache API og
crossOriginIsolated oppforer seg som paa GitHub Pages.
"""

from __future__ import annotations

import contextlib
import functools
import http.server
import json
import pathlib
import os
import socket
import threading

ROT = pathlib.Path(__file__).resolve().parent.parent
BILDER = ROT / "tools" / "provebilder"
MODELLER = ROT / "modeller"


def ledig_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@contextlib.contextmanager
def server(rot: pathlib.Path):
    """Stille http.server paa en ledig port, i egen traad."""

    class Stille(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *_):
            pass

    port = ledig_port()
    handler = functools.partial(Stille, directory=str(rot))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    traad = threading.Thread(target=httpd.serve_forever, daemon=True)
    traad.start()
    try:
        yield f"http://127.0.0.1:{port}"
    finally:
        httpd.shutdown()


# Kjores inne i siden. Setter modelladressen lokalt, laster bildet, og kjorer
# den ekte KLASSIFISER.klassifiser() - ingen etterligning.
SKRIPT = """
async (arg) => {
  const [base, bildeUrl] = arg;
  if (!window.KLASSIFISER) return { feil: 'KLASSIFISER finnes ikke' };
  if (!window.ARTSMAPPING) return { feil: 'ARTSMAPPING finnes ikke' };
  KLASSIFISER.base = base;

  const bilde = new Image();
  bilde.crossOrigin = 'anonymous';
  await new Promise((ok, nei) => {
    bilde.onload = ok;
    bilde.onerror = () => nei(new Error('fikk ikke lastet ' + bildeUrl));
    bilde.src = bildeUrl;
  });

  const t0 = performance.now();
  try {
    const svar = await KLASSIFISER.klassifiser(bilde, {
      bekreftNedlasting: async () => true,
      funnet: new Set(),
    });
    return { ...svar, ms: Math.round(performance.now() - t0) };
  } catch (e) {
    return { feil: String(e && e.message || e), navn: e && e.navn };
  }
}
"""


# Headless Chromium far normalt ingen GPU-adapter og faller stille til wasm.
# Da testes ikke WebGPU-stien i det hele tatt - og det var nettopp der feilen
# laa: onnxruntime-web 1.29 sin WebGPU-backend klarer ikke per-kanal-kvantiserte
# DequantizeLinear-noder. Med VILLMARK_WEBGPU=1 tvinges GPU paa, slik at testen
# ser det samme som en ekte Chrome paa skrivebordet.
GPU_ARGS = [
    "--enable-unsafe-webgpu",
    "--enable-features=Vulkan,UseSkiaRenderer",
    "--use-angle=metal",
    "--ignore-gpu-blocklist",
]


def main() -> None:
    from playwright.sync_api import sync_playwright

    if not (MODELLER / "inat21.onnx").exists():
        raise SystemExit("fant ikke modeller/inat21.onnx - kjor eksportskriptet forst")
    filer = sorted(p for p in BILDER.glob("*.jpg"))
    if not filer:
        raise SystemExit(f"fant ingen bilder i {BILDER}")

    fasit = {
        "rev": "rev", "elg": "elg", "fluesopp": "fluesopp", "kantarell": "kantarell",
        "gran": "gran", "bjork": "bjork", "rosslyng": "rosslyng", "havorn": "havorn",
    }

    with server(ROT) as adresse:
        with sync_playwright() as pw:
            med_gpu = os.environ.get("VILLMARK_WEBGPU") == "1"
            nettleser = pw.chromium.launch(args=GPU_ARGS if med_gpu else [])
            side = nettleser.new_page()
            konsoll = []
            side.on("console", lambda m: konsoll.append(f"{m.type}: {m.text}"))
            side.on("pageerror", lambda e: konsoll.append(f"pageerror: {e}"))

            side.goto(f"{adresse}/index.html", wait_until="load")
            side.wait_for_function("() => !!window.KLASSIFISER", timeout=15000)
            gpu = side.evaluate("() => !!navigator.gpu")
            print(f"WebGPU i nettleseren: {gpu}"
                  f"{'  (VILLMARK_WEBGPU=1)' if med_gpu else '  (sett VILLMARK_WEBGPU=1 for aa tvinge paa)'}")

            feil = 0
            for sti in filer:
                navn = sti.stem
                svar = side.evaluate(
                    SKRIPT, [f"{adresse}/modeller/", f"{adresse}/tools/provebilder/{sti.name}"]
                )
                if svar.get("feil"):
                    feil += 1
                    print(f"FEIL  {navn}: {svar['feil']}")
                    continue
                # _ikke_* er laptop, murvegg og liknende: eneste riktige
                # svar er at ingenting gjenkjennes.
                if navn.startswith("_ikke_"):
                    ok = svar.get("id") is None
                else:
                    ventet = fasit.get(navn)
                    ok = ventet is None or svar.get("id") == ventet
                if not ok:
                    feil += 1
                print(
                    f"{'ok   ' if ok else 'FEIL '}{navn:<11}-> {str(svar.get('id')):<11}"
                    f"{svar.get('nivaTekst', ''):<20}{svar.get('p', 0) * 100:5.1f} %"
                    f"  {svar.get('ms', 0):>6} ms   {svar.get('latin', '')}"
                )

            # Uten kamera skal spillet falle tilbake til simulert skann og
            # fortsatt naa funn-skjermen. Det er sikkerhetsnettet hele
            # endringen hviler paa, saa det testes her og ikke bare paa papiret.
            # Hver skjerm har sin egen tabbar, saa [data-go="scan"] treffer
            # flere skjulte knapper. Gaa via splash og bruk fanen paa plenen.
            try:
                side.click("#screen-splash [data-go=\"field\"]", timeout=5000)
                side.wait_for_selector("#screen-field.active", timeout=5000)
                side.click("#screen-field [data-go=\"scan\"]")
                side.wait_for_selector("#screen-scan.active", timeout=5000)
                side.click("#scanGo")
                side.wait_for_selector("#screen-reveal.active", timeout=20000)
                print("\nok    simulert skann uten kamera naadde funn-skjermen")
            except Exception as e:
                feil += 1
                print(f"\nFEIL  simulert skann uten kamera: {e}")

            nettleser.close()

    if konsoll:
        print("\nkonsoll:")
        for linje in konsoll[-15:]:
            print("  " + linje)

    print(f"\n{len(filer) - feil}/{len(filer)} bilder klassifisert riktig i nettleseren")
    raise SystemExit(1 if feil else 0)


if __name__ == "__main__":
    main()
