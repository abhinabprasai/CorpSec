/* dashboard.js — "Watch a company come to life" interactive demo.
   A jurisdiction switcher ("See it for …") swaps a 3-column dashboard board
   (entity + compliance, services + real prices, recent activity) with a
   staggered spring animation, and auto-cycles every 4.2s until the visitor
   takes over. Data mirrors CorpSec's six demo jurisdictions verbatim.
   Also mounts the global floating contact pill (mail + WhatsApp). */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  var IC = {
    check: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.2 2.2L15.8 9.4"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8.5v7M8.5 12h7"/></svg>',
    doc: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>'
  };

  /* verbatim CorpSec demo data (6 jurisdictions) */
  var DATA = [
    { iso: "sg", code: "SG", name: "Singapore", entity: "Acme Pte Ltd",
      compliance: { label: "ACRA AR-1 — due in 24 days" }, renewal: "Mar 15", renewalIn: "24 days",
      services: [["Registered address", "S$1,000/yr"], ["Bookkeeping", "S$550/mo"], ["IRAS Form C-S", "S$1,750/yr"]],
      activity: [["ACRA Annual Return AR-1 filed", "2h ago", "check"], ["Bookkeeping service activated", "1d ago", "plus"], ["Form C-S submitted to IRAS", "3d ago", "doc"]] },
    { iso: "fr", code: "FR", name: "France", entity: "Acme SAS",
      compliance: { label: "Liasse fiscale — due in 9 days" }, renewal: "Apr 30", renewalIn: "9 days",
      services: [["Registered address", "€288/yr"], ["Bookkeeping", "€180/mo"], ["Liasse fiscale (IS)", "€900/yr"]],
      activity: [["Bilan déposé au greffe", "2h ago", "check"], ["Comptabilité Bookiper activée", "1d ago", "plus"], ["Liasse fiscale transmise à la DGFiP", "3d ago", "doc"]] },
    { iso: "be", code: "BE", name: "Belgium", entity: "Acme BV",
      compliance: { label: "ISoc — due in 11 days" }, renewal: "Sep 30", renewalIn: "11 days",
      services: [["Registered address", "€600/yr"], ["Bookkeeping", "€390/mo"], ["Déclaration ISoc", "€1,200/yr"]],
      activity: [["Annual accounts filed at NBB", "2h ago", "check"], ["Bookkeeping service activated", "1d ago", "plus"], ["UBO register updated", "3d ago", "doc"]] },
    { iso: "ae", code: "AE", name: "Dubai", entity: "Acme FZ-LLC",
      compliance: { label: "Trade licence — due in 32 days" }, renewal: "Jun 30", renewalIn: "32 days",
      services: [["Registered address", "AED 8,800/yr"], ["Bookkeeping", "AED 2,800/mo"], ["UAE Corporate Tax return", "AED 6,800/yr"]],
      activity: [["Corporate Tax return submitted to FTA", "2h ago", "check"], ["Bookkeeping service activated", "1d ago", "plus"], ["Trade licence renewed at DED", "3d ago", "doc"]] },
    { iso: "gb", code: "UK", name: "UK", entity: "Acme Ltd",
      compliance: { label: "CT600 — due in 12 days" }, renewal: "Jan 31", renewalIn: "12 days",
      services: [["Registered address", "£250/yr"], ["Bookkeeping", "£250/mo"], ["CT600 (HMRC)", "£650/yr"]],
      activity: [["CS01 confirmation statement filed", "2h ago", "check"], ["Bookkeeping service activated", "1d ago", "plus"], ["CT600 submitted to HMRC", "3d ago", "doc"]] },
    { iso: "us", code: "TX", name: "Texas", entity: "Acme LLC",
      compliance: { label: "Franchise Tax PIR — due in 18 days" }, renewal: "May 15", renewalIn: "18 days",
      services: [["Registered address", "$372/yr"], ["Bookkeeping", "$372/mo"], ["Federal 1120 + Franchise Tax", "$1,140/yr"]],
      activity: [["Public Information Report filed", "2h ago", "check"], ["Bookkeeping service activated", "1d ago", "plus"], ["Form 1120 submitted to IRS", "3d ago", "doc"]] }
  ];

  var pillsEl = document.getElementById("platformPills");
  var boardEl = document.getElementById("platformBoard");

  function flag(iso) {
    return '<img class="pb-flag" src="https://flagcdn.com/w40/' + iso + '.png" alt="" loading="lazy" width="20" height="15">';
  }

  function boardHTML(j) {
    var services = j.services.map(function (s) {
      return '<li class="pb-srow"><span class="pb-sname">' + s[0] + '</span><span class="pb-sprice">' + s[1] + "</span></li>";
    }).join("");
    var activity = j.activity.map(function (a) {
      return '<li class="pb-act pb-act--' + a[2] + '"><span class="pb-act__ic">' + IC[a[2]] +
        '</span><span class="pb-act__txt">' + a[0] + "<small>" + a[1] + "</small></span></li>";
    }).join("");
    return '' +
      '<div class="pb-col pb-col--entity">' +
        '<div class="pb-entity">' + flag(j.iso) +
          '<div class="pb-entity__id"><b>' + j.entity + '</b><span class="pb-entity__sub">' + j.code + ' · <i class="pb-live">Active</i></span></div>' +
        '</div>' +
        '<div class="pb-block"><span class="pb-label">Compliance</span>' +
          '<div class="pb-due"><span class="pb-due__dot"></span>' + j.compliance.label + '</div>' +
          '<p class="pb-renewal">Next renewal <b>' + j.renewal + '</b> <span>(' + j.renewalIn + ')</span></p>' +
        '</div>' +
      '</div>' +
      '<div class="pb-col pb-col--services"><span class="pb-label">Services</span><ul class="pb-list">' + services + '</ul></div>' +
      '<div class="pb-col pb-col--activity"><span class="pb-label">Recent activity</span><ul class="pb-list">' + activity + '</ul></div>';
  }

  if (pillsEl && boardEl) {
    var active = 0, userPicked = false, hovered = false, visible = false, timer = null;

    function render(i, animate) {
      active = i;
      boardEl.innerHTML = boardHTML(DATA[i]);
      if (animate && !reduce) { boardEl.classList.remove("swap-in"); void boardEl.offsetWidth; }
      boardEl.classList.add("swap-in");
      Array.prototype.forEach.call(pillsEl.children, function (p, k) {
        p.classList.toggle("active", k === i);
        p.setAttribute("aria-selected", k === i ? "true" : "false");
      });
    }

    pillsEl.innerHTML = DATA.map(function (j, i) {
      return '<button class="platform-pill" role="tab" type="button" data-i="' + i + '" aria-selected="' + (i === 0 ? "true" : "false") + '">' +
        flag(j.iso) + "<span>" + j.name + "</span></button>";
    }).join("");

    pillsEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".platform-pill");
      if (!btn) return;
      userPicked = true;                 // visitor takes over → stop auto-cycle
      var i = +btn.getAttribute("data-i");
      if (i !== active) render(i, true);
    });

    /* auto-cycle every 4.2s until hovered / picked / offscreen / hidden */
    function tick() {
      if (userPicked || hovered || !visible || document.hidden) return;
      render((active + 1) % DATA.length, true);
    }
    function markHover(v) { return function () { hovered = v; }; }
    [pillsEl, boardEl].forEach(function (el) {
      el.addEventListener("pointerenter", markHover(true));
      el.addEventListener("pointerleave", markHover(false));
    });
    if (!reduce) {
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.25 })
          .observe(document.getElementById("platform"));
      } else { visible = true; }
      timer = setInterval(tick, 4200);
    }

    render(0, false);
  }

  /* ============================================================
     Floating contact pill (mail + WhatsApp), liquid glass.
     Appears after 1.2s, expands on hover/focus.
     ============================================================ */
  (function contactPill() {
    if (document.getElementById("contactPill")) return;
    var wrap = document.createElement("div");
    wrap.className = "contact-pill";
    wrap.id = "contactPill";
    wrap.innerHTML =
      '<a class="cpill-btn cpill-wa" href="https://wa.me/33757905918" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' +
        '<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.042zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>' +
        '<span class="cpill-label">WhatsApp</span>' +
      '</a>' +
      '<span class="cpill-sep" aria-hidden="true"></span>' +
      '<a class="cpill-btn cpill-mail" href="mailto:hello@corpsec.io" aria-label="Email hello@corpsec.io">' +
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>' +
        '<span class="cpill-label">Email us</span>' +
      '</a>';
    function mount() {
      document.body.appendChild(wrap);
      requestAnimationFrame(function () { wrap.classList.add("is-in"); });
    }
    if (reduce) { mount(); return; }
    setTimeout(mount, 1200);
  })();
})();
