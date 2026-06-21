/* interactions.js — shared micro-interactions for jurisdiction pages.
   Safe on any page: all element lookups are null-guarded. */
(function () {
  "use strict";
  var PERF = window.__PERF || {};
  var reduce = PERF.reduce != null ? PERF.reduce
    : (window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches);
  var COARSE = !!PERF.coarse;
  /* HOVER: does the device have ANY fine pointer (mouse/trackpad) available?
     (pointer:coarse) is true on touch-capable laptops even when a mouse is used,
     which wrongly killed every cursor effect. (any-pointer:fine) is the right test:
     true for a trackpad/mouse laptop, false for a pure touchscreen phone. */
  var HOVER = (typeof window.matchMedia !== "function") ? true
    : window.matchMedia("(any-pointer:fine)").matches;

  /* ── scroll reveal (.reveal → .in) ───────────────────────────────────── */
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
      if (document.querySelectorAll(".reveal.in").length === 0)
        reveals.forEach(function (el) { el.classList.add("in"); });
    }, 1600);
  }

  /* ── cursor spotlight (radial glow follows mouse) ─────────────────────── */
  function initCursorSpot() {
    if (!HOVER || reduce) return;
    var spot = document.createElement("div");
    spot.className = "cs-spot";
    spot.setAttribute("aria-hidden", "true");
    document.body.insertBefore(spot, document.body.firstChild);
    document.addEventListener("pointermove", function (e) {
      spot.style.setProperty("--cx", e.clientX + "px");
      spot.style.setProperty("--cy", e.clientY + "px");
    }, { passive: true });
    document.addEventListener("pointerleave", function () {
      spot.style.setProperty("--cx", "-999px");
      spot.style.setProperty("--cy", "-999px");
    }, { passive: true });
  }

  /* ── global cursor parallax (--parX / --parY on :root) ───────────────── */
  function initParallax() {
    if (reduce || !HOVER) return;
    var mX = 0, mY = 0, pX = 0, pY = 0;
    document.addEventListener("pointermove", function (e) {
      mX = (e.clientX / window.innerWidth - 0.5) * 12;
      mY = (e.clientY / window.innerHeight - 0.5) * 12;
    }, { passive: true });
    var root = document.documentElement;
    (function loop() {
      pX += (mX - pX) * 0.06;
      pY += (mY - pY) * 0.06;
      root.style.setProperty("--parX", pX.toFixed(2) + "px");
      root.style.setProperty("--parY", pY.toFixed(2) + "px");
      requestAnimationFrame(loop);
    })();
  }

  /* ── pointer glow (CSS --mx/--my on glassy / card targets) ───────────── */
  function initGlow() {
    if (!HOVER) return;
    var GLOW_SEL = ".btn,.bento-card,.lg,.nav-inner,.jx-memo,.jx-svc-row,[data-lg]";
    var glowEl = null;
    var clearGlow = function (el) {
      el.style.setProperty("--mx", "-999px");
      el.style.setProperty("--my", "-999px");
    };
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
    document.addEventListener("pointerleave", function () {
      if (glowEl) { clearGlow(glowEl); glowEl = null; }
    });
  }

  /* ── bento-card tilt + grow + border-glow (--card-mouse-x/y) ─────────── */
  function initTilt(root) {
    if (!HOVER) return;
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
        /* ±0.5 → ±6° tilt: clearly perceptible without feeling gimmicky */
        card.style.setProperty("--card-rot-x", (py * -12).toFixed(2) + "deg");
        card.style.setProperty("--card-rot-y", (px * 12).toFixed(2) + "deg");
        card.style.setProperty("--card-shift-x", (px * 14).toFixed(2) + "px");
        card.style.setProperty("--card-shift-y", (py * 14).toFixed(2) + "px");
        card.style.setProperty("--card-grow-x", Math.abs(px * 10).toFixed(2));
        card.style.setProperty("--card-grow-y", Math.abs(py * 10).toFixed(2));
      };
      card.addEventListener("pointermove", function (e) {
        cEvt = e; if (cQueued) return; cQueued = true; requestAnimationFrame(apply);
      }, { passive: true });
      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--card-rot-x", "0deg");
        card.style.setProperty("--card-rot-y", "0deg");
        card.style.setProperty("--card-shift-x", "0px");
        card.style.setProperty("--card-shift-y", "0px");
        card.style.setProperty("--card-grow-x", "0");
        card.style.setProperty("--card-grow-y", "0");
      });
    });
  }

  /* ── MutationObserver: auto-bind tilt on dynamically inserted cards ───── */
  function watchNewCards() {
    if (!("MutationObserver" in window)) return;
    var pending = false;
    var mo = new MutationObserver(function (records) {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        records.forEach(function (r) {
          r.addedNodes.forEach(function (node) {
            if (node.nodeType !== 1) return;
            /* node itself is a bento-card */
            if (node.classList && node.classList.contains("bento-card")) {
              initTilt({ querySelectorAll: function () { return [node]; } });
              return;
            }
            /* node is a container holding bento-cards */
            if (node.querySelectorAll) {
              var found = node.querySelectorAll(".bento-card");
              if (found.length) initTilt(node);
            }
          });
        });
        /* also catch newly visible reveals */
        initReveal();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  /* ── public API ───────────────────────────────────────────────────────── */
  window.Interactions = {
    initReveal: initReveal,
    initGlow: initGlow,
    initTilt: initTilt,
    initParallax: initParallax,
    refresh: function (root) { initTilt(root); initReveal(); }
  };

  if (document.readyState !== "loading") boot();
  else document.addEventListener("DOMContentLoaded", boot);

  function boot() {
    initCursorSpot();
    initGlow();
    initTilt();
    initReveal();
    initParallax();
    watchNewCards();
  }
})();
