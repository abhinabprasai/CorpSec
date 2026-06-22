/* globe.js — persistent, scroll-driven d3 globe.
   Lives in a fixed full-viewport layer. In the hero it is a huge dotted
   "horizon" anchored below the fold; as you scroll into the Jurisdictions
   section it eases into a full sphere on the right that rotates to face the
   jurisdiction you hover. Adds cursor parallax + per-country particle lift,
   and a great-circle ROUTE arc between a passport country and a destination.
   Exposes window.Globe (setProgress/setParallax/focus/setRoute) and window.JURIS_DATA.
   Uses global d3 (v7). Fails soft to the CSS space backdrop.

   Performance model (the hero was reported laggy):
     • render loop is capped to ~60fps via a performance.now() accumulator and
       eased with frame-rate-independent dt, so 120/144Hz panels do ~half the work;
     • render-on-demand: a dirty flag means we only repaint when something moved
       (auto-spin, drag, hover, parallax/scroll easing, route draw, cursor);
     • the static sphere shading (atmosphere + ocean + bright rim, incl. the costly
       shadowBlur) is pre-rendered to an OFFSCREEN backdrop canvas and blitted —
       rebuilt only when geometry/theme changes, so auto-spin reuses it every frame;
     • the per-dot cursor-proximity test uses squared distance behind a cheap
       bounding-box reject (no sqrt for far dots), and per-dot ctx.shadowBlur is
       gone (faked with a second low-alpha arc);
     • palette literal is built once per theme, not per frame;
     • markers/tooltip only re-run on a real change. */
