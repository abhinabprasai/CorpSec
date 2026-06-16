/* dashboard.js — "Watch a company come to life" interactive demo.
   A jurisdiction switcher ("See it for …") swaps a 3-column dashboard board
   (entity + compliance, services + real prices, recent activity) with a
   staggered spring animation. Data is jurisdiction-accurate (real registries,
   filings and currencies) to match the brand's "honest, real numbers" ethos. */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  /* icon set (stroke, 24-grid) ------------------------------------------- */
  var IC = {
    check: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.2 2.2L15.8 9.4"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8.5v7M8.5 12h7"/></svg>',
    doc: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>'
  };

  /* jurisdiction data ---------------------------------------------------- */
  var DATA = [
    {
      iso: "sg", code: "SG", name: "Singapore", entity: "Acme Pte Ltd",
      reg: "UEN 202612345A",
      compliance: { label: "ACRA AR-1 · annual return", due: "due in 24 days" },
      renewal: "Mar 15", renewalIn: "24 days",
      services: [
        ["Registered address", "S$1,000/yr"],
        ["Bookkeeping", "S$550/mo"],
        ["IRAS Form C-S (tax)", "S$1,750/yr"]
      ],
      activity: [
        ["ACRA Annual Return AR-1 filed", "2h ago", "check"],
        ["Bookkeeping service activated", "1d ago", "plus"],
        ["Form C-S submitted to IRAS", "3d ago", "doc"]
      ]
    },
    {
      iso: "fr", code: "FR", name: "France", entity: "Acme SAS",
      reg: "SIREN 914 287 015",
      compliance: { label: "Liasse fiscale · tax bundle", due: "due in 38 days" },
      renewal: "Apr 30", renewalIn: "38 days",
      services: [
        ["Siège social (address)", "€90/mo"],
        ["Comptabilité (bookkeeping)", "€320/mo"],
        ["Liasse fiscale (tax filing)", "€1,400/yr"]
      ],
      activity: [
        ["Statuts filed with the Greffe", "4h ago", "check"],
        ["TVA (VAT) number issued", "2d ago", "plus"],
        ["Extrait Kbis delivered", "5d ago", "doc"]
      ]
    },
    {
      iso: "be", code: "BE", name: "Belgium", entity: "Acme BV",
      reg: "BCE 0788.512.904",
      compliance: { label: "Annual accounts · NBB", due: "due in 52 days" },
      renewal: "Jun 30", renewalIn: "52 days",
      services: [
        ["Registered address", "€80/mo"],
        ["Bookkeeping", "€290/mo"],
        ["Corporate tax return", "€1,200/yr"]
      ],
      activity: [
        ["Deed notarised & filed (KBO)", "6h ago", "check"],
        ["VAT number activated", "3d ago", "plus"],
        ["UBO register updated", "6d ago", "doc"]
      ]
    },
    {
      iso: "ae", code: "AE", name: "Dubai", entity: "Acme FZ-LLC",
      reg: "DMCC Licence 0912744",
      compliance: { label: "Corporate tax return · FTA", due: "due in 71 days" },
      renewal: "Sep 12", renewalIn: "71 days",
      services: [
        ["Flexi-desk address", "AED 6,000/yr"],
        ["Bookkeeping", "AED 1,800/mo"],
        ["Corporate tax filing", "AED 5,500/yr"]
      ],
      activity: [
        ["Trade licence issued (DMCC)", "3h ago", "check"],
        ["Establishment card approved", "2d ago", "plus"],
        ["Registered for corporate tax (FTA)", "4d ago", "doc"]
      ]
    },
    {
      iso: "gb", code: "UK", name: "United Kingdom", entity: "Acme Ltd",
      reg: "Company No. 15428809",
      compliance: { label: "Confirmation statement", due: "due in 19 days" },
      renewal: "Mar 31", renewalIn: "19 days",
      services: [
        ["Registered office", "£180/yr"],
        ["Bookkeeping", "£240/mo"],
        ["Corporation tax (CT600)", "£900/yr"]
      ],
      activity: [
        ["Incorporated at Companies House", "2h ago", "check"],
        ["VAT registration submitted", "1d ago", "plus"],
        ["Confirmation statement filed", "4d ago", "doc"]
      ]
    },
    {
      iso: "us", code: "TX", name: "Texas", entity: "Acme LLC",
      reg: "SOS File 0804512226",
      compliance: { label: "Franchise tax · PIR", due: "due in 44 days" },
      renewal: "May 15", renewalIn: "44 days",
      services: [
        ["Registered agent", "$120/yr"],
        ["Bookkeeping", "$280/mo"],
        ["Federal + franchise tax", "$1,100/yr"]
      ],
      activity: [
        ["Certificate of Formation filed (SOS)", "5h ago", "check"],
        ["EIN issued by the IRS", "1d ago", "plus"],
        ["BOI report submitted (FinCEN)", "3d ago", "doc"]
      ]
    }
  ];

  var pillsEl = document.getElementById("platformPills");
  var boardEl = document.getElementById("platformBoard");
  if (!pillsEl || !boardEl) return;

  function flag(iso) {
    return '<img class="pb-flag" src="https://flagcdn.com/w40/' + iso + '.png" ' +
      'alt="" loading="lazy" width="20" height="15">';
  }

  function boardHTML(j) {
    var services = j.services.map(function (s) {
      return '<li class="pb-srow"><span class="pb-sname">' + s[0] +
        '</span><span class="pb-sprice">' + s[1] + '</span></li>';
    }).join("");
    var activity = j.activity.map(function (a) {
      return '<li class="pb-act pb-act--' + a[2] + '">' +
        '<span class="pb-act__ic">' + IC[a[2]] + '</span>' +
        '<span class="pb-act__txt">' + a[0] + '<small>' + a[1] + '</small></span></li>';
    }).join("");

    return '' +
      '<div class="pb-col pb-col--entity">' +
        '<div class="pb-entity">' + flag(j.iso) +
          '<div class="pb-entity__id"><b>' + j.entity + '</b>' +
            '<span class="pb-entity__sub">' + j.code + ' · <i class="pb-live">Active</i></span></div>' +
        '</div>' +
        '<div class="pb-block">' +
          '<span class="pb-label">Compliance</span>' +
          '<div class="pb-due"><span class="pb-due__dot"></span>' + j.compliance.label +
            '<small>' + j.compliance.due + '</small></div>' +
          '<p class="pb-renewal">Next renewal <b>' + j.renewal + '</b> <span>(' + j.renewalIn + ')</span></p>' +
          '<p class="pb-reg">' + j.reg + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="pb-col pb-col--services">' +
        '<span class="pb-label">Services</span>' +
        '<ul class="pb-list">' + services + '</ul>' +
      '</div>' +
      '<div class="pb-col pb-col--activity">' +
        '<span class="pb-label">Recent activity</span>' +
        '<ul class="pb-list">' + activity + '</ul>' +
      '</div>';
  }

  var active = 0;

  function render(i, animate) {
    active = i;
    boardEl.innerHTML = boardHTML(DATA[i]);
    if (animate && !reduce) {
      boardEl.classList.remove("swap-in");
      void boardEl.offsetWidth;           // reflow → restart stagger
      boardEl.classList.add("swap-in");
    } else {
      boardEl.classList.add("swap-in");
    }
    Array.prototype.forEach.call(pillsEl.children, function (p, k) {
      p.classList.toggle("active", k === i);
      p.setAttribute("aria-selected", k === i ? "true" : "false");
    });
  }

  // build pills
  pillsEl.innerHTML = DATA.map(function (j, i) {
    return '<button class="platform-pill" role="tab" type="button" data-i="' + i + '" ' +
      'aria-selected="' + (i === 0 ? "true" : "false") + '">' +
      flag(j.iso) + '<span>' + j.name + '</span></button>';
  }).join("");

  pillsEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".platform-pill");
    if (!btn) return;
    var i = +btn.getAttribute("data-i");
    if (i === active) return;
    render(i, true);
  });

  render(0, false);
})();
