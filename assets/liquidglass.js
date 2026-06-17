/* liquidglass.js — real refraction for any element tagged [data-lg].
   Builds an SVG displacement filter from a rounded-rect signed-distance
   field and drives it through backdrop-filter, so content BEHIND the
   element is bent like glass. Ported to vanilla JS from the React/SVG
   "liquid glass" component. Degrades to the CSS .lg glass if the browser
   can't do SVG backdrop filters. */
(function () {
  "use strict";

  function smoothStep(a, b, t) { t = Math.max(0, Math.min(1, (t - a) / (b - a))); return t * t * (3 - 2 * t); }
  function len(x, y) { return Math.sqrt(x * x + y * y); }
  function roundedRectSDF(x, y, w, h, r) {
    var qx = Math.abs(x) - w + r, qy = Math.abs(y) - h + r;
    return Math.min(Math.max(qx, qy), 0) + len(Math.max(qx, 0), Math.max(qy, 0)) - r;
  }

  // shared <svg> host for every filter
  var host = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  host.setAttribute("width", "0"); host.setAttribute("height", "0");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;pointer-events:none;z-index:-1";
  var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  host.appendChild(defs);

  var scratch = document.createElement("canvas");
  var sctx = scratch.getContext("2d");
  var uid = 0;
  var registry = [];

  function makeFilter(id) {
    var f = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    f.setAttribute("id", id);
    f.setAttribute("filterUnits", "userSpaceOnUse");
    f.setAttribute("colorInterpolationFilters", "sRGB");
    f.setAttribute("x", "0"); f.setAttribute("y", "0");
    var feImage = document.createElementNS("http://www.w3.org/2000/svg", "feImage");
    feImage.setAttribute("result", id + "_map");
    var feDisp = document.createElementNS("http://www.w3.org/2000/svg", "feDisplacementMap");
    feDisp.setAttribute("in", "SourceGraphic");
    feDisp.setAttribute("in2", id + "_map");
    feDisp.setAttribute("xChannelSelector", "R");
    feDisp.setAttribute("yChannelSelector", "G");
    feDisp.setAttribute("scale", "0");
    f.appendChild(feImage); f.appendChild(feDisp); defs.appendChild(f);
    return { filter: f, feImage: feImage, feDisp: feDisp };
  }

  // settings: how much the glass bends what's behind it
  var S = { w: 0.3, h: 0.2, radius: 0.62, edge: 0.8, offset: 0.15, strength: 1 };

  function build(entry) {
    var el = entry.el;
    var w = Math.max(1, Math.round(el.offsetWidth));
    var h = Math.max(1, Math.round(el.offsetHeight));
    if (!w || !h) return;
    if (entry.w === w && entry.h === h) return;
    entry.w = w; entry.h = h;

    scratch.width = w; scratch.height = h;
    var data = new Uint8ClampedArray(w * h * 4);
    var raw = new Float32Array(w * h * 2);
    var maxScale = 0, k = 0;

    for (var i = 0; i < w * h; i++) {
      var px = i % w, py = (i / w) | 0;
      var ux = px / w - 0.5, uy = py / h - 0.5;
      var dist = roundedRectSDF(ux, uy, S.w, S.h, S.radius);
      var disp = smoothStep(S.edge, 0, dist - S.offset);
      var scaled = smoothStep(0, 1, disp);
      var dx = (ux * scaled + 0.5) * w - px;
      var dy = (uy * scaled + 0.5) * h - py;
      if (Math.abs(dx) > maxScale) maxScale = Math.abs(dx);
      if (Math.abs(dy) > maxScale) maxScale = Math.abs(dy);
      raw[k++] = dx; raw[k++] = dy;
    }
    maxScale *= 0.5; if (maxScale < 0.0001) maxScale = 0.0001;

    var di = 0, ri = 0;
    for (var j = 0; j < w * h; j++) {
      data[di++] = (raw[ri++] / maxScale + 0.5) * 255;
      data[di++] = (raw[ri++] / maxScale + 0.5) * 255;
      data[di++] = 0; data[di++] = 255;
    }
    sctx.putImageData(new ImageData(data, w, h), 0, 0);

    entry.feImage.setAttribute("width", w); entry.feImage.setAttribute("height", h);
    entry.feImage.setAttributeNS("http://www.w3.org/1999/xlink", "href", scratch.toDataURL());
    entry.filter.setAttribute("width", w); entry.filter.setAttribute("height", h);
    entry.feDisp.setAttribute("scale", (maxScale * S.strength).toString());
  }

  function register(el) {
    var id = "lg-" + (uid++).toString(36);
    var parts = makeFilter(id);
    var entry = { el: el, id: id, filter: parts.filter, feImage: parts.feImage, feDisp: parts.feDisp, w: 0, h: 0 };
    registry.push(entry);
    var blur = el.getAttribute("data-lg-blur") || "0.4px";
    el.style.backdropFilter = "url(#" + id + ") blur(" + blur + ") saturate(1.5) brightness(1.06)";
    el.style.webkitBackdropFilter = el.style.backdropFilter;
    el.classList.add("lg-on");
    build(entry);
    if (window.ResizeObserver) {
      var rot; // debounce: the SDF rebuild does a per-pixel loop + PNG encode
      var ro = new ResizeObserver(function () { clearTimeout(rot); rot = setTimeout(function () { build(entry); }, 150); });
      ro.observe(el);
    }
    return entry;
  }

  function init() {
    // SVG-in-backdrop-filter is a Chromium/WebKit capability; if it's missing
    // the .lg CSS (blur + tint + highlights) already carries the look.
    var supported = (function () {
      try { return CSS.supports("backdrop-filter", "url(#x)") || CSS.supports("-webkit-backdrop-filter", "url(#x)"); }
      catch (e) { return false; }
    })();
    // low-spec: skip SVG refraction entirely (per-pixel SDF + PNG encode + an
    // feDisplacementMap inside backdrop-filter is one of the costliest composites).
    // The plain .lg CSS fallback still gives blur + tint + highlights.
    if (window.__PERF && window.__PERF.low) supported = false;
    document.body.appendChild(host);
    if (!supported) return;
    document.querySelectorAll("[data-lg]").forEach(register);
    window.addEventListener("resize", function () { registry.forEach(build); }, { passive: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.LiquidGlass = { refresh: function () { registry.forEach(function (e) { e.w = 0; build(e); }); } };
})();
