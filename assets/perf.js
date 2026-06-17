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

  window.__PERF = {
    low: LOW,
    reduce: reduce,
    coarse: coarse,
    saveData: saveData,
    // DPR: capable keeps native (≤2); low-power drops to 1.25 (or 1 under reduced-motion)
    dpr: LOW ? (reduce ? 1 : 1.25) : Math.min(window.devicePixelRatio || 1, 2),
    // how many concurrent WebGL (bento3d) contexts we allow
    maxGfx: LOW ? (smallVP ? 1 : 2) : 5,
    // point-cloud density multiplier
    density: LOW ? 0.45 : 1
  };
})();
