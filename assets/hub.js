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

  /* ---- coordinate lookups (for globe focus) built from the full list ---- */
  var COORDS = {}, COORDS_ISO = {}, META = {};
  var SEARCH = [];
  ALL.forEach(function (r) {
    var s = slugify(r[0]);
    if (typeof r[3] === "number") {
      if (COORDS[s] === undefined) COORDS[s] = [r[3], r[4]];
      if (COORDS_ISO[r[1]] === undefined) COORDS_ISO[r[1]] = [r[3], r[4]];
    }
    if (META[s] === undefined) META[s] = { name: r[0], region: r[2] || "", iso: r[1], slug: s };
    SEARCH.push({ name: r[0], slug: s, iso: r[1], region: r[2] || "", rich: !!BY[s] });
  });
  function focusGlobe(slug, iso) {
    if (!window.Globe) return;
    var c = (slug && COORDS[slug]) || (iso && COORDS_ISO[iso]);
    if (c) window.Globe.focusAt(c[0], c[1], (slug && META[slug]) || null);
    else window.Globe.clearSearch();
  }

  /* ---- long corporate-tax sentences → tidy bullet list ---- */
  function taxBullets(val) {
    var parts = String(val).split(/;\s*/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (parts.length < 2) return null;
    return '<ul class="jx-taxbul">' + parts.map(function (p) { return '<li>' + p + '</li>'; }).join("") + '</ul>';
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
      var taxBul = taxBullets(tax);
      var taxRow = taxBul
        ? '<div class="hub-card__metric--stack"><dt>Corp tax</dt>' + taxBul + '</div>'
        : '<div><dt>Corp tax</dt><dd>' + tax + '</dd></div>';
      return '<a class="bento-card hub-card reveal" data-slot="card" data-name="' + j.name.toLowerCase() + '" data-iso="' + j.iso + '" data-slug="' + j.slug + '" href="jurisdiction.html?j=' + j.slug + '">' +
        '<div class="bento-card__border"></div><div class="bento-card__border-glow"></div>' +
        '<div class="bento-card__inner">' +
        '<div class="hub-card__top"><span class="jx-flag-chip"><img src="' + flag(j.iso) + '" alt="" width="34" height="26" /></span>' +
        '<div class="hub-card__id"><b>' + j.name + '</b><small>' + (j.region || "") + '</small></div></div>' +
        '<dl class="hub-card__metrics">' + taxRow +
        '<div class="hub-card__metric--stack"><dt>Setup</dt><dd>' + setup + '</dd></div>' +
        '<div class="hub-card__metric--stack"><dt>From</dt><dd>' + price + '</dd></div></dl>' +
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
        // flagship slugs have a full guide; the rest carry name/iso/region in the
        // URL so the detail page can render a real branded landing (not a stub).
        var href = "jurisdiction.html?j=" + j.slug + (rich ? "" : "&n=" + encodeURIComponent(j.name) + "&iso=" + j.iso + "&r=" + encodeURIComponent(j.region));
        return '<a class="hub-mini" data-name="' + j.name.toLowerCase() + '" data-iso="' + j.iso + '" data-slug="' + j.slug + '" href="' + href + '">' +
          '<span class="jx-flag-chip jx-flag-chip--sm"><img src="' + flag(j.iso) + '" alt="" width="24" height="18" loading="lazy" /></span>' +
          '<span class="hub-mini__name">' + j.name + (rich ? ' <span class="hub-mini__dot" title="In-depth guide" aria-hidden="true"></span>' : '') + '</span>' +
          '<span class="hub-mini__go" aria-hidden="true">→</span></a>';
      }).join("");
      return '<div class="hub-region" data-region="' + region + '"><h3 class="hub-region__h">' + region +
        ' <span class="hub-region__n">' + regions[region].length + '</span></h3>' +
        '<div class="hub-region__grid">' + cards + '</div></div>';
    }).join("");
  }

  /* cobe self-manages its own pointer interaction + always shows the full
     sphere, so the old d3 bootGlobe()/parallax wiring is no longer needed. */

  /* ---- quick pills: hover → focus globe (click navigates) ---- */
  if (quick) {
    quick.addEventListener("pointerenter", function (e) {
      var pill = e.target.closest && e.target.closest(".hub-pill");
      if (!pill) return;
      var slug = (pill.getAttribute("href") || "").split("j=")[1] || "";
      focusGlobe(slug, null);
    }, true);
  }

  /* ---- live search (filters cards + directory + globe) ---- */
  var input = document.getElementById("hubSearch");
  var empty = document.getElementById("jxEmpty");
  var form = document.getElementById("hubSearchForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });
  // screen-reader status: announce filtered result counts (search updates silently otherwise)
  var status = document.createElement("span");
  status.className = "sr-only"; status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");
  if (input && input.parentNode) input.parentNode.appendChild(status);
  if (input) {
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var firstSlug = null, firstIso = null, anyMini = 0;
      buildAC(input.value);
      // popular cards
      document.querySelectorAll("#jxPopular .hub-card").forEach(function (c) {
        var hit = !q || c.dataset.name.indexOf(q) > -1;
        c.style.display = hit ? "" : "none";
        if (hit && !firstSlug) { firstSlug = c.dataset.slug || null; firstIso = c.dataset.iso || null; }
      });
      // all minis + region visibility
      document.querySelectorAll(".hub-region").forEach(function (rg) {
        var shown = 0;
        rg.querySelectorAll(".hub-mini").forEach(function (m) {
          var hit = !q || m.dataset.name.indexOf(q) > -1;
          m.style.display = hit ? "" : "none";
          if (hit) { shown++; if (!firstSlug) { firstSlug = m.dataset.slug || null; firstIso = m.dataset.iso || null; } }
        });
        rg.style.display = shown ? "" : "none";
        anyMini += shown;
      });
      if (empty) empty.hidden = anyMini > 0;
      if (status) status.textContent = q ? (anyMini + " jurisdiction" + (anyMini === 1 ? "" : "s") + " match “" + q + "”") : "";
      // globe focus
      if (q && (firstSlug || firstIso)) focusGlobe(firstSlug, firstIso);
      else if (window.Globe) window.Globe.clearSearch();
    });
  }

  /* ---- search autocomplete dropdown (quick jump + globe rotate) ---- */
  var ac = null, acIdx = -1;
  function acOpts() { return ac ? Array.prototype.slice.call(ac.querySelectorAll("li")) : []; }
  function acSetActive(li) {
    acOpts().forEach(function (o) { o.classList.remove("is-active"); o.setAttribute("aria-selected", "false"); });
    if (li) {
      li.classList.add("is-active"); li.setAttribute("aria-selected", "true"); acIdx = acOpts().indexOf(li);
      if (input) input.setAttribute("aria-activedescendant", li.id);
    } else if (input) { input.removeAttribute("aria-activedescendant"); }
  }
  function acHide() {
    if (ac) { ac.hidden = true; ac.innerHTML = ""; } acIdx = -1;
    if (input) { input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); }
  }
  function buildAC(raw) {
    if (!input || !form) return;
    var q = (raw || "").trim().toLowerCase();
    if (!ac) {
      ac = document.createElement("ul");
      ac.className = "hub-ac"; ac.id = "hubAC"; ac.setAttribute("role", "listbox");
      ac.hidden = true; form.appendChild(ac);
      ac.addEventListener("pointermove", function (e) {
        var li = e.target.closest("li[data-slug]"); if (!li) return;
        acSetActive(li); focusGlobe(li.dataset.slug, li.dataset.iso || null);
      });
      ac.addEventListener("mousedown", function (e) {     // mousedown fires before input blur
        var li = e.target.closest("li[data-href]"); if (!li) return;
        e.preventDefault(); window.location.href = li.dataset.href;
      });
    }
    if (!q) { acHide(); return; }
    var matches = SEARCH.filter(function (j) {
      return j.name.toLowerCase().indexOf(q) > -1 || j.region.toLowerCase().indexOf(q) > -1;
    }).slice(0, 7);
    if (!matches.length) { acHide(); return; }
    ac.innerHTML = matches.map(function (j, idx) {
      var href = "jurisdiction.html?j=" + j.slug + (j.rich ? "" : "&n=" + encodeURIComponent(j.name) + "&iso=" + j.iso + "&r=" + encodeURIComponent(j.region));
      return '<li role="option" id="hubac-opt-' + idx + '" class="hub-ac__opt" data-slug="' + j.slug + '" data-iso="' + j.iso + '" data-href="' + href + '">' +
        '<img class="hub-ac__flag" src="' + flag(j.iso) + '" alt="" width="22" height="16" loading="lazy">' +
        '<span class="hub-ac__name">' + j.name + '</span>' +
        '<span class="hub-ac__region">' + j.region + '</span>' +
        (j.rich ? '<span class="hub-ac__badge">Guide</span>' : '') + '</li>';
    }).join("");
    ac.hidden = false; input.setAttribute("aria-expanded", "true"); acIdx = -1;
  }
  if (input) {
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-controls", "hubAC");
    input.setAttribute("aria-expanded", "false");
    input.addEventListener("keydown", function (e) {
      if (!ac || ac.hidden) return;
      var o = acOpts(); if (!o.length) return;
      if (e.key === "ArrowDown") { e.preventDefault(); acIdx = Math.min(o.length - 1, acIdx + 1); acSetActive(o[acIdx]); focusGlobe(o[acIdx].dataset.slug, o[acIdx].dataset.iso); }
      else if (e.key === "ArrowUp") { e.preventDefault(); acIdx = Math.max(0, acIdx - 1); acSetActive(o[acIdx]); focusGlobe(o[acIdx].dataset.slug, o[acIdx].dataset.iso); }
      else if (e.key === "Enter") { var li = o[acIdx] || o[0]; if (li) { e.preventDefault(); window.location.href = li.dataset.href; } }
      else if (e.key === "Escape") { acHide(); }
    });
    input.addEventListener("blur", function () { setTimeout(acHide, 150); });
    input.addEventListener("focus", function () { if (input.value.trim()) buildAC(input.value); });
  }

  if (window.Interactions) window.Interactions.refresh(document);
})();
