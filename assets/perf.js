/* perf.js — shared device-tier gate. Loaded FIRST (blocking, in <head>) so every
   later script/module can read window.__PERF before it spins anything up.
   The whole point: on low-spec / small / battery-saving / reduced-motion devices
   we cut WebGL contexts, DPR, particle counts and expensive effects — while
   capable desktops are byte-for-byte unchanged. */
(function () {
  "use strict";
  var nav = navigator;
  var mm = window.matchMedia || function () { return { matches: false }; };
  var reduce = mm("(prefers-reduced-motion:reduce)").matches;
  var coarse = mm("(pointer:coarse)").matches;
  var smallVP = Math.min(window.innerWidth, window.innerHeight) < 760;
  var fewCores = (nav.hardwareConcurrency || 8) <= 4;
  var lowMem = (nav.deviceMemory || 8) <= 4;
  var saveData = !!(nav.connection && nav.connection.saveData);

  // LOW = treat as a constrained device. deviceMemory/hardwareConcurrency are
  // undefined on Safari/iOS → default 8 (capable); phones still caught by coarse+smallVP.
  var LOW = reduce || saveData || smallVP || fewCores || lowMem;
  // PHONE: a touch device with a small min-dimension. This — NOT viewport height
  // or core count — is what we use to drop heavy visuals. A short/modest desktop
  // or a tablet is NOT a phone and keeps the full experience.
  var phone = coarse && Math.min(window.innerWidth, window.innerHeight) < 700;

  window.__PERF = {
    low: LOW,
    // mobile === phone. The hero globe is dropped on phones only (CSS gradient
    // stands in); the grain/particle field runs on EVERY device; 3D card graphics
    // load on everything except phones. Tablets + desktops always get the globe.
    mobile: phone,
    reduce: reduce,
    coarse: coarse,
    saveData: saveData,
    // DPR: capable keeps native (≤2); low-power drops to 1.25 (or 1 under reduced-motion)
    dpr: LOW ? (reduce ? 1 : 1.25) : Math.min(window.devicePixelRatio || 1, 2),
    // concurrent WebGL (bento3d) contexts: phones 1, short/modest desktops 3
    // (enough for all card graphics), capable desktops 5.
    maxGfx: phone ? 1 : (LOW ? 3 : 5),
    // point-cloud density multiplier
    density: LOW ? 0.45 : 1
  };
})();
