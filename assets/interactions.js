/* interactions.js — shared landing-page micro-interactions for the standalone
   Jurisdiction pages: scroll-reveal, pointer-glow, and bento-card tilt.
   Ported from app.js so the new pages match index.html's feel without pulling
   in app.js's index-only wiring. Safe on any page (null/empty-guarded). */
(function () {
  "use strict";
  var PERF = window.__PERF || {};
  var reduce = PERF.reduce != null ? PERF.reduce
    : (window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches);
  var COARSE = !!PERF.coarse;

  /* ---- scroll reveal (.reveal -> .in) ---- */
  function initReveal() {
    var reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;
    if (reduce || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "-40px" });
    reveals.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      if (document.querySelectorAll(".reveal.in").length === 0) {
        reveals.forEach(function (el) { el.classList.add("in"); });
      }
    }, 1600);
  }

  /* ---- pointer glow (CSS var --mx/--my on glassy targets) ---- */
  function initGlow() {
    if (COARSE) return;
    var GLOW_SEL = ".btn,.bento-card,.lg,.nav-inner,.jx-memo,.jx-svc-row";
    var glowEl = null;
    var clearGlow = function (el) { el.style.setProperty("--mx", "-999px"); el.style.setProperty("--my", "-999px"); };
    var pmEvt = null, pmQueued = false;
    var apply = function () {
      pmQueued = false;
      var e = pmEvt; if (!e) return;
      var el = e.target && e.target.closest ? e.target.closest(GLOW_SEL) : null;
      if (glowEl && glowEl !== el) { clearGlow(glowEl); glowEl = null; }
      if (!el) return;
      glowEl = el;
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
      el.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
    };
    document.addEventListener("pointermove", function (e) {
      pmEvt = e; if (pmQueued) return; pmQueued = true; requestAnimationFrame(apply);
    }, { passive: true });
    document.addEventListener("pointerleave", function () { if (glowEl) { clearGlow(glowEl); glowEl = null; } });
  }

  /* ---- bento-card tilt + grow + border-glow position ---- */
  function initTilt(root) {
    if (COARSE) return;
    (root || document).querySelectorAll(".bento-card").forEach(function (card) {
      if (card.__tilt) return; card.__tilt = true;
      var cEvt = null, cQueued = false;
      var apply = function () {
        cQueued = false;
        var e = cEvt; if (!e) return;
        var r = card.getBoundingClientRect();
        var mx = e.clientX - r.left, my = e.clientY - r.top;
        card.style.setProperty("--card-mouse-x", mx.toFixed(1) + "px");
        card.style.setProperty("--card-mouse-y", my.toFixed(1) + "px");
        if (reduce) return;
        var px = mx / r.width - 0.5, py = my / r.height - 0.5;
        card.style.setProperty("--card-rot-x", (py * -6).toFixed(2) + "deg");
        card.style.setProperty("--card-rot-y", (px * 6).toFixed(2) + "deg");
        card.style.setProperty("--card-shift-x", (px * 10).toFixed(2) + "px");
        card.style.setProperty("--card-shift-y", (py * 10).toFixed(2) + "px");
      };
      card.addEventListener("pointermove", function (e) {
        cEvt = e; if (cQueued) return; cQueued = true; requestAnimationFrame(apply);
      }, { passive: true });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--card-rot-x", "0deg");
        card.style.setProperty("--card-rot-y", "0deg");
        card.style.setProperty("--card-shift-x", "0px");
        card.style.setProperty("--card-shift-y", "0px");
      });
    });
  }

  // expose so renderers can re-bind tilt/reveal on dynamically inserted cards
  window.Interactions = { initReveal: initReveal, initGlow: initGlow, initTilt: initTilt, refresh: function (root) { initTilt(root); initReveal(); } };

  if (document.readyState !== "loading") boot();
  else document.addEventListener("DOMContentLoaded", boot);
  function boot() { initGlow(); initTilt(); initReveal(); }
})();
