(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ---------- theme switch (dark / light, blue-tinted) ---------- */
  var root = document.documentElement;
  var storedTheme = null;
  try { storedTheme = localStorage.getItem("theme"); } catch (err) {}
  if (storedTheme === "light" || storedTheme === "dark") root.dataset.theme = storedTheme;
  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.dataset.theme === "light" ? "dark" : "light";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (err) {}
    });
  }

  /* ---------- nav: glass on scroll + Dynamic-Island collapse ---------- */
  var nav = document.getElementById("nav");
  var lastY = window.scrollY || 0, ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    nav.classList.toggle("scrolled", y > 24);
    if (y < 120) {
      nav.classList.remove("collapsed");           // full nav near the top
    } else if (y > lastY + 3) {
      nav.classList.add("collapsed");              // scrolling down → shrink to wordmark
    } else if (y < lastY - 3) {
      nav.classList.remove("collapsed");           // scrolling up → expand
    }
    lastY = y;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { onScroll(); ticking = false; }); }
  }, { passive: true });
  onScroll();

  /* ---------- mobile drawer ---------- */
  var burger = document.getElementById("burger");
  var closeTimer = null;
  function closeDrawer() {
    if (!nav.classList.contains("open")) return;
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    if (reduce) return;
    nav.classList.add("closing");
    clearTimeout(closeTimer);
    closeTimer = setTimeout(function () { nav.classList.remove("closing"); }, 340);
  }
  burger.addEventListener("click", function () {
    if (nav.classList.contains("open")) { closeDrawer(); return; }
    clearTimeout(closeTimer); nav.classList.remove("closing");
    nav.classList.add("open");
    burger.setAttribute("aria-expanded", "true");
  });
  document.querySelectorAll(".nav-drawer a").forEach(function (a) {
    a.addEventListener("click", closeDrawer);
  });

  /* ---------- scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "-40px" });
    reveals.forEach(function (el) { io.observe(el); });
    // safety net: if the observer never fires (no-paint env / quirky browser), reveal everything
    setTimeout(function () {
      if (document.querySelectorAll(".reveal.in").length === 0) {
        reveals.forEach(function (el) { el.classList.add("in"); });
      }
    }, 1600);
  }

  /* ---------- count-up for trustbar ---------- */
  function countUp(el) {
    var raw = el.textContent.trim();
    var m = raw.match(/^(\d+)(.*)$/);
    if (!m || reduce) return;
    var target = parseInt(m[1], 10), suffix = m[2], start = null, dur = 900;
    function tick(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(p * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  var tb = document.querySelector(".trustbar");
  if (tb) {
    var done = false;
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !done) {
          done = true;
          tb.querySelectorAll("b").forEach(countUp);
        }
      });
    }, { threshold: 0.5 });
    io2.observe(tb);
  }

  /* ---------- hero recommender mock: type + stagger ---------- */
  var chat = document.getElementById("chatLine");
  var rankItems = document.querySelectorAll("#rankList li");
  var phrase = "I'm building a SaaS in France, selling to US customers.";
  function revealRanks() {
    rankItems.forEach(function (li, i) {
      setTimeout(function () { li.classList.add("in"); }, reduce ? 0 : 160 * i);
    });
  }
  if (!chat) { /* hero mock not present on this page */ }
  else if (reduce) {
    chat.textContent = phrase; chat.classList.add("done"); revealRanks();
  } else {
    var i = 0;
    function type() {
      if (i <= phrase.length) {
        chat.textContent = phrase.slice(0, i); i++;
        setTimeout(type, 26);
      } else {
        chat.classList.add("done");
        setTimeout(revealRanks, 350);
      }
    }
    setTimeout(type, 600);
  }

  /* ---------- marquees: duplicate for seamless loop ---------- */
  if (!reduce) {
    document.querySelectorAll(".marquee .logos").forEach(function (track) {
      var items = Array.prototype.slice.call(track.children);
      items.forEach(function (el) {
        var c = el.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        track.appendChild(c);
      });
    });
  }

  /* ---------- jurisdiction search (liquid glass) + globe linkage ---------- */
  var JD = window.JURIS_DATA || [];
  var ALLJ = window.JURISDICTIONS_ALL || [];
  var searchInput = document.getElementById("jSearchInput");
  var searchResults = document.getElementById("jSearchResults");

  function norm(s) { return s.replace(/[(),]/g, "").replace(/\s+/g, " ").trim().toLowerCase(); }
  function jxMatch(name) {
    for (var i = 0; i < JD.length; i++) if (norm(JD[i].name) === norm(name)) return JD[i];
    return null;
  }
  function selectResult(j) {
    var jx = jxMatch(j[0]);
    if (!window.Globe) return;
    if (jx) { window.Globe.clearSearch(); window.Globe.focus(jx.iso); }
    else { window.Globe.focus(null); window.Globe.focusAt(j[3], j[4], { name: j[0], iso: j[1].toUpperCase(), region: j[2] }); }
  }
  function resultHTML(j, i) {
    return '<button type="button" class="jresult' + (i === 0 ? " active" : "") + '" data-idx="' + i + '">' +
      '<img class="jresult-flag" src="https://flagcdn.com/w40/' + j[1] + '.png" alt="" loading="lazy" width="22" height="22">' +
      '<span class="jresult-name">' + j[0] + '</span>' +
      '<span class="jresult-region">' + j[2] + '</span>' +
    '</button>';
  }
  if (searchInput && searchResults && ALLJ.length) {
    searchInput.addEventListener("input", function () {
      var q = searchInput.value.trim().toLowerCase();
      if (!q) {
        searchResults.innerHTML = "";
        if (window.Globe) window.Globe.clearSearch();
        return;
      }
      var list = ALLJ.filter(function (j) { return j[0].toLowerCase().indexOf(q) >= 0; }).slice(0, 8);
      if (!list.length) {
        searchResults.innerHTML = '<div class="jsearch-empty">No jurisdiction found.</div>';
        if (window.Globe) window.Globe.clearSearch();
        return;
      }
      searchResults.innerHTML = list.map(resultHTML).join("");
      searchResults.querySelectorAll(".jresult").forEach(function (btn, i) {
        btn.addEventListener("mouseenter", function () {
          searchResults.querySelectorAll(".jresult").forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          selectResult(list[i]);
        });
        btn.addEventListener("click", function () {
          searchResults.querySelectorAll(".jresult").forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          selectResult(list[i]);
        });
      });
      selectResult(list[0]);
    });

    // quick-select pills for the jurisdictions on the current plan
    var jquick = document.getElementById("jQuick");
    if (jquick && JD.length) {
      jquick.innerHTML = JD.map(function (j) {
        var badge = j.live ? '<span class="jqpill-badge">Recommended</span>' : '<span class="jqpill-badge soon">Soon</span>';
        return '<button type="button" class="jqpill" data-iso="' + j.iso + '">' +
          '<img class="jqpill-flag" src="https://flagcdn.com/w40/' + j.iso.toLowerCase() + '.png" alt="" loading="lazy" width="18" height="18">' +
          '<span>' + j.name + '</span>' + badge +
        '</button>';
      }).join("");
      jquick.querySelectorAll(".jqpill").forEach(function (btn) {
        var iso = btn.dataset.iso;
        btn.addEventListener("mouseenter", function () {
          jquick.querySelectorAll(".jqpill").forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          if (window.Globe) { window.Globe.clearSearch(); window.Globe.focus(iso); }
        });
        btn.addEventListener("click", function () {
          jquick.querySelectorAll(".jqpill").forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          if (window.Globe) { window.Globe.clearSearch(); window.Globe.focus(iso); }
        });
        btn.addEventListener("mouseleave", function () {
          btn.classList.remove("active");
          if (window.Globe) window.Globe.focus(null);
        });
      });
    }

    var jsec = document.getElementById("jurisdictions");
    if (jsec && JD.length && "IntersectionObserver" in window) {
      var jio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { if (window.Globe) window.Globe.focus(JD[0].iso); jio.unobserve(jsec); }
        });
      }, { threshold: 0.45 });
      jio.observe(jsec);
    }
  }

  /* ---------- back office tabs ---------- */
  var boTabs = document.getElementById("boTabs");
  boTabs.addEventListener("click", function (e) {
    var btn = e.target.closest(".tab"); if (!btn) return;
    var key = btn.dataset.tab;
    this.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); });
    btn.classList.add("active");
    document.querySelectorAll(".tab-panel").forEach(function (p) {
      p.classList.toggle("active", p.dataset.panel === key);
    });
  });

  /* ---------- dashboard entity switch ---------- */
  document.querySelectorAll(".dash-entity .ent").forEach(function (ent) {
    ent.addEventListener("click", function () {
      document.querySelectorAll(".dash-entity .ent").forEach(function (e) { e.classList.remove("active"); });
      ent.classList.add("active");
    });
  });

  /* ---------- liquid-glass pointer light (laser glow follows the cursor) ---------- */
  var GLOW_SEL = ".btn,.card,.j-card,.jcard,.reco-card,.dash-callout,.lg,.nav-inner,.jsearch-box";
  var tiltEl = null, glowEl = null;
  function clearGlow(el) {
    el.style.setProperty("--mx", "-999px"); el.style.setProperty("--my", "-999px");
  }
  document.addEventListener("pointermove", function (e) {
    var el = e.target.closest ? e.target.closest(GLOW_SEL) : null;
    if (glowEl && glowEl !== el) { clearGlow(glowEl); glowEl = null; }
    if (!el) {
      if (tiltEl) { tiltEl.style.setProperty("--tiltX", "0deg"); tiltEl.style.setProperty("--tiltY", "0deg"); tiltEl = null; }
      return;
    }
    glowEl = el;
    var r = el.getBoundingClientRect();
    el.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
    el.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");

    // super-subtle tilt toward the cursor (tiny rotation, no perspective drama)
    if (!reduce) {
      if (tiltEl && tiltEl !== el) { tiltEl.style.setProperty("--tiltX", "0deg"); tiltEl.style.setProperty("--tiltY", "0deg"); }
      tiltEl = el;
      var px = (e.clientX - r.left) / r.width - 0.5;   // -0.5..0.5
      var py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--tiltX", (px * 2.4).toFixed(2) + "deg");
      el.style.setProperty("--tiltY", (py * -2.4).toFixed(2) + "deg");
    }
  }, { passive: true });
  document.addEventListener("pointerleave", function () {
    if (tiltEl) { tiltEl.style.setProperty("--tiltX", "0deg"); tiltEl.style.setProperty("--tiltY", "0deg"); tiltEl = null; }
    if (glowEl) { clearGlow(glowEl); glowEl = null; }
  });

  /* ---------- the "scene": scroll progress, parallax, dissolve, dock ---------- */
  var heroEl = document.getElementById("hero");
  var heroCenter = document.querySelector(".hero-center");
  var jurisLeft = document.querySelector(".juris2-left");
  var jSec = document.getElementById("jurisdictions");
  var logobarEl = document.querySelector(".logobar");
  var stars = document.getElementById("spaceStars");
  var scrollCue = document.querySelector(".hero-scrollcue");
  var globeLayer = document.getElementById("globeLayer");
  var mX = 0, mY = 0, cmX = 0, cmY = 0;
  window.addEventListener("pointermove", function (e) {
    mX = (e.clientX / window.innerWidth - 0.5) * 2;
    mY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function scene() {
    requestAnimationFrame(scene);
    var vh = window.innerHeight;
    var heroH = heroEl ? heroEl.offsetHeight : vh;
    var y = window.scrollY || window.pageYOffset || 0;
    var p = clamp01(y / (heroH * 0.9));                 // hero -> jurisdictions progress
    if (window.Globe) window.Globe.setProgress(p);

    if (!reduce) { cmX += (mX - cmX) * 0.06; cmY += (mY - cmY) * 0.06; }
    if (window.Globe) window.Globe.setParallax(cmX, cmY);

    // site-wide subtle cursor parallax for cards/panels
    if (!reduce) {
      document.documentElement.style.setProperty("--parX", (cmX * 4).toFixed(2) + "px");
      document.documentElement.style.setProperty("--parY", (cmY * 4).toFixed(2) + "px");
    }

    if (heroCenter) {
      var ho = 1 - clamp01((p - 0.05) / 0.5);
      heroCenter.style.opacity = ho.toFixed(3);
      heroCenter.style.transform = "translate3d(" + (cmX * 8).toFixed(1) + "px," + (-p * 50 + cmY * 6).toFixed(1) + "px,0)";
      heroCenter.style.pointerEvents = ho < 0.1 ? "none" : "";
      if (scrollCue) scrollCue.style.opacity = ho.toFixed(3);
    }
    if (jurisLeft) {
      var jp = clamp01((p - 0.42) / 0.45);
      jurisLeft.style.opacity = jp.toFixed(3);
      jurisLeft.style.transform = "translate3d(" + ((1 - jp) * -26).toFixed(1) + "px," + (cmY * 5).toFixed(1) + "px,0)";
    }
    if (stars && !reduce) stars.style.transform = "translate3d(" + (cmX * -14).toFixed(1) + "px," + (y * -0.06 + cmY * -10).toFixed(1) + "px,0)";
    if (globeLayer && jSec) {
      // dark "space" layer covers hero + jurisdictions + the strip, then
      // fades out exactly as the strip's bottom edge clears the viewport
      var darkEnd = (logobarEl || jSec).offsetTop + (logobarEl || jSec).offsetHeight;
      var parkP = clamp01((y - (darkEnd - vh)) / (vh * 0.4));
      globeLayer.style.opacity = (1 - parkP).toFixed(3);
      globeLayer.classList.toggle("parked", parkP >= 0.999);
      if (logobarEl) logobarEl.classList.toggle("on-light", parkP > 0.5 || root.dataset.theme === "light");
    }
  }
  requestAnimationFrame(scene);
})();
