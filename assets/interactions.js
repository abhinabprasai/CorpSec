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

  /* ── edge rails: fade the page-margin lines over dark sections ─────────
     Shared by every page (was index-only in app.js) so the appear/disappear
     behaviour is identical site-wide. The dark footer is included, so the
     rails always fade out as you reach the bottom of any page. */
  function initRails() {
    if (!("IntersectionObserver" in window)) return;
    var darkEls = document.querySelectorAll(".hero,.juris2,.band-dark,.band-primary,.footer");
    if (!darkEls.length) return;
    var darkState = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { darkState.set(e.target, e.isIntersecting); });
      var anyDark = false;
      darkState.forEach(function (v) { if (v) anyDark = true; });
      document.body.classList.toggle("rails-hidden", anyDark);
    }, { threshold: 0 });
    darkEls.forEach(function (el) { io.observe(el); });
  }

  /* ── count-up: animate stat numbers when they scroll into view ─────────
     Auto-detects the stat <b> elements site-wide (statband, CTA stats, about
     stats) plus anything tagged [data-count]. Parses the existing text so
     "500+", "48h", "4.9★", "1,500+" keep their prefix/suffix and formatting. */
  function initCounters() {
    var els = document.querySelectorAll(
      ".stat-item b,.jx-cta2__stats b,.about-stat b,[data-count]");
    if (!els.length) return;
    function parse(txt) {
      var m = String(txt).match(/^(\D*?)([\d][\d.,]*)(.*)$/);
      if (!m) return null;
      var raw = m[2];
      var num = parseFloat(raw.replace(/,/g, ""));
      if (isNaN(num)) return null;
      return { pre: m[1], num: num, suf: m[3],
        dec: (raw.split(".")[1] || "").length, comma: raw.indexOf(",") > -1 };
    }
    function fmt(v, p) {
      var s = v.toFixed(p.dec);
      if (p.comma) {
        var parts = s.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        s = parts.join(".");
      }
      return p.pre + s + p.suf;
    }
    function run(el) {
      var p = el.__cp; if (!p) return;
      if (reduce) { el.textContent = fmt(p.num, p); return; }
      var dur = 1300, t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur);
        el.textContent = fmt(p.num * (1 - Math.pow(1 - k, 3)), p);   // easeOutCubic
        if (k < 1) requestAnimationFrame(step); else el.textContent = fmt(p.num, p);
      }
      requestAnimationFrame(step);
    }
    var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.45 }) : null;
    els.forEach(function (el) {
      if (el.__cp) return;
      var p = parse(el.textContent); if (!p) return;
      el.__cp = p;
      el.textContent = fmt(reduce ? p.num : 0, p);
      if (io) io.observe(el); else run(el);
    });
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
        card.style.setProperty("--card-rot-x", (py * -12).toFixed(2) + "deg");
        card.style.setProperty("--card-rot-y", (px * 12).toFixed(2) + "deg");
        card.style.setProperty("--card-shift-x", (px * 14).toFixed(2) + "px");
        card.style.setProperty("--card-shift-y", (py * 14).toFixed(2) + "px");
        card.style.setProperty("--card-grow-x", Math.abs(px * 10).toFixed(2));
        card.style.setProperty("--card-grow-y", Math.abs(py * 10).toFixed(2));
      };
      card.addEventListener("pointerenter", function () {
        /* kill the transform transition while tracking so tilt is instant */
        card.style.transition = 'box-shadow .45s var(--ease-soft)';
      }, { passive: true });
      card.addEventListener("pointermove", function (e) {
        cEvt = e; if (cQueued) return; cQueued = true; requestAnimationFrame(apply);
      }, { passive: true });
      card.addEventListener("pointerleave", function () {
        cEvt = null; // discard any pending RAF so it doesn't re-apply after reset
        /* restore spring transition so the card springs back to rest */
        card.style.transition = '';
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

  /* ── rolling headline (#heroRoll): cycles the highlighted phrase ──────────
     JS owns only the schedule (which phrase is .is-in); the slide+fade is a pure
     CSS transition on transform/opacity (compositor-only). Phrases are stacked in
     one CSS grid cell so the container reserves the widest/tallest → zero layout
     shift. Pauses off-screen + on tab-hide; static first phrase under reduced-motion
     (the whole sentence is exposed to AT via an adjacent .sr-only span). */
  function initRoller() {
    var roll = document.getElementById("heroRoll");
    if (!roll) return;
    var items = Array.prototype.slice.call(roll.querySelectorAll(".roll__item"));
    if (items.length < 2 || reduce) return;          // reduced-motion: leave first phrase shown
    var idx = 0, timer = null;
    function step() {
      var cur = items[idx];
      idx = (idx + 1) % items.length;
      var nxt = items[idx];
      cur.classList.remove("is-in"); cur.classList.add("is-out");
      nxt.classList.remove("is-out"); nxt.classList.add("is-in");
      // after the transition, return the old phrase to its resting (below) state
      setTimeout(function () { cur.classList.remove("is-out"); }, 650);
    }
    function play() { if (!timer) timer = setInterval(step, 2600); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { es[0].isIntersecting ? play() : stop(); }, { threshold: 0 }).observe(roll);
    } else { play(); }
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : play(); });
  }

  if (document.readyState !== "loading") boot();
  else document.addEventListener("DOMContentLoaded", boot);

  function boot() {
    initCursorSpot();
    initGlow();
    initTilt();
    initReveal();
    initRails();
    initCounters();
    initParallax();
    initRoller();
    watchNewCards();
  }
})();
