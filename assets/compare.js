/* compare.js — jurisdiction comparison for compare.html.
   Starts empty: the user searches (combobox) or taps a popular chip to add up to
   5 jurisdictions, which render as side-by-side columns. No preselection, no
   modal — an inline search + quick-add chips drive everything. */
(function () {
  "use strict";

  /* ── Rich data for the 6 flagship jurisdictions ──────────────────────────── */
  var CDATA = {
    "singapore": {
      name:"Singapore",iso:"sg",region:"Asia",slug:"singapore",
      entity:"Private Limited (Pte Ltd)",
      corpTax:"17% headline · ~8.25% effective on first S$200k",
      vatGst:"9% GST (Jan 2024)",
      cgt:"None",
      personalTax:"Progressive 0–22%",
      dividendWH:"0%",
      lossCarry:"Indefinite",
      minCapital:"S$1",
      residentDir:"Required",
      setupTime:"~10 days",
      yearOne:"From S$5,234 (~$4,130 USD)",
      annualFilings:"Annual Return + AGM; IRAS profits tax return",
      banking:"DBS or OCBC introductions",
      bestFor:["APAC HQ","ASEAN & India","IP & trading","Treaty network"]
    },
    "hong-kong": {
      name:"Hong Kong",iso:"hk",region:"Asia",slug:"hong-kong",
      entity:"Private company limited by shares",
      corpTax:"8.25% on first HK$2M · 16.5% above",
      vatGst:"None",
      cgt:"None",
      personalTax:"Salaries tax 2–17%",
      dividendWH:"None",
      lossCarry:"Indefinite (trade losses)",
      minCapital:"HK$1 (1 share)",
      residentDir:"Not required",
      setupTime:"~1 week",
      yearOne:"From US$1,950",
      annualFilings:"Annual Return to CR; Profits Tax return to IRD",
      banking:"HSBC or Standard Chartered introductions",
      bestFor:["Asia trading gateway","China & Greater Bay","Foreign-income treatment","Holding companies"]
    },
    "united-kingdom": {
      name:"United Kingdom",iso:"gb",region:"Europe",slug:"united-kingdom",
      entity:"Private limited company (Ltd)",
      corpTax:"25% main rate · 19% small-profits rate (≤£50k profit)",
      vatGst:"20% VAT (register from £90k turnover)",
      cgt:"Included in corporation tax",
      personalTax:"20–45% income tax",
      dividendWH:"None (treaty-dependent)",
      lossCarry:"Indefinite carry-forward; 1 yr carry-back",
      minCapital:"£1",
      residentDir:"Not required",
      setupTime:"~48 hours",
      yearOne:"From £936",
      annualFilings:"Confirmation statement + accounts (CH); CT600 to HMRC",
      banking:"Wise, Revolut, Tide or high-street introductions",
      bestFor:["EU/UK-facing SaaS","Fintech","Holding companies","Fast setup"]
    },
    "estonia": {
      name:"Estonia",iso:"ee",region:"Europe",slug:"estonia",
      entity:"OÜ (private limited company)",
      corpTax:"0% on retained profits · 22% on distribution (2025)",
      vatGst:"22% VAT",
      cgt:"None at company level (taxed on distribution)",
      personalTax:"20% flat income tax",
      dividendWH:"22% distribution tax (paid by company)",
      lossCarry:"Distribution-tax model — not applicable",
      minCapital:"€0.01 (no upfront payment)",
      residentDir:"Not required",
      setupTime:"~48 hours via e-Residency",
      yearOne:"From €1,678",
      annualFilings:"Annual report to Business Registry; tax return to MTA",
      banking:"LHV or Wise introductions",
      bestFor:["EU digital-first","Remote founders","Reinvest-to-grow","e-Residency"]
    },
    "dubai": {
      name:"Dubai (UAE)",iso:"ae",region:"Middle East",slug:"dubai",
      entity:"Free Zone LLC (e.g. IFZA) or mainland LLC",
      corpTax:"9% on income over AED 375k · 0% for qualifying free-zone persons",
      vatGst:"5% VAT",
      cgt:"None",
      personalTax:"0% (no personal income tax in UAE)",
      dividendWH:"None",
      lossCarry:"Indefinite",
      minCapital:"AED 1,000 (varies by free zone)",
      residentDir:"Not required",
      setupTime:"~2 weeks",
      yearOne:"From AED 37,500 (~$15,200 USD)",
      annualFilings:"Annual licence renewal; CT return to UAE FTA",
      banking:"Emirates NBD or ADCB introductions",
      bestFor:["UAE residency & visa","0% personal tax","Web3 / crypto","MENA & Africa gateway"]
    },
    "delaware": {
      name:"Delaware, USA",iso:"us",region:"North America",slug:"delaware",
      entity:"C-Corporation (VC standard) or LLC",
      corpTax:"21% federal CIT + Delaware franchise tax",
      vatGst:"No federal VAT — sales tax by state",
      cgt:"Taxed as ordinary income (21% corp rate)",
      personalTax:"Federal 10–37% income tax",
      dividendWH:"30% on non-residents (treaty may reduce)",
      lossCarry:"Indefinite (≤80% of taxable income per year)",
      minCapital:"No minimum",
      residentDir:"Not required (registered agent needed)",
      setupTime:"~5 days",
      yearOne:"From ~$2,038 USD",
      annualFilings:"Delaware franchise tax; federal & state tax returns",
      banking:"Mercury, Brex or major bank introductions",
      bestFor:["VC-backed startups","SAFE / priced rounds","Stock-option plans","US-market focus"]
    }
  };

  /* ── Row definitions ─────────────────────────────────────────────────────── */
  var ROWS = [
    {type:"cat",label:"At a glance"},
    {key:"region",      label:"Region"},
    {key:"entity",      label:"Entity type"},
    {key:"bestFor",     label:"Best for",           type:"tags"},
    {type:"cat",label:"Tax"},
    {key:"corpTax",     label:"Corporate tax"},
    {key:"vatGst",      label:"VAT / GST"},
    {key:"cgt",         label:"Capital gains tax"},
    {key:"personalTax", label:"Personal income tax"},
    {key:"dividendWH",  label:"Dividend withholding"},
    {key:"lossCarry",   label:"Loss carry-forward"},
    {type:"cat",label:"Incorporation"},
    {key:"minCapital",  label:"Min. share capital"},
    {key:"residentDir", label:"Resident director",  type:"director"},
    {key:"setupTime",   label:"Setup time"},
    {key:"yearOne",     label:"Bundle from (Year 1)", type:"price"},
    {type:"cat",label:"Ongoing"},
    {key:"annualFilings",label:"Annual filings"},
    {key:"banking",     label:"Banking"}
  ];

  var FLAGSHIP = ["singapore","hong-kong","united-kingdom","estonia","dubai","delaware"];
  var MAX = 5;
  var activeCols = []; /* {key, name, iso, region, data, isStub} — empty by default */

  var SEARCH_IDX = [];
  var NAME_TO_SLUG = {
    "Singapore":"singapore","United Kingdom":"united-kingdom",
    "Dubai, UAE":"dubai","Delaware, USA":"delaware",
    "Estonia":"estonia","Hong Kong":"hong-kong"
  };

  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function slugify(n){ return n.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }
  function flag(iso){ return "https://flagcdn.com/w40/"+iso+".png"; }

  function buildSearchIndex(){
    var all = window.JURISDICTIONS_ALL || [];
    all.forEach(function(j){
      var name=j[0],iso=j[1],region=j[2];
      var slug=NAME_TO_SLUG[name]||null;
      var key=slug||slugify(name);
      SEARCH_IDX.push({name:name,iso:iso,region:region,slug:slug,key:key});
    });
  }
  function entryByKey(key){ for(var i=0;i<SEARCH_IDX.length;i++) if(SEARCH_IDX[i].key===key) return SEARCH_IDX[i]; return null; }
  function entryBySlug(slug){ for(var i=0;i<SEARCH_IDX.length;i++) if(SEARCH_IDX[i].slug===slug) return SEARCH_IDX[i]; return null; }

  function makeCol(entry){
    if(entry.slug && CDATA[entry.slug]){
      return {key:entry.key,name:entry.name,iso:entry.iso,region:entry.region,data:CDATA[entry.slug],isStub:false};
    }
    return {key:entry.key,name:entry.name,iso:entry.iso,region:entry.region,isStub:true,data:{
      name:entry.name,iso:entry.iso,region:entry.region,slug:null,
      entity:"—",corpTax:"—",vatGst:"—",cgt:"—",personalTax:"—",dividendWH:"—",
      lossCarry:"—",minCapital:"—",residentDir:"—",setupTime:"—",yearOne:null,
      annualFilings:"—",banking:"—",bestFor:[]
    }};
  }

  /* ── Cell rendering ──────────────────────────────────────────────────────── */
  function renderCell(row,col){
    if(col.isStub){
      if(row.type==="price") return '<a href="contact.html" class="cmp-quote">Get a quote →</a>';
      if(row.key==="region") return '<span>'+esc(col.region)+'</span>';
      return '<span class="cmp-dash">—</span>';
    }
    var val=col.data[row.key];
    if(val==null||val==="") return '<span class="cmp-dash">—</span>';
    if(row.type==="tags"){
      if(!val.length) return '<span class="cmp-dash">—</span>';
      return val.map(function(t){return '<span class="cmp-tag">'+esc(t)+'</span>';}).join(" ");
    }
    if(row.type==="director"){
      var req=val.toLowerCase().indexOf("required")!==-1&&val.toLowerCase().indexOf("not")===-1;
      return req?'<span class="cmp-badge cmp-badge--warn">Required</span>'
                :'<span class="cmp-badge cmp-badge--ok">Not required</span>';
    }
    if(row.type==="price"){
      return '<strong class="cmp-price">'+esc(val)+'</strong>';
    }
    var lc=val.toLowerCase();
    var isNone=lc==="none"||lc==="0%";
    return isNone?'<span class="cmp-none">'+esc(val)+'</span>':'<span>'+esc(val)+'</span>';
  }

  /* ── Table / empty state render ──────────────────────────────────────────── */
  function render(){
    var outer=document.getElementById("cmpOuter");
    if(!outer) return;

    if(!activeCols.length){
      outer.classList.add("cmp-outer--empty");
      outer.innerHTML=
        '<div class="cmp-empty">'+
          '<span class="cmp-empty__ic" aria-hidden="true">'+
            '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>'+
          '</span>'+
          '<h3 class="cmp-empty__title">Build your comparison</h3>'+
          '<p class="cmp-empty__sub">Search above or pick a popular jurisdiction below — add up to 5 and compare them side by side.</p>'+
          '<div class="cmp-chips__row cmp-chips__row--empty" id="cmpEmptyChips"></div>'+
        '</div>';
      renderChips(document.getElementById("cmpEmptyChips"));
      syncTools();
      return;
    }

    outer.classList.remove("cmp-outer--empty");
    var n=activeCols.length;

    var heads=activeCols.map(function(col){
      var detail=col.data.slug
        ? '<a class="cmp-col-detail" href="jurisdiction.html?j='+col.data.slug+'">View details →</a>'
        : '<span class="cmp-th__stub">Details on request</span>';
      return '<th class="cmp-th" scope="col">'+
        '<div class="cmp-th__top">'+
          '<img class="cmp-flag" src="'+flag(esc(col.iso))+'" alt="" width="26" height="18" loading="lazy">'+
          '<button class="cmp-remove" data-key="'+esc(col.key)+'" aria-label="Remove '+esc(col.name)+'">'+
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'+
          '</button>'+
        '</div>'+
        '<span class="cmp-th__name">'+esc(col.name)+'</span>'+
        '<span class="cmp-th__region">'+esc(col.region)+'</span>'+
        detail+'</th>';
    }).join("");

    var rows=ROWS.map(function(row){
      if(row.type==="cat"){
        return '<tr class="cmp-cat-row"><td class="cmp-cat-cell" colspan="'+(n+1)+'">'+esc(row.label)+'</td></tr>';
      }
      var cells=activeCols.map(function(col){
        return '<td class="cmp-td">'+renderCell(row,col)+'</td>';
      }).join("");
      return '<tr class="cmp-row"><th class="cmp-td cmp-td--label" scope="row">'+esc(row.label)+'</th>'+cells+'</tr>';
    }).join("");

    outer.innerHTML='<div class="cmp-scroll"><table class="cmp-table">'+
      '<thead><tr><td class="cmp-th cmp-th--label"><span class="cmp-th__metric">Metric</span></td>'+heads+'</tr></thead>'+
      '<tbody>'+rows+'</tbody></table></div>';

    outer.querySelectorAll(".cmp-remove").forEach(function(btn){
      btn.addEventListener("click",function(){ removeCol(this.dataset.key); });
    });
    syncTools();
  }

  function removeCol(key){ activeCols=activeCols.filter(function(c){return c.key!==key;}); render(); }
  function addByKey(key){
    var entry=entryByKey(key);
    if(!entry) return false;
    if(activeCols.some(function(c){return c.key===entry.key;})) return false;
    if(activeCols.length>=MAX) return false;
    activeCols.push(makeCol(entry));
    render();
    return true;
  }

  /* ── Toolbar: search combobox + quick-add chips + counter ────────────────── */
  function renderTools(){
    var tools=document.getElementById("cmpTools");
    if(!tools) return;
    tools.innerHTML=
      '<div class="cmp-combo" id="cmpCombo">'+
        '<svg class="cmp-combo__ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'+
        '<input class="cmp-combo__in" id="cmpSearch" type="text" role="combobox" aria-expanded="false" aria-controls="cmpList" aria-autocomplete="list" aria-label="Search jurisdictions to add" autocomplete="off" placeholder="Search 79 jurisdictions to add…">'+
        '<span class="cmp-combo__count" id="cmpCount" aria-live="polite"></span>'+
        '<ul class="cmp-combo__list" id="cmpList" role="listbox" aria-label="Matching jurisdictions" hidden></ul>'+
      '</div>'+
      '<div class="cmp-chips"><span class="cmp-chips__lab">Popular</span><span class="cmp-chips__row" id="cmpChips"></span></div>';
    wireCombo();
    renderChips(document.getElementById("cmpChips"));
    syncTools();
  }

  function renderChips(mount){
    if(!mount) return;
    var active={}; activeCols.forEach(function(c){active[c.key]=true;});
    var full=activeCols.length>=MAX;
    mount.innerHTML=FLAGSHIP.map(function(slug){
      var e=entryBySlug(slug); if(!e) return "";
      var on=!!active[e.key];
      return '<button type="button" class="cmp-chip'+(on?" is-added":"")+'" data-key="'+esc(e.key)+'"'+((on||full)&&!on?' disabled':'')+(on?' aria-pressed="true"':'')+'>'+
        '<img src="'+flag(esc(e.iso))+'" alt="" width="18" height="13" loading="lazy">'+
        '<span>'+esc(e.name)+'</span>'+
        (on
          ? '<svg class="cmp-chip__mark" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
          : '<svg class="cmp-chip__mark" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>')+
      '</button>';
    }).join("");
    mount.querySelectorAll(".cmp-chip").forEach(function(b){
      b.addEventListener("click",function(){
        if(b.classList.contains("is-added")){ removeCol(b.dataset.key); }
        else if(!b.disabled){ addByKey(b.dataset.key); }
      });
    });
  }

  function syncTools(){
    var count=document.getElementById("cmpCount");
    if(count) count.textContent=activeCols.length+" / "+MAX;
    var input=document.getElementById("cmpSearch");
    if(input){
      var full=activeCols.length>=MAX;
      input.disabled=full;
      input.placeholder=full?"Maximum 5 reached — remove one to add another":"Search 79 jurisdictions to add…";
    }
    renderChips(document.getElementById("cmpChips"));
  }

  function wireCombo(){
    var input=document.getElementById("cmpSearch");
    var list=document.getElementById("cmpList");
    if(!input||!list) return;
    var filtered=[], idx=-1, open=false;

    function build(q){
      q=(q||"").trim().toLowerCase();
      var active={}; activeCols.forEach(function(c){active[c.key]=true;});
      filtered=SEARCH_IDX.filter(function(e){
        return !q||e.name.toLowerCase().indexOf(q)!==-1||e.region.toLowerCase().indexOf(q)!==-1;
      }).slice(0,40);
      list.innerHTML=filtered.length?filtered.map(function(e,i){
        var on=!!active[e.key];
        return '<li role="option" id="cmpopt-'+i+'" class="cmp-opt'+(on?" is-added":"")+'" data-key="'+esc(e.key)+'" aria-selected="false">'+
          '<img class="cmp-opt__flag" src="'+flag(esc(e.iso))+'" alt="" width="22" height="16" loading="lazy">'+
          '<span class="cmp-opt__name">'+esc(e.name)+'</span>'+
          '<span class="cmp-opt__region">'+esc(e.region)+'</span>'+
          (e.slug?'<span class="cmp-opt__badge">Full data</span>':'')+
          (on?'<span class="cmp-opt__added">Added</span>':'')+
        '</li>';
      }).join(""):'<li class="cmp-opt cmp-opt--empty" role="presentation">No jurisdiction found</li>';
      idx=-1;
    }
    function show(){ if(input.disabled) return; open=true; list.hidden=false; input.setAttribute("aria-expanded","true"); }
    function hide(){ open=false; list.hidden=true; input.setAttribute("aria-expanded","false"); input.removeAttribute("aria-activedescendant"); idx=-1; }
    function opts(){ return list.querySelectorAll(".cmp-opt[data-key]"); }
    function setActive(i){
      var o=opts(); o.forEach(function(x){x.classList.remove("is-active");x.setAttribute("aria-selected","false");});
      idx=i;
      if(i>=0&&o[i]){ o[i].classList.add("is-active"); o[i].setAttribute("aria-selected","true"); input.setAttribute("aria-activedescendant",o[i].id); o[i].scrollIntoView({block:"nearest"}); }
    }
    function pick(key){
      var ok=addByKey(key);
      if(!ok) return;
      if(activeCols.length>=MAX){ hide(); input.blur(); return; }
      input.value=""; build(""); show(); input.focus();
    }

    input.addEventListener("focus",function(){ build(input.value); show(); });
    input.addEventListener("input",function(){ build(input.value); show(); });
    input.addEventListener("keydown",function(e){
      if(e.key==="ArrowDown"){ e.preventDefault(); if(!open){build(input.value);show();} setActive(Math.min(opts().length-1,idx+1)); }
      else if(e.key==="ArrowUp"){ e.preventDefault(); setActive(Math.max(0,idx-1)); }
      else if(e.key==="Enter"){ var o=opts()[idx>=0?idx:0]; if(o){ e.preventDefault(); pick(o.dataset.key); } }
      else if(e.key==="Escape"){ hide(); }
    });
    list.addEventListener("mousedown",function(e){ var li=e.target.closest(".cmp-opt[data-key]"); if(!li) return; e.preventDefault(); pick(li.dataset.key); });
    list.addEventListener("pointermove",function(e){ var li=e.target.closest(".cmp-opt[data-key]"); if(!li) return; var arr=Array.prototype.slice.call(opts()); setActive(arr.indexOf(li)); });
    input.addEventListener("blur",function(){ setTimeout(hide,150); });
  }

  /* ── Init ────────────────────────────────────────────────────────────────── */
  function init(){
    buildSearchIndex();
    renderTools();
    render();   // empty state by default — no preselected countries
  }

  if(document.readyState!=="loading") init();
  else document.addEventListener("DOMContentLoaded",init);
})();
