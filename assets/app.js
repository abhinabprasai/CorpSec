(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

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

  /* ---------- jurisdiction cards (premium glass) + globe linkage ---------- */
  function hexA(hex, a) { var n = parseInt(hex.slice(1), 16); return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")"; }
  var JD = window.JURIS_DATA || [];
  var jcardsEl = document.getElementById("jCards");
  function jcardHTML(j) {
    var iso = j.iso.toLowerCase();
    var badge = j.live ? '<span class="jb jb-live">Live</span>' : '<span class="jb jb-soon">Soon</span>';
    return '<button type="button" class="jcard" data-iso="' + j.iso + '" ' +
      'style="--accent:' + j.accent + ';--accent-soft:' + hexA(j.accent, .22) + ';--accent-glow:' + hexA(j.accent, .5) + '">' +
      '<div class="jcard-top">' +
        '<span class="jflag-wrap"><img class="jflag" src="https://flagcdn.com/w80/' + iso + '.png" alt="" loading="lazy" width="30" height="30"></span>' +
        '<span><span class="jcard-name">' + j.name + '</span><span class="jcard-region">' + j.region + '</span></span>' +
        '<span class="jcard-badges">' + badge + '</span>' +
      '</div>' +
      '<div class="jcard-specs">' +
        '<span class="jspec"><span>Corp tax</span><b>' + j.tax + '</b></span>' +
        '<span class="jspec"><span>Setup</span><b>' + j.setup + '</b></span>' +
      '</div>' +
      '<div class="jcard-from"><span class="lbl">From (year 1)</span><span class="val">' + (j.live ? j.from : "Waitlist") + '</span></div>' +
    '</button>';
  }
  if (jcardsEl && JD.length) {
    jcardsEl.innerHTML = JD.map(jcardHTML).join("");
    var jcards = jcardsEl.querySelectorAll(".jcard");
    function activate(iso) {
      jcards.forEach(function (c) { c.classList.toggle("active", c.dataset.iso === iso); });
      if (window.Globe) window.Globe.focus(iso);
    }
    jcards.forEach(function (c) {
      c.addEventListener("mouseenter", function () { activate(c.dataset.iso); });
      c.addEventListener("focus", function () { activate(c.dataset.iso); });
      c.addEventListener("click", function () { activate(c.dataset.iso); });
      c.addEventListener("mouseleave", function () {
        c.classList.remove("active");
        if (window.Globe) window.Globe.focus(null);
      });
      c.addEventListener("blur", function () {
        c.classList.remove("active");
        if (window.Globe) window.Globe.focus(null);
      });
    });
    var jsec = document.getElementById("jurisdictions");
    if (jsec && "IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !jcardsEl.querySelector(".jcard.active")) activate(JD[0].iso); });
      }, { threshold: 0.45 }).observe(jsec);
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
  var GLOW_SEL = ".btn,.card,.j-card,.jcard,.reco-card,.dash-callout,.lg,.nav-inner";
  var tiltEl = null;
  document.addEventListener("pointermove", function (e) {
    var el = e.target.closest ? e.target.closest(GLOW_SEL) : null;
    if (!el) {
      if (tiltEl) { tiltEl.style.setProperty("--tiltX", "0deg"); tiltEl.style.setProperty("--tiltY", "0deg"); tiltEl = null; }
      return;
    }
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
  });

  /* ---------- the "scene": scroll progress, parallax, dissolve, dock ---------- */
  var heroEl = document.getElementById("hero");
  var heroCenter = document.querySelector(".hero-center");
  var jurisLeft = document.querySelector(".juris2-left");
  var jSec = document.getElementById("jurisdictions");
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
      var jb = jSec.offsetTop + jSec.offsetHeight;
      globeLayer.classList.toggle("parked", y > jb - vh * 0.55);
    }
  }
  requestAnimationFrame(scene);
})();
