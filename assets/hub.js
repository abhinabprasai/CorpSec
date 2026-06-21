/* hub.js — Jurisdictions hub: renders the popular bento cards (rich data) and
   the full 79-jurisdiction directory grouped by region, with live search.
   Reuses the landing-page bento system via interactions.js. */
(function () {
  "use strict";
  var RICH = window.JX_DATA || [];
  var BY = window.JX_BY_SLUG || {};
  var ALL = window.JURISDICTIONS_ALL || [];
  var flag = function (iso) { return "https://flagcdn.com/" + iso + ".svg"; };

  function slugify(name) {
    return name.split(/[,(]/)[0].trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function metric(j, re) {
    var m = (j.memo || []).filter(function (x) { return re.test(x.label); })[0];
    if (m) return m.value;
    var f = (j.fiscal || []).filter(function (x) { return re.test(x.label); })[0];
    return f ? f.value : "—";
  }

  /* ---- quick pills ---- */
  var quick = document.getElementById("hubQuick");
  if (quick) {
    quick.innerHTML = RICH.map(function (j) {
      return '<a class="hub-pill" href="jurisdiction.html?j=' + j.slug + '">' +
        '<img src="' + flag(j.iso) + '" alt="" width="18" height="14" />' + j.name + '</a>';
    }).join("");
  }

  /* ---- popular rich cards ---- */
  var pop = document.getElementById("jxPopular");
  if (pop) {
    pop.innerHTML = RICH.map(function (j) {
      var tax = metric(j, /corp/i), setup = metric(j, /setup|active|timing/i);
      var price = (j.bundle && j.bundle.priceLabel) || "—";
      var tags = (j.bestForTags || []).slice(0, 2).map(function (t) { return '<span class="hub-card__tag">' + t + '</span>'; }).join("");
      return '<a class="bento-card hub-card reveal" data-slot="card" data-name="' + j.name.toLowerCase() + '" href="jurisdiction.html?j=' + j.slug + '">' +
        '<div class="bento-card__border"></div><div class="bento-card__border-glow"></div>' +
        '<div class="bento-card__inner">' +
        '<div class="hub-card__top"><span class="jx-flag-chip"><img src="' + flag(j.iso) + '" alt="" width="34" height="26" /></span>' +
        '<div class="hub-card__id"><b>' + j.name + '</b><small>' + (j.region || "") + '</small></div></div>' +
        '<dl class="hub-card__metrics"><div><dt>Corp tax</dt><dd>' + tax + '</dd></div>' +
        '<div><dt>Setup</dt><dd>' + setup + '</dd></div><div><dt>From</dt><dd>' + price + '</dd></div></dl>' +
        '<div class="hub-card__tags">' + tags + '</div>' +
        '<span class="hub-card__go">Explore ' + j.name + ' <span aria-hidden="true">→</span></span>' +
        '</div></a>';
    }).join("");
  }

  /* ---- all by region ---- */
  var allMount = document.getElementById("jxAll");
  var regions = {};
  ALL.forEach(function (row) {
    var name = row[0], iso = row[1], region = row[2] || "Other";
    (regions[region] = regions[region] || []).push({ name: name, iso: iso, region: region, slug: slugify(name) });
  });
  var order = ["North America", "Europe", "Asia", "Middle East", "Offshore", "Latin America", "South America", "Africa", "Oceania", "Other"];
  var regionKeys = Object.keys(regions).sort(function (a, b) {
    var ia = order.indexOf(a), ib = order.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  if (allMount) {
    allMount.innerHTML = regionKeys.map(function (region) {
      var cards = regions[region].map(function (j) {
        var rich = !!BY[j.slug];
        return '<a class="hub-mini" data-name="' + j.name.toLowerCase() + '" href="jurisdiction.html?j=' + j.slug + '">' +
          '<span class="jx-flag-chip jx-flag-chip--sm"><img src="' + flag(j.iso) + '" alt="" width="24" height="18" loading="lazy" /></span>' +
          '<span class="hub-mini__name">' + j.name + (rich ? ' <span class="hub-mini__dot" title="In-depth guide" aria-hidden="true"></span>' : '') + '</span>' +
          '<span class="hub-mini__go" aria-hidden="true">→</span></a>';
      }).join("");
      return '<div class="hub-region" data-region="' + region + '"><h3 class="hub-region__h">' + region +
        ' <span class="hub-region__n">' + regions[region].length + '</span></h3>' +
        '<div class="hub-region__grid">' + cards + '</div></div>';
    }).join("");
  }

  /* ---- globe: show full sphere immediately + parallax on mouse ---- */
  function bootGlobe() {
    if (!window.Globe) return;
    window.Globe.setProgress(1);
    // subtle cursor parallax on the hub hero
    var hero = document.querySelector(".hub-hero");
    if (hero) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        window.Globe.setParallax(nx * 0.4, ny * 0.4);
      }, { passive: true });
    }
  }
  // boot after globe.js has had a chance to initialize
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootGlobe);
  else setTimeout(bootGlobe, 0);

  /* ---- quick pills: click → focus globe ---- */
  if (quick) {
    quick.addEventListener("click", function (e) {
      var pill = e.target.closest(".hub-pill");
      if (pill && window.Globe) {
        var href = pill.getAttribute("href") || "";
        var iso = ALL.filter(function (r) {
          return href.indexOf(slugify(r[0])) > -1;
        }).map(function (r) { return r[1]; })[0] || "";
        if (iso) window.Globe.focus(iso);
      }
    });
  }

  /* ---- live search (filters cards + directory + globe) ---- */
  var input = document.getElementById("hubSearch");
  var empty = document.getElementById("jxEmpty");
  var form = document.getElementById("hubSearchForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });
  if (input) {
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var firstIso = null, anyMini = 0;
      // popular cards
      document.querySelectorAll("#jxPopular .hub-card").forEach(function (c) {
        var hit = !q || c.dataset.name.indexOf(q) > -1;
        c.style.display = hit ? "" : "none";
        if (hit && !firstIso) firstIso = c.dataset.iso || null;
      });
      // all minis + region visibility
      document.querySelectorAll(".hub-region").forEach(function (rg) {
        var shown = 0;
        rg.querySelectorAll(".hub-mini").forEach(function (m) {
          var hit = !q || m.dataset.name.indexOf(q) > -1;
          m.style.display = hit ? "" : "none";
          if (hit) { shown++; if (!firstIso) firstIso = m.dataset.iso || null; }
        });
        rg.style.display = shown ? "" : "none";
        anyMini += shown;
      });
      if (empty) empty.hidden = anyMini > 0;
      // globe focus
      if (window.Globe) {
        if (q && firstIso) window.Globe.focus(firstIso);
        else window.Globe.clearSearch();
      }
    });
  }

  if (window.Interactions) window.Interactions.refresh(document);
})();
