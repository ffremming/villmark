/* VILLMARK - where the species models live.

   Its own file because both index.html and diagnostics.html need it. With the
   address only in index.html, the diagnostics page tested against the
   placeholder and reported 401 on something that was never broken.

   The models live outside the repo: 150 MB binaries break GitHub Pages, and
   every new version would stay in the git history forever. Run tools/export_*.py
   and upload with `hf upload`. If the address is empty, the game falls back to
   a simulated scan. */

if(window.CLASSIFIER){
  CLASSIFIER.base = 'https://huggingface.co/ffremming/villmark-modeller/resolve/main/';
}
