/* globe.js — persistent, scroll-driven d3 globe.
   Lives in a fixed full-viewport layer. In the hero it is a huge dotted
   "horizon" anchored below the fold; as you scroll into the Jurisdictions
   section it eases into a full sphere on the right that rotates to face the
   jurisdiction you hover. Adds cursor parallax + per-country particle lift.
   Exposes window.Globe (setProgress/setParallax/focus) and window.JURIS_DATA.
   Uses global d3 (v7). Fails soft to the CSS space backdrop. */
(function () {
  "use strict";

  /* ---- single source of truth for jurisdictions (cards + globe) ---- */
  var JX = [
    { iso: "SG", name: "Singapore", region: "Asia", lat: 1.3521, lng: 103.8198, tax: "8.5%", setup: "2 days", from: "SGD 1,600", live: true, popular: true, accent: "#ff5a5f", hub: true },
    { iso: "GB", name: "United Kingdom", region: "Europe", lat: 51.5074, lng: -0.1278, tax: "19%", setup: "48 hours", from: "£249", live: true, popular: true, accent: "#5b8def" },
    { iso: "US", name: "Texas, USA", region: "North America", lat: 30.2672, lng: -97.7431, tax: "0%**", setup: "48 hours", from: "$780", live: true, accent: "#5b9bff" },
    { iso: "AE", name: "Dubai (UAE)", region: "Middle East", lat: 25.2048, lng: 55.2708, tax: "0%*", setup: "2 weeks", from: "AED 30,000", live: true, popular: true, accent: "#2bb673" },
    { iso: "HK", name: "Hong Kong", region: "Asia", lat: 22.3193, lng: 114.1694, tax: "8.25%", setup: "~1 week", from: "HK$6,950", live: true, accent: "#ff6b6b" },
    { iso: "FR", name: "France", region: "Europe", lat: 48.8566, lng: 2.3522, tax: "25%", setup: "5 days", from: "€1,099", live: true, accent: "#6e8bff" },
    { iso: "BE", name: "Belgium", region: "Europe", lat: 50.8503, lng: 4.3517, tax: "25%", setup: "5 days", from: "€1,500", live: true, accent: "#ffce6e" },
    { iso: "EE", name: "Estonia", region: "Europe", lat: 59.437, lng: 24.7536, tax: "20%", setup: "Coming soon", from: "—", live: false, popular: true, accent: "#7db6ff" }
  ];
  window.JURIS_DATA = JX;

  var stage = document.getElementById("globeStage");
  if (!stage) return;
  var canvas = document.getElementById("globeCanvas");
  var markersEl = document.getElementById("globeMarkers");
  var tip = document.getElementById("globeTip");
  var fallback = document.getElementById("globeFallback");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  // public no-op API so the page never errors even if WebGL/d3 is missing
  window.Globe = { setProgress: function () {}, setParallax: function () {}, focus: function () {}, focusAt: function () {}, clearSearch: function () {}, getDisk: function () { return { cx: -9999, cy: -9999, r: 0 }; } };
  if (typeof d3 === "undefined") { if (fallback) fallback.textContent = ""; return; }
  if (fallback) fallback.style.display = "none";

  var ctx = canvas.getContext("2d");
  var PERF = window.__PERF || {};
  var LOW = !!PERF.low;
  var dpr = PERF.dpr || Math.min(window.devicePixelRatio || 1, 2);
  var W = 1, H = 1, DEG = Math.PI / 180;

  var projection = d3.geoOrthographic().clipAngle(90).precision(0.5);
  var path = d3.geoPath().projection(projection).context(ctx);
  var graticule = d3.geoGraticule().step([18, 18])();

  var rotation = [-30, -14, 0];          // current spin/tilt
  var focusIso = null, focusRot = null;  // when a jurisdiction is targeted
  var searchPoint = null;                // when a searched (non-card) jurisdiction is targeted

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

  function resize() {
    W = Math.max(1, window.innerWidth); H = Math.max(1, window.innerHeight);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
  }

  /* ---------------- render ---------------- */
  var diskCx = -9999, diskCy = -9999, diskR = 0;
  function render() {
    var light = document.documentElement.dataset.theme === "light";
    var pal = light ? {
      atmo: ["rgba(70,110,230,0)", "rgba(80,130,235,0.14)", "rgba(74,120,225,0)"],
      ocean: ["#dde9fb", "#bdd2f6", "#9cb8ee"],
      rimGlow: "rgba(70,120,230,0.4)", rimShadow: "rgba(70,120,230,0.7)", rimBlur: 28,
      rim: ["rgba(60,100,210,0)", "rgba(80,130,235,0.55)", "rgba(40,80,200,0.95)", "rgba(80,130,235,0.55)", "rgba(60,100,210,0)"],
      rimShadow2: "rgba(80,130,235,0.7)",
      graticule: "rgba(50,90,170,0.14)", land: "rgba(40,75,160,0.28)",
      dotLit: "#3a5fd9", dotDim: "#7f96cf"
    } : {
      atmo: ["rgba(74,120,255,0)", "rgba(92,148,255,0.16)", "rgba(86,140,255,0)"],
      ocean: ["#12274f", "#0a1530", "#03060f"],
      rimGlow: "rgba(110,162,255,0.5)", rimShadow: "rgba(96,150,255,1)", rimBlur: 40,
      rim: ["rgba(70,120,220,0)", "rgba(130,178,255,0.6)", "rgba(232,242,255,1)", "rgba(130,178,255,0.6)", "rgba(70,120,220,0)"],
      rimShadow2: "rgba(170,205,255,0.95)",
      graticule: "rgba(120,165,230,0.10)", land: "rgba(150,190,245,0.20)",
      dotLit: "#dbe8ff", dotDim: "#9fb8e6"
    };
    var L = layout(), ar = L.radius, cx = L.cx, cy = L.cy;
    diskCx = cx; diskCy = cy; diskR = ar;
    projection.scale(ar).translate([cx, cy]).rotate([rotation[0] + parX * 5, rotation[1] - parY * 4, 0]);
    ctx.clearRect(0, 0, W, H);

    // atmosphere bloom
    var ag = ctx.createRadialGradient(cx, cy, ar * 0.92, cx, cy, ar * 1.2);
    ag.addColorStop(0, pal.atmo[0]); ag.addColorStop(0.5, pal.atmo[1]); ag.addColorStop(1, pal.atmo[2]);
    ctx.beginPath(); ctx.arc(cx, cy, ar * 1.2, 0, 2 * Math.PI); ctx.fillStyle = ag; ctx.fill();

    // ocean disk
    var og = ctx.createRadialGradient(cx, cy - ar * 0.6, ar * 0.06, cx, cy, ar);
    og.addColorStop(0, pal.ocean[0]); og.addColorStop(0.4, pal.ocean[1]); og.addColorStop(1, pal.ocean[2]);
    ctx.beginPath(); ctx.arc(cx, cy, ar, 0, 2 * Math.PI); ctx.fillStyle = og; ctx.fill();

    // bright rim — full ring in juris view, top arc in hero view
    var a0 = lerp(Math.PI * 1.14, 0, L.p), a1 = lerp(Math.PI * 1.86, 2 * Math.PI, L.p);
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, ar, lerp(Math.PI * 1.1, 0, L.p), lerp(Math.PI * 1.9, 2 * Math.PI, L.p));
    ctx.strokeStyle = pal.rimGlow; ctx.lineWidth = 12; ctx.shadowColor = pal.rimShadow; ctx.shadowBlur = pal.rimBlur; ctx.stroke();
    ctx.restore();
    var rg = ctx.createLinearGradient(cx - ar, 0, cx + ar, 0);
    rg.addColorStop(0, pal.rim[0]); rg.addColorStop(0.3, pal.rim[1]); rg.addColorStop(0.5, pal.rim[2]); rg.addColorStop(0.7, pal.rim[3]); rg.addColorStop(1, pal.rim[4]);
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, ar, a0, a1); ctx.strokeStyle = rg; ctx.lineWidth = 2.4;
    ctx.shadowColor = pal.rimShadow2; ctx.shadowBlur = 18; ctx.stroke(); ctx.restore();

    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, ar, 0, 2 * Math.PI); ctx.clip();

    // graticule
    ctx.beginPath(); path(graticule); ctx.strokeStyle = pal.graticule; ctx.lineWidth = 0.6; ctx.stroke();
    // land outline
    if (land) { ctx.beginPath(); land.features.forEach(function (f) { path(f); }); ctx.strokeStyle = pal.land; ctx.lineWidth = 0.6; ctx.stroke(); }

    // halftone dots, lifting the hovered country's particles outward
    if (dots.length) {
      var view = viewVec(), vx = view[0], vy = view[1], vz = view[2];
      var topY = cy - ar;
      var activeIso = hoverIso || focusIso;
      var hv = activeIso ? jByIso(activeIso) : null, hvv = hv ? cart(hv.lng, hv.lat) : null;
      var dragEnergy = dragging ? Math.min(1, Math.hypot(velX, velY) / 6) : 0;
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
        // cursor proximity: every visible dot reacts to the live pointer position,
        // rising/glowing away from the cursor in proportion to closeness.
        // Skip the per-dot sqrt entirely when no pointer is present (touch devices).
        if (cursorX > -9000) {
          var cdx = sx - cursorX, cdy = sy - cursorY, cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          var cradius = 130;
          if (cdist < cradius) {
            var ck = (1 - cdist / cradius);
            ck = ck * ck;
            var cl = cdist || 1;
            sx += (cdx / cl) * 10 * ck; sy += (cdy / cl) * 10 * ck;
            r += 2.2 * ck; a = Math.min(1, a + 0.6 * ck);
            glow = Math.max(glow, ck);
          }
        }
        ctx.globalAlpha = a; ctx.fillStyle = litT > 0.62 ? pal.dotLit : pal.dotDim;
        // per-dot shadowBlur is the single most expensive 2D op — skip it on low-spec
        if (!LOW && glow > 0.15) { ctx.shadowColor = "rgba(140,190,255," + Math.min(1, glow).toFixed(2) + ")"; ctx.shadowBlur = 10 * glow; }
        else { ctx.shadowBlur = 0; }
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, 2 * Math.PI); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  function jByIso(iso) { for (var i = 0; i < JX.length; i++) if (JX[i].iso === iso) return JX[i]; return null; }

  /* ---------------- markers + glass tooltip ---------------- */
  var mkEls = JX.map(function (d) {
    var b = document.createElement("button");
    b.className = "gmk" + (d.hub ? " hub" : "") + (d.live ? "" : " soon"); b.type = "button";
    b.style.setProperty("--mk", d.accent);
    b.setAttribute("aria-label", d.name + ", " + d.tax + " corporate tax, " + d.setup);
    b.onmouseenter = function () { hoverIso = d.iso; }; b.onmouseleave = function () { if (hoverIso === d.iso) hoverIso = null; };
    b.onfocus = function () { hoverIso = d.iso; }; b.onblur = function () { if (hoverIso === d.iso) hoverIso = null; };
    markersEl.appendChild(b); return b;
  });

  // extra marker for a searched jurisdiction without a card/JX entry
  var searchMk = document.createElement("button");
  searchMk.className = "gmk search-mk"; searchMk.type = "button"; searchMk.style.display = "none";
  searchMk.setAttribute("aria-hidden", "true");
  markersEl.appendChild(searchMk);

  function placeMarkers() {
    var view = viewVec(), vx = view[0], vy = view[1], vz = view[2];
    var showIso = hoverIso || focusIso;
    JX.forEach(function (d, i) {
      var el = mkEls[i], v = cart(d.lng, d.lat);
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

    if (tip) {
      var d = showIso ? jByIso(showIso) : null;
      if (d) {
        var v = cart(d.lng, d.lat), front = v[0] * vx + v[1] * vy + v[2] * vz, sp = projection([d.lng, d.lat]);
        if (front > 0.06 && sp) {
          tip.style.left = sp[0].toFixed(0) + "px"; tip.style.top = sp[1].toFixed(0) + "px";
          tip.innerHTML = '<div class="gh"><span class="iso" style="background:' + hexA(d.accent, .2) + ';color:' + d.accent + '">' + d.iso + '</span><span class="gcty">' + d.name + '<br><small style="font-weight:400;opacity:.6">' + d.region + '</small></span></div>' +
            '<div class="grow"><span>Corp tax</span><b>' + d.tax + '</b></div>' +
            '<div class="grow"><span>Setup</span><b>' + d.setup + '</b></div>' +
            '<div class="grow"><span>From (year 1)</span><b>' + (d.live ? d.from : "Waitlist") + '</b></div>' +
            (d.live ? '<div class="gbadge">Live for checkout</div>' : '<div class="gbadge soon">Coming soon</div>');
          tip.classList.add("on");
        } else tip.classList.remove("on");
      } else if (searchPoint && !hoverIso) {
        var sv2 = cart(searchPoint.lng, searchPoint.lat);
        var sfront2 = sv2[0] * vx + sv2[1] * vy + sv2[2] * vz, ssp2 = projection([searchPoint.lng, searchPoint.lat]);
        if (sfront2 > 0.06 && ssp2) {
          tip.style.left = ssp2[0].toFixed(0) + "px"; tip.style.top = ssp2[1].toFixed(0) + "px";
          tip.innerHTML = '<div class="gh"><span class="iso" style="background:rgba(140,190,255,.2);color:#8cb6ff">' + searchPoint.iso + '</span><span class="gcty">' + searchPoint.name + '</span></div>' +
            '<div class="grow"><span>Region</span><b>' + searchPoint.region + '</b></div>';
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
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  });
  function handleMove(e) {
    cursorX = e.clientX; cursorY = e.clientY;
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
    // hover-detect nearest jurisdiction on the globe
    var view = viewVec(), best = null, bestD = 30;
    JX.forEach(function (d) {
      var v = cart(d.lng, d.lat); if (v[0] * view[0] + v[1] * view[1] + v[2] * view[2] <= 0.06) return;
      var sp = projection([d.lng, d.lat]); if (!sp) return;
      var dd = Math.hypot(sp[0] - e.clientX, sp[1] - e.clientY); if (dd < bestD) { bestD = dd; best = d.iso; }
    });
    hoverIso = best;
  }
  canvas.addEventListener("pointermove", handleMove, { passive: true });
  window.addEventListener("pointermove", function (e) { if (dragging) handleMove(e); else { cursorX = e.clientX; cursorY = e.clientY; } }, { passive: true });
  window.addEventListener("pointerup", function (e) { dragging = false; try { canvas.releasePointerCapture(e.pointerId); } catch (err) {} });
  window.addEventListener("pointercancel", function () { dragging = false; });
  window.addEventListener("pointerleave", function () { cursorX = -9999; cursorY = -9999; }, { passive: true });
  var _rt; window.addEventListener("resize", function () { clearTimeout(_rt); _rt = setTimeout(resize, 150); }, { passive: true });

  function now() { return window.performance ? performance.now() : Date.now(); }

  /* ---------------- public API ---------------- */
  window.Globe = {
    setProgress: function (p) { tgtP = Math.max(0, Math.min(1, p)); },
    setParallax: function (nx, ny) { if (!dragging) { tgtParX = nx; tgtParY = ny; } },
    focus: function (iso) {
      var d = iso && jByIso(iso); focusIso = d ? iso : null;
      focusRot = d ? [-d.lng, Math.max(-55, Math.min(55, -d.lat))] : null;
      if (d) resumeAt = now() + 4000;
    },
    focusAt: function (lat, lng, meta) {
      searchPoint = { lat: lat, lng: lng, name: (meta && meta.name) || "", iso: (meta && meta.iso) || "", region: (meta && meta.region) || "" };
      focusIso = null; focusRot = [-lng, Math.max(-55, Math.min(55, -lat))];
      resumeAt = now() + 4000;
    },
    clearSearch: function () { searchPoint = null; },
    isDragging: function () { return dragging; },
    getDisk: function () { return { cx: diskCx, cy: diskCy, r: diskR }; }
  };

  /* ---------------- loop ---------------- */
  var raf = 0, visible = true;
  function frame() {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    // ease scalars
    curP += (tgtP - curP) * 0.09;
    parX += (tgtParX - parX) * 0.06; parY += (tgtParY - parY) * 0.06;
    lift += (((hoverIso || focusIso) ? 1 : 0) - lift) * 0.12;

    if (curP > 0.55 && focusRot) {                 // juris: ease toward the focused country
      rotation[0] += (focusRot[0] - rotation[0]) * 0.06;
      rotation[1] += (focusRot[1] - rotation[1]) * 0.06;
    } else if (!reduce && !dragging && now() > resumeAt && curP < 0.6) {
      rotation[0] += 0.05;                          // hero: gentle auto-spin
    }
    render(); placeMarkers();
  }
  // pause the globe loop when its visible zone (hero + jurisdictions) is scrolled
  // past — the fixed layer fades out there anyway, so we stop doing any work.
  var zone = {};
  function recomputeVisible() { visible = (zone.hero || zone.jurisdictions) && !document.hidden; }
  if ("IntersectionObserver" in window) {
    var zio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { zone[e.target.id] = e.isIntersecting; });
      recomputeVisible();
    }, { threshold: 0 });
    [document.getElementById("hero"), document.getElementById("jurisdictions")].forEach(function (el) { if (el) zio.observe(el); });
  } else { zone.hero = true; visible = true; }
  document.addEventListener("visibilitychange", recomputeVisible);

  resize();
  fetch("assets/ne_110m_land.json").then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(function (geo) { land = geo; buildDots(geo.features); }).catch(function () {});
  raf = requestAnimationFrame(frame);
})();
