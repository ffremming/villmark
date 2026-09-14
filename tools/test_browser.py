"""Runs the whole scan chain in a real browser.

    python tools/test_browser.py

This is the only test that tries what classify.js actually does on a phone:
load onnxruntime-web from the CDN, run the model in a worker with
numThreads = 1, draw the image into a canvas and read the pixels back out.
Errors in layout, normalization or label order that the Python tests cannot
see - because they compute in numpy and not in a canvas - show up here.

Needs playwright:
    pip install playwright && playwright install chromium

Serves the repo on 127.0.0.1, which is a secure context, so the Cache API and
crossOriginIsolated behave the way they do on GitHub Pages.
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

ROOT = pathlib.Path(__file__).resolve().parent.parent
IMAGES = ROOT / "tools" / "sample_images"
MODELS = ROOT / "models"


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@contextlib.contextmanager
def server(root: pathlib.Path):
    """A quiet http.server on a free port, in its own thread."""

    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *_):
            pass

    port = free_port()
    handler = functools.partial(Quiet, directory=str(root))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{port}"
    finally:
        httpd.shutdown()


# Runs inside the page. Sets the model address locally, loads the image, and
# runs the real CLASSIFIER.classify() - nothing is imitated.
SCRIPT = """
async (arg) => {
  const [base, imageUrl] = arg;
  if (!window.CLASSIFIER) return { error: 'CLASSIFIER does not exist' };
  if (!window.SPECIESMAPPING) return { error: 'SPECIESMAPPING does not exist' };
  CLASSIFIER.base = base;

  const image = new Image();
  image.crossOrigin = 'anonymous';
  await new Promise((ok, no) => {
    image.onload = ok;
    image.onerror = () => no(new Error('could not load ' + imageUrl));
    image.src = imageUrl;
  });

  const t0 = performance.now();
  try {
    const answer = await CLASSIFIER.classify(image, {
      confirmDownload: async () => true,
      found: new Set(),
    });
    return { ...answer, ms: Math.round(performance.now() - t0) };
  } catch (e) {
    return { error: String(e && e.message || e), name: e && e.name };
  }
}
"""


# Headless Chromium normally gets no GPU adapter and falls back to wasm in
# silence. Then the WebGPU path is never tested at all - and that was exactly
# where the bug sat: the WebGPU backend of onnxruntime-web 1.29 cannot handle
# per-channel quantized DequantizeLinear nodes. With VILLMARK_WEBGPU=1 the GPU
# is forced on, so the test sees the same thing a real desktop Chrome does.
GPU_ARGS = [
    "--enable-unsafe-webgpu",
    "--enable-features=Vulkan,UseSkiaRenderer",
    "--use-angle=metal",
    "--ignore-gpu-blocklist",
]


def main() -> None:
    from playwright.sync_api import sync_playwright

    if not (MODELS / "inat21.onnx").exists():
        raise SystemExit("could not find models/inat21.onnx - run the export script first")
    files = sorted(p for p in IMAGES.glob("*.jpg"))
    if not files:
        raise SystemExit(f"found no images in {IMAGES}")

    expected = {
        "fox": "fox", "moose": "moose", "flyagaric": "flyagaric",
        "chanterelle": "chanterelle", "spruce": "spruce", "birch": "birch",
        "heather": "heather", "seaeagle": "seaeagle",
    }

    with server(ROOT) as address:
        with sync_playwright() as pw:
            with_gpu = os.environ.get("VILLMARK_WEBGPU") == "1"
            browser = pw.chromium.launch(args=GPU_ARGS if with_gpu else [])
            page = browser.new_page()
            console = []
            page.on("console", lambda m: console.append(f"{m.type}: {m.text}"))
            page.on("pageerror", lambda e: console.append(f"pageerror: {e}"))

            page.goto(f"{address}/index.html", wait_until="load")
            page.wait_for_function("() => !!window.CLASSIFIER", timeout=15000)
            gpu = page.evaluate("() => !!navigator.gpu")
            print(f"WebGPU in the browser: {gpu}"
                  f"{'  (VILLMARK_WEBGPU=1)' if with_gpu else '  (set VILLMARK_WEBGPU=1 to force it on)'}")

            failures = 0
            for path in files:
                name = path.stem
                answer = page.evaluate(
                    SCRIPT, [f"{address}/models/", f"{address}/tools/sample_images/{path.name}"]
                )
                if answer.get("error"):
                    failures += 1
                    print(f"FAIL  {name}: {answer['error']}")
                    continue
                # _not_* is a laptop, a brick wall and the like: the only right
                # answer is that nothing is recognized.
                if name.startswith("_not_"):
                    ok = answer.get("id") is None
                else:
                    want = expected.get(name)
                    ok = want is None or answer.get("id") == want
                if not ok:
                    failures += 1
                print(
                    f"{'ok   ' if ok else 'FAIL '}{name:<11}-> {str(answer.get('id')):<11}"
                    f"{answer.get('levelText', ''):<20}{answer.get('p', 0) * 100:5.1f} %"
                    f"  {answer.get('ms', 0):>6} ms   {answer.get('latin', '')}"
                )

            # Without a camera the game must fall back to the simulated scan
            # and still reach the reveal screen. That is the safety net the
            # whole change rests on, so it is tested here and not only on
            # paper. Every screen has its own tab bar, so [data-go="scan"]
            # matches several hidden buttons. Go via the splash and use the
            # tab on the lawn.
            try:
                page.click("#screen-splash [data-go=\"field\"]", timeout=5000)
                page.wait_for_selector("#screen-field.active", timeout=5000)
                page.click("#screen-field [data-go=\"scan\"]")
                page.wait_for_selector("#screen-scan.active", timeout=5000)
                page.click("#scanGo")
                page.wait_for_selector("#screen-reveal.active", timeout=20000)
                print("\nok    the simulated scan without a camera reached the reveal screen")
            except Exception as e:
                failures += 1
                print(f"\nFAIL  the simulated scan without a camera: {e}")

            browser.close()

    if console:
        print("\nconsole:")
        for line in console[-15:]:
            print("  " + line)

    print(f"\n{len(files) - failures}/{len(files)} images classified correctly in the browser")
    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
