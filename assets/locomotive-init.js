/* locomotive-init.js — Locomotive Scroll v5 (Lenis-based) smooth scrolling.
   v5 preserves NATIVE scroll position, so position:fixed (the globe layer),
   position:sticky, IntersectionObserver and every scrollY-driven effect on the
   page keep working — Lenis only smooths the wheel/touch delta. We enable it
   ONLY on capable devices; low-spec / reduced-motion keep crisp native scroll
   (matches the performance budget). Vendored locally (Lenis inlined). */
import LocomotiveScroll from "./vendor/locomotive-scroll.bundle.js";

(function () {
  "use strict";
  var PERF = window.__PERF || {};
  if (PERF.low || PERF.reduce) return;     // native scroll on constrained devices

  var loco;
  try {
    loco = new LocomotiveScroll({
      lenisOptions: {
        lerp: 0.085,          // smoothing factor — lower = silkier, more "weight"
        duration: 1.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
        gestureOrientation: "vertical"
      }
    });
  } catch (e) { return; }

  var lenis = loco.lenisInstance || null;
  window.__loco = loco;
  window.__lenis = lenis;

  if (lenis) {
    // pause smooth-scroll while a modal is open (the page is overflow:hidden then)
    var sync = function () {
      if (document.documentElement.classList.contains("csm-open")) lenis.stop();
      else lenis.start();
    };
    new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    // also pause when the tab is hidden
    document.addEventListener("visibilitychange", function () { if (document.hidden) lenis.stop(); else if (!document.documentElement.classList.contains("csm-open")) lenis.start(); });
  }
})();
