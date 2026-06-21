/* nav.js — shared chrome for the standalone Jurisdiction pages (hub + detail).
   Mirrors app.js's theme + nav-scroll + drawer behavior so the new pages stay
   consistent with index.html, WITHOUT pulling in app.js's index-only wiring.
   Everything is null-guarded so it is safe on any page. */
(function () {
  "use strict";
  var PERF = window.__PERF || {};
  var reduce = PERF.reduce != null ? PERF.reduce
    : (window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches);
  var root = document.documentElement;

  /* theme — same localStorage key ("theme") as app.js so it persists across pages */
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}
  if (stored === "light" || stored === "dark") root.dataset.theme = stored;
  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.dataset.theme === "light" ? "dark" : "light";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* nav: glass on scroll + collapse on scroll-down */
  var nav = document.getElementById("nav");
  if (nav) {
    var lastY = window.scrollY || 0, ticking = false;
    var onScroll = function () {
      var y = window.scrollY || window.pageYOffset || 0;
      nav.classList.toggle("scrolled", y > 24);
      if (y < 120) nav.classList.remove("collapsed");
      else if (y > lastY + 3) nav.classList.add("collapsed");
      else if (y < lastY - 3) nav.classList.remove("collapsed");
      lastY = y;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(function () { onScroll(); ticking = false; }); }
    }, { passive: true });
    onScroll();

    /* mobile drawer */
    var burger = document.getElementById("burger");
    var closeTimer = null;
    var closeDrawer = function () {
      if (!nav.classList.contains("open")) return;
      nav.classList.remove("open");
      if (burger) burger.setAttribute("aria-expanded", "false");
      if (reduce) return;
      nav.classList.add("closing");
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () { nav.classList.remove("closing"); }, 340);
    };
    if (burger) {
      burger.addEventListener("click", function () {
        if (nav.classList.contains("open")) { closeDrawer(); return; }
        clearTimeout(closeTimer); nav.classList.remove("closing");
        nav.classList.add("open");
        burger.setAttribute("aria-expanded", "true");
      });
    }
    document.querySelectorAll(".nav-drawer a").forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });
  }
})();
