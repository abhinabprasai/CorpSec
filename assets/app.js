(function () {
  "use strict";
  var PERF = window.__PERF || {};
  var reduce = PERF.reduce != null ? PERF.reduce : (window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches);
  var COARSE = !!PERF.coarse;        // touch — no cursor glow/tilt to gain
  var LOW = !!PERF.low;
  var root = document.documentElement;

  /* ---------- nav: glass on scroll + Dynamic-Island collapse ---------- */
  var nav = document.getElementById("nav");
  var lastY = window.scrollY || 0, ticking = false;
  function onScroll() {
    if (!nav) return;
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

  /* ---------- mobile drawer (accessible disclosure: focus move, trap, ESC) ---------- */
  var burger = document.getElementById("burger");
  var drawer = document.getElementById("drawer");
  var closeTimer = null;
  if (burger && drawer) {
    burger.setAttribute("aria-controls", "drawer");
    var drawerFocusables = function () {
      return Array.prototype.slice.call(drawer.querySelectorAll("a[href],button:not([disabled])"));
    };
    var closeDrawer = function (returnFocus) {
      if (!nav.classList.contains("open")) return;
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      if (returnFocus) burger.focus();
      if (reduce) return;
      nav.classList.add("closing");
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () { nav.classList.remove("closing"); }, 340);
    };
    var openDrawer = function () {
      clearTimeout(closeTimer); nav.classList.remove("closing");
      nav.classList.add("open");
      burger.setAttribute("aria-expanded", "true");
      var f = drawerFocusables(); if (f.length) f[0].focus();
    };
    burger.addEventListener("click", function () {
      if (nav.classList.contains("open")) closeDrawer(true); else openDrawer();
    });
    drawer.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeDrawer(true); return; }
      if (e.key !== "Tab") return;
      var f = drawerFocusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { closeDrawer(false); });
    });
  }

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

  /* edge-rail hiding over dark sections now lives in interactions.js (initRails),
     so every page shares identical appear/disappear behaviour. */

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

  /* ---------- passport + destination comboboxes → globe route ----------
     Two searchable selects ("My passport", "Country to incorporate"). Pick both
     and the globe draws a great-circle arc with a flag pin at each end; pick one
     and it simply flies to that country. */
  var JD = window.JURIS_DATA || [];
  var ALLJ = window.JURISDICTIONS_ALL || [];
  function norm(s) { return s.replace(/[(),]/g, "").replace(/\s+/g, " ").trim().toLowerCase(); }
  function flagSm(iso) { return "https://flagcdn.com/w40/" + (iso || "").toLowerCase() + ".png"; }

  function makeCombo(cfg) {
    var input = document.getElementById(cfg.input);
    var list = document.getElementById(cfg.list);
    var flag = cfg.flag ? document.getElementById(cfg.flag) : null;
    var combo = cfg.combo ? document.getElementById(cfg.combo) : null;
    if (!input || !list) return null;
    var api = { value: null, input: input };
    var filtered = [], activeIdx = -1, isOpen = false;

    function optHTML(j, i) {
      return '<li role="option" id="' + cfg.list + '-o' + i + '" class="jcombo__opt" data-i="' + i + '">' +
        '<img class="jcombo__optflag" src="' + flagSm(j[1]) + '" alt="" width="22" height="16" loading="lazy">' +
        '<span class="jcombo__optname">' + j[0] + '</span>' +
        '<span class="jcombo__optreg">' + j[2] + '</span></li>';
    }
    function build(q) {
      q = (q || "").trim().toLowerCase();
      filtered = (q ? ALLJ.filter(function (j) { return j[0].toLowerCase().indexOf(q) >= 0 || j[2].toLowerCase().indexOf(q) >= 0; }) : ALLJ).slice(0, 8);
      list.innerHTML = filtered.length ? filtered.map(optHTML).join("") : '<li class="jcombo__empty" role="presentation">No jurisdiction found</li>';
      activeIdx = -1;
    }
    function openDrop() {
      if (isOpen) return;
      isOpen = true; list.hidden = false; input.setAttribute("aria-expanded", "true");
    }
    function closeDrop() {
      if (!isOpen) return;
      isOpen = false; list.hidden = true;
      input.removeAttribute("aria-activedescendant"); input.setAttribute("aria-expanded", "false"); activeIdx = -1;
    }
    function setActive(i) {
      var opts = list.querySelectorAll(".jcombo__opt");
      opts.forEach(function (o) { o.classList.remove("is-active"); o.setAttribute("aria-selected", "false"); });
      activeIdx = i;
      if (i >= 0 && opts[i]) { opts[i].classList.add("is-active"); opts[i].setAttribute("aria-selected", "true"); input.setAttribute("aria-activedescendant", opts[i].id); opts[i].scrollIntoView({ block: "nearest" }); }
    }
    function clearVal() {
      api.value = null;
      if (flag) { flag.style.backgroundImage = ""; flag.classList.remove("on"); }
      if (combo) combo.classList.remove("has-val");
    }
    function choose(j) {
      api.value = j; input.value = j[0];
      if (flag) { flag.style.backgroundImage = "url(" + flagSm(j[1]) + ")"; flag.classList.add("on"); }
      if (combo) combo.classList.add("has-val");
      closeDrop(); if (cfg.onSelect) cfg.onSelect();
    }
    api.set = function (j) { if (j) choose(j); };
    api.clear = function () { input.value = ""; clearVal(); closeDrop(); };

    input.addEventListener("focus", function () { build(input.value); openDrop(); });
    input.addEventListener("input", function () {
      clearVal(); // any manual edit invalidates the committed value
      build(input.value); openDrop();
      if (filtered.length && cfg.onPreview) cfg.onPreview(filtered[0]);
    });
    input.addEventListener("keydown", function (e) {
      if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) { build(input.value); openDrop(); return; }
      if (!isOpen) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(Math.min(filtered.length - 1, activeIdx + 1)); if (cfg.onPreview && filtered[activeIdx]) cfg.onPreview(filtered[activeIdx]); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive(Math.max(0, activeIdx - 1)); if (cfg.onPreview && filtered[activeIdx]) cfg.onPreview(filtered[activeIdx]); }
      else if (e.key === "Enter") { var j = filtered[activeIdx >= 0 ? activeIdx : 0]; if (j) { e.preventDefault(); choose(j); } }
      else if (e.key === "Escape") { closeDrop(); input.blur(); }
    });
    list.addEventListener("mousedown", function (e) {
      var li = e.target.closest(".jcombo__opt"); if (!li) return;
      e.preventDefault(); choose(filtered[+li.dataset.i]);
    });
    list.addEventListener("pointermove", function (e) {
      var li = e.target.closest(".jcombo__opt"); if (!li) return;
      var i = +li.dataset.i; setActive(i); if (cfg.onPreview && filtered[i]) cfg.onPreview(filtered[i]);
    });
    input.addEventListener("blur", function () {
      setTimeout(function () {
        closeDrop();
        // if user typed but never committed a selection, restore or clear
        if (!api.value) input.value = "";
        else input.value = api.value[0];
      }, 200);
    });
    return api;
  }

  var jSearch = document.getElementById("jSearch");
  if (jSearch && ALLJ.length) {
    var passport = null, dest = null;
    function toPt(j) { return { lat: j[3], lng: j[4], iso: j[1], name: j[0], region: j[2] }; }
    function bothPicked() { return passport && passport.value && dest && dest.value; }
    function previewFocus(j) {
      if (!window.Globe || bothPicked() || !j) return;
      window.Globe.clearRoute();
      window.Globe.focusAt(j[3], j[4], { name: j[0], iso: j[1].toUpperCase(), region: j[2] });
    }
    function updateRoute() {
      if (!window.Globe) return;
      var o = passport && passport.value, d = dest && dest.value;
      if (o && d) window.Globe.setRoute(toPt(o), toPt(d));
      else if (d) { window.Globe.clearRoute(); window.Globe.focusAt(d[3], d[4], { name: d[0], iso: d[1].toUpperCase(), region: d[2] }); }
      else if (o) { window.Globe.clearRoute(); window.Globe.focusAt(o[3], o[4], { name: o[0], iso: o[1].toUpperCase(), region: o[2] }); }
      else window.Globe.clearRoute();
    }
    passport = makeCombo({ input: "jPassport", list: "jPassportList", flag: "jPassportFlag", combo: "jPassportCombo", onSelect: updateRoute, onPreview: previewFocus });
    dest = makeCombo({ input: "jDest", list: "jDestList", flag: "jDestFlag", combo: "jDestCombo", onSelect: updateRoute, onPreview: previewFocus });

    // when the section enters view, gently fly to the first recommended country
    var jsec = document.getElementById("jurisdictions");
    if (jsec && JD.length && "IntersectionObserver" in window) {
      var jio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { if (window.Globe && !bothPicked()) window.Globe.focus(JD[0].iso); jio.unobserve(jsec); }
        });
      }, { threshold: 0.45 });
      jio.observe(jsec);
    }
  }

  /* ---------- back office tabs (WAI-ARIA tabs: roving tabindex + arrows) ---------- */
  var boTabs = document.getElementById("boTabs");
  if (boTabs) {
    var tabBtns = Array.prototype.slice.call(boTabs.querySelectorAll(".tab"));
    var tabPanels = Array.prototype.slice.call(document.querySelectorAll(".tab-panel"));
    var selectTab = function (btn, moveFocus) {
      var key = btn.dataset.tab;
      tabBtns.forEach(function (t) {
        var on = t === btn;
        t.classList.toggle("active", on);
        t.setAttribute("data-state", on ? "active" : "inactive");
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
      });
      tabPanels.forEach(function (p) {
        var on = p.dataset.panel === key;
        p.classList.toggle("active", on);
        p.setAttribute("data-state", on ? "active" : "inactive");
      });
      if (moveFocus) btn.focus();
    };
    // wire ARIA relationships (panels are display:none when inactive → hidden from AT)
    tabBtns.forEach(function (t) {
      var key = t.dataset.tab, on = t.classList.contains("active");
      t.id = t.id || "bo-tab-" + key;
      var panel = tabPanels.filter(function (p) { return p.dataset.panel === key; })[0];
      if (panel) {
        panel.id = panel.id || "bo-panel-" + key;
        panel.setAttribute("aria-labelledby", t.id);
        panel.tabIndex = 0;
        t.setAttribute("aria-controls", panel.id);
      }
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    });
    boTabs.addEventListener("click", function (e) {
      var btn = e.target.closest(".tab"); if (btn) selectTab(btn, false);
    });
    boTabs.addEventListener("keydown", function (e) {
      var i = tabBtns.indexOf(document.activeElement);
      if (i < 0) return;
      var n = tabBtns.length, j = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % n;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + n) % n;
      else if (e.key === "Home") j = 0;
      else if (e.key === "End") j = n - 1;
      if (j >= 0) { e.preventDefault(); selectTab(tabBtns[j], true); }
    });
  }

  /* ---------- dashboard entity switch ---------- */
  document.querySelectorAll(".dash-entity .ent").forEach(function (ent) {
    ent.addEventListener("click", function () {
      document.querySelectorAll(".dash-entity .ent").forEach(function (e) { e.classList.remove("active"); });
      ent.classList.add("active");
    });
  });

  /* ---------- liquid-glass pointer light (laser glow follows the cursor) ---------- */
  var GLOW_SEL = ".btn,.card,.j-card,.jcard,.reco-card,.dash-callout,.lg,.nav-inner,.jcombo";
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

  /* ---------- bento cards: tilt + grow + border glow ----------
     Handled centrally by interactions.js (initTilt) for ALL pages — it gates on
     (any-pointer:fine), dedupes via card.__tilt, sets --card-rot/shift/grow/mouse,
     and re-binds dynamically inserted cards via MutationObserver. No duplicate here. */

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

  // layout metrics (heroH, dark-zone end) are stable during scroll — cache them and
  // recompute only on resize/load instead of forcing a layout read every frame.
  var vhC = window.innerHeight, heroHC = heroEl ? heroEl.offsetHeight : vhC, darkEndC = 0;
  function measureScene() {
    vhC = window.innerHeight;
    heroHC = heroEl ? heroEl.offsetHeight : vhC;
    var ref = logobarEl || jSec;
    darkEndC = ref ? ref.offsetTop + ref.offsetHeight : 0;
  }
  measureScene();
  var _sceneRT; window.addEventListener("resize", function () { clearTimeout(_sceneRT); _sceneRT = setTimeout(measureScene, 150); }, { passive: true });
  window.addEventListener("load", measureScene);

  var lastY = -1, lastCmX = 999, lastCmY = 999;
  function scene() {
    requestAnimationFrame(scene);
    if (document.hidden) return;
    var y = window.scrollY || window.pageYOffset || 0;
    if (!reduce) { cmX += (mX - cmX) * 0.06; cmY += (mY - cmY) * 0.06; }
    // dirty-check: if nothing scrolled and the cursor parallax has settled, do no
    // layout reads, no style writes, no custom-prop churn this frame.
    if (y === lastY && Math.abs(cmX - lastCmX) < 1e-3 && Math.abs(cmY - lastCmY) < 1e-3) return;
    lastY = y; lastCmX = cmX; lastCmY = cmY;

    var vh = vhC, heroH = heroHC;
    var p = clamp01(y / (heroH * 0.9));                 // hero -> jurisdictions progress
    if (window.Globe) { window.Globe.setProgress(p); window.Globe.setParallax(cmX, cmY); }

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
      var parkP = clamp01((y - (darkEndC - vh)) / (vh * 0.4));
      globeLayer.style.opacity = (1 - parkP).toFixed(3);
      globeLayer.style.transform = "translate3d(0," + (-parkP * vh * 0.6).toFixed(1) + "px,0)";
      globeLayer.classList.toggle("parked", parkP >= 0.999);
      if (logobarEl) logobarEl.classList.toggle("on-light", parkP > 0.5 || root.dataset.theme === "light");
    }
  }
  requestAnimationFrame(scene);
})();
