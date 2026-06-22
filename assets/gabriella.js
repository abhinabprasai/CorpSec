/* gabriella.js — the "Gabriella" AI incorporation advisor.
   • Hero prompt bar + suggestion chips launch a guided questionnaire.
   • A reusable liquid-glass modal (also used by the incorporation + contact
     forms in forms.js) hosts a multi-step, spring-animated flow.
   • Gabriella asks ~7 questions, then computes a ranked jurisdiction
     recommendation and hands off to the incorporation funnel.
   No backend: submission resolves to a local success/result state. */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* ============================================================
     Reusable modal shell (exposed as window.CSModal)
     ============================================================ */
  var root = null, panel = null, lastFocus = null, onCloseCb = null;

  function ensureRoot() {
    if (root) return;
    root = document.createElement("div");
    root.className = "csm";
    root.hidden = true;
    root.innerHTML =
      '<div class="csm__scrim" data-csm-close data-slot="dialog-overlay"></div>' +
      '<div class="csm__panel" role="dialog" aria-modal="true" tabindex="-1" data-slot="dialog-content">' +
        '<button class="csm__close" type="button" data-csm-close aria-label="Close" data-slot="dialog-close">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
        '<div class="csm__content"></div>' +
      '</div>';
    document.body.appendChild(root);
    panel = root.querySelector(".csm__panel");

    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-csm-close]")) CSModal.close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !root.hidden) CSModal.close();
      if (e.key === "Tab" && !root.hidden) trapFocus(e);
    });
  }

  function trapFocus(e) {
    var f = panel.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
    f = Array.prototype.filter.call(f, function (el) { return el.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  var CSModal = {
    open: function (contentNode, opts) {
      opts = opts || {};
      ensureRoot();
      lastFocus = document.activeElement;
      onCloseCb = opts.onClose || null;
      var content = panel.querySelector(".csm__content");
      content.innerHTML = "";
      content.appendChild(contentNode);
      panel.classList.toggle("csm__panel--wide", !!opts.wide);
      root.hidden = false;
      document.documentElement.classList.add("csm-open");
      void root.offsetWidth;
      root.classList.add("is-open");
      window.requestAnimationFrame(function () {
        var focusEl = panel.querySelector("[data-autofocus]") || panel;
        focusEl.focus({ preventScroll: true });
      });
    },
    close: function () {
      if (!root || root.hidden) return;
      root.classList.remove("is-open");
      var done = function () {
        root.hidden = true;
        document.documentElement.classList.remove("csm-open");
        panel.querySelector(".csm__content").innerHTML = "";
        if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
        if (onCloseCb) { var cb = onCloseCb; onCloseCb = null; cb(); }
      };
      if (reduce) return done();
      var t = setTimeout(done, 360);
      root.addEventListener("transitionend", function h() {
        clearTimeout(t); root.removeEventListener("transitionend", h); done();
      }, { once: true });
    },
    el: function () { return panel; }
  };
  window.CSModal = CSModal;

  /* small helper */
  function h(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* ============================================================
     Gabriella questionnaire
     ============================================================ */
  var IC = {
    saas: '<path d="M4 5h16v11H4z"/><path d="M2 20h20M9 16v4M15 16v4"/>',
    ecom: '<path d="M6 7h13l-1.4 8.5a2 2 0 0 1-2 1.7H9.4a2 2 0 0 1-2-1.7L6 4H3"/><circle cx="9" cy="20" r="1"/><circle cx="16" cy="20" r="1"/>',
    holding: '<path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6"/>',
    consult: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
    web3: '<path d="M12 2 4 7v10l8 5 8-5V7l-8-5Z"/><path d="m12 7 5 3v5l-5 3-5-3v-5l5-3Z"/>',
    other: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.8 2.6 15.2 0 18M12 3c-2.6 2.8-2.6 15.2 0 18"/>',
    flag: '<path d="M5 3v18M5 4h12l-2 4 2 4H5"/>',
    bank: '<path d="M3 10l9-6 9 6M5 10v9M19 10v9M9 10v9M15 10v9M3 21h18"/>',
    bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>',
    shield: '<path d="M12 3 5 6v5c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-3Z"/>',
    tax: '<path d="M9 3h6l1 4H8l1-4ZM6 7h12l-1 13H7L6 7Z"/><path d="M10 11v5M14 11v5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  function svg(p) {
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }

  var COUNTRIES = ["United States", "United Kingdom", "Canada", "Germany", "France",
    "Netherlands", "Spain", "Italy", "Ireland", "Switzerland", "United Arab Emirates",
    "Saudi Arabia", "India", "Singapore", "Hong Kong", "Australia", "Nigeria",
    "South Africa", "Brazil", "Mexico", "Japan", "Estonia", "Poland", "Other"];

  var STEPS = [
    { id: "building", q: "What are you building?", help: "This shapes tax treatment and what investors expect to see.", type: "cards",
      options: [
        { v: "saas", label: "SaaS / software", ic: "saas" },
        { v: "ecom", label: "E-commerce", ic: "ecom" },
        { v: "holding", label: "Holding company", ic: "holding" },
        { v: "consult", label: "Consulting / services", ic: "consult" },
        { v: "web3", label: "Crypto / Web3", ic: "web3" },
        { v: "other", label: "Something else", ic: "other" }
      ] },
    { id: "base", q: "Where are you based?", help: "Your residency drives tax exposure and banking access.", type: "select",
      placeholder: "Select your country of residence", options: COUNTRIES },
    { id: "market", q: "Where are most of your customers?", help: "Revenue location affects the smartest place to register.", type: "cards",
      options: [
        { v: "us", label: "United States", ic: "flag" },
        { v: "eu", label: "Europe", ic: "flag" },
        { v: "uk", label: "United Kingdom", ic: "flag" },
        { v: "me", label: "Middle East", ic: "flag" },
        { v: "asia", label: "Asia-Pacific", ic: "flag" },
        { v: "global", label: "Truly global", ic: "globe" }
      ] },
    { id: "raising", q: "Are you raising outside capital?", help: "Investor familiarity can outweigh a slightly lower tax rate.", type: "cards",
      options: [
        { v: "us_vc", label: "Yes — US investors", ic: "bank" },
        { v: "eu_vc", label: "Yes — EU / UK investors", ic: "bank" },
        { v: "soon", label: "Planning to soon", ic: "clock" },
        { v: "boot", label: "Bootstrapped", ic: "shield" }
      ] },
    { id: "banking", q: "How soon do you need a bank account?", help: "Some jurisdictions open remote banking in days, others take weeks.", type: "cards",
      options: [
        { v: "now", label: "Immediately", ic: "bolt" },
        { v: "month", label: "Within a month", ic: "clock" },
        { v: "flex", label: "I'm flexible", ic: "shield" }
      ] },
    { id: "priority", q: "What matters most to you?", help: "Pick up to two — Gabriella weighs these highest.", type: "multi", max: 2,
      options: [
        { v: "tax", label: "Low tax", ic: "tax" },
        { v: "investor", label: "Investor familiarity", ic: "bank" },
        { v: "speed", label: "Speed & simplicity", ic: "bolt" },
        { v: "privacy", label: "Privacy", ic: "shield" },
        { v: "banking", label: "Strong banking", ic: "globe" }
      ] },
    { id: "email", q: "Where should Gabriella send your report?", help: "Your ranked shortlist with full reasoning. No spam, ever.", type: "email" }
  ];

  /* recommendation engine (transparent heuristic) -------------------- */
  var JX = {
    delaware: { name: "Delaware, USA", iso: "us", setup: "2–3 days", tax: "21% federal", why: "The default for startups raising from US VCs — investors know the C-Corp paperwork cold.", banks: ["Mercury", "Brex", "Stripe"] },
    singapore: { name: "Singapore", iso: "sg", setup: "2 days", tax: "17% (with rebates)", why: "Fast remote setup, world-class banking and a credible Asian HQ with strong treaty access.", banks: ["DBS", "Wise", "Aspire"] },
    uk: { name: "United Kingdom", iso: "gb", setup: "24–48 hours", tax: "25% / 19% small", why: "The fastest credible incorporation, strong banking and easy access to EU and US customers.", banks: ["Wise", "Revolut", "Mercury"] },
    estonia: { name: "Estonia", iso: "ee", setup: "1–3 days", tax: "0% on retained", why: "0% tax on reinvested profit and fully digital admin — ideal for lean, remote-first teams.", banks: ["Wise", "Revolut", "LHV"] },
    ireland: { name: "Ireland", iso: "ie", setup: "3–5 days", tax: "12.5% trading", why: "Low corporate tax inside the EU — the classic base for software selling into Europe.", banks: ["Wise", "AIB", "Revolut"] },
    dubai: { name: "Dubai, UAE", iso: "ae", setup: "4–6 days", tax: "9% (0% to AED 375k)", why: "Near-zero tax, premium banking and a fast-growing hub for Middle East and global trade.", banks: ["Mashreq", "WIO", "Emirates NBD"] }
  };

  function recommend(a) {
    var primary = "singapore", alts = ["uk", "estonia"];
    if (a.raising === "us_vc" || (a.market === "us" && a.raising === "soon")) { primary = "delaware"; alts = ["singapore", "uk"]; }
    else if (a.market === "me" || a.base === "United Arab Emirates" || a.base === "Saudi Arabia") { primary = "dubai"; alts = ["uk", "singapore"]; }
    else if (a.market === "asia" || (a.banking === "now" && a.priority && a.priority.indexOf("banking") > -1)) { primary = "singapore"; alts = ["uk", "dubai"]; }
    else if (a.priority && a.priority.indexOf("tax") > -1 && (a.market === "eu" || a.market === "global")) { primary = "estonia"; alts = ["ireland", "uk"]; }
    else if (a.market === "eu") { primary = "ireland"; alts = ["estonia", "uk"]; }
    else if (a.market === "uk" || a.raising === "eu_vc") { primary = "uk"; alts = ["ireland", "estonia"]; }
    return { primary: primary, alts: alts };
  }

  /* questionnaire controller ---------------------------------------- */
  function startQuestionnaire(seed) {
    var answers = { seed: seed || "" };
    var idx = 0;

    var wrap = h("div", "gq");
    wrap.innerHTML =
      '<div class="gq-head">' +
        '<span class="gq-avatar">' + svg(IC.web3 ? '<path d="M12 3.5l1.6 4.3L18 9.4l-4.4 1.6L12 15.5l-1.6-4.5L6 9.4l4.4-1.6L12 3.5Z"/>' : "") + '</span>' +
        '<div class="gq-id"><b>Gabriella</b><small>AI incorporation advisor</small></div>' +
        '<div class="gq-count" id="gqCount"></div>' +
      '</div>' +
      '<div class="gq-progress"><i id="gqProg"></i></div>' +
      '<div class="gq-stage" id="gqStage"></div>';

    var stage = wrap.querySelector("#gqStage");
    var prog = wrap.querySelector("#gqProg");
    var count = wrap.querySelector("#gqCount");

    function setProgress() {
      var pct = Math.round((idx / STEPS.length) * 100);
      prog.style.width = pct + "%";
      count.textContent = (idx + 1) + " / " + STEPS.length;
    }

    function stepHTML(step) {
      var body = "";
      if (step.type === "cards" || step.type === "multi") {
        body = '<div class="gq-opts' + (step.type === "multi" ? " gq-opts--multi" : "") + '">' +
          step.options.map(function (o) {
            return '<button class="gq-opt" type="button" data-v="' + o.v + '">' +
              '<span class="gq-opt__ic">' + svg(IC[o.ic] || IC.other) + '</span>' +
              '<span class="gq-opt__label">' + o.label + '</span>' +
              '<span class="gq-opt__check"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></span>' +
            '</button>';
          }).join("") + "</div>";
      } else if (step.type === "select") {
        body = '<div class="gq-field">' +
          '<select class="gq-select" id="gqSelect" data-autofocus><option value="" disabled selected>' + step.placeholder + "</option>" +
          step.options.map(function (c) { return '<option value="' + c + '">' + c + "</option>"; }).join("") +
          "</select></div>";
      } else if (step.type === "email") {
        body = '<div class="gq-field">' +
          '<input class="gq-input2" id="gqEmail" type="email" inputmode="email" placeholder="you@company.com" data-autofocus autocomplete="email" />' +
          '<p class="gq-err" id="gqErr" hidden>Please enter a valid email address.</p>' +
        "</div>";
      }
      var showContinue = step.type !== "cards";
      return '<div class="gq-step">' +
        '<h3 class="gq-q">' + step.q + "</h3>" +
        (step.help ? '<p class="gq-help">' + step.help + "</p>" : "") +
        body +
        '<div class="gq-nav">' +
          (idx > 0 ? '<button class="gq-back" type="button">← Back</button>' : '<span></span>') +
          (showContinue ? '<button class="btn btn-primary gq-next" type="button" disabled>Continue</button>' : '<span class="gq-hint">Select to continue</span>') +
        "</div>" +
      "</div>";
    }

    function render(dir) {
      setProgress();
      var html = stepHTML(STEPS[idx]);
      if (reduce) { stage.innerHTML = html; bind(); return; }
      stage.style.transition = "opacity .16s ease, transform .22s ease";
      stage.style.opacity = "0";
      stage.style.transform = "translateX(" + (-dir * 16) + "px)";
      setTimeout(function () {
        stage.innerHTML = html;
        stage.style.transition = "none";
        stage.style.transform = "translateX(" + (dir * 18) + "px)";
        void stage.offsetWidth;
        stage.style.transition = "opacity .3s ease, transform .5s cubic-bezier(.34,1.42,.52,1)";
        stage.style.opacity = "1";
        stage.style.transform = "translateX(0)";
        bind();
      }, 150);
    }

    function next() { if (idx < STEPS.length - 1) { idx++; render(1); } else { finish(); } }
    function back() { if (idx > 0) { idx--; render(-1); } }

    function bind() {
      var step = STEPS[idx];
      var stepEl = stage.querySelector(".gq-step");
      var nextBtn = stepEl.querySelector(".gq-next");
      var backBtn = stepEl.querySelector(".gq-back");
      if (backBtn) backBtn.addEventListener("click", back);

      if (step.type === "cards") {
        stepEl.querySelectorAll(".gq-opt").forEach(function (b) {
          b.addEventListener("click", function () {
            stepEl.querySelectorAll(".gq-opt").forEach(function (x) { x.classList.remove("is-sel"); });
            b.classList.add("is-sel");
            answers[step.id] = b.getAttribute("data-v");
            setTimeout(next, 280);
          });
        });
      } else if (step.type === "multi") {
        var sel = [];
        stepEl.querySelectorAll(".gq-opt").forEach(function (b) {
          b.addEventListener("click", function () {
            var v = b.getAttribute("data-v");
            var i = sel.indexOf(v);
            if (i > -1) { sel.splice(i, 1); b.classList.remove("is-sel"); }
            else {
              if (sel.length >= (step.max || 2)) return;
              sel.push(v); b.classList.add("is-sel");
            }
            answers[step.id] = sel.slice();
            nextBtn.disabled = sel.length === 0;
          });
        });
        nextBtn.addEventListener("click", next);
      } else if (step.type === "select") {
        var s = stepEl.querySelector("#gqSelect");
        s.addEventListener("change", function () { answers[step.id] = s.value; nextBtn.disabled = !s.value; });
        nextBtn.addEventListener("click", next);
      } else if (step.type === "email") {
        var inp = stepEl.querySelector("#gqEmail");
        var err = stepEl.querySelector("#gqErr");
        var valid = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };
        inp.addEventListener("input", function () { nextBtn.disabled = !valid(inp.value.trim()); err.hidden = true; });
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter" && valid(inp.value.trim())) { answers.email = inp.value.trim(); next(); } });
        nextBtn.addEventListener("click", function () {
          if (!valid(inp.value.trim())) { err.hidden = false; return; }
          answers.email = inp.value.trim(); next();
        });
      }
    }

    /* matching + result ------------------------------------------- */
    function finish() {
      idx = STEPS.length; setProgress();
      stage.style.transition = "opacity .2s ease"; stage.style.opacity = "0";
      setTimeout(function () {
        stage.innerHTML =
          '<div class="gq-matching">' +
            '<span class="gq-spinner"></span>' +
            '<p>Gabriella is cross-checking 79 jurisdictions…</p>' +
          "</div>";
        stage.style.opacity = "1";
        var rec = recommend(answers);
        setTimeout(function () { showResult(rec); }, reduce ? 200 : 1600);
      }, 200);
    }

    function jxCard(key, rank) {
      var j = JX[key];
      return '<div class="gq-rec' + (rank === 1 ? " gq-rec--primary" : "") + '">' +
        '<div class="gq-rec__top">' +
          '<img class="gq-rec__flag" src="https://flagcdn.com/w40/' + j.iso + '.png" alt="" width="30" height="22">' +
          '<div class="gq-rec__id"><b>' + j.name + '</b>' +
            (rank === 1 ? '<span class="gq-rec__badge">Gabriella’s pick</span>' : '<span class="gq-rec__alt">Also strong</span>') + "</div>" +
          '<div class="gq-rec__tax"><small>Corp tax</small><b>' + j.tax + "</b></div>" +
        "</div>" +
        (rank === 1 ? '<p class="gq-rec__why">' + j.why + "</p>" : "") +
        '<div class="gq-rec__meta">' +
          '<span class="gq-rec__chip">⚡ Setup ' + j.setup + "</span>" +
          j.banks.map(function (b) { return '<span class="gq-rec__chip">' + b + " ✓</span>"; }).join("") +
        "</div>" +
      "</div>";
    }

    function showResult(rec) {
      stage.style.transition = "opacity .2s ease"; stage.style.opacity = "0";
      setTimeout(function () {
        prog.style.width = "100%"; count.textContent = "Done";
        stage.innerHTML =
          '<div class="gq-result">' +
            '<div class="gq-result__head"><span class="gq-tick"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></span>' +
              "<h3>Your shortlist is ready" + (answers.email ? " — and on its way to " + answers.email : "") + ".</h3></div>" +
            jxCard(rec.primary, 1) +
            '<div class="gq-alts">' + rec.alts.map(function (k) { return jxCard(k, 2); }).join("") + "</div>" +
            '<div class="gq-result__cta">' +
              '<button class="btn btn-primary btn-lg" id="gqStart">Start incorporation in ' + JX[rec.primary].name.split(",")[0] + " →</button>" +
              '<button class="btn btn-ghost" id="gqRestart">Start over</button>' +
            "</div>" +
            '<p class="gq-disclaimer">A guided demo recommendation. Your real shortlist is confirmed by a licensed local partner before anything is filed.</p>' +
          "</div>";
        stage.style.opacity = "1";
        var startBtn = stage.querySelector("#gqStart");
        var restart = stage.querySelector("#gqRestart");
        if (startBtn) startBtn.addEventListener("click", function () {
          if (typeof window.openIncorporation === "function") window.openIncorporation(JX[rec.primary].name);
          else { CSModal.close(); var p = document.getElementById("pricing"); if (p) p.scrollIntoView({ behavior: "smooth" }); }
        });
        if (restart) restart.addEventListener("click", function () { idx = 0; answers = { seed: seed }; render(1); });
      }, 200);
    }

    CSModal.open(wrap, { wide: false });
    render(1);
  }

  window.openGabriella = function (seed) { startQuestionnaire(seed); };

  /* ============================================================
     Hero prompt bar wiring
     ============================================================ */
  var bar = document.getElementById("gabBar");
  var input = document.getElementById("gabInput");
  var chips = document.getElementById("gabChips");
  if (bar) {
    bar.addEventListener("submit", function (e) {
      e.preventDefault();
      window.openGabriella(input ? input.value.trim() : "");
    });
    if (chips) chips.addEventListener("click", function (e) {
      var c = e.target.closest(".gab-chip");
      if (!c) return;
      if (input) input.value = c.textContent.trim();
      window.openGabriella(c.textContent.trim());
    });
  }

  /* ============================================================
     Give every prominent "Ask Gabriella" CTA an AI vibe:
     a twinkling sparkle + breathing glow (CSS class .is-ai).
     Scoped to buttons + the CTA pill — not plain text links.
     ============================================================ */
  function decorateAIButtons() {
    /* inject shared SVG gradient defs once */
    if (!document.getElementById("gabGradDefs")) {
      var d = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      d.id = "gabGradDefs"; d.setAttribute("aria-hidden", "true");
      d.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
      d.innerHTML = '<defs>' +
        '<linearGradient id="gabStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%" stop-color="#c4b5fd"/>' +
        '<stop offset="40%" stop-color="#a78bfa"/>' +
        '<stop offset="72%" stop-color="#f472b6"/>' +
        '<stop offset="100%" stop-color="#fb923c"/>' +
        '</linearGradient></defs>';
      document.body.insertBefore(d, document.body.firstChild);
    }
    var sel = '.btn[data-cta="gabriella"], .jx-cta2__pill[data-cta="gabriella"]';
    var SPARK = '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="url(#gabStarGrad)" d="M12 2 13.8 10.2 22 12 13.8 13.8 12 22 10.2 13.8 2 12 10.2 10.2Z"/></svg>';
    document.querySelectorAll(sel).forEach(function (b) {
      if (b.__ai) return; b.__ai = true;
      b.classList.add("is-ai");
      var s = document.createElement("span");
      s.className = "gab-spark"; s.setAttribute("aria-hidden", "true");
      s.innerHTML = SPARK;
      b.insertBefore(s, b.firstChild);
    });
    /* hero prompt-bar send button: breathing glow only — the bar already
       carries its own sparkle avatar, so we skip the injected star here. */
    var gabSend = document.querySelector("#gabBar .gab-send");
    if (gabSend && !gabSend.__ai) { gabSend.__ai = true; gabSend.classList.add("is-ai"); }
  }
  if (document.readyState !== "loading") decorateAIButtons();
  else document.addEventListener("DOMContentLoaded", decorateAIButtons);
})();
