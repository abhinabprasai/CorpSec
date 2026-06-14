/* jurisdictions.js — the full 79-jurisdiction list (name, region, flag code)
   used to render the draggable strip in the logo-bar section.
   Rendering + drag-to-scroll logic lives here too. */
(function () {
  "use strict";

  var ALL = [
    ["Abu Dhabi (Mainland), UAE", "ae", "Middle East"],
    ["ADGM (Abu Dhabi Global Market)", "ae", "Middle East"],
    ["Andorra", "ad", "Europe"],
    ["Anguilla", "ai", "Offshore"],
    ["Argentina", "ar", "Latin America"],
    ["Australia", "au", "Oceania"],
    ["Austria", "at", "Europe"],
    ["Bahrain", "bh", "Middle East"],
    ["Belgium", "be", "Europe"],
    ["Belize", "bz", "Offshore"],
    ["Bermuda", "bm", "Offshore"],
    ["Brazil", "br", "South America"],
    ["British Virgin Islands", "vg", "Offshore"],
    ["California, USA", "us", "North America"],
    ["Canada", "ca", "North America"],
    ["Cayman Islands", "ky", "Offshore"],
    ["China", "cn", "Asia"],
    ["Costa Rica", "cr", "Latin America"],
    ["Cyprus", "cy", "Europe"],
    ["Czech Republic", "cz", "Europe"],
    ["Delaware, USA", "us", "North America"],
    ["Denmark", "dk", "Europe"],
    ["Dubai, UAE", "ae", "Middle East"],
    ["Egypt", "eg", "Africa"],
    ["Estonia", "ee", "Europe"],
    ["Finland", "fi", "Europe"],
    ["France", "fr", "Europe"],
    ["Georgia", "ge", "Europe"],
    ["Germany", "de", "Europe"],
    ["Gibraltar", "gi", "Europe"],
    ["Greece", "gr", "Europe"],
    ["Hong Kong", "hk", "Asia"],
    ["India", "in", "Asia"],
    ["Indonesia", "id", "Asia"],
    ["Ireland", "ie", "Europe"],
    ["Isle of Man", "im", "Offshore"],
    ["Israel", "il", "Middle East"],
    ["Italy", "it", "Europe"],
    ["Japan", "jp", "Asia"],
    ["Jersey", "je", "Offshore"],
    ["Liechtenstein", "li", "Europe"],
    ["Lithuania", "lt", "Europe"],
    ["Luxembourg", "lu", "Europe"],
    ["Malta", "mt", "Europe"],
    ["Mauritius", "mu", "Africa"],
    ["Mexico", "mx", "Latin America"],
    ["Monaco", "mc", "Europe"],
    ["Morocco", "ma", "Africa"],
    ["Nepal", "np", "Asia"],
    ["Netherlands", "nl", "Europe"],
    ["Nevada, USA", "us", "North America"],
    ["New York, USA", "us", "North America"],
    ["New Zealand", "nz", "Oceania"],
    ["Nigeria", "ng", "Africa"],
    ["Norway", "no", "Europe"],
    ["Oman", "om", "Middle East"],
    ["Pakistan", "pk", "Asia"],
    ["Panama", "pa", "Latin America"],
    ["Philippines", "ph", "Asia"],
    ["Poland", "pl", "Europe"],
    ["Portugal", "pt", "Europe"],
    ["Qatar", "qa", "Middle East"],
    ["Rwanda", "rw", "Africa"],
    ["Saudi Arabia", "sa", "Middle East"],
    ["Seychelles", "sc", "Africa"],
    ["Singapore", "sg", "Asia"],
    ["South Africa", "za", "Africa"],
    ["South Korea", "kr", "Asia"],
    ["Spain", "es", "Europe"],
    ["Sweden", "se", "Europe"],
    ["Switzerland", "ch", "Europe"],
    ["Texas, USA", "us", "North America"],
    ["Thailand", "th", "Asia"],
    ["Turkey", "tr", "Europe"],
    ["United Kingdom", "gb", "Europe"],
    ["Uruguay", "uy", "Latin America"],
    ["USA - Florida", "us", "North America"],
    ["Vietnam", "vn", "Asia"],
    ["Wyoming, USA", "us", "North America"]
  ];
  window.JURISDICTIONS_ALL = ALL;

  var track = document.getElementById("jurisStripTrack");
  if (!track) return;

  track.innerHTML = ALL.map(function (j) {
    return '<span class="jpill">' +
      '<img class="jpill-flag" src="https://flagcdn.com/w40/' + j[1] + '.png" alt="" loading="lazy" width="18" height="13">' +
      '<span class="jpill-name">' + j[0] + '</span>' +
    '</span>';
  }).join("");

  /* ---- drag-to-scroll ---- */
  var strip = track.parentElement;
  var dragging = false, moved = false, startX = 0, startScroll = 0;
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
  strip.addEventListener("pointerleave", endDrag);
  strip.addEventListener("pointercancel", endDrag);
  strip.addEventListener("click", function (e) { if (moved) e.preventDefault(); }, true);
})();
