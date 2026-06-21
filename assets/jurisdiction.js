/* jurisdiction.js — per-jurisdiction detail page, rendered from
   window.JX_BY_SLUG[?j=slug]. Light + minimal, built from the landing page's
   bento-card system (tilt + border-glow). Merges incorporation + services +
   pricing (à la carte) + in-context compare with flags. */
(function () {
  "use strict";

  var params = new URLSearchParams(location.search);
  var slug = (params.get("j") || "singapore").toLowerCase();
  var DATA = window.JX_BY_SLUG || {};
  var d = DATA[slug];
  var mount = document.getElementById("jx");
  var flag = function (iso) { return "https://flagcdn.com/" + iso + ".svg"; };

  if (!d) {
    mount.innerHTML =
      '<section class="section jx-empty"><div class="container center">' +
      '<span class="eyebrow">Jurisdiction</span>' +
      '<h1 class="display" style="font-size:clamp(28px,5vw,44px)">We’re preparing this one.</h1>' +
      '<p class="sub" style="max-width:48ch;margin:14px auto 26px">We don’t have a full guide for “' + esc(slug) +
      '” yet. Browse the jurisdictions we cover in depth, or ask a specialist.</p>' +
      '<div class="hero-cta center-cta" style="justify-content:center">' +
      '<a class="btn btn-primary" href="jurisdictions.html" data-slot="button" data-variant="default">Browse jurisdictions</a>' +
      '<a class="btn btn-ghost" href="#" data-cta="contact" data-source="jx_missing" data-slot="button" data-variant="outline">Ask about it</a>' +
      '</div></div></section>';
    return;
  }

  if (d.metaTitle) document.title = d.metaTitle;
  if (d.metaDescription) setMeta("description", d.metaDescription);

  var cols = (d.flagColors && d.flagColors.length ? d.flagColors : ["#5b9bff", "#665efd"]).slice(0, 3);
  var c1 = cols[0], c2 = cols[1] || cols[0];

  mount.innerHTML =
    heroHTML(d, c1, c2) +
    fitsHTML(d) +
    compareHTML(d) +
    detailHTML(d) +
    pricingHTML(d) +
    timelineHTML(d) +
    faqHTML(d) +
    ctaHTML(d);

  wireTabs();
  wireFaq();
  wireCart(d);
  if (window.Interactions) window.Interactions.refresh(mount);

  /* ============================ sections ============================ */

  function heroHTML(d, c1, c2) {
    var tags = (d.bestForTags || []).map(function (t) { return '<span class="jx-tag">' + t + '</span>'; }).join("");
    var tax = metric(d, /corp/i);
    var setup = metric(d, /setup|active|timing/i);
    var price = ((d.bundle && d.bundle.priceLabel) || "—").split("(")[0].trim();
    var icTax = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
    var icClock = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 3.5"/></svg>';
    var icTag = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2H7a1 1 0 0 0-.707.293l-4 4A1 1 0 0 0 2 7v5a1 1 0 0 0 .293.707l9 9a1 1 0 0 0 1.414 0l8-8a1 1 0 0 0 0-1.414l-9-9A1 1 0 0 0 12 2Z"/><circle cx="7" cy="7" r="1" fill="currentColor"/></svg>';
    return '' +
      '<section class="jx-hero jx-hero--bento" style="--c1:' + c1 + ';--c2:' + c2 + '">' +
      '<div class="container">' +
      '<a class="jx-back" href="jurisdictions.html"><span aria-hidden="true">←</span> All jurisdictions</a>' +
      '<div class="jx-hero__bento">' +

      // ── Main card (col 1-2, row 1-2)
      '<article class="bento-card jx-bento-main reveal" data-slot="card" aria-label="' + esc(d.name) + ' overview">' +
      '<div class="bento-card__border"></div><div class="bento-card__border-glow"></div>' +
      '<div class="bento-card__inner">' +
      '<div class="jx-bento-main__head">' +
      '<span class="jx-flag-chip jx-flag-chip--xl"><img src="' + flag(d.iso) + '" alt="' + esc(d.name) + ' flag" width="52" height="39" loading="eager" /></span>' +
      '<div><span class="eyebrow">' + esc(d.region || "") + '</span><h1 class="jx-h1">' + esc(d.name) + '</h1></div>' +
      '</div>' +
      '<p class="jx-sub">' + d.hero.sub + '</p>' +
      '<div class="jx-tags jx-bento-main__tags">' + tags + '</div>' +
      '</div></article>' +

      // ── Corp tax stat card (col 3, row 1)
      '<article class="bento-card jx-bento-stat reveal" data-slot="card">' +
      '<div class="bento-card__border"></div><div class="bento-card__border-glow"></div>' +
      '<div class="bento-card__inner">' +
      '<span class="jx-bento-stat__ic">' + icTax + '</span>' +
      '<span class="jx-bento-stat__label">Corporate tax</span>' +
      '<span class="jx-bento-stat__val">' + tax + '</span>' +
      '</div></article>' +

      // ── Setup time stat card (col 3, row 2)
      '<article class="bento-card jx-bento-stat reveal" data-slot="card">' +
      '<div class="bento-card__border"></div><div class="bento-card__border-glow"></div>' +
      '<div class="bento-card__inner">' +
      '<span class="jx-bento-stat__ic">' + icClock + '</span>' +
      '<span class="jx-bento-stat__label">Setup time</span>' +
      '<span class="jx-bento-stat__val">' + setup + '</span>' +
      '</div></article>' +

      // ── From price card (col 1, row 3)
      '<article class="bento-card jx-bento-price reveal" data-slot="card">' +
      '<div class="bento-card__border"></div><div class="bento-card__border-glow"></div>' +
      '<div class="bento-card__inner">' +
      '<span class="jx-bento-stat__ic">' + icTag + '</span>' +
      '<span class="jx-bento-stat__label">Bundle from</span>' +
      '<span class="jx-bento-price__val">' + price + '</span>' +
      '<a class="jx-bento-price__link" href="#pricing">Build package <span aria-hidden="true">↓</span></a>' +
      '</div></article>' +

      // ── CTA card (col 2-3, row 3)
      '<article class="bento-card jx-bento-cta reveal" data-slot="card">' +
      '<div class="bento-card__border"></div><div class="bento-card__border-glow"></div>' +
      '<div class="bento-card__inner">' +
      '<div class="jx-bento-cta__inner">' +
      '<a class="btn btn-primary btn-lg" href="#pricing" data-slot="button" data-variant="default" data-size="lg">Build your package</a>' +
      '<a class="btn btn-ghost btn-lg" href="#" data-cta="contact" data-source="jx_hero_' + esc(d.slug) + '" data-slot="button" data-variant="outline" data-size="lg">Talk to a specialist</a>' +
      '</div></div></article>' +

      '</div></div></section>';
  }

  function fitsHTML(d) {
    var fits = (d.fits || []).map(function (f, i) {
      return '<article class="bento-card jx-fit reveal" data-slot="card">' +
        '<div class="bento-card__border"></div><div class="bento-card__border-glow"></div>' +
        '<div class="bento-card__inner"><span class="jx-fit__n">' + pad(i + 1) + '</span>' +
        '<h3>' + f.title + '</h3><p>' + f.body + '</p></div></article>';
    }).join("");
    return '' +
      '<section class="section jx-fits"><div class="container">' +
      '<div class="section-head reveal"><span class="eyebrow">Is it right for you?</span>' +
      '<h2>' + d.name + ' fits if…</h2>' +
      '<p class="sub">The clearest signal you’re in the right jurisdiction — or that another one deserves a look.</p></div>' +
      '<div class="jx-fits__grid">' + fits + '</div></div></section>';
  }

  function compareHTML(d) {
    var anchor = compareCard(d, true);
    var alts = (d.alternatives || []).map(function (a) {
      var j = DATA[a.slug];
      return j ? compareCard(j, false, a.reason) : altFallback(a);
    }).join("");
    var withList = [d.slug].concat((d.alternatives || []).map(function (a) { return a.slug; })).join(",");
    return '' +
      '<section class="section band-tint jx-compare" id="compare"><div class="container">' +
      '<div class="section-head reveal"><span class="eyebrow">Compare</span>' +
      '<h2>How ' + d.name + ' stacks up.</h2>' +
      '<p class="sub">The jurisdictions founders weigh against ' + d.name + ', side by side — tax, speed and all-in cost at a glance.</p></div>' +
      '<div class="jx-cmp__grid">' + anchor + alts + '</div>' +
      '<div class="jx-cmp__foot reveal"><a class="btn btn-ghost" href="jurisdictions.html#compare?with=' + withList + '" data-slot="button" data-variant="outline">Compare all side by side <span aria-hidden="true">↗</span></a></div>' +
      '</div></section>';
  }

  function compareCard(j, isAnchor, reason) {
    var tax = metric(j, /corp/i), setup = metric(j, /setup|active|timing/i);
    var price = (j.bundle && j.bundle.priceLabel) || "—";
    return '<article class="bento-card jx-cmp' + (isAnchor ? " jx-cmp--anchor" : "") + ' reveal" data-slot="card">' +
      '<div class="bento-card__border"></div><div class="bento-card__border-glow"></div>' +
      '<div class="bento-card__inner">' +
      (isAnchor ? '<span class="jx-cmp__badge">You’re viewing</span>' : '') +
      '<div class="jx-cmp__head"><span class="jx-flag-chip jx-flag-chip--sm"><img src="' + flag(j.iso) + '" alt="" width="28" height="21" /></span>' +
      '<div><b>' + j.name + '</b><small>' + (j.region || "") + '</small></div></div>' +
      '<dl class="jx-cmp__metrics">' +
      '<div><dt>Corporate tax</dt><dd>' + tax + '</dd></div>' +
      '<div><dt>Setup time</dt><dd>' + setup + '</dd></div>' +
      '<div><dt>From</dt><dd>' + price + '</dd></div>' +
      '</dl>' +
      (reason ? '<p class="jx-cmp__why">' + reason + '</p>' : '') +
      (isAnchor ? '<span class="jx-cmp__cur">Current jurisdiction</span>'
        : '<a class="jx-cmp__link" href="jurisdiction.html?j=' + j.slug + '">View ' + j.name + ' <span aria-hidden="true">→</span></a>') +
      '</div></article>';
  }
  function altFallback(a) {
    return '<article class="bento-card jx-cmp reveal" data-slot="card"><div class="bento-card__border"></div>' +
      '<div class="bento-card__inner"><div class="jx-cmp__head"><div><b>' + a.name + '</b></div></div>' +
      '<p class="jx-cmp__why">' + a.reason + '</p>' +
      '<a class="jx-cmp__link" href="jurisdiction.html?j=' + a.slug + '">View ' + a.name + ' <span aria-hidden="true">→</span></a></div></article>';
  }

  function detailHTML(d) {
    return '' +
      '<section class="section jx-detail"><div class="container">' +
      '<div class="section-head reveal"><span class="eyebrow">The operating reality</span>' +
      '<h2>Tax, structure &amp; compliance — the facts you’ll be asked about.</h2></div>' +
      '<div class="bento-card jx-detail__card reveal" data-slot="card"><div class="bento-card__border"></div>' +
      '<div class="bento-card__inner">' +
      '<div class="jx-tabs" role="tablist" aria-label="Detail">' +
      '<button class="jx-tab is-on" role="tab" data-tab="fiscal" data-slot="tabs-trigger" data-state="active">Fiscal</button>' +
      '<button class="jx-tab" role="tab" data-tab="legal" data-slot="tabs-trigger" data-state="inactive">Legal &amp; structure</button>' +
      '</div>' +
      '<div class="jx-tabpanel is-on" data-panel="fiscal" data-slot="tabs-content"><table class="jx-table"><tbody>' + rows(d.fiscal) + '</tbody></table></div>' +
      '<div class="jx-tabpanel" data-panel="legal" data-slot="tabs-content"><table class="jx-table"><tbody>' + rows(d.legal) + '</tbody></table></div>' +
      '</div></div></div></section>';
  }

  /* à-la-carte pricing — bundle OR any combination of individual services */
  function pricingHTML(d) {
    var cur = d.currency || "";
    var bundleAmt = firstNum(d.bundle.priceLabel);
    var bundleLabel = (d.bundle.priceLabel || "").split("(")[0].trim();
    var recurLabel = d.bundle.recurringLabel || "";
    var incItems = d.bundle.includes || [];

    // Extract prices from include strings and compare to bundle price
    var incTotal = incItems.reduce(function (s, line) {
      var m = line.replace(/,/g, "").match(/(\d{3,})/g);
      return s + (m ? +m[0] : 0);
    }, 0);
    var saved = incTotal > bundleAmt + 200 ? incTotal - bundleAmt : 0;
    var saveBadge = saved
      ? '<span class="jx-bundle-save-badge"><svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd"/></svg>Save ~' + cur + " " + saved.toLocaleString() + ' vs. individual billing</span>'
      : '<span class="jx-bundle-save-badge"><svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd"/></svg>One invoice · one partner</span>';
    var inc = incItems.map(function (x) { return '<li>' + check() + '<span>' + x + '</span></li>'; }).join("");

    var bundleCard =
      '<article class="bento-card jx-pkg--bundle jx-pkg--full reveal" data-slot="card">' +
      '<div class="bento-card__border"></div><div class="bento-card__border-glow"></div>' +
      '<div class="bento-card__inner jx-bundle-inner">' +

      '<div class="jx-bundle-left">' +
      '<div class="jx-bundle-badges"><span class="price-badge" data-slot="badge" data-variant="default">Complete bundle</span>' +
      '<span class="jx-bundle-popular">Most popular</span></div>' +
      '<div class="jx-bundle-amt">' + bundleLabel + '</div>' +
      '<div class="jx-bundle-rec">' + recurLabel + '</div>' +
      saveBadge +
      '<label class="jx-pick jx-bundle-pick">' +
      '<input type="checkbox" class="jx-pick__in" data-name="' + esc(d.name) + ' formation bundle" data-amount="' + bundleAmt + '" data-bundle="1" />' +
      '<span class="jx-pick__box" aria-hidden="true"></span>' +
      '<span class="jx-bundle-pick-label">Add complete bundle</span>' +
      '</label></div>' +

      '<div class="jx-bundle-right">' +
      '<h4 class="jx-bundle-inc-h">What\'s included</h4>' +
      '<ul class="jx-bundle-inc">' + inc + '</ul>' +
      '</div>' +
      '</div></article>';

    var groups = (d.addons || []).map(function (g) {
      var items = (g.items || []).map(function (it) {
        var amt = firstNum(it.price);
        return '<label class="jx-svc-row">' +
          '<input type="checkbox" class="jx-pick__in" data-name="' + esc(it.name) + '" data-amount="' + amt + '" />' +
          '<span class="jx-pick__box" aria-hidden="true"></span>' +
          '<span class="jx-svc-row__name">' + it.name + '</span>' +
          '<span class="jx-svc-row__price">' + it.price + '</span></label>';
      }).join("");
      return '<article class="bento-card jx-pkg reveal" data-slot="card">' +
        '<div class="bento-card__border"></div><div class="bento-card__border-glow"></div>' +
        '<div class="bento-card__inner"><h3 class="jx-pkg__group">' + g.group + '</h3>' +
        '<div class="jx-svc-list">' + items + '</div></div></article>';
    }).join("");

    return '' +
      '<section class="section band-tint jx-price" id="pricing"><div class="container">' +
      '<div class="section-head reveal"><span class="eyebrow">Build your package</span>' +
      '<h2>Take the full bundle — or just what you need.</h2>' +
      '<p class="sub">Select the complete formation bundle, or mix and match individual services in ' + esc(d.name) + '. One checkout, one invoice.</p></div>' +
      bundleCard +
      '<div class="jx-price-divider"><span>Or add individual services à la carte</span></div>' +
      '<div class="jx-svc__grid" id="services">' + groups + '</div>' +
      '</div>' +
      '<div class="jx-cart" id="jxCart" hidden>' +
      '<div class="container jx-cart__inner">' +
      '<div class="jx-cart__info">' +
      '<span class="jx-cart__count" id="jxCartCount">0 services</span>' +
      '<span class="jx-cart__total" id="jxCartTotal"></span>' +
      '</div>' +
      '<button class="jx-cart__btn" id="jxCartGo" type="button">Continue to checkout <span aria-hidden="true">→</span></button>' +
      '</div></div>' +
      '</section>';
  }

  function timelineHTML(d) {
    if (!d.timeline || !d.timeline.length) return "";
    var icons = [icDoc(), icBuild(), icRocket()];
    var steps = d.timeline.map(function (p, i) {
      var li = (p.items || []).map(function (x) { return '<li>' + x + '</li>'; }).join("");
      return '<article class="bento-card jx-step reveal" data-slot="card"><div class="bento-card__border"></div><div class="bento-card__border-glow"></div>' +
        '<div class="bento-card__inner">' +
        '<div class="jx-step__top"><span class="jx-step__num">' + pad(i + 1) + '</span><span class="jx-step__ic">' + (icons[i] || icDoc()) + '</span></div>' +
        '<div class="jx-step__when">' + p.when + '</div><h3>' + p.phase + '</h3><ul>' + li + '</ul></div></article>';
    }).join("");
    return '' +
      '<section class="section jx-timeline"><div class="container">' +
      '<div class="section-head reveal"><span class="eyebrow">How it works</span>' +
      '<h2>From signed engagement to operating company.</h2>' +
      '<p class="sub">A licensed local partner runs each step. You sign once and watch it progress.</p></div>' +
      '<div class="jx-steps">' + steps + '</div></div></section>';
  }

  function faqHTML(d) {
    var items = (d.faqs || []).map(function (f) {
      return '<details class="faq-item" data-slot="accordion-item"><summary data-slot="accordion-trigger">' +
        f.q + '<span class="faq-chev" aria-hidden="true"></span></summary>' +
        '<div class="faq-a" data-slot="accordion-content" role="region"><p>' + f.a + '</p></div></details>';
    }).join("");
    var src = (d.sources || []).map(function (s) {
      return '<a class="jx-src" href="' + s.url + '" target="_blank" rel="noopener">' + s.label + '</a>';
    }).join("");
    return '' +
      '<section class="section jx-faq" id="faq"><div class="container">' +
      '<div class="section-head reveal"><span class="eyebrow">FAQ</span>' +
      '<h2>What founders ask before incorporating in ' + d.name + '.</h2></div>' +
      '<div class="faq-list reveal">' + items + '</div>' +
      (src ? '<div class="jx-sources reveal"><span>Sources</span>' + src + '</div>' : "") +
      '</div></section>';
  }

  function ctaHTML(d) {
    return '' +
      '<section class="section jx-final"><div class="container">' +
      '<div class="jx-final__card reveal" style="--c1:' + c1 + ';--c2:' + c2 + '">' +
      '<div class="jx-final__glow" aria-hidden="true"></div>' +
      '<div class="jx-final__body">' +
      '<span class="jx-flag-chip jx-flag-chip--lg"><img src="' + flag(d.iso) + '" alt="" width="40" height="30" /></span>' +
      '<h2>Your ' + d.name + ' company, ready to operate.</h2>' +
      '<p>A licensed local team handles filing, banking introductions and compliance. You stay in control.</p>' +
      '<div class="hero-cta center-cta jx-final__cta">' +
      '<a class="btn btn-white btn-lg" href="#pricing" data-slot="button" data-variant="secondary" data-size="lg">Build your package</a>' +
      '<a class="btn btn-ghost-light btn-lg" href="jurisdictions.html#compare" data-slot="button" data-variant="outline" data-size="lg">Compare jurisdictions</a>' +
      '</div></div>' +
      '<div class="jx-final__stats"><div><b>48h</b><span>avg. filing</span></div><div><b>79</b><span>jurisdictions</span></div><div><b>2,400+</b><span>companies</span></div></div>' +
      '</div></div></section>';
  }

  /* ============================ cart ============================ */
  function wireCart(d) {
    var cart = document.getElementById("jxCart");
    var countEl = document.getElementById("jxCartCount");
    var totalEl = document.getElementById("jxCartTotal");
    var goEl = document.getElementById("jxCartGo");
    if (!cart || !goEl) return;
    var cur = d.currency || "";
    function selected() {
      return Array.prototype.slice.call(mount.querySelectorAll(".jx-pick__in:checked")).map(function (i) {
        return { name: i.dataset.name, amount: +i.dataset.amount || 0, bundle: i.dataset.bundle === "1" };
      });
    }
    function update() {
      var sel = selected();
      if (!sel.length) { cart.hidden = true; return; }
      cart.hidden = false;
      var total = sel.reduce(function (s, x) { return s + x.amount; }, 0);
      countEl.textContent = sel.length + (sel.length === 1 ? " service selected" : " services selected");
      totalEl.textContent = total ? "from " + cur + " " + total.toLocaleString() : "";
    }
    mount.addEventListener("change", function (e) { if (e.target.classList.contains("jx-pick__in")) update(); });
    goEl.addEventListener("click", function () { openCheckout(d, selected(), cur); });
  }

  function openCheckout(d, sel, cur) {
    var total = sel.reduce(function (s, x) { return s + x.amount; }, 0);
    var node = document.createElement("div");
    node.className = "jx-co";
    var lines = sel.map(function (x) {
      return '<div class="jx-co__row"><span>' + x.name + '</span><span>' + (x.amount ? cur + " " + x.amount.toLocaleString() : "—") + '</span></div>';
    }).join("");
    node.innerHTML =
      '<h3 class="jx-co__h">Your ' + d.name + ' package</h3>' +
      '<p class="jx-co__sub">Send this selection to a ' + d.name + ' specialist. We confirm scope and exact pricing before anything is charged.</p>' +
      '<div class="jx-co__list">' + lines + '</div>' +
      '<div class="jx-co__total"><span>Estimated from</span><b>' + cur + " " + total.toLocaleString() + '</b></div>' +
      '<form class="jx-co__form" autocomplete="off">' +
      '<input type="text" required placeholder="Your name" aria-label="Your name" data-slot="input" data-autofocus />' +
      '<input type="email" required placeholder="Work email" aria-label="Work email" data-slot="input" />' +
      '<button class="btn btn-primary" type="submit" data-slot="button" data-variant="default">Send my package</button>' +
      '</form>';
    node.querySelector(".jx-co__form").addEventListener("submit", function (e) {
      e.preventDefault();
      node.innerHTML = '<div class="jx-co__done"><div class="jx-co__tick">' + check() + '</div>' +
        '<h3>Got it — we’ll be in touch.</h3><p>A ' + d.name + ' specialist will email you a confirmed scope and quote within one business day.</p>' +
        '<button class="btn btn-primary" type="button" data-csm-close data-slot="button" data-variant="default">Done</button></div>';
    });
    if (window.CSModal) window.CSModal.open(node, { wide: false });
  }

  /* ============================ helpers ============================ */
  function rows(arr) { return (arr || []).map(function (r) { return '<tr><th scope="row">' + r.label + '</th><td>' + r.value + '</td></tr>'; }).join(""); }
  function metric(j, re) {
    var m = (j.memo || []).filter(function (x) { return re.test(x.label); })[0];
    if (m) return m.value;
    var f = (j.fiscal || []).filter(function (x) { return re.test(x.label); })[0];
    return f ? f.value : "—";
  }
  function firstNum(s) { var m = String(s).replace(/,/g, "").match(/(\d{2,})/); return m ? +m[1] : 0; }
  function check() { return '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.2 2.2L15.8 9.4"/></svg>'; }
  function icDoc() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7Z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 17h4"/></svg>'; }
  function icBuild() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-6h6v6"/></svg>'; }
  function icRocket() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13c-1.5 1.5-2 5-2 5s3.5-.5 5-2"/><path d="M14.5 4.5C18 4 20 6 19.5 9.5c-.4 2.7-3.5 6.3-7 8.5l-4-4c2.2-3.5 5.8-6.6 8.5-7Z"/><circle cx="14.5" cy="9.5" r="1.5"/></svg>'; }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function setMeta(name, val) {
    var m = document.querySelector('meta[name="' + name + '"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", name); document.head.appendChild(m); }
    m.setAttribute("content", val);
  }

  function wireTabs() {
    var tabs = mount.querySelectorAll(".jx-tab");
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        var key = t.dataset.tab;
        tabs.forEach(function (x) { x.classList.toggle("is-on", x === t); x.setAttribute("data-state", x === t ? "active" : "inactive"); });
        mount.querySelectorAll(".jx-tabpanel").forEach(function (p) { p.classList.toggle("is-on", p.dataset.panel === key); });
      });
    });
  }
  function wireFaq() {
    mount.querySelectorAll(".faq-item").forEach(function (item) {
      var sum = item.querySelector("summary"), body = item.querySelector(".faq-a");
      if (!sum || !body) return;
      sum.addEventListener("click", function (e) {
        e.preventDefault();
        if (item.open) {
          body.style.height = body.scrollHeight + "px";
          requestAnimationFrame(function () { body.style.height = "0px"; });
          var done = function () { item.open = false; body.style.height = ""; body.removeEventListener("transitionend", done); };
          body.addEventListener("transitionend", done);
        } else {
          item.open = true; var h = body.scrollHeight; body.style.height = "0px";
          requestAnimationFrame(function () { body.style.height = h + "px"; });
          var done2 = function () { body.style.height = ""; body.removeEventListener("transitionend", done2); };
          body.addEventListener("transitionend", done2);
        }
      });
    });
  }
})();
