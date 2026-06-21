/* hub-globe.js — cobe WebGL globe for the Jurisdictions hub hero.
   Replaces the d3 globe. Light, minimal dotted globe that auto-rotates,
   can be dragged to spin (with momentum), and eases-to-focus on a
   jurisdiction when the user searches or taps a quick pill.

   Exposes a window.Globe facade compatible with hub.js:
     Globe.focus(iso)        — rotate to the first jurisdiction with that ISO2
     Globe.focusAt(lat,lng)  — rotate to an exact coordinate
     Globe.clearSearch()     — release focus, resume auto-rotate
     Globe.setProgress()     — no-op (cobe always shows the full sphere)
     Globe.setParallax()     — no-op (cobe owns its own pointer interaction)

   Loaded as <script type="module">, so it runs after the classic scripts
   that define window.JURISDICTIONS_ALL. */
import createGlobe from "./cobe.js";

(function () {
  "use strict";

  var canvas = document.getElementById("hubGlobe");
  if (!canvas) return;
  var PERF = window.__PERF || {};

  /* ---- coordinate lookups built from the 79-jurisdiction list ---- */
  var ALL = window.JURISDICTIONS_ALL || [];
  function slugify(name) {
    return name.split(/[,(]/)[0].trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  var coordsByIso = {}, coordsBySlug = {};
  ALL.forEach(function (r) {
    var iso = r[1], lat = r[3], lng = r[4];
    if (typeof lat !== "number" || typeof lng !== "number") return;
    if (coordsByIso[iso] === undefined) coordsByIso[iso] = [lat, lng];
    var s = slugify(r[0]);
    if (coordsBySlug[s] === undefined) coordsBySlug[s] = [lat, lng];
  });

  /* subtle markers for the flagship guides only — keeps "minimal colours" */
  var MARK_SLUGS = ["singapore", "united-kingdom", "dubai", "delaware", "estonia", "hong-kong"];
  var markers = MARK_SLUGS.map(function (s) {
    var c = coordsBySlug[s];
    return c ? { location: c, size: 0.045 } : null;
  }).filter(Boolean);

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ---- rotation state ---- */
  var phi = 4.6;                 // start over Europe / Middle East
  var theta = 0.2;
  var restTheta = 0.2;
  var baseSpeed = reduce ? 0 : 0.0032;
  var spin = baseSpeed;          // current spin velocity (eases back to baseSpeed)
  var focusPhi = null, focusTheta = null;

  var dragging = false, lastX = 0, lastY = 0;
  var size = 0;                  // CSS px (square)
  var dpr = PERF.dpr || Math.min(window.devicePixelRatio || 1, 2);

  function locToAngles(lat, lng) {
    return [Math.PI - (lng * Math.PI) / 180 - Math.PI / 2, (lat * Math.PI) / 180];
  }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function shortest(d) { d = (d + Math.PI) % (2 * Math.PI); if (d < 0) d += 2 * Math.PI; return d - Math.PI; }

  function measure() {
    size = canvas.offsetWidth || canvas.parentElement.offsetWidth || 600;
    dpr = PERF.dpr || Math.min(window.devicePixelRatio || 1, 2);
  }
  measure();

  /* ---- create globe (config mirrors the look the user requested) ---- */
  var globe = createGlobe(canvas, {
    devicePixelRatio: dpr,
    width: size * dpr,
    height: size * dpr,
    phi: phi,
    theta: theta,
    dark: 0,
    diffuse: 1.4,
    mapSamples: PERF.low ? 7000 : 16000,
    mapBrightness: 9,
    baseColor: [1, 1, 1],
    markerColor: [0.31, 0.45, 0.86],
    glowColor: [0.94, 0.93, 0.91],
    markers: markers,
    opacity: 0.92,
    onRender: function (state) {
      if (focusPhi !== null) {
        phi += shortest(focusPhi - phi) * 0.045;
        theta += (focusTheta - theta) * 0.045;
      } else if (!dragging) {
        spin += (baseSpeed - spin) * 0.02;   // momentum decays to idle drift
        phi += spin;
        theta += (restTheta - theta) * 0.03; // settle tilt back to rest
      }
      state.phi = phi;
      state.theta = theta;
      state.width = size * dpr;
      state.height = size * dpr;
    }
  });

  /* fade in once the first frame is up */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { canvas.classList.add("is-on"); });
  });

  /* ---- drag to spin ---- */
  canvas.addEventListener("pointerdown", function (e) {
    dragging = true;
    lastX = e.clientX; lastY = e.clientY;
    focusPhi = null; focusTheta = null;     // user takes over
    canvas.style.cursor = "grabbing";
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    var dPhi = dx * 0.006;
    phi += dPhi;
    spin = dPhi;                              // carry momentum on release
    theta = clamp(theta - dy * 0.006, -0.65, 0.65);
    restTheta = theta;
  });
  function release(e) {
    if (!dragging) return;
    dragging = false;
    canvas.style.cursor = "grab";
    restTheta = 0.2;                          // ease tilt back to a level view
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
  }
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);

  /* ---- resize ---- */
  var rT;
  window.addEventListener("resize", function () {
    clearTimeout(rT);
    rT = setTimeout(measure, 120);
  }, { passive: true });

  /* ---- pause cobe's continuous RAF loop when the globe is off-screen or the
     tab is hidden (otherwise it renders at full rate forever — GPU/battery) ---- */
  var onScreen = true, tabVisible = !document.hidden;
  function syncRunning() { if (globe && globe.toggle) globe.toggle(onScreen && tabVisible); }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      onScreen = es[0].isIntersecting;
      syncRunning();
    }, { threshold: 0 }).observe(canvas);
  }
  document.addEventListener("visibilitychange", function () {
    tabVisible = !document.hidden;
    syncRunning();
  });

  /* ---- public facade (used by hub.js search / quick pills) ---- */
  window.Globe = {
    focusAt: function (lat, lng) {
      if (typeof lat !== "number" || typeof lng !== "number") return;
      var a = locToAngles(lat, lng);
      focusPhi = a[0];
      focusTheta = clamp(a[1], -0.6, 0.6);
    },
    focus: function (iso) {
      var c = coordsByIso[(iso || "").toLowerCase()];
      if (c) this.focusAt(c[0], c[1]);
    },
    focusSlug: function (slug) {
      var c = coordsBySlug[(slug || "").toLowerCase()];
      if (c) this.focusAt(c[0], c[1]);
    },
    clearSearch: function () { focusPhi = null; focusTheta = null; },
    setProgress: function () {},
    setParallax: function () {},
    destroy: function () { if (globe) globe.destroy(); }
  };
})();
