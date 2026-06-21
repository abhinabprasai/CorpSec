(function () {
  "use strict";
  var PERF = window.__PERF || {};
  var reduce = PERF.reduce != null ? PERF.reduce : (window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches);
  var COARSE = !!PERF.coarse;        // touch — no cursor glow/tilt to gain
  var LOW = !!PERF.low;

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

  /* ---------- hide edge rails over dark sections ---------- */
  if ("IntersectionObserver" in window) {
    var darkEls = document.querySelectorAll(".hero,.juris2,.band-dark,.band-primary");
    var darkState = new Map();
    var railIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { darkState.set(e.target, e.isIntersecting); });
      var anyDark = false;
      darkState.forEach(function (v) { if (v) anyDark = true; });
      document.body.classList.toggle("rails-hidden", anyDark);
    }, { threshold: 0 });
    darkEls.forEach(function (el) { railIO.observe(el); });
  }

  /* ---------- testimonial cycle cards: vertical autoscroll + roving dark highlight ---------- */
  (function () {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".pcard--cycle"));
    if (!cards.length) return;

    var states = cards.map(function (card) {
      var track = card.querySelector(".pcycle-track");
      var slides = Array.prototype.slice.call(track.children);
      if (slides.length > 1) track.appendChild(slides[0].cloneNode(true)); // clone first → seamless wrap
      return { card: card, track: track, count: slides.length, idx: 0 };
    });

    function slideH(st) { return st.track.children[0].getBoundingClientRect().height; }

    function advance(st) {
      if (st.count < 2) return;
      st.idx++;
      st.track.style.transition = "transform 1.1s cubic-bezier(.22,1,.36,1)";
      st.track.style.transform = "translateY(" + (-st.idx * slideH(st)) + "px)";
      if (st.idx === st.count) {
        var onEnd = function () {
          st.track.removeEventListener("transitionend", onEnd);
          st.track.style.transition = "none";
          st.idx = 0;
          st.track.style.transform = "translateY(0px)";
          void st.track.offsetHeight;          // force reflow
          st.track.style.transition = "";
        };
        st.track.addEventListener("transitionend", onEnd);
      }
    }

    // initial highlight (the card flagged data-cycle-start="0")
    cards.forEach(function (c) { c.classList.toggle("is-dark", c.getAttribute("data-cycle-start") === "0"); });

    if (reduce) return; // respect reduced-motion: static, no autoscroll

    var running = false, timer = null, whichCard = 0, dark = 0;
    function tick() {
      // alternate: scroll left, scroll right, scroll left, ...
      advance(states[whichCard]);
      dark = (dark + 1) % 3;
      cards.forEach(function (c, i) { c.classList.toggle("is-dark", dark === i); });
      whichCard = 1 - whichCard; // toggle between 0 and 1
    }
    function start() { if (running) return; running = true; timer = setInterval(tick, 5500); }
    function stop() { running = false; clearInterval(timer); }

    if ("IntersectionObserver" in window) {
      var sec = document.getElementById("proof");
      new IntersectionObserver(function (es) {
        es[0].isIntersecting ? start() : stop();
      }, { threshold: 0.1 }).observe(sec);
    } else { start(); }

    window.addEventListener("resize", function () {
      states.forEach(function (st) {
        st.track.style.transition = "none";
        st.track.style.transform = "translateY(" + (-st.idx * slideH(st)) + "px)";
        void st.track.offsetHeight;
        st.track.style.transition = "";
      });
    }, { passive: true });
  })();


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
    this.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); t.setAttribute("data-state", "inactive"); });
    btn.classList.add("active"); btn.setAttribute("data-state", "active");
    document.querySelectorAll(".tab-panel").forEach(function (p) {
      var on = p.dataset.panel === key;
      p.classList.toggle("active", on);
      p.setAttribute("data-state", on ? "active" : "inactive");
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
  // coalesce to one read+write per frame; getBoundingClientRect + closest on every
  // raw pointer event is layout thrash. Touch devices skip this entirely.
  if (!COARSE) {
    var pmEvt = null, pmQueued = false;
    var applyGlow = function () {
      pmQueued = false;
      var e = pmEvt; if (!e) return;
      var el = e.target && e.target.closest ? e.target.closest(GLOW_SEL) : null;
      if (glowEl && glowEl !== el) { clearGlow(glowEl); glowEl = null; }
      if (!el) {
        if (tiltEl) { tiltEl.style.setProperty("--tiltX", "0deg"); tiltEl.style.setProperty("--tiltY", "0deg"); tiltEl = null; }
        return;
      }
      glowEl = el;
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
      el.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
      if (!reduce) {
        if (tiltEl && tiltEl !== el) { tiltEl.style.setProperty("--tiltX", "0deg"); tiltEl.style.setProperty("--tiltY", "0deg"); }
        tiltEl = el;
        var px = (e.clientX - r.left) / r.width - 0.5;   // -0.5..0.5
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--tiltX", (px * 2.4).toFixed(2) + "deg");
        el.style.setProperty("--tiltY", (py * -2.4).toFixed(2) + "deg");
      }
    };
    document.addEventListener("pointermove", function (e) {
      pmEvt = e;
      if (pmQueued) return;
      pmQueued = true;
      requestAnimationFrame(applyGlow);
    }, { passive: true });
    document.addEventListener("pointerleave", function () {
      if (tiltEl) { tiltEl.style.setProperty("--tiltX", "0deg"); tiltEl.style.setProperty("--tiltY", "0deg"); tiltEl = null; }
      if (glowEl) { clearGlow(glowEl); glowEl = null; }
    });
  }

  /* ---------- bento cards: tilt + grow + mouse-tracking border glow ---------- */
  /* touch devices get no tilt benefit but pay getBoundingClientRect per move → skip */
  if (!COARSE) document.querySelectorAll(".bento-card").forEach(function (card) {
    var cEvt = null, cQueued = false;
    var applyCard = function () {
      cQueued = false;
      var e = cEvt; if (!e) return;
      var r = card.getBoundingClientRect();
      var mx = e.clientX - r.left, my = e.clientY - r.top;
      card.style.setProperty("--card-mouse-x", mx.toFixed(1) + "px");
      card.style.setProperty("--card-mouse-y", my.toFixed(1) + "px");
      if (reduce) return;
      var px = mx / r.width - 0.5, py = my / r.height - 0.5;   // -0.5..0.5
      card.style.setProperty("--card-rot-x", (py * -6).toFixed(2) + "deg");
      card.style.setProperty("--card-rot-y", (px * 6).toFixed(2) + "deg");
      card.style.setProperty("--card-shift-x", (px * 10).toFixed(2) + "px");
      card.style.setProperty("--card-shift-y", (py * 10).toFixed(2) + "px");
      card.style.setProperty("--card-grow-x", Math.abs(px * 8).toFixed(2));
      card.style.setProperty("--card-grow-y", Math.abs(py * 8).toFixed(2));
    };
    card.addEventListener("pointermove", function (e) {
      cEvt = e; if (cQueued) return; cQueued = true; requestAnimationFrame(applyCard);
    }, { passive: true });
    card.addEventListener("pointerleave", function () {
      card.style.setProperty("--card-rot-x", "0deg");
      card.style.setProperty("--card-rot-y", "0deg");
      card.style.setProperty("--card-shift-x", "0px");
      card.style.setProperty("--card-shift-y", "0px");
      card.style.setProperty("--card-grow-x", "0");
      card.style.setProperty("--card-grow-y", "0");
    });
  });

  /* ---------- bento: scroll-in triggers (chart bars, substance meter) ---------- */
  if ("IntersectionObserver" in window) {
    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); bio.unobserve(en.target); } });
    }, { threshold: 0.25 });
    document.querySelectorAll(".bento-card--chart,.bento-card--substance").forEach(function (c) { bio.observe(c); });
  } else {
    document.querySelectorAll(".bento-card--chart,.bento-card--substance").forEach(function (c) { c.classList.add("in"); });
  }

  /* ---------- bento: live "cumulative leakage" odometer (chart card) ---------- */
  var leakEl = document.querySelector("[data-leak]");
  if (leakEl) {
    var leakVal = 48213, leakOn = false;
    var fmt = function (n) { return "$" + Math.floor(n).toLocaleString("en-US"); };
    leakEl.textContent = fmt(leakVal);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { leakOn = es[0].isIntersecting; }, { threshold: 0.15 }).observe(leakEl);
    } else { leakOn = true; }
    setInterval(function () {
      if (!leakOn || document.hidden || reduce) return;
      leakVal += 137 + Math.floor(Math.random() * 420);
      leakEl.textContent = fmt(leakVal);
    }, 90);
  }

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
    if (document.hidden) return;
    var vh = window.innerHeight;
    var heroH = heroEl ? heroEl.offsetHeight : vh;
    var y = window.scrollY || window.pageYOffset || 0;
    var p = clamp01(y / (heroH * 0.9));                 // hero -> jurisdictions progress
    if (window.Globe) window.Globe.setProgress(p);

    if (!reduce) { cmX += (mX - cmX) * 0.06; cmY += (mY - cmY) * 0.06; }
    if (window.Globe) window.Globe.setParallax(cmX, cmY);

    // site-wide subtle cursor parallax for cards/panels (no cursor on touch)
    if (!reduce && !COARSE) {
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
      // scrolls up and fades out exactly as the strip's bottom edge clears the viewport
      var darkEnd = (logobarEl || jSec).offsetTop + (logobarEl || jSec).offsetHeight;
      var parkP = clamp01((y - (darkEnd - vh)) / (vh * 0.4));
      globeLayer.style.opacity = (1 - parkP).toFixed(3);
      globeLayer.style.transform = "translate3d(0," + (-parkP * vh * 0.6).toFixed(1) + "px,0)";
      globeLayer.classList.toggle("parked", parkP >= 0.999);
      if (logobarEl) logobarEl.classList.toggle("on-light", parkP > 0.5 || root.dataset.theme === "light");
    }
  }
  requestAnimationFrame(scene);
})();
