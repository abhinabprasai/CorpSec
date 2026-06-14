/* particles.js — site-wide sandpaper grain layer.
   A fixed full-viewport canvas drawing a dense field of tiny static
   grain specks, tinted light-on-dark / dark-on-light depending on the
   section beneath them, with extra density/contrast near section
   boundaries ("dissolve" look) and a subtle cursor disturbance
   (no glow — just a slight local density/contrast bump, like grit
   shifting under a finger).
   Fails soft (no canvas / reduced motion -> static, very light grain). */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  var canvas = document.createElement("canvas");
  canvas.id = "grainLayer";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  var ctx = canvas.getContext("2d");

  var W = 1, H = 1, dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  var docH = 1;

  /* ---- dark-section ranges (page-Y px) for the dissolve tint ---- */
  var darkSelectors = ["#hero", "#jurisdictions", ".band-dark", ".band-primary"];
  var darkRanges = [];
  function measure() {
    W = window.innerWidth; H = window.innerHeight;
    docH = Math.max(document.documentElement.scrollHeight, H);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    darkRanges = [];
    darkSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        var top = el.offsetTop, h = el.offsetHeight;
        darkRanges.push([top, top + h]);
      });
    });
    darkRanges.sort(function (a, b) { return a[0] - b[0]; });
    spawnAll();
  }

  var TRANS = 170; // px band around a dark/light boundary that "dissolves"
  function darkness(pageY) {
    for (var i = 0; i < darkRanges.length; i++) {
      var r = darkRanges[i];
      if (pageY >= r[0] && pageY <= r[1]) {
        var dTop = pageY - r[0], dBot = r[1] - pageY, d = Math.min(dTop, dBot);
        return d < TRANS ? 0.5 + 0.5 * (d / TRANS) : 1;
      }
      if (pageY < r[0]) {
        var dist = r[0] - pageY;
        return dist < TRANS ? 0.5 * (1 - dist / TRANS) : 0;
      }
    }
    return 0;
  }
  function transitionMix(pageY) {
    var best = 1;
    for (var i = 0; i < darkRanges.length; i++) {
      best = Math.min(best, Math.abs(pageY - darkRanges[i][0]) / TRANS);
      best = Math.min(best, Math.abs(pageY - darkRanges[i][1]) / TRANS);
    }
    return Math.max(0, 1 - Math.min(1, best));
  }

  /* ---- sandpaper grain field: dense, static positions, fine specks ---- */
  var grains = [];
  function spawnAll() {
    var density = 1 / 28; // specks per px^2 of viewport
    var n = Math.min(22000, Math.round(W * H * density));
    grains = [];
    for (var i = 0; i < n; i++) {
      grains.push({
        x: Math.random() * W,
        py: Math.random() * docH,
        r: Math.random() < 0.6 ? 1 : (Math.random() < 0.85 ? 1.5 : 2),
        base: 0.7 + Math.random() * 0.5, // per-speck brightness variance
        ox: 0, oy: 0, vx: 0, vy: 0 // smoke-drift offset + inertia
      });
    }
  }

  /* ---- cursor ---- */
  var mx = -9999, my = -9999, tmx = -9999, tmy = -9999;
  window.addEventListener("pointermove", function (e) { tmx = e.clientX; tmy = e.clientY; }, { passive: true });
  window.addEventListener("pointerleave", function () { tmx = -9999; tmy = -9999; }, { passive: true });

  var t = 0;
  function frame() {
    requestAnimationFrame(frame);
    t += 1;
    var scrollY = window.scrollY || window.pageYOffset || 0;
    mx += (tmx - mx) * 0.18; my += (tmy - my) * 0.18;
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < grains.length; i++) {
      var g = grains[i];
      var sy = g.py - scrollY;
      if (sy < -4 - 40 || sy > H + 4 + 40) continue;

      // smoke-like inertia: cursor pushes grains away, they drift with
      // momentum and slowly settle back to their resting position
      if (!reduce) {
        var px = g.x + g.ox, py = sy + g.oy;
        var pdx = px - mx, pdy = py - my, pdist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pdist < 110 && pdist > 0.01) {
          var force = (1 - pdist / 110) * 1.6;
          g.vx += (pdx / pdist) * force;
          g.vy += (pdy / pdist) * force;
        }
        g.vx += -g.ox * 0.012; g.vy += -g.oy * 0.012; // gentle spring home
        g.vx *= 0.92; g.vy *= 0.92;                    // drag / friction
        g.ox += g.vx; g.oy += g.vy;
      }

      var sx = g.x + g.ox, ssy = sy + g.oy;
      if (ssy < -4 || ssy > H + 4) continue;

      var dk = darkness(g.py);
      var tr = transitionMix(g.py);

      // cursor disturbance: nearby specks get slightly brighter/larger, no glow
      var dx = sx - mx, dy = ssy - my, dist = Math.sqrt(dx * dx + dy * dy);
      var disturb = dist < 110 ? (1 - dist / 110) : 0;

      // flicker: gentle per-frame shimmer, like light catching grit at slightly
      // different angles each instant
      var flicker = reduce ? 1 : 0.7 + 0.3 * Math.random();

      var baseA = (0.12 + 0.16 * dk) * g.base;     // grain base visibility
      var a = Math.min(0.85, (baseA + tr * 0.16 + disturb * 0.2) * flicker);
      var r = g.r + tr * 0.4 + disturb * 0.5;

      var col = dk > 0.5 ? "255,255,255" : "40,52,76";
      ctx.fillStyle = "rgba(" + col + "," + a.toFixed(3) + ")";
      ctx.fillRect(sx, ssy, r, r);
    }
  }

  measure();
  window.addEventListener("resize", measure, { passive: true });
  // re-measure after layout settles (fonts/images can shift section heights)
  setTimeout(measure, 400); setTimeout(measure, 1500);

  requestAnimationFrame(frame);
})();
