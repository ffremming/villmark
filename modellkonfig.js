/* VILLMARK - hvor artsmodellene ligger.

   Egen fil fordi bade index.html og diagnose.html trenger den. Sto adressen
   bare i index.html, testet diagnosesiden mot plassholderen og meldte 401 paa
   noe som aldri var feil.

   Modellene ligger utenfor repoet: 150 MB binaerfiler odelegger GitHub Pages,
   og hver ny versjon ville ligget igjen i git-historikken for alltid.
   Kjor tools/export_*.py og last opp med `hf upload`. Star adressen tom,
   faller spillet tilbake til simulert skann. */

if(window.KLASSIFISER){
  KLASSIFISER.base = 'https://huggingface.co/ffremming/villmark-modeller/resolve/main/';
}
