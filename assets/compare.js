/* compare.js — jurisdiction comparison table for compare.html */
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

  /* ── State ───────────────────────────────────────────────────────────────── */
  var DEFAULT_SLUGS = ["singapore","hong-kong","united-kingdom","estonia"];
  var activeCols = []; /* {key, name, iso, region, data, isStub} */

  /* ── Search index ────────────────────────────────────────────────────────── */
  var SEARCH_IDX = [];
  var NAME_TO_SLUG = {
    "Singapore":"singapore","United Kingdom":"united-kingdom",
    "Dubai, UAE":"dubai","Delaware, USA":"delaware",
    "Estonia":"estonia","Hong Kong":"hong-kong"
  };

  /* ── Helpers ─────────────────────────────────────────────────────────────── */
  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function slugify(n){ return n.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }

  function buildSearchIndex(){
    var all = window.JURISDICTIONS_ALL || [];
    all.forEach(function(j){
      var name=j[0],iso=j[1],region=j[2];
      var slug=NAME_TO_SLUG[name]||null;
      var key=slug||slugify(name);
      SEARCH_IDX.push({name:name,iso:iso,region:region,slug:slug,key:key});
    });
  }

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

  /* ── Table render ────────────────────────────────────────────────────────── */
  function render(){
    var outer=document.getElementById("cmpOuter");
    if(!outer) return;
    var n=activeCols.length;
    var canAdd=n<5, canRemove=n>1;

    var heads=activeCols.map(function(col){
      var rm=canRemove?'<button class="cmp-remove" data-key="'+esc(col.key)+'" aria-label="Remove '+esc(col.name)+'"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>':'';
      var detail=col.data.slug?'<a class="cmp-col-detail" href="jurisdiction.html?j='+col.data.slug+'">View details →</a>':'<span class="cmp-th__stub">Details on request</span>';
      return '<th class="cmp-th" scope="col">'+rm+
        '<img class="cmp-flag" src="https://flagcdn.com/w40/'+esc(col.iso)+'.png" alt="" width="24" height="16" loading="lazy">'+
        '<span class="cmp-th__name">'+esc(col.name)+'</span>'+
        detail+'</th>';
    }).join("");

    var addTh=canAdd?'<th class="cmp-th cmp-th--add" scope="col"><button class="cmp-add-btn" id="cmpAddBtn" aria-label="Add a jurisdiction to compare"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>Add</span></button></th>':'';

    var rows=ROWS.map(function(row){
      if(row.type==="cat"){
        return '<tr class="cmp-cat-row"><td class="cmp-cat-cell" colspan="'+(n+(canAdd?2:1))+'">'+esc(row.label)+'</td></tr>';
      }
      var cells=activeCols.map(function(col){
        return '<td class="cmp-td">'+renderCell(row,col)+'</td>';
      }).join("");
      var addPad=canAdd?'<td class="cmp-td cmp-td--add"></td>':'';
      return '<tr class="cmp-row"><td class="cmp-td cmp-td--label">'+esc(row.label)+'</td>'+cells+addPad+'</tr>';
    }).join("");

    outer.innerHTML='<div class="cmp-scroll"><table class="cmp-table">'+
      '<thead><tr><th class="cmp-th cmp-th--label" scope="col"></th>'+heads+addTh+'</tr></thead>'+
      '<tbody>'+rows+'</tbody></table></div>';

    bindTableEvents();
  }

  function bindTableEvents(){
    document.querySelectorAll(".cmp-remove").forEach(function(btn){
      btn.addEventListener("click",function(){ removeCol(this.dataset.key); });
    });
    var add=document.getElementById("cmpAddBtn");
    if(add) add.addEventListener("click",function(e){ e.stopPropagation(); openSearch(); });
  }

  function removeCol(key){
    activeCols=activeCols.filter(function(c){return c.key!==key;});
    render();
  }

  function addCol(entry){
    if(activeCols.some(function(c){return c.key===entry.key;})) return;
    if(activeCols.length>=5) return;
    activeCols.push(makeCol(entry));
    render();
    closeSearch();
  }

  /* ── Search overlay ──────────────────────────────────────────────────────── */
  var overlay=null;

  function openSearch(){
    if(!overlay){
      overlay=document.createElement("div");
      overlay.className="cmp-overlay";
      overlay.setAttribute("role","dialog");
      overlay.setAttribute("aria-modal","true");
      overlay.setAttribute("aria-label","Add jurisdiction");
      overlay.innerHTML='<div class="cmp-panel">'+
        '<div class="cmp-panel__head">'+
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'+
          '<input class="cmp-search-input" type="search" id="cmpSearchQ" placeholder="Search 79 jurisdictions…" autocomplete="off" aria-label="Search jurisdictions">'+
          '<button class="cmp-panel__close" id="cmpCloseBtn" aria-label="Close">'+
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'+
          '</button>'+
        '</div>'+
        '<ul class="cmp-results" id="cmpResults" role="listbox" aria-label="Matching jurisdictions"></ul>'+
        '<p class="cmp-panel__tip">Jurisdictions with <span class="cmp-result-badge" style="font-size:10px">Full data</span> have detailed comparison rows. Others show key fields.</p>'+
      '</div>';
      document.body.appendChild(overlay);

      var q=document.getElementById("cmpSearchQ");
      q.addEventListener("input",function(){ renderResults(this.value); });
      document.getElementById("cmpCloseBtn").addEventListener("click",closeSearch);
      overlay.addEventListener("click",function(e){ if(e.target===overlay) closeSearch(); });
      overlay.addEventListener("keydown",function(e){ if(e.key==="Escape") closeSearch(); });

      document.getElementById("cmpResults").addEventListener("click",function(e){
        var li=e.target.closest("li[data-key]");
        if(li) addByKey(li.dataset.key);
      });
      document.getElementById("cmpResults").addEventListener("keydown",function(e){
        var li=e.target.closest("li[data-key]");
        if(li&&(e.key==="Enter"||e.key===" ")){ e.preventDefault(); addByKey(li.dataset.key); }
      });

      renderResults("");
    } else {
      overlay.hidden=false;
    }
    overlay.hidden=false;
    var q=document.getElementById("cmpSearchQ");
    if(q){ q.value=""; renderResults(""); q.focus(); }
  }

  function closeSearch(){ if(overlay) overlay.hidden=true; }

  function addByKey(key){
    var entry=SEARCH_IDX.find(function(e){return e.key===key;});
    if(entry) addCol(entry);
  }

  function renderResults(q){
    var ul=document.getElementById("cmpResults");
    if(!ul) return;
    q=q.trim().toLowerCase();
    var active={};
    activeCols.forEach(function(c){active[c.key]=true;});
    var isFull=activeCols.length>=5;

    var matches=SEARCH_IDX.filter(function(e){
      return !q||e.name.toLowerCase().indexOf(q)!==-1||e.region.toLowerCase().indexOf(q)!==-1;
    }).slice(0,30);

    ul.innerHTML=matches.map(function(e){
      var added=active[e.key];
      var disabled=added||isFull;
      var hasFull=!!e.slug;
      return '<li role="option" class="cmp-result'+(disabled?' cmp-result--off':'')+(hasFull?' cmp-result--rich':'')+'"'+
        (!disabled?' data-key="'+esc(e.key)+'" tabindex="0"':'')+' aria-selected="'+(added?'true':'false')+'">'+
        '<img src="https://flagcdn.com/w40/'+esc(e.iso)+'.png" alt="" width="20" height="14" loading="lazy" class="cmp-result-flag">'+
        '<span class="cmp-result-name">'+esc(e.name)+'</span>'+
        '<span class="cmp-result-region">'+esc(e.region)+'</span>'+
        (hasFull?'<span class="cmp-result-badge">Full data</span>':'')+
        (added?'<span class="cmp-result-added">Added</span>':'')+
      '</li>';
    }).join("");
  }

  /* ── Init ────────────────────────────────────────────────────────────────── */
  function init(){
    buildSearchIndex();
    DEFAULT_SLUGS.forEach(function(slug){
      var e=SEARCH_IDX.find(function(x){return x.slug===slug;});
      if(e) activeCols.push(makeCol(e));
    });
    render();
  }

  if(document.readyState!=="loading") init();
  else document.addEventListener("DOMContentLoaded",init);
})();