(function () {
  "use strict";

  /* ---- single source of truth for jurisdictions (cards + globe) ---- */
  /* Tax figures are concise teasers (effective / tiered, conditions apply);
     the per-jurisdiction pages carry the full headline-vs-effective detail. */
  var JX = [
    { iso: "SG", name: "Singapore", region: "Asia", lat: 1.3521, lng: 103.8198, tax: "~8.25%*", setup: "2 days", from: "SGD 1,600", live: true, popular: true, accent: "#ff5a5f", hub: true },
    { iso: "GB", name: "United Kingdom", region: "Europe", lat: 51.5074, lng: -0.1278, tax: "19–25%", setup: "48 hours", from: "£249", live: true, popular: true, accent: "#5b8def" },
    { iso: "US", name: "Texas, USA", region: "North America", lat: 30.2672, lng: -97.7431, tax: "0%**", setup: "48 hours", from: "$780", live: true, accent: "#5b9bff" },
    { iso: "AE", name: "Dubai (UAE)", region: "Middle East", lat: 25.2048, lng: 55.2708, tax: "0–9%*", setup: "2 weeks", from: "AED 30,000", live: true, popular: true, accent: "#2bb673" },
    { iso: "HK", name: "Hong Kong", region: "Asia", lat: 22.3193, lng: 114.1694, tax: "8.25–16.5%", setup: "~1 week", from: "HK$6,950", live: true, accent: "#ff6b6b" },
    { iso: "FR", name: "France", region: "Europe", lat: 48.8566, lng: 2.3522, tax: "25%", setup: "5 days", from: "€1,099", live: true, accent: "#6e8bff" },
    { iso: "BE", name: "Belgium", region: "Europe", lat: 50.8503, lng: 4.3517, tax: "25%", setup: "5 days", from: "€1,500", live: true, accent: "#ffce6e" },
    { iso: "EE", name: "Estonia", region: "Europe", lat: 59.437, lng: 24.7536, tax: "0–22%*", setup: "Coming soon", from: "—", live: false, popular: true, accent: "#7db6ff" }
  ];
  window.JURIS_DATA = JX;

  var stage = document.getElementById("globeStage");
  if (!stage) return;
  var canvas = document.getElementById("globeCanvas");
  var markersEl = document.getElementById("globeMarkers");
  var tip = document.getElementById("globeTip");
  var fallback = document.getElementById("globeFallback");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  // public no-op API so the page never errors even if WebGL/d3 is missing or
  // the globe is disabled for performance (calls from app.js/hub.js stay safe).
  window.Globe = { setProgress: function () {}, setParallax: function () {}, focus: function () {}, focusAt: function () {}, clearSearch: function () {}, setRoute: function () {}, clearRoute: function () {}, getDisk: function () { return { cx: -9999, cy: -9999, r: 0 }; } };
  var PERF = window.__PERF || {};
  // perf gate: skip the whole dotted-globe canvas + RAF loop on PHONES ONLY
  // (tablets + desktops keep it); the CSS .globe-layer gradient + starfield stand in.
  if (PERF.mobile) { if (fallback) fallback.textContent = ""; return; }
  if (typeof d3 === "undefined") { if (fallback) fallback.textContent = ""; return; }
  if (fallback) fallback.style.display = "none";

  var ctx = canvas.getContext("2d");
  var LOW = !!PERF.low;
  var dpr = PERF.dpr || Math.min(window.devicePixelRatio || 1, 2);
  var W = 1, H = 1, DEG = Math.PI / 180, TAU = Math.PI * 2;

  var projection = d3.geoOrthographic().clipAngle(90).precision(0.5);
  var path = d3.geoPath().projection(projection).context(ctx);
  var graticule = d3.geoGraticule().step([18, 18])();

  // pre-cache each jurisdiction's constant cartesian vector (never changes)
  JX.forEach(function (d) { d._v = cart(d.lng, d.lat); });

  var rotation = [-30, -14, 0];          // current spin/tilt
  var focusIso = null, focusRot = null;  // when a jurisdiction is targeted
  var searchPoint = null;                // when a searched (non-card) jurisdiction is targeted
  var route = null, routeProg = 0;       // {o:{lat,lng,iso,name}, d:{...}} + 0..1 draw progress

  // eased scalars (give the "locomotive" smoothness)
  var curP = 0, tgtP = 0;                 // scroll progress hero->juris
  var parX = 0, parY = 0, tgtParX = 0, tgtParY = 0;  // cursor parallax (-1..1)
  var hoverIso = null, lift = 0;          // country particle lift 0..1
  var cursorX = -9999, cursorY = -9999;   // live pointer position (screen px), for per-dot reaction

  var land = null, dots = [];             // dots: {p:[lng,lat], v:[x,y,z]}

  function cart(lng, lat) { var pl = lng * DEG, pt = lat * DEG, c = Math.cos(pt); return [c * Math.cos(pl), c * Math.sin(pl), Math.sin(pt)]; }
  function viewVec() { return cart(-rotation[0], -rotation[1]); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  // frame-rate-independent easing: reproduce a per-frame factor `f` (tuned @60fps)
  // for an arbitrary elapsed dt so the feel is identical on 60/120/144Hz panels.
  function eFac(f, dt) { return 1 - Math.pow(1 - f, dt / 16.667); }

  function resize() {
    W = Math.max(1, window.innerWidth); H = Math.max(1, window.innerHeight);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bd.width = canvas.width; bd.height = canvas.height;   // keep backdrop in sync
    bdKey = "";                                            // force backdrop rebuild
    dirty = true;
  }

  /* interpolated layout: hero "horizon" -> jurisdictions "right sphere" */
  function layout() {
    var p = ease(Math.max(0, Math.min(1, curP)));
    var hr = Math.max(W * 0.95, H * 1.15), hcx = W / 2, hcy = H * 0.17 + hr;
    var narrow = W < 880;
    var jr = Math.min(W, H) * (narrow ? 0.4 : 0.34);
    var jcx = narrow ? W * 0.5 : W * 0.72;
    var jcy = narrow ? H * 0.33 : H * 0.52;
    var radius = lerp(hr, jr, p) * (1 - 0.03 * lift);     // subtle zoom-out on hover
    var cx = lerp(hcx, jcx, p) + parX * (12 + 22 * p);
    var cy = lerp(hcy, jcy, p) + parY * (10 + 18 * p);
    return { radius: radius, cx: cx, cy: cy, p: p };
  }

  /* ---- halftone dot generation (planar point-in-polygon, per reference) ---- */
  function inRing(pt, ring) {
    var x = pt[0], y = pt[1], inside = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      var xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function inFeature(pt, g) {
    if (g.type === "Polygon") {
      if (!inRing(pt, g.coordinates[0])) return false;
      for (var i = 1; i < g.coordinates.length; i++) if (inRing(pt, g.coordinates[i])) return false;
      return true;
    }
    if (g.type === "MultiPolygon") {
      for (var k = 0; k < g.coordinates.length; k++) {
        var poly = g.coordinates[k];
        if (inRing(pt, poly[0])) { var hole = false; for (var h = 1; h < poly.length; h++) if (inRing(pt, poly[h])) { hole = true; break; } if (!hole) return true; }
      }
    }
    return false;
  }
  function buildDots(features) {
    var step = LOW ? 2.4 : 1.5;          // ~2.6× fewer dots on low-spec
    features.forEach(function (f) {
      var b = d3.geoBounds(f);
      for (var lng = b[0][0]; lng <= b[1][0]; lng += step)
        for (var lat = b[0][1]; lat <= b[1][1]; lat += step)
          if (inFeature([lng, lat], f.geometry)) dots.push({ p: [lng, lat], v: cart(lng, lat) });
    });
    dirty = true;
  }

  /* ---- palette: built once per theme key, not per frame ---- */
  var pal = null, palKey = "";
  function buildPal(mono, light) {
    return mono ? {
      atmo: ["rgba(160,170,185,0)", "rgba(155,168,185,0.06)", "rgba(160,170,185,0)"],
      ocean: ["#f2f4f7", "#e8ecf1", "#dce1e8"],
      rimGlow: "rgba(170,180,200,0.18)", rimShadow: "rgba(160,175,195,0.28)", rimBlur: 10,
      rim: ["rgba(155,168,188,0)", "rgba(165,178,200,0.28)", "rgba(208,218,230,0.65)", "rgba(165,178,200,0.28)", "rgba(155,168,188,0)"],
      rimShadow2: "rgba(175,190,210,0.45)",
      graticule: "rgba(140,155,175,0.08)", land: "rgba(125,140,160,0.14)",
      dotLit: "#8fa0b5", dotDim: "#bac8d4", arc: "rgba(70,110,180,0.95)", arcGlow: "rgba(120,150,200,0.22)"
    } : light ? {
      atmo: ["rgba(70,110,230,0)", "rgba(80,130,235,0.14)", "rgba(74,120,225,0)"],
      ocean: ["#dde9fb", "#bdd2f6", "#9cb8ee"],
      rimGlow: "rgba(70,120,230,0.4)", rimShadow: "rgba(70,120,230,0.7)", rimBlur: 28,
      rim: ["rgba(60,100,210,0)", "rgba(80,130,235,0.55)", "rgba(40,80,200,0.95)", "rgba(80,130,235,0.55)", "rgba(60,100,210,0)"],
      rimShadow2: "rgba(80,130,235,0.7)",
      graticule: "rgba(50,90,170,0.14)", land: "rgba(40,75,160,0.28)",
      dotLit: "#3a5fd9", dotDim: "#7f96cf", arc: "rgba(40,80,200,0.95)", arcGlow: "rgba(80,130,235,0.22)"
    } : {
      atmo: ["rgba(74,120,255,0)", "rgba(92,148,255,0.16)", "rgba(86,140,255,0)"],
      ocean: ["#12274f", "#0a1530", "#03060f"],
      rimGlow: "rgba(110,162,255,0.5)", rimShadow: "rgba(96,150,255,1)", rimBlur: 40,
      rim: ["rgba(70,120,220,0)", "rgba(130,178,255,0.6)", "rgba(232,242,255,1)", "rgba(130,178,255,0.6)", "rgba(70,120,220,0)"],
      rimShadow2: "rgba(170,205,255,0.95)",
      graticule: "rgba(120,165,230,0.10)", land: "rgba(150,190,245,0.20)",
      dotLit: "#dbe8ff", dotDim: "#9fb8e6", arc: "rgba(220,240,255,0.95)", arcGlow: "rgba(130,178,255,0.22)"
    };
  }

  /* ---- offscreen backdrop: atmosphere + ocean disk + bright rim ----
     Depends only on geometry (cx/cy/ar/p) + theme — NOT on rotation — so during
     auto-spin (where only rotation changes) it is built once and blitted every
     frame. This is what takes the expensive per-frame gradients + rim shadowBlur
     off the hot path. */
  var bd = document.createElement("canvas"), bctx = bd.getContext("2d");
  bd.width = 1; bd.height = 1;
  var bdKey = "";
  function ensureBackdrop(cx, cy, ar, p) {
    var key = palKey + "|" + Math.round(cx) + "|" + Math.round(cy) + "|" + Math.round(ar) + "|" + Math.round(p * 200) + "|" + dpr;
    if (key === bdKey) return;
    bdKey = key;
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.clearRect(0, 0, W, H);

    // atmosphere bloom
    var ag = bctx.createRadialGradient(cx, cy, ar * 0.92, cx, cy, ar * 1.2);
    ag.addColorStop(0, pal.atmo[0]); ag.addColorStop(0.5, pal.atmo[1]); ag.addColorStop(1, pal.atmo[2]);
    bctx.beginPath(); bctx.arc(cx, cy, ar * 1.2, 0, TAU); bctx.fillStyle = ag; bctx.fill();

    // ocean disk
    var og = bctx.createRadialGradient(cx, cy - ar * 0.6, ar * 0.06, cx, cy, ar);
    og.addColorStop(0, pal.ocean[0]); og.addColorStop(0.4, pal.ocean[1]); og.addColorStop(1, pal.ocean[2]);
    bctx.beginPath(); bctx.arc(cx, cy, ar, 0, TAU); bctx.fillStyle = og; bctx.fill();

    // bright rim — full ring in juris view, top arc in hero view
    var a0 = lerp(Math.PI * 1.14, 0, p), a1 = lerp(Math.PI * 1.86, TAU, p);
    bctx.save();
    bctx.beginPath(); bctx.arc(cx, cy, ar, lerp(Math.PI * 1.1, 0, p), lerp(Math.PI * 1.9, TAU, p));
    bctx.strokeStyle = pal.rimGlow; bctx.lineWidth = 12; bctx.shadowColor = pal.rimShadow; bctx.shadowBlur = pal.rimBlur; bctx.stroke();
    bctx.restore();
    var rg = bctx.createLinearGradient(cx - ar, 0, cx + ar, 0);
    rg.addColorStop(0, pal.rim[0]); rg.addColorStop(0.3, pal.rim[1]); rg.addColorStop(0.5, pal.rim[2]); rg.addColorStop(0.7, pal.rim[3]); rg.addColorStop(1, pal.rim[4]);
    bctx.save();
    bctx.beginPath(); bctx.arc(cx, cy, ar, a0, a1); bctx.strokeStyle = rg; bctx.lineWidth = 2.4;
    bctx.shadowColor = pal.rimShadow2; bctx.shadowBlur = 18; bctx.stroke(); bctx.restore();
  }

  /* ---------------- render ---------------- */
  var diskCx = -9999, diskCy = -9999, diskR = 0;
  function render() {
    var mono = stage.dataset.mono === "1";
    var light = document.documentElement.dataset.theme === "light";
    var pk = mono ? "m" : light ? "l" : "d";
    if (pk !== palKey) { palKey = pk; pal = buildPal(mono, light); bdKey = ""; }

    var L = layout(), ar = L.radius, cx = L.cx, cy = L.cy;
    diskCx = cx; diskCy = cy; diskR = ar;
    projection.scale(ar).translate([cx, cy]).rotate([rotation[0] + parX * 5, rotation[1] - parY * 4, 0]);

    // clear whole device buffer, then blit the cached static backdrop
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ensureBackdrop(cx, cy, ar, L.p);
    ctx.drawImage(bd, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);   // back to CSS-px space for vectors

    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, ar, 0, TAU); ctx.clip();

    // graticule
    ctx.beginPath(); path(graticule); ctx.strokeStyle = pal.graticule; ctx.lineWidth = 0.6; ctx.stroke();
    // land outline
    if (land) { ctx.beginPath(); land.features.forEach(function (f) { path(f); }); ctx.strokeStyle = pal.land; ctx.lineWidth = 0.6; ctx.stroke(); }

    // halftone dots, lifting the hovered country's particles outward
    if (dots.length) {
      var view = viewVec(), vx = view[0], vy = view[1], vz = view[2];
      var topY = cy - ar;
      var activeIso = hoverIso || focusIso;
      var hv = activeIso ? jByIso(activeIso) : null, hvv = hv ? hv._v : null;
      var dragEnergy = dragging ? Math.min(1, Math.hypot(velX, velY) / 6) : 0;
      var hasCursor = cursorX > -9000;
      var cradius = 130, cradius2 = cradius * cradius;
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i], v = d.v;
        if (v[0] * vx + v[1] * vy + v[2] * vz <= 0.04) continue;
        var sp = projection(d.p); if (!sp) continue;
        var litT = 1 - Math.min(1, (sp[1] - topY) / (ar * 1.25));
        var a = 0.18 + litT * 0.72, r = 1.15;
        var sx = sp[0], sy = sp[1], glow = 0;
        if (hvv && lift > 0.01) {
          var dotp = v[0] * hvv[0] + v[1] * hvv[1] + v[2] * hvv[2];
          if (dotp > 0.975) {                       // near the hovered country
            var k = (dotp - 0.975) / 0.025 * lift;
            var dx = sx - cx, dy = sy - cy, dl = Math.sqrt(dx * dx + dy * dy) || 1;
            sx += (dx / dl) * 8 * k; sy += (dy / dl) * 8 * k - 10 * k;  // rise outward + up
            r += 1.8 * k; a = Math.min(1, a + 0.55 * k); glow = k;
          }
        }
        // drag energy: faint sparkle boost across the lit hemisphere while spinning
        if (dragEnergy > 0.01 && litT > 0.5) {
          a = Math.min(1, a + dragEnergy * litT * 0.35);
          r += dragEnergy * litT * 0.6;
        }
        // cursor proximity: bounding-box reject first (two compares, no multiply),
        // then squared distance — only the handful of near dots pay a sqrt.
        if (hasCursor) {
          var cdx = sx - cursorX, cdy = sy - cursorY;
          if (cdx > -cradius && cdx < cradius && cdy > -cradius && cdy < cradius) {
            var cdist2 = cdx * cdx + cdy * cdy;
            if (cdist2 < cradius2) {
              var cdist = Math.sqrt(cdist2);
              var ck = (1 - cdist / cradius); ck = ck * ck;
              var cl = cdist || 1;
              sx += (cdx / cl) * 10 * ck; sy += (cdy / cl) * 10 * ck;
              r += 2.2 * ck; a = Math.min(1, a + 0.6 * ck);
              if (ck > glow) glow = ck;
            }
          }
        }
        ctx.globalAlpha = a; ctx.fillStyle = litT > 0.62 ? pal.dotLit : pal.dotDim;
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, TAU); ctx.fill();
        // cheap fake-bloom instead of the (very expensive) per-dot ctx.shadowBlur:
        // a single larger, low-alpha arc reads as a soft glow at a fraction of the cost.
        if (!LOW && glow > 0.18) {
          ctx.globalAlpha = glow * 0.28;
          ctx.beginPath(); ctx.arc(sx, sy, r + 3.2 * glow, 0, TAU); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    // route great-circle arc (drawn on top of the surface, clipped to the disk)
    if (route) drawRoute();
    ctx.restore();
  }

  /* great-circle route arc + endpoint nodes (d3 densifies the arc; clipAngle(90)
     hides the half that wraps behind the globe). Poor-man's glow = 2 stacked
     strokes, never shadowBlur. */
  function drawRoute() {
    var o = route.o, d = route.d;
    var interp = d3.geoInterpolate([o.lng, o.lat], [d.lng, d.lat]);
    var N = 96, last = Math.max(2, Math.ceil(N * routeProg));
    var coords = [];
    for (var i = 0; i < last; i++) coords.push(interp(i / (N - 1)));
    var line = { type: "LineString", coordinates: coords };
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); path(line); ctx.strokeStyle = pal.arcGlow; ctx.lineWidth = 6; ctx.stroke();
    ctx.beginPath(); path(line); ctx.strokeStyle = pal.arc; ctx.lineWidth = 1.7; ctx.stroke();
    // endpoint nodes
    var view = viewVec();
    [o, d].forEach(function (pt) {
      var v = cart(pt.lng, pt.lat);
      if (v[0] * view[0] + v[1] * view[1] + v[2] * view[2] <= 0.02) return;
      var sp = projection([pt.lng, pt.lat]); if (!sp) return;
      ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(sp[0], sp[1], 3.2, 0, TAU); ctx.fillStyle = pal.arc; ctx.fill();
      ctx.beginPath(); ctx.arc(sp[0], sp[1], 6.5, 0, TAU); ctx.strokeStyle = pal.arcGlow; ctx.lineWidth = 2.4; ctx.stroke();
    });
  }

  function jByIso(iso) { for (var i = 0; i < JX.length; i++) if (JX[i].iso === iso) return JX[i]; return null; }

  /* ---------------- markers + glass tooltip ---------------- */
  var mkEls = JX.map(function (d) {
    var b = document.createElement("button");
    b.className = "gmk" + (d.hub ? " hub" : "") + (d.live ? "" : " soon"); b.type = "button";
    b.style.setProperty("--mk", d.accent);
    b.setAttribute("aria-label", d.name + ", " + d.tax + " corporate tax, " + d.setup);
    b.onmouseenter = function () { hoverIso = d.iso; dirty = true; }; b.onmouseleave = function () { if (hoverIso === d.iso) hoverIso = null; dirty = true; };
    b.onfocus = function () { hoverIso = d.iso; dirty = true; }; b.onblur = function () { if (hoverIso === d.iso) hoverIso = null; dirty = true; };
    markersEl.appendChild(b); return b;
  });

  // extra marker for a searched jurisdiction without a card/JX entry
  var searchMk = document.createElement("button");
  searchMk.className = "gmk search-mk"; searchMk.type = "button"; searchMk.style.display = "none";
  searchMk.setAttribute("aria-hidden", "true");
  markersEl.appendChild(searchMk);

  // two flag pins for the passport→destination route
  function makeRouteMk(kind) {
    var el = document.createElement("span");
    el.className = "groute groute--" + kind; el.style.display = "none"; el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<img class="groute__flag" alt="" width="26" height="20"><span class="groute__tag"></span>';
    markersEl.appendChild(el); return el;
  }
  var routeMk = { o: makeRouteMk("from"), d: makeRouteMk("to") };
  function flagURL(iso) { return "https://flagcdn.com/w40/" + (iso || "").toLowerCase() + ".png"; }
  function fillRouteMk(el, pt, label) {
    var img = el.querySelector(".groute__flag"), tag = el.querySelector(".groute__tag");
    if (img.dataset.iso !== pt.iso) { img.src = flagURL(pt.iso); img.dataset.iso = pt.iso; }
    tag.textContent = pt.name || "";
    el.setAttribute("data-label", label);
  }

  var lastTipIso = "", lastTipSearch = "";
  function placeMarkers() {
    var view = viewVec(), vx = view[0], vy = view[1], vz = view[2];
    var showIso = hoverIso || focusIso;
    JX.forEach(function (d, i) {
      var el = mkEls[i], v = d._v;
      var front = v[0] * vx + v[1] * vy + v[2] * vz, sp = projection([d.lng, d.lat]);
      if (front <= 0.06 || !sp) { el.style.display = "none"; return; }
      el.style.display = "block";
      var depth = Math.max(0, front), hot = showIso === d.iso, sc = (0.78 + 0.5 * depth) * (hot ? 1.45 : 1);
      el.style.transform = "translate3d(" + sp[0].toFixed(1) + "px," + sp[1].toFixed(1) + "px,0) scale(" + sc.toFixed(3) + ")";
      el.style.opacity = (0.45 + 0.55 * depth).toFixed(2);
      el.classList.toggle("on", hot);
    });
    // marker for a searched (non-card) jurisdiction
    if (searchPoint) {
      var sv = cart(searchPoint.lng, searchPoint.lat);
      var sfront = sv[0] * vx + sv[1] * vy + sv[2] * vz, ssp = projection([searchPoint.lng, searchPoint.lat]);
      if (sfront > 0.06 && ssp) {
        searchMk.style.display = "block";
        var sdepth = Math.max(0, sfront), shot = !hoverIso, ssc = (0.78 + 0.5 * sdepth) * (shot ? 1.45 : 1);
        searchMk.style.transform = "translate3d(" + ssp[0].toFixed(1) + "px," + ssp[1].toFixed(1) + "px,0) scale(" + ssc.toFixed(3) + ")";
        searchMk.style.opacity = (0.45 + 0.55 * sdepth).toFixed(2);
        searchMk.classList.toggle("on", shot);
      } else searchMk.style.display = "none";
    } else searchMk.style.display = "none";

    // route flag pins
    if (route) {
      [["o", route.o, "From"], ["d", route.d, "To"]].forEach(function (t) {
        var el = routeMk[t[0]], pt = t[1];
        var v = cart(pt.lng, pt.lat), front = v[0] * vx + v[1] * vy + v[2] * vz, sp = projection([pt.lng, pt.lat]);
        if (front <= 0.04 || !sp) { el.style.display = "none"; return; }
        fillRouteMk(el, pt, t[2]);
        el.style.display = "flex";
        var depth = Math.max(0, front);
        el.style.transform = "translate3d(" + sp[0].toFixed(1) + "px," + sp[1].toFixed(1) + "px,0) scale(" + (0.86 + 0.3 * depth).toFixed(3) + ")";
        el.style.opacity = (0.6 + 0.4 * depth).toFixed(2);
      });
    } else { routeMk.o.style.display = "none"; routeMk.d.style.display = "none"; }

    if (tip) {
      // route mode owns its own flag pins; suppress the single-country tooltip
      var d = (showIso && !route) ? jByIso(showIso) : null;
      if (d) {
        var v = d._v, front = v[0] * vx + v[1] * vy + v[2] * vz, sp = projection([d.lng, d.lat]);
        if (front > 0.06 && sp) {
          tip.style.left = sp[0].toFixed(0) + "px"; tip.style.top = sp[1].toFixed(0) + "px";
          if (lastTipIso !== d.iso) {       // only rebuild innerHTML on a change
            tip.innerHTML = '<div class="gh"><span class="iso" style="background:' + hexA(d.accent, .2) + ';color:' + d.accent + '">' + d.iso + '</span><span class="gcty">' + d.name + '<br><small style="font-weight:400;opacity:.6">' + d.region + '</small></span></div>' +
              '<div class="grow"><span>Corp tax</span><b>' + d.tax + '</b></div>' +
              '<div class="grow"><span>Setup</span><b>' + d.setup + '</b></div>' +
              '<div class="grow"><span>From (year 1)</span><b>' + (d.live ? d.from : "Waitlist") + '</b></div>' +
              (d.live ? '<div class="gbadge">Live for checkout</div>' : '<div class="gbadge soon">Coming soon</div>');
            lastTipIso = d.iso; lastTipSearch = "";
          }
          tip.classList.add("on");
        } else tip.classList.remove("on");
      } else if (searchPoint && !hoverIso && !route) {
        var sv2 = cart(searchPoint.lng, searchPoint.lat);
        var sfront2 = sv2[0] * vx + sv2[1] * vy + sv2[2] * vz, ssp2 = projection([searchPoint.lng, searchPoint.lat]);
        if (sfront2 > 0.06 && ssp2) {
          tip.style.left = ssp2[0].toFixed(0) + "px"; tip.style.top = ssp2[1].toFixed(0) + "px";
          if (lastTipSearch !== searchPoint.iso + searchPoint.name) {
            tip.innerHTML = '<div class="gh"><span class="iso" style="background:rgba(140,190,255,.2);color:#8cb6ff">' + searchPoint.iso + '</span><span class="gcty">' + searchPoint.name + '</span></div>' +
              '<div class="grow"><span>Region</span><b>' + searchPoint.region + '</b></div>';
            lastTipSearch = searchPoint.iso + searchPoint.name; lastTipIso = "";
          }
          tip.classList.add("on");
        } else tip.classList.remove("on");
      } else tip.classList.remove("on");
    }
  }
  function hexA(hex, a) { var n = parseInt(hex.slice(1), 16); return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")"; }

  /* ---------------- interaction ---------------- */
  var dragging = false, lx = 0, ly = 0, resumeAt = 0, velX = 0, velY = 0;
  canvas.addEventListener("pointerdown", function (e) {
    dragging = true; lx = e.clientX; ly = e.clientY; velX = 0; velY = 0; focusIso = null; focusRot = null;
    dirty = true; ensureRunning();
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  });
  var hoverQueued = false;
  function handleMove(e) {
    cursorX = e.clientX; cursorY = e.clientY; dirty = true; ensureRunning();
    if (dragging) {
      var dx = e.clientX - lx, dy = e.clientY - ly;
      // 1:1 feel: convert screen px to degrees relative to the globe's on-screen radius
      var scale = 90 / Math.max(1, diskR || 1);
      rotation[0] += dx * scale;
      rotation[1] -= dy * scale;
      rotation[1] = Math.max(-90, Math.min(90, rotation[1]));
      velX = dx * scale; velY = -dy * scale;
      lx = e.clientX; ly = e.clientY;
      resumeAt = now() + 2400;
      return;
    }
    // hover-detect nearest jurisdiction on the globe — throttled to one rAF
    if (hoverQueued) return; hoverQueued = true;
    requestAnimationFrame(function () {
      hoverQueued = false;
      var view = viewVec(), best = null, bestD2 = 900;   // 30px squared
      JX.forEach(function (d) {
        var v = d._v; if (v[0] * view[0] + v[1] * view[1] + v[2] * view[2] <= 0.06) return;
        var sp = projection([d.lng, d.lat]); if (!sp) return;
        var ddx = sp[0] - cursorX, ddy = sp[1] - cursorY, dd2 = ddx * ddx + ddy * ddy;
        if (dd2 < bestD2) { bestD2 = dd2; best = d.iso; }
      });
      if (best !== hoverIso) { hoverIso = best; dirty = true; }
    });
  }
  canvas.addEventListener("pointermove", handleMove, { passive: true });
  window.addEventListener("pointermove", function (e) { if (dragging) handleMove(e); else { cursorX = e.clientX; cursorY = e.clientY; dirty = true; } }, { passive: true });
  window.addEventListener("pointerup", function (e) { dragging = false; try { canvas.releasePointerCapture(e.pointerId); } catch (err) {} });
  window.addEventListener("pointercancel", function () { dragging = false; });
  window.addEventListener("pointerleave", function () { cursorX = -9999; cursorY = -9999; dirty = true; }, { passive: true });
  var _rt; window.addEventListener("resize", function () { clearTimeout(_rt); _rt = setTimeout(resize, 150); }, { passive: true });

  function now() { return window.performance ? performance.now() : Date.now(); }

  /* ---------------- public API ---------------- */
  window.Globe = {
    setProgress: function (p) { p = Math.max(0, Math.min(1, p)); if (Math.abs(p - tgtP) > 0.0005) { tgtP = p; dirty = true; ensureRunning(); } },
    setParallax: function (nx, ny) { if (!dragging && (Math.abs(nx - tgtParX) > 0.001 || Math.abs(ny - tgtParY) > 0.001)) { tgtParX = nx; tgtParY = ny; dirty = true; ensureRunning(); } },
    focus: function (iso) {
      var d = iso && jByIso(iso); focusIso = d ? iso : null;
      focusRot = d ? [-d.lng, Math.max(-55, Math.min(55, -d.lat))] : null;
      if (d) resumeAt = now() + 4000;
      dirty = true; ensureRunning();
    },
    focusAt: function (lat, lng, meta) {
      searchPoint = { lat: lat, lng: lng, name: (meta && meta.name) || "", iso: (meta && meta.iso) || "", region: (meta && meta.region) || "" };
      focusIso = null; focusRot = [-lng, Math.max(-55, Math.min(55, -lat))];
      resumeAt = now() + 4000; dirty = true; ensureRunning();
    },
    clearSearch: function () { searchPoint = null; dirty = true; },
    // origin/dest: { lat, lng, iso, name }. Draws the connecting great-circle arc
    // + two flag pins and frames the midpoint.
    setRoute: function (origin, dest) {
      if (!origin || !dest) { this.clearRoute(); return; }
      route = { o: origin, d: dest }; routeProg = 0;
      searchPoint = null; focusIso = null; hoverIso = null;
      var mid = d3.geoInterpolate([origin.lng, origin.lat], [dest.lng, dest.lat])(0.5);
      focusRot = [-mid[0], Math.max(-55, Math.min(55, -mid[1]))];
      resumeAt = now() + 6e5; dirty = true; ensureRunning();
    },
    clearRoute: function () { route = null; routeProg = 0; focusRot = null; routeMk.o.style.display = "none"; routeMk.d.style.display = "none"; dirty = true; },
    isDragging: function () { return dragging; },
    getDisk: function () { return { cx: diskCx, cy: diskCy, r: diskR }; }
  };

  /* ---------------- loop (60fps cap + render-on-demand) ---------------- */
  var raf = 0, running = false, visible = true, msPrev = 0, dirty = true;
  var MSPF = 1000 / 60;
  function ensureRunning() { if (!running && visible) { running = true; msPrev = now(); raf = requestAnimationFrame(frame); } }
  function frame(t) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (!visible) { running = false; cancelAnimationFrame(raf); return; }
    var dt = t - msPrev;
    if (dt < MSPF) return;                 // cap to ~60fps on high-refresh panels
    msPrev = t - (dt % MSPF);              // keep cadence without drifting
    if (dt > 50) dt = 50;                  // clamp after tab-restore / long stalls

    var moved = false;
    // ease scalars (frame-rate independent)
    var d0;
    d0 = (tgtP - curP) * eFac(0.09, dt); if (Math.abs(d0) > 1e-4) { curP += d0; moved = true; }
    d0 = (tgtParX - parX) * eFac(0.06, dt); if (Math.abs(d0) > 1e-4) { parX += d0; moved = true; }
    d0 = (tgtParY - parY) * eFac(0.06, dt); if (Math.abs(d0) > 1e-4) { parY += d0; moved = true; }
    d0 = (((hoverIso || focusIso) ? 1 : 0) - lift) * eFac(0.12, dt); if (Math.abs(d0) > 1e-4) { lift += d0; moved = true; }

    if (route && routeProg < 1) { routeProg = Math.min(1, routeProg + dt / 900); moved = true; }

    if ((curP > 0.55 || route) && focusRot) {        // ease toward the focused country / route midpoint
      var r0 = (focusRot[0] - rotation[0]) * eFac(0.06, dt);
      var r1 = (focusRot[1] - rotation[1]) * eFac(0.06, dt);
      if (Math.abs(r0) > 1e-3 || Math.abs(r1) > 1e-3) { rotation[0] += r0; rotation[1] += r1; moved = true; }
    } else if (!reduce && !dragging && now() > resumeAt && curP < 0.6) {
      rotation[0] += 0.05 * (dt / 16.667);           // hero: gentle auto-spin (dt-scaled)
      moved = true;
    }

    if (dragging) moved = true;

    if (moved || dirty) { render(); placeMarkers(); dirty = false; }
    else { running = false; cancelAnimationFrame(raf); }   // fully settled → sleep until next input
  }

  // pause the globe loop when its visible zone (hero + jurisdictions) is scrolled
  // past — the fixed layer fades out there anyway, so we stop doing any work.
  var zone = {};
  function recomputeVisible() {
    var vis = (zone.hero || zone.jurisdictions) && !document.hidden;
    if (vis === visible) return;
    visible = vis;
    if (visible) ensureRunning();
  }
  if ("IntersectionObserver" in window) {
    var zio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { zone[e.target.id] = e.isIntersecting; });
      recomputeVisible();
    }, { threshold: 0 });
    [document.getElementById("hero"), document.getElementById("jurisdictions")].forEach(function (el) { if (el) zio.observe(el); });
  } else { zone.hero = true; visible = true; }
  document.addEventListener("visibilitychange", function () { recomputeVisible(); if (visible) { msPrev = now(); ensureRunning(); } });

  resize();
  fetch("assets/ne_110m_land.json").then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(function (geo) { land = geo; buildDots(geo.features); ensureRunning(); }).catch(function () {});
  ensureRunning();
})();
