/* jurisdictions.js — the full 79-jurisdiction list (name, region, flag code)
   used to render the draggable strip in the logo-bar section.
   Rendering + drag-to-scroll logic lives here too. */
(function () {
  "use strict";

  var ALL = [
    ["Abu Dhabi (Mainland), UAE", "ae", "Middle East", 24.4539, 54.3773],
    ["ADGM (Abu Dhabi Global Market)", "ae", "Middle East", 24.4539, 54.3773],
    ["Andorra", "ad", "Europe", 42.5063, 1.5218],
    ["Anguilla", "ai", "Offshore", 18.2206, -63.0686],
    ["Argentina", "ar", "Latin America", -34.6037, -58.3816],
    ["Australia", "au", "Oceania", -35.2809, 149.13],
    ["Austria", "at", "Europe", 48.2082, 16.3738],
    ["Bahrain", "bh", "Middle East", 26.0667, 50.5577],
    ["Belgium", "be", "Europe", 50.8503, 4.3517],
    ["Belize", "bz", "Offshore", 17.1899, -88.4976],
    ["Bermuda", "bm", "Offshore", 32.3078, -64.7505],
    ["Brazil", "br", "South America", -15.7939, -47.8828],
    ["British Virgin Islands", "vg", "Offshore", 18.4207, -64.6399],
    ["California, USA", "us", "North America", 38.5816, -121.4944],
    ["Canada", "ca", "North America", 45.4215, -75.6972],
    ["Cayman Islands", "ky", "Offshore", 19.3133, -81.2546],
    ["China", "cn", "Asia", 39.9042, 116.4074],
    ["Costa Rica", "cr", "Latin America", 9.9281, -84.0907],
    ["Cyprus", "cy", "Europe", 35.1856, 33.3823],
    ["Czech Republic", "cz", "Europe", 50.0755, 14.4378],
    ["Delaware, USA", "us", "North America", 39.1582, -75.5244],
    ["Denmark", "dk", "Europe", 55.6761, 12.5683],
    ["Dubai, UAE", "ae", "Middle East", 25.2048, 55.2708],
    ["Egypt", "eg", "Africa", 30.0444, 31.2357],
    ["Estonia", "ee", "Europe", 59.437, 24.7536],
    ["Finland", "fi", "Europe", 60.1699, 24.9384],
    ["France", "fr", "Europe", 48.8566, 2.3522],
    ["Georgia", "ge", "Europe", 41.7151, 44.8271],
    ["Germany", "de", "Europe", 52.52, 13.405],
    ["Gibraltar", "gi", "Europe", 36.1408, -5.3536],
    ["Greece", "gr", "Europe", 37.9838, 23.7275],
    ["Hong Kong", "hk", "Asia", 22.3193, 114.1694],
    ["India", "in", "Asia", 28.6139, 77.209],
    ["Indonesia", "id", "Asia", -6.2088, 106.8456],
    ["Ireland", "ie", "Europe", 53.3498, -6.2603],
    ["Isle of Man", "im", "Offshore", 54.2361, -4.5481],
    ["Israel", "il", "Middle East", 31.7683, 35.2137],
    ["Italy", "it", "Europe", 41.9028, 12.4964],
    ["Japan", "jp", "Asia", 35.6762, 139.6503],
    ["Jersey", "je", "Offshore", 49.2144, -2.1312],
    ["Liechtenstein", "li", "Europe", 47.166, 9.5554],
    ["Lithuania", "lt", "Europe", 54.6872, 25.2797],
    ["Luxembourg", "lu", "Europe", 49.6116, 6.1319],
    ["Malta", "mt", "Europe", 35.8997, 14.5146],
    ["Mauritius", "mu", "Africa", -20.1609, 57.5012],
    ["Mexico", "mx", "Latin America", 19.4326, -99.1332],
    ["Monaco", "mc", "Europe", 43.7384, 7.4246],
    ["Morocco", "ma", "Africa", 33.9716, -6.8498],
    ["Nepal", "np", "Asia", 27.7172, 85.324],
    ["Netherlands", "nl", "Europe", 52.3676, 4.9041],
    ["Nevada, USA", "us", "North America", 39.1638, -119.7674],
    ["New York, USA", "us", "North America", 40.7128, -74.006],
    ["New Zealand", "nz", "Oceania", -41.2865, 174.7762],
    ["Nigeria", "ng", "Africa", 9.0765, 7.3986],
    ["Norway", "no", "Europe", 59.9139, 10.7522],
    ["Oman", "om", "Middle East", 23.588, 58.3829],
    ["Pakistan", "pk", "Asia", 33.6844, 73.0479],
    ["Panama", "pa", "Latin America", 8.9824, -79.5199],
    ["Philippines", "ph", "Asia", 14.5995, 120.9842],
    ["Poland", "pl", "Europe", 52.2297, 21.0122],
    ["Portugal", "pt", "Europe", 38.7223, -9.1393],
    ["Qatar", "qa", "Middle East", 25.2854, 51.531],
    ["Rwanda", "rw", "Africa", -1.9706, 30.1044],
    ["Saudi Arabia", "sa", "Middle East", 24.7136, 46.6753],
    ["Seychelles", "sc", "Africa", -4.6796, 55.492],
    ["Singapore", "sg", "Asia", 1.3521, 103.8198],
    ["South Africa", "za", "Africa", -25.7479, 28.2293],
    ["South Korea", "kr", "Asia", 37.5665, 126.978],
    ["Spain", "es", "Europe", 40.4168, -3.7038],
    ["Sweden", "se", "Europe", 59.3293, 18.0686],
    ["Switzerland", "ch", "Europe", 46.948, 7.4474],
    ["Texas, USA", "us", "North America", 30.2672, -97.7431],
    ["Thailand", "th", "Asia", 13.7563, 100.5018],
    ["Turkey", "tr", "Europe", 39.9334, 32.8597],
    ["United Kingdom", "gb", "Europe", 51.5074, -0.1278],
    ["Uruguay", "uy", "Latin America", -34.9011, -56.1645],
    ["USA - Florida", "us", "North America", 25.7617, -80.1918],
    ["Vietnam", "vn", "Asia", 21.0278, 105.8342],
    ["Wyoming, USA", "us", "North America", 41.14, -104.8202]
  ];
  window.JURISDICTIONS_ALL = ALL;

  var track = document.getElementById("jurisStripTrack");
  if (!track) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  var pillsHTML = ALL.map(function (j) {
    return '<span class="jpill">' +
      '<img class="jpill-flag" src="https://flagcdn.com/w40/' + j[1] + '.png" alt="" loading="lazy" width="18" height="13">' +
      '<span class="jpill-name">' + j[0] + '</span>' +
    '</span>';
  }).join("");
  // duplicate the set so the auto-scroll can loop seamlessly
  track.innerHTML = pillsHTML + pillsHTML;

  /* ---- drag-to-scroll ---- */
  var strip = track.parentElement;
  var dragging = false, moved = false, hovering = false, startX = 0, startScroll = 0;
  strip.addEventListener("pointerdown", function (e) {
    dragging = true; moved = false; startX = e.clientX; startScroll = strip.scrollLeft;
    strip.classList.add("dragging");
    try { strip.setPointerCapture(e.pointerId); } catch (err) {}
  });
  strip.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - startX;
    if (Math.abs(dx) > 3) moved = true;
    strip.scrollLeft = startScroll - dx;
  });
  function endDrag() { dragging = false; strip.classList.remove("dragging"); }
  strip.addEventListener("pointerup", endDrag);
  strip.addEventListener("pointerleave", function () { hovering = false; endDrag(); });
  strip.addEventListener("pointercancel", endDrag);
  strip.addEventListener("pointerenter", function () { hovering = true; });
  strip.addEventListener("click", function (e) { if (moved) e.preventDefault(); }, true);

  /* ---- continuous auto-scroll, pauses on drag/hover/off-screen ---- */
  if (!reduce) {
    var half = 0, visibleStrip = true, last = 0, _stripRT;
    function measureHalf() { half = track.scrollWidth / 2; }
    measureHalf();
    window.addEventListener("resize", function () { clearTimeout(_stripRT); _stripRT = setTimeout(measureHalf, 200); }, { passive: true });
    window.addEventListener("load", measureHalf);
    // do no work while the strip is scrolled out of view (mirrors the globe/cycle gating)
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visibleStrip = es[0].isIntersecting; }, { threshold: 0 }).observe(strip);
    }
    function autoScroll(t) {
      requestAnimationFrame(autoScroll);
      if (dragging || hovering || !visibleStrip || document.hidden) { last = t; return; }
      if (!half) { measureHalf(); if (!half) return; }
      var dt = last ? Math.min(50, t - last) : 16.667; last = t;   // frame-rate independent
      strip.scrollLeft += 0.03 * dt;                                // ~0.5px/frame @60fps
      if (strip.scrollLeft >= half) strip.scrollLeft -= half;
    }
    requestAnimationFrame(autoScroll);
  }
})();
