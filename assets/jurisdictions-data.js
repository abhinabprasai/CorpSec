/* jurisdictions-data.js — rich per-jurisdiction content for the flagship set
   (Singapore, UK, Dubai, Delaware, Estonia, Hong Kong). Generated from
   verified facts (IRAS/HMRC/ACRA/PwC etc.); single source of truth for the
   Jurisdictions hub directory + compare + per-jurisdiction detail pages.
   Keyed by slug via window.JX_DATA (array) and window.JX_BY_SLUG (map). */
(function () {
  "use strict";
  window.JX_DATA = [
    {
      "slug": "singapore",
      "name": "Singapore",
      "iso": "sg",
      "region": "Asia",
      "currency": "SGD",
      "flagColors": [
        "#ED2939",
        "#FFFFFF"
      ],
      "metaTitle": "Singapore Company Incorporation | CorpSec",
      "metaDescription": "Incorporate a Singapore Pte Ltd with a resident director, tax filing, and bank introductions. 17% headline tax, ~8.25% effective on first S$200k. Setup in ~10 days.",
      "hero": {
        "h1": "Singapore company incorporation for founders building across Asia",
        "sub": "Set up a Singapore Pte Ltd in about 10 days, with a resident director, corporate secretary, tax filing, and DBS or OCBC bank introductions handled by our licensed local partner."
      },
      "memo": [
        {
          "label": "Entity type",
          "value": "Private Limited (Pte Ltd); LLP and Branch also available"
        },
        {
          "label": "Corporate tax",
          "value": "17% headline; ~8.25% effective on first S$200k via partial exemption"
        },
        {
          "label": "GST",
          "value": "9% (since Jan 2024); registration optional below threshold"
        },
        {
          "label": "Capital gains tax",
          "value": "None"
        },
        {
          "label": "Minimum capital",
          "value": "S$1"
        },
        {
          "label": "Resident director",
          "value": "Required (nominee available)"
        },
        {
          "label": "Setup time",
          "value": "About 10 days"
        }
      ],
      "bestForTags": [
        "APAC HQ",
        "ASEAN & India go-to-market",
        "Wealth & family offices",
        "IP & trading",
        "Treaty network"
      ],
      "fits": [
        {
          "title": "You want an APAC headquarters investors recognize",
          "body": "Singapore is a default base for regional operations. Its legal system, English-language filings, and deep investor familiarity make it easy to raise, hire, and sign customers across the region."
        },
        {
          "title": "You sell into ASEAN and India",
          "body": "A Pte Ltd gives you a credible local entity for contracts, hiring, and banking as you expand across Southeast Asia and India, backed by one of the world's widest tax treaty networks."
        },
        {
          "title": "You run wealth or a family office",
          "body": "Stable rule of law, no capital gains tax, and structures like the VCC and 13O/13U fund incentives make Singapore a serious home for holding, investment, and family-office vehicles."
        }
      ],
      "alternatives": [
        {
          "slug": "estonia",
          "name": "Estonia",
          "reason": "Lower cost and no resident-director requirement if you want a lean, fully online EU base."
        },
        {
          "slug": "hong-kong",
          "name": "Hong Kong",
          "reason": "Foreign-income treatment can suit founders whose revenue is earned outside the jurisdiction."
        },
        {
          "slug": "united-kingdom",
          "name": "United Kingdom",
          "reason": "Cheaper to run and EU-facing if your customers and team sit closer to Europe."
        }
      ],
      "fiscal": [
        {
          "label": "Corporate income tax (headline)",
          "value": "17%"
        },
        {
          "label": "Effective rate on first S$200k",
          "value": "~8.25% via partial exemption (75% on first S$10k, 50% on next S$290k)"
        },
        {
          "label": "Startup exemption (first 3 YAs)",
          "value": "75% on first S$100k, 50% on next S$100k"
        },
        {
          "label": "GST",
          "value": "9% (since January 2024)"
        },
        {
          "label": "Capital gains tax",
          "value": "None"
        },
        {
          "label": "Withholding on dividends (no treaty)",
          "value": "0%"
        },
        {
          "label": "Withholding on interest (no treaty)",
          "value": "15%"
        },
        {
          "label": "Withholding on royalties (no treaty)",
          "value": "10%"
        },
        {
          "label": "Loss carry-forward",
          "value": "Indefinite, subject to conditions"
        }
      ],
      "legal": [
        {
          "label": "Entity type",
          "value": "Private Limited (Pte Ltd); LLP and Branch also available"
        },
        {
          "label": "Minimum paid-up capital",
          "value": "S$1"
        },
        {
          "label": "Resident director",
          "value": "Required; nominee director available"
        },
        {
          "label": "Corporate secretary",
          "value": "Required within 6 months of incorporation"
        },
        {
          "label": "Registry",
          "value": "ACRA via BizFile+"
        },
        {
          "label": "Annual filings",
          "value": "Annual Return and AGM; corporate tax filing to IRAS"
        },
        {
          "label": "Banking",
          "value": "DBS or OCBC introductions; account opening is rigorous"
        }
      ],
      "bundle": {
        "priceLabel": "From S$5,234 (~$4,130 USD, excl. 9% GST)",
        "recurringLabel": "From S$3,634/yr from Year 2",
        "includes": [
          "Company formation (S$1,600 one-time)",
          "Resident director, corporate secretary, and tax filing (S$2,970/yr)",
          "Bookkeeping from S$37/mo (revenue up to S$200k)",
          "ACRA registration and standard constitution",
          "Ongoing compliance support via licensed local partner"
        ]
      },
      "addons": [
        {
          "group": "Banking & immigration",
          "items": [
            {
              "name": "DBS or OCBC bank introduction",
              "price": "from S$600"
            },
            {
              "name": "Employment Pass (founder)",
              "price": "from S$1,200"
            }
          ]
        },
        {
          "group": "Tax & compliance",
          "items": [
            {
              "name": "GST registration",
              "price": "S$300"
            },
            {
              "name": "Annual Return + AGM",
              "price": "S$220/yr"
            },
            {
              "name": "Change of director or shareholder",
              "price": "S$180"
            },
            {
              "name": "Trademark (IPOS, 1 class)",
              "price": "S$700"
            }
          ]
        },
        {
          "group": "Funding & fund structures",
          "items": [
            {
              "name": "Share issuance (new round)",
              "price": "from S$650"
            },
            {
              "name": "VCC setup",
              "price": "from S$8,500"
            },
            {
              "name": "13O/13U fund tax incentive",
              "price": "from S$25,000"
            }
          ]
        }
      ],
      "timeline": [
        {
          "phase": "Onboarding & KYC",
          "when": "Days 1-3",
          "items": [
            "Collect director and shareholder details",
            "Run KYC and due diligence checks",
            "Reserve company name with ACRA"
          ]
        },
        {
          "phase": "Incorporation",
          "when": "Days 3-7",
          "items": [
            "Prepare constitution and incorporation documents",
            "Appoint resident director and corporate secretary",
            "File with ACRA via BizFile+"
          ]
        },
        {
          "phase": "Post-incorporation & banking",
          "when": "Days 7-10+",
          "items": [
            "Issue share certificates and statutory registers",
            "Make DBS or OCBC introduction",
            "Set up bookkeeping and tax calendar"
          ]
        }
      ],
      "faqs": [
        {
          "q": "Do I need a resident director to incorporate in Singapore?",
          "a": "Yes. Every Singapore company must have at least one director who is ordinarily resident in Singapore. If no founder qualifies, we provide a nominee director so you can incorporate while keeping full control of the business."
        },
        {
          "q": "How much tax will my Singapore company actually pay?",
          "a": "The headline corporate rate is 17%, but partial exemption brings the effective rate to about 8.25% on the first S$200k of chargeable income. New companies may also qualify for a startup exemption in their first three years of assessment, subject to conditions. These are general figures from IRAS, not advice on your specific position."
        },
        {
          "q": "Can you guarantee a Singapore bank account?",
          "a": "No one can. We make introductions to DBS or OCBC and help you prepare a strong application, but account opening is rigorous and the decision rests with the bank. We are upfront about this so you can plan around it."
        },
        {
          "q": "How long does setup take?",
          "a": "About 10 days end to end, assuming KYC is clean and documents come back promptly. Incorporation with ACRA itself is fast; banking and Employment Pass steps can run in parallel and may take longer."
        },
        {
          "q": "Is Singapore a good base for raising from investors?",
          "a": "Yes. The Pte Ltd is well understood by VCs and growth investors across Asia, and equity, SAFE, and convertible structures map cleanly onto it. That investor familiarity is one of the main reasons founders choose Singapore over less common jurisdictions."
        },
        {
          "q": "Do I have to register for GST?",
          "a": "Not immediately. GST is 9% and registration is mandatory only once you cross the turnover threshold, though you can register voluntarily earlier. We can handle registration as an add-on when it makes sense for your business."
        }
      ],
      "sources": [
        {
          "label": "IRAS - corporate tax, GST, and withholding tax",
          "url": "https://www.iras.gov.sg"
        },
        {
          "label": "ACRA & BizFile+ - company registration",
          "url": "https://www.acra.gov.sg"
        },
        {
          "label": "PwC Singapore - Worldwide Tax Summaries",
          "url": "https://taxsummaries.pwc.com/singapore"
        }
      ]
    },
    {
      "slug": "united-kingdom",
      "name": "United Kingdom",
      "iso": "gb",
      "region": "Europe",
      "currency": "GBP",
      "flagColors": [
        "#012169",
        "#C8102E",
        "#FFFFFF"
      ],
      "metaTitle": "UK Company Incorporation | CorpSec",
      "metaDescription": "Form a UK private limited company in about 48 hours. £1 minimum capital, no resident-director rule, real banking introductions. Year 1 from £936.",
      "hero": {
        "h1": "UK company incorporation, done in about 48 hours",
        "sub": "Set up a UK private limited company (Ltd) with £1 minimum capital and no resident-director requirement. A credible, low-cost European entity that investors and banks already understand."
      },
      "memo": [
        {
          "label": "Entity type",
          "value": "Private limited company (Ltd)"
        },
        {
          "label": "Corporation tax",
          "value": "25% main rate; 19% small-profits rate (subject to conditions)"
        },
        {
          "label": "VAT",
          "value": "20% standard; register from £90k turnover"
        },
        {
          "label": "Minimum capital",
          "value": "£1"
        },
        {
          "label": "Resident director",
          "value": "Not required"
        },
        {
          "label": "Setup time",
          "value": "~48 hours via Companies House"
        },
        {
          "label": "Year-1 cost",
          "value": "From £936 (CorpSec)"
        }
      ],
      "bestForTags": [
        "EU/UK-facing SaaS",
        "Fintech",
        "Holding companies",
        "Low-cost European entity",
        "Fast incorporation"
      ],
      "fits": [
        {
          "title": "You're building EU/UK-facing SaaS or fintech",
          "body": "A UK Ltd is a structure your customers, partners, and processors already trust. It pairs well with UK and EU banking rails and a deep talent pool, so you can sell and hire without explaining your entity first."
        },
        {
          "title": "You want a credible European entity, fast and cheap",
          "body": "With £1 minimum capital, no resident-director rule, and incorporation in about 48 hours, you get a recognised European company without a big upfront commitment or local presence."
        },
        {
          "title": "You need a clean holding company",
          "body": "The UK is a well-understood jurisdiction for holding structures, with an extensive treaty network and corporate norms that investors and acquirers read without friction."
        }
      ],
      "alternatives": [
        {
          "slug": "ireland",
          "name": "Ireland",
          "reason": "12.5% trading rate plus EU passporting if you need an in-the-bloc base for regulated or EU-sales activity."
        },
        {
          "slug": "estonia",
          "name": "Estonia",
          "reason": "Fully digital incorporation and e-Residency for remote founders who never want to set foot in an office."
        },
        {
          "slug": "singapore",
          "name": "Singapore",
          "reason": "Better fit if your customers, team, or fundraising centre on APAC rather than Europe."
        }
      ],
      "fiscal": [
        {
          "label": "Corporation tax (main rate)",
          "value": "25% on profits over £250k"
        },
        {
          "label": "Corporation tax (small-profits rate)",
          "value": "19% on profits under £50k"
        },
        {
          "label": "Marginal relief",
          "value": "Tapered rate between £50k and £250k"
        },
        {
          "label": "VAT",
          "value": "20% standard rate"
        },
        {
          "label": "VAT registration threshold",
          "value": "£90k taxable turnover"
        },
        {
          "label": "Tax authority",
          "value": "HM Revenue & Customs (HMRC)"
        }
      ],
      "legal": [
        {
          "label": "Entity",
          "value": "Private limited company (Ltd)"
        },
        {
          "label": "Registry",
          "value": "Companies House"
        },
        {
          "label": "Minimum capital",
          "value": "£1"
        },
        {
          "label": "Shareholders",
          "value": "One or more (individuals or corporate)"
        },
        {
          "label": "Directors",
          "value": "At least one; no residency requirement"
        },
        {
          "label": "Registered office",
          "value": "Required (UK address)"
        },
        {
          "label": "Annual filings",
          "value": "Confirmation statement and annual accounts to Companies House; corporation tax return to HMRC"
        }
      ],
      "bundle": {
        "priceLabel": "From £936",
        "recurringLabel": "Year 1, all-in",
        "includes": [
          "UK Ltd incorporation via Companies House",
          "Registered office address",
          "Standard articles and share issuance",
          "Companies House filing fees",
          "Bank account introductions (Wise, Revolut, Tide, or high-street)",
          "First-year confirmation statement support"
        ]
      },
      "addons": [
        {
          "group": "Compliance & filings",
          "items": [
            {
              "name": "Annual accounts preparation and filing",
              "price": "Quote on profile"
            },
            {
              "name": "Corporation tax return (CT600) to HMRC",
              "price": "Quote on profile"
            },
            {
              "name": "Confirmation statement (annual)",
              "price": "Quote on profile"
            },
            {
              "name": "VAT registration",
              "price": "Quote on profile"
            }
          ]
        },
        {
          "group": "Tax & payroll",
          "items": [
            {
              "name": "PAYE payroll setup and running",
              "price": "Quote on profile"
            },
            {
              "name": "Bookkeeping",
              "price": "Quote on profile"
            },
            {
              "name": "R&D tax relief support",
              "price": "Quote on profile"
            }
          ]
        },
        {
          "group": "Banking & substance",
          "items": [
            {
              "name": "Additional bank account introductions",
              "price": "Quote on profile"
            },
            {
              "name": "Registered office and mail forwarding",
              "price": "Quote on profile"
            },
            {
              "name": "Nominee and director support",
              "price": "Quote on profile"
            }
          ]
        }
      ],
      "timeline": [
        {
          "phase": "Onboarding & KYC",
          "when": "Day 1",
          "items": [
            "Choose company name and confirm availability",
            "Collect director and shareholder ID for verification",
            "Set share structure and registered office"
          ]
        },
        {
          "phase": "Incorporation",
          "when": "~48 hours",
          "items": [
            "File with Companies House",
            "Receive certificate of incorporation",
            "Set up statutory registers and articles"
          ]
        },
        {
          "phase": "Banking & tax setup",
          "when": "Days 3-10",
          "items": [
            "Bank account introductions (Wise, Revolut, Tide, or high-street)",
            "Register for corporation tax with HMRC",
            "VAT and PAYE registration if needed"
          ]
        }
      ],
      "faqs": [
        {
          "q": "Do I need to live in the UK or have a resident director?",
          "a": "No. The UK has no resident-director requirement, so you can incorporate and own a UK Ltd from anywhere. You'll need a UK registered office address, which CorpSec provides."
        },
        {
          "q": "How fast can the company be set up?",
          "a": "Incorporation at Companies House typically takes about 48 hours once we have your name choice and verified ID. Banking and tax registrations follow over the next several days."
        },
        {
          "q": "What corporation tax will my company actually pay?",
          "a": "The headline rates are 25% on profits over £250k and a small-profits rate of 19% under £50k, with marginal relief tapering between the two. Your effective rate depends on profit and conditions; we'd point you to HMRC and a tax adviser for specifics."
        },
        {
          "q": "Can I really open a bank account as a non-resident?",
          "a": "We make introductions to providers like Wise, Revolut, Tide, and high-street banks. These are introductions, not guaranteed accounts, but a UK Ltd is well understood by these providers, which helps."
        },
        {
          "q": "Will investors be comfortable with a UK company?",
          "a": "Yes. The UK Ltd is a familiar structure for VCs and angels, with established precedent for equity rounds, options, and SAFE-style instruments, so you spend less time explaining the entity in diligence."
        },
        {
          "q": "When do I have to register for VAT?",
          "a": "VAT registration becomes mandatory once taxable turnover passes £90k in a rolling 12-month period. The standard VAT rate is 20%. You can also register voluntarily earlier if it suits your business."
        }
      ],
      "sources": [
        {
          "label": "Companies House",
          "url": "https://www.gov.uk/government/organisations/companies-house"
        },
        {
          "label": "HM Revenue & Customs (HMRC)",
          "url": "https://www.gov.uk/government/organisations/hm-revenue-customs"
        },
        {
          "label": "PwC Worldwide Tax Summaries - United Kingdom",
          "url": "https://taxsummaries.pwc.com/united-kingdom"
        }
      ]
    },
    {
      "slug": "dubai",
      "name": "Dubai (UAE)",
      "iso": "ae",
      "region": "Middle East",
      "currency": "AED",
      "flagColors": [
        "#00843D",
        "#FF0000",
        "#000000",
        "#FFFFFF"
      ],
      "metaTitle": "Dubai Company Incorporation | UAE Setup",
      "metaDescription": "Set up a Dubai company with 0% personal tax and a founder visa. UAE free zone or mainland LLC in ~2 weeks, with banking introductions and bookkeeping.",
      "hero": {
        "h1": "Dubai company incorporation for founders who want UAE residency and 0% personal tax",
        "sub": "Form a UAE free zone or mainland LLC in about two weeks. We pair you with a licensed local partner for your licence, founder visa, banking introductions, and ongoing compliance."
      },
      "memo": [
        {
          "label": "Entity type",
          "value": "Free Zone LLC (e.g. IFZA) or mainland LLC"
        },
        {
          "label": "Corporate tax",
          "value": "9% on taxable income over AED 375,000; 0% for Qualifying Free Zone Persons on qualifying income"
        },
        {
          "label": "Personal income tax",
          "value": "0%"
        },
        {
          "label": "VAT",
          "value": "5%"
        },
        {
          "label": "CT registration",
          "value": "Within 3 months of incorporation (UAE FTA, 2024) — AED 10,000 penalty if late"
        },
        {
          "label": "Resident director",
          "value": "Not required"
        },
        {
          "label": "Local presence",
          "value": "Local office or flexi-desk required (free zone)"
        },
        {
          "label": "Setup time",
          "value": "About 2 weeks"
        }
      ],
      "bestForTags": [
        "UAE residency",
        "0% personal tax",
        "Web3 / crypto",
        "MENA & Africa gateway",
        "Tax-residency founders"
      ],
      "fits": [
        {
          "title": "You want UAE residency and 0% personal tax",
          "body": "A free zone company comes with a founder visa, Emirates ID, and tax residency. The UAE charges 0% personal income tax, so salary and dividends you draw are not taxed at the personal level."
        },
        {
          "title": "You run a Web3 or crypto business",
          "body": "Dubai has a dedicated virtual assets regulator (VARA) and clear licensing paths for crypto and Web3 activity. That regulatory clarity makes it easier to bank, hire, and operate than in less-defined markets."
        },
        {
          "title": "You are expanding into MENA and Africa",
          "body": "Dubai sits at the crossroads of the Middle East, Africa, and South Asia, with world-class logistics and time-zone overlap across both regions. It works well as a regional headquarters or trading hub."
        }
      ],
      "alternatives": [
        {
          "slug": "singapore",
          "name": "Singapore",
          "reason": "Stronger banking access and a wide treaty network for cross-border structures."
        },
        {
          "slug": "estonia",
          "name": "Estonia",
          "reason": "Fully online setup with no physical office or in-person banking visit required."
        },
        {
          "slug": "hong-kong",
          "name": "Hong Kong",
          "reason": "Foreign-sourced income can fall outside the local tax net, subject to conditions."
        }
      ],
      "fiscal": [
        {
          "label": "Corporate tax (headline rate)",
          "value": "9% on taxable income above AED 375,000"
        },
        {
          "label": "Small-profit band",
          "value": "0% on taxable income up to AED 375,000"
        },
        {
          "label": "Qualifying Free Zone Person",
          "value": "0% on qualifying income, subject to conditions"
        },
        {
          "label": "Personal income tax",
          "value": "0%"
        },
        {
          "label": "VAT",
          "value": "5% standard rate"
        },
        {
          "label": "Tax authority",
          "value": "UAE Federal Tax Authority (FTA)"
        }
      ],
      "legal": [
        {
          "label": "Entity options",
          "value": "Free Zone LLC (e.g. IFZA) or mainland LLC"
        },
        {
          "label": "Foreign ownership",
          "value": "100% foreign ownership permitted"
        },
        {
          "label": "Resident director",
          "value": "Not required"
        },
        {
          "label": "Local presence",
          "value": "Local office or flexi-desk required (free zone)"
        },
        {
          "label": "Founder visa",
          "value": "Available via the free zone licence"
        },
        {
          "label": "Crypto / Web3",
          "value": "Regulated by VARA (Virtual Assets Regulatory Authority)"
        },
        {
          "label": "Compliance",
          "value": "FTA registration, bookkeeping, and corporate tax filing"
        }
      ],
      "bundle": {
        "priceLabel": "From AED 37,500 (~$15,194 USD) year 1",
        "recurringLabel": "AED 29,000 / year recurring",
        "includes": [
          "IFZA free-zone licence",
          "Founder visa",
          "Medical and Emirates ID onboarding",
          "Monthly bookkeeping",
          "FTA registration",
          "Banking introductions"
        ]
      },
      "addons": [
        {
          "group": "Visas & residency",
          "items": [
            {
              "name": "Additional dependent or employee visa",
              "price": "Quoted per visa"
            },
            {
              "name": "Family / spouse sponsorship",
              "price": "Quoted on request"
            }
          ]
        },
        {
          "group": "Banking & finance",
          "items": [
            {
              "name": "Additional bank introduction",
              "price": "Quoted on request"
            },
            {
              "name": "VAT registration and filing",
              "price": "Quoted on request"
            },
            {
              "name": "Corporate tax filing",
              "price": "Quoted on request"
            }
          ]
        },
        {
          "group": "Office & compliance",
          "items": [
            {
              "name": "Upgraded physical office",
              "price": "Quoted on request"
            },
            {
              "name": "Annual audit support",
              "price": "Quoted on request"
            }
          ]
        }
      ],
      "timeline": [
        {
          "phase": "Licence & company formation",
          "when": "Week 1",
          "items": [
            "Choose free zone or mainland structure",
            "Reserve name and confirm activities",
            "Submit documents and issue the trade licence"
          ]
        },
        {
          "phase": "Visa & residency",
          "when": "Weeks 1-2",
          "items": [
            "Entry permit and founder visa",
            "Medical test and Emirates ID biometrics",
            "Emirates ID issuance"
          ]
        },
        {
          "phase": "Banking & onboarding",
          "when": "Week 2 onward",
          "items": [
            "Bank account introductions",
            "In-person verification with the bank",
            "FTA registration and bookkeeping setup"
          ]
        }
      ],
      "faqs": [
        {
          "q": "Do I really pay 0% personal tax in Dubai?",
          "a": "Yes. The UAE charges 0% personal income tax, so salary and dividends you draw are not taxed at the personal level. Note that a 9% corporate tax applies to company profits above AED 375,000, and 0% applies below that. Always confirm your position against your home-country rules."
        },
        {
          "q": "Does my company qualify for the 0% free zone rate?",
          "a": "A Qualifying Free Zone Person can pay 0% corporate tax on qualifying income, subject to conditions set by the Federal Tax Authority. Whether you qualify depends on your activities and substance. We help you assess this rather than assume it."
        },
        {
          "q": "How long does it take to set up?",
          "a": "Company formation typically takes about two weeks. Your founder visa, medical, and Emirates ID run alongside it. Bank account opening is separate and can take several more weeks depending on your profile."
        },
        {
          "q": "Do I need to live in or visit the UAE?",
          "a": "You do not need a resident director, but a free zone company requires a local office or flexi-desk, and banks require in-person verification. You will need to visit for visa medicals, Emirates ID biometrics, and account opening."
        },
        {
          "q": "Can you guarantee a bank account?",
          "a": "No one can. We make introductions to banks that fit your business, but the decision is the bank's and depends on your profile, activity, and documentation. We prepare you to give the application the best chance."
        },
        {
          "q": "Is Dubai a good base for a crypto or Web3 business?",
          "a": "Dubai has a dedicated virtual assets regulator, VARA, with clear licensing paths for crypto and Web3 activity. That regulatory clarity, plus 0% personal tax, is a major reason founders in the space choose the UAE."
        }
      ],
      "sources": [
        {
          "label": "UAE Federal Tax Authority",
          "url": "https://tax.gov.ae"
        },
        {
          "label": "IFZA (International Free Zone Authority)",
          "url": "https://www.ifza.com"
        },
        {
          "label": "PwC Middle East Tax Summaries",
          "url": "https://taxsummaries.pwc.com/united-arab-emirates"
        }
      ]
    },
    {
      "slug": "delaware",
      "name": "Delaware",
      "iso": "us",
      "region": "North America",
      "currency": "USD",
      "flagColors": [
        "#00558C",
        "#B9975B"
      ],
      "metaTitle": "Delaware company incorporation for founders",
      "metaDescription": "Incorporate a Delaware C-Corp or LLC with CorpSec. The default for US VC-backed startups: SAFE/priced-round precedent, fast setup, founder-friendly banking.",
      "hero": {
        "h1": "Delaware company incorporation for VC-backed founders",
        "sub": "Set up the entity US investors already know. A Delaware C-Corp gives you SAFE and priced-round precedent, stock-option plans, and access to founder-friendly banking. CorpSec handles formation, registered agent, and EIN through licensed local partners."
      },
      "memo": [
        {
          "label": "Entity types",
          "value": "C-Corporation (VC standard) or LLC (small business / holding)"
        },
        {
          "label": "Corporate tax",
          "value": "21% federal corporate income tax, plus applicable state taxes"
        },
        {
          "label": "State annual cost",
          "value": "Delaware franchise tax (scales with shares or assets)"
        },
        {
          "label": "Setup time",
          "value": "~5 days, often faster"
        },
        {
          "label": "Banking",
          "value": "Mercury, Brex — founder-friendly, often remote"
        },
        {
          "label": "Year-1 from",
          "value": "~$2,038 (CorpSec)"
        },
        {
          "label": "Best known for",
          "value": "80%+ of US VC-backed startups incorporate here"
        }
      ],
      "bestForTags": [
        "VC-backed SaaS",
        "US-market operations",
        "Stock-option plans",
        "SAFE / priced rounds",
        "C-Corp fundraising"
      ],
      "fits": [
        {
          "title": "You're raising from US VCs",
          "body": "US investors expect a Delaware C-Corp. The SAFE, the priced round, and the standard term sheet all assume Delaware corporate law, so you skip the conversion friction later."
        },
        {
          "title": "You're building for the US market",
          "body": "If your customers, hires, or go-to-market are US-first, a Delaware entity gives you a clean home base for contracts, payroll, and banking with Mercury or Brex."
        },
        {
          "title": "You need to grant equity",
          "body": "Stock-option plans and clean cap tables are routine in Delaware. Issuing founder stock, an option pool, and later employee grants follows well-worn precedent your lawyers and investors already know."
        }
      ],
      "alternatives": [
        {
          "slug": "singapore",
          "name": "Singapore",
          "reason": "Better fit if your team and customers are APAC-first and you want a regional HQ with strong treaties."
        },
        {
          "slug": "united-kingdom",
          "name": "United Kingdom",
          "reason": "A cleaner European base if you're selling into the UK and EU and want London credibility."
        },
        {
          "slug": "estonia",
          "name": "Estonia",
          "reason": "Choose this for a fully digital, EU-resident company run remotely with low admin overhead."
        }
      ],
      "fiscal": [
        {
          "label": "Federal corporate income tax",
          "value": "21% headline rate on corporate profits"
        },
        {
          "label": "State corporate income tax",
          "value": "No Delaware state corporate income tax on out-of-state activity; nexus rules apply as you scale"
        },
        {
          "label": "Delaware franchise tax",
          "value": "Annual; amount scales with authorized shares or assets, subject to method chosen"
        },
        {
          "label": "Federal employer ID",
          "value": "EIN required for banking, payroll, and tax filing"
        },
        {
          "label": "Pass-through option (LLC)",
          "value": "An LLC can be taxed as a pass-through; a C-Corp is taxed at the entity level"
        },
        {
          "label": "Tax treatment note",
          "value": "Figures are headline rates and subject to conditions; confirm with a US tax adviser for your facts"
        }
      ],
      "legal": [
        {
          "label": "Standard fundraising entity",
          "value": "Delaware C-Corporation"
        },
        {
          "label": "Holding / small business entity",
          "value": "Delaware LLC"
        },
        {
          "label": "Governing law",
          "value": "Delaware General Corporation Law (DGCL)"
        },
        {
          "label": "Registered agent",
          "value": "Required in Delaware; included in CorpSec setup"
        },
        {
          "label": "Annual obligations",
          "value": "Franchise tax filing and annual report (corporations)"
        },
        {
          "label": "Cap table & equity",
          "value": "Founder stock, option pools, and SAFEs follow standard Delaware precedent"
        }
      ],
      "bundle": {
        "priceLabel": "From ~$2,038 year 1",
        "recurringLabel": "Annual: registered agent + franchise tax + filings",
        "includes": [
          "Delaware C-Corp or LLC formation",
          "Registered agent (year 1)",
          "EIN (federal tax ID) application",
          "Founder-friendly banking introductions (Mercury, Brex)",
          "Franchise tax and annual report guidance",
          "Standard cap table and equity setup support"
        ]
      },
      "addons": [
        {
          "group": "Banking & finance",
          "items": [
            {
              "name": "Banking introduction (Mercury / Brex)",
              "price": "Included in setup"
            },
            {
              "name": "Bookkeeping & accounting setup",
              "price": "Quoted on scope"
            },
            {
              "name": "US tax filing support",
              "price": "Quoted on scope"
            }
          ]
        },
        {
          "group": "Equity & governance",
          "items": [
            {
              "name": "Cap table & SAFE document support",
              "price": "Quoted on scope"
            },
            {
              "name": "Stock-option plan setup",
              "price": "Quoted on scope"
            },
            {
              "name": "83(b) election filing guidance",
              "price": "Quoted on scope"
            }
          ]
        },
        {
          "group": "Ongoing compliance",
          "items": [
            {
              "name": "Registered agent renewal",
              "price": "Annual"
            },
            {
              "name": "Franchise tax & annual report filing",
              "price": "Annual"
            },
            {
              "name": "Foreign qualification (other US states)",
              "price": "Per state"
            }
          ]
        }
      ],
      "timeline": [
        {
          "phase": "Setup & details",
          "when": "Day 1",
          "items": [
            "Confirm C-Corp vs LLC",
            "Collect founder and shareholder details",
            "Choose company name and share structure"
          ]
        },
        {
          "phase": "Formation",
          "when": "Days 1-5",
          "items": [
            "File certificate of incorporation in Delaware",
            "Appoint registered agent",
            "Issue founder stock and adopt bylaws"
          ]
        },
        {
          "phase": "EIN & banking",
          "when": "After formation",
          "items": [
            "Apply for federal EIN",
            "Open account with Mercury or Brex via introduction",
            "Set up initial cap table"
          ]
        },
        {
          "phase": "Ongoing",
          "when": "Annual",
          "items": [
            "File Delaware franchise tax and annual report",
            "Renew registered agent",
            "Monitor nexus as you scale into other states"
          ]
        }
      ],
      "faqs": [
        {
          "q": "Why do US investors prefer a Delaware C-Corp?",
          "a": "More than 80% of US VC-backed startups incorporate in Delaware. Investors know the corporate law, the SAFE and priced-round documents assume it, and standard term sheets are written for it. Choosing Delaware removes friction from your raise."
        },
        {
          "q": "Should I form a C-Corp or an LLC?",
          "a": "If you plan to raise from VCs or grant stock options, choose a C-Corp — it's the fundraising standard. If you're bootstrapping, running a small business, or setting up a holding vehicle, an LLC is usually simpler and more flexible."
        },
        {
          "q": "Do I have to live in the US to incorporate in Delaware?",
          "a": "No. Non-US founders can form a Delaware company. You'll need a registered agent (included in CorpSec setup) and an EIN. Banking is handled through introductions to founder-friendly providers like Mercury and Brex, which often onboard remotely."
        },
        {
          "q": "What will I actually pay each year?",
          "a": "Year 1 starts from around $2,038 with CorpSec. Formation itself can be low, but registered agent, the Delaware franchise tax, and getting an EIN add up. The franchise tax scales with your authorized shares or assets, so the structure you choose matters."
        },
        {
          "q": "Is there really no tax in Delaware?",
          "a": "No — that's a common misconception. You still pay the 21% federal corporate income tax. Delaware has no state corporate income tax on out-of-state activity, but as you grow and create nexus in other states, those state taxes can apply. Confirm specifics with a US tax adviser."
        },
        {
          "q": "Can you help me open a US bank account?",
          "a": "We make introductions to founder-friendly providers such as Mercury and Brex, which often onboard founders remotely. These are introductions, not guaranteed accounts — final approval rests with the bank and depends on your documentation and profile."
        }
      ],
      "sources": [
        {
          "label": "Delaware Division of Corporations",
          "url": "https://corp.delaware.gov/"
        },
        {
          "label": "IRS (Internal Revenue Service)",
          "url": "https://www.irs.gov/"
        },
        {
          "label": "PwC Worldwide Tax Summaries — United States",
          "url": "https://taxsummaries.pwc.com/united-states"
        }
      ]
    },
    {
      "slug": "estonia",
      "name": "Estonia",
      "iso": "ee",
      "region": "Europe",
      "currency": "EUR",
      "flagColors": [
        "#0072CE",
        "#000000",
        "#FFFFFF"
      ],
      "metaTitle": "Estonia Company Formation | OÜ Setup via e-Residency",
      "metaDescription": "Set up an Estonian OÜ company fully online in ~48 hours via e-Residency. 0% tax on reinvested profits, €0.01 min capital. From €1,678/year with CorpSec.",
      "hero": {
        "h1": "Estonia company formation for digital-first founders",
        "sub": "Register an Estonian OÜ fully online in about 48 hours via e-Residency. Pay 0% corporate tax on profits you reinvest, with tax due only when you distribute. Built for remote and bootstrapped teams that run lean from anywhere."
      },
      "memo": [
        {
          "label": "Entity type",
          "value": "OÜ (private limited company)"
        },
        {
          "label": "Corporate tax",
          "value": "0% on retained/reinvested profits; 22% on distribution (2025)"
        },
        {
          "label": "VAT",
          "value": "22% standard rate"
        },
        {
          "label": "Min share capital",
          "value": "From €0.01, no upfront payment required"
        },
        {
          "label": "Local director",
          "value": "Not required; local contact person needed if all management is abroad"
        },
        {
          "label": "Setup time",
          "value": "~48 hours, fully online via e-Residency"
        },
        {
          "label": "Year-1 cost",
          "value": "From €1,678 (CorpSec)"
        }
      ],
      "bestForTags": [
        "EU digital-first",
        "Remote founders",
        "Bootstrapped",
        "Reinvest profits",
        "e-Residency"
      ],
      "fits": [
        {
          "title": "You reinvest instead of paying out",
          "body": "Estonia taxes profits only when you distribute them. If you plow earnings back into growth, your OÜ pays 0% corporate tax until you take money out, so compounding stays untaxed."
        },
        {
          "title": "You run fully remote",
          "body": "e-Residency lets you incorporate, sign documents, and manage the company online from anywhere. No need to live in Estonia or travel there to keep the company running."
        },
        {
          "title": "You want a real EU company on a lean budget",
          "body": "Share capital starts at €0.01 with no upfront payment, and year-1 costs start from €1,678. You get a credible EU entity without heavy setup capital or local-office overhead."
        }
      ],
      "alternatives": [
        {
          "slug": "ireland",
          "name": "Ireland",
          "reason": "Choose Ireland if you want a 12.5% trading rate and easier access to a traditional euro bank account."
        },
        {
          "slug": "united-kingdom",
          "name": "United Kingdom",
          "reason": "Pick the UK for a globally credible, low-cost entity that investors and banks recognize instantly."
        },
        {
          "slug": "singapore",
          "name": "Singapore",
          "reason": "Go with Singapore for an APAC base with strong banking and a wide treaty network."
        }
      ],
      "fiscal": [
        {
          "label": "Corporate tax on retained profits",
          "value": "0% (tax deferred until distribution)"
        },
        {
          "label": "Corporate tax on distributed profits",
          "value": "22% headline rate (2025), subject to conditions"
        },
        {
          "label": "VAT",
          "value": "22% standard rate; registration required above the turnover threshold"
        },
        {
          "label": "Withholding on dividends",
          "value": "Generally none at company level beyond distribution tax; check treaty position"
        },
        {
          "label": "Treaty network",
          "value": "Broad network of double-tax treaties; confirm relief for your home country"
        },
        {
          "label": "Tax authority",
          "value": "Estonian Tax & Customs Board (EMTA)"
        }
      ],
      "legal": [
        {
          "label": "Entity",
          "value": "OÜ (osaühing), private limited company"
        },
        {
          "label": "Shareholders",
          "value": "One or more; individuals or companies, any nationality"
        },
        {
          "label": "Directors",
          "value": "At least one; no residency requirement"
        },
        {
          "label": "Local contact person",
          "value": "Required if all board members are outside Estonia"
        },
        {
          "label": "Registered address",
          "value": "Estonian address required (provided as an add-on)"
        },
        {
          "label": "Registry",
          "value": "Estonian Business Register (RIK)"
        },
        {
          "label": "Accounting",
          "value": "Annual report filing required; ongoing bookkeeping mandatory"
        }
      ],
      "bundle": {
        "priceLabel": "From €1,678",
        "recurringLabel": "year 1, all-in",
        "includes": [
          "OÜ incorporation via e-Residency (~48 hours)",
          "Local contact person for the first year",
          "Registered Estonian business address",
          "Business Register (RIK) filing",
          "Banking / EMI introductions (LHV, Wise, EMIs)",
          "First-year bookkeeping and annual report support"
        ]
      },
      "addons": [
        {
          "group": "Compliance & registered presence",
          "items": [
            {
              "name": "Local contact person (annual renewal)",
              "price": "Quoted per year"
            },
            {
              "name": "Registered business address (annual renewal)",
              "price": "Quoted per year"
            },
            {
              "name": "VAT registration with EMTA",
              "price": "Quoted"
            }
          ]
        },
        {
          "group": "Accounting & tax",
          "items": [
            {
              "name": "Monthly bookkeeping",
              "price": "From monthly fee"
            },
            {
              "name": "Annual report preparation & filing",
              "price": "Quoted"
            },
            {
              "name": "Payroll setup and filing",
              "price": "Quoted"
            }
          ]
        },
        {
          "group": "Banking & onboarding",
          "items": [
            {
              "name": "Bank / EMI account introductions",
              "price": "Included or quoted"
            },
            {
              "name": "e-Residency application support",
              "price": "Quoted"
            }
          ]
        }
      ],
      "timeline": [
        {
          "phase": "e-Residency",
          "when": "Before setup",
          "items": [
            "Apply for an e-Residency digital ID",
            "Collect the card at a pickup location",
            "Activate your digital signature"
          ]
        },
        {
          "phase": "Incorporation",
          "when": "~48 hours",
          "items": [
            "File the OÜ in the Business Register (RIK)",
            "Appoint directors and local contact person",
            "Confirm registered address and share capital"
          ]
        },
        {
          "phase": "Banking & tax setup",
          "when": "Days 1-2 after registration",
          "items": [
            "Introductions to LHV, Wise, or EMIs",
            "Open the operating account",
            "Register for VAT with EMTA if needed"
          ]
        },
        {
          "phase": "Ongoing",
          "when": "Year-round",
          "items": [
            "Monthly bookkeeping",
            "Annual report filing",
            "Track the deferral: 0% until you distribute"
          ]
        }
      ],
      "faqs": [
        {
          "q": "Do I really pay 0% corporate tax in Estonia?",
          "a": "You pay 0% corporate tax on profits you retain or reinvest. Tax applies only when you distribute profits, at a 22% headline distribution rate (2025). So the rate is a deferral, not a permanent exemption, and your home-country tax may still apply to dividends you receive."
        },
        {
          "q": "Can I get a real bank account, or only an EMI?",
          "a": "Be clear on the difference. A traditional bank account (for example LHV) can be hard to open for fully remote owners with no local ties. Many e-Residency founders use EMIs like Wise instead. CorpSec makes introductions to banks and EMIs, but accounts are never guaranteed."
        },
        {
          "q": "Do I need to live in or visit Estonia?",
          "a": "No. With e-Residency you can incorporate and run the company entirely online. If all your board members are based abroad, you'll need a local contact person in Estonia, which CorpSec provides."
        },
        {
          "q": "How fast can I incorporate?",
          "a": "Once you have an active e-Residency ID, the OÜ itself can be registered in about 48 hours through the Business Register. Allow extra lead time for the e-Residency application and card pickup beforehand."
        },
        {
          "q": "Is €0.01 share capital enough?",
          "a": "Legally, yes. Minimum share capital starts at €0.01 and no upfront payment is required to register. Many founders set a modest figure, but consider what looks credible to banks, partners, and future investors."
        },
        {
          "q": "Will investors accept an Estonian OÜ?",
          "a": "Estonia is a recognized EU jurisdiction, and the OÜ is a standard private limited company. For some VC rounds investors may still prefer a US or UK holding structure, so confirm expectations early if you plan to raise."
        }
      ],
      "sources": [
        {
          "label": "e-Residency",
          "url": "https://www.e-resident.gov.ee/"
        },
        {
          "label": "Estonian Business Register (RIK)",
          "url": "https://www.rik.ee/en"
        },
        {
          "label": "Estonian Tax & Customs Board (EMTA)",
          "url": "https://www.emta.ee/en"
        },
        {
          "label": "PwC Tax Summaries - Estonia",
          "url": "https://taxsummaries.pwc.com/estonia"
        }
      ]
    },
    {
      "slug": "hong-kong",
      "name": "Hong Kong",
      "iso": "hk",
      "region": "Asia",
      "currency": "HKD",
      "flagColors": [
        "#DE2910",
        "#FFFFFF"
      ],
      "metaTitle": "Hong Kong Company Incorporation | CorpSec",
      "metaDescription": "Set up a Hong Kong company in about a week. Two-tier profits tax from 8.25%, territorial system, no capital gains, no VAT. Common-law base for Asia trade.",
      "hero": {
        "h1": "Hong Kong company incorporation, done right",
        "sub": "Form a Hong Kong private limited company in about a week. A common-law, low-tax base for trading into China, Greater Bay, and the rest of Asia — with no residency requirement for directors or shareholders."
      },
      "memo": [
        {
          "label": "Entity type",
          "value": "Private company limited by shares"
        },
        {
          "label": "Profits tax",
          "value": "8.25% on first HK$2M, 16.5% above (two-tier)"
        },
        {
          "label": "Tax system",
          "value": "Territorial — foreign-sourced income may be exempt"
        },
        {
          "label": "Minimum capital",
          "value": "HK$1 (1 share)"
        },
        {
          "label": "Residency requirement",
          "value": "None for directors or shareholders"
        },
        {
          "label": "Setup time",
          "value": "About 1 week"
        },
        {
          "label": "VAT / capital gains",
          "value": "No VAT/GST, no capital gains tax"
        }
      ],
      "bestForTags": [
        "Asia trading gateway",
        "China & Greater Bay",
        "Foreign-income treatment",
        "Low-tax common-law base",
        "Holding companies"
      ],
      "fits": [
        {
          "title": "You trade into China and Greater Bay",
          "body": "Hong Kong is the practical gateway to mainland China and the Greater Bay Area. A local entity gives you a credible counterparty for suppliers, customers, and partners across Asia."
        },
        {
          "title": "You have foreign-sourced income",
          "body": "Under Hong Kong's territorial system, income earned outside Hong Kong may be exempt from profits tax, subject to conditions and the FSIE rules. That suits trading and holding structures with offshore revenue."
        },
        {
          "title": "You want a low-tax common-law base",
          "body": "An English-language, common-law jurisdiction with profits tax from 8.25%, no capital gains tax, and no VAT. Familiar to investors and banks, with no residency requirement to set up."
        }
      ],
      "alternatives": [
        {
          "slug": "singapore",
          "name": "Singapore",
          "reason": "Stronger treaty network and global reputation for fundraising and regional holding."
        },
        {
          "slug": "dubai",
          "name": "Dubai",
          "reason": "0% free-zone tax and a residency visa for founders relocating to the UAE."
        },
        {
          "slug": "estonia",
          "name": "Estonia",
          "reason": "Fully online EU base with tax deferred until profits are distributed."
        }
      ],
      "fiscal": [
        {
          "label": "Profits tax (first HK$2M)",
          "value": "8.25% headline rate, two-tier system"
        },
        {
          "label": "Profits tax (above HK$2M)",
          "value": "16.5% headline rate"
        },
        {
          "label": "Tax basis",
          "value": "Territorial — only Hong Kong-sourced profits are taxed"
        },
        {
          "label": "Foreign-sourced income",
          "value": "May be exempt, subject to conditions and FSIE rules"
        },
        {
          "label": "Capital gains tax",
          "value": "None"
        },
        {
          "label": "VAT / GST",
          "value": "None"
        },
        {
          "label": "Withholding tax",
          "value": "No withholding on dividends"
        }
      ],
      "legal": [
        {
          "label": "Entity type",
          "value": "Private company limited by shares"
        },
        {
          "label": "Minimum capital",
          "value": "HK$1 (one share)"
        },
        {
          "label": "Directors",
          "value": "At least one; no residency requirement"
        },
        {
          "label": "Shareholders",
          "value": "At least one; no residency requirement"
        },
        {
          "label": "Company secretary",
          "value": "Required; must be Hong Kong resident or local firm"
        },
        {
          "label": "Registered office",
          "value": "Local Hong Kong address required"
        },
        {
          "label": "Annual filings",
          "value": "Annual return and audited accounts to the Companies Registry and IRD"
        },
        {
          "label": "Legal system",
          "value": "Common law, English-language"
        }
      ],
      "bundle": {
        "priceLabel": "From US$1,950 all-in",
        "recurringLabel": "Renewal from US$1,650/year",
        "includes": [
          "Company name check and incorporation with the Companies Registry",
          "Standard articles of association",
          "Company secretary for year one",
          "Registered office address for year one",
          "Business Registration Certificate",
          "Digital company kit (incorporation docs, share certificates)",
          "Bank or EMI account introductions"
        ]
      },
      "addons": [
        {
          "group": "Compliance & filings",
          "items": [
            {
              "name": "Annual return filing",
              "price": "From US$350/year"
            },
            {
              "name": "Audit & accounting (statutory)",
              "price": "From US$1,200/year"
            },
            {
              "name": "Profits tax return preparation",
              "price": "From US$450/year"
            },
            {
              "name": "FSIE / foreign-income assessment",
              "price": "From US$900"
            }
          ]
        },
        {
          "group": "Banking & operations",
          "items": [
            {
              "name": "Traditional bank introduction (HSBC, Hang Seng)",
              "price": "From US$600"
            },
            {
              "name": "EMI account setup (Airwallex and similar)",
              "price": "From US$300"
            },
            {
              "name": "Nominee company secretary",
              "price": "From US$500/year"
            }
          ]
        },
        {
          "group": "Governance & people",
          "items": [
            {
              "name": "Additional registered office year",
              "price": "From US$400/year"
            },
            {
              "name": "Share transfer / restructuring",
              "price": "From US$650"
            },
            {
              "name": "Employment & work visa support",
              "price": "On request"
            }
          ]
        }
      ],
      "timeline": [
        {
          "phase": "Preparation & KYC",
          "when": "Days 1-2",
          "items": [
            "Confirm company name availability",
            "Collect director and shareholder ID and address proof",
            "Agree share structure and registered details"
          ]
        },
        {
          "phase": "Incorporation",
          "when": "Days 3-6",
          "items": [
            "File incorporation with the Companies Registry",
            "Issue Certificate of Incorporation",
            "Obtain Business Registration Certificate",
            "Appoint company secretary and registered office"
          ]
        },
        {
          "phase": "Banking & go-live",
          "when": "Week 2 onward",
          "items": [
            "Prepare bank or EMI application pack",
            "Introductions to HSBC, Hang Seng, or EMIs",
            "Set up accounting and first-year compliance calendar"
          ]
        }
      ],
      "faqs": [
        {
          "q": "How long does it take to incorporate in Hong Kong?",
          "a": "About one week in most cases, once we have your name choice and KYC documents. Company secretary and registered office are set up as part of incorporation."
        },
        {
          "q": "Do I need to live in Hong Kong or visit to set up?",
          "a": "No. There is no residency requirement for directors or shareholders, and incorporation can be handled remotely. You will need a local company secretary and registered office, which we provide."
        },
        {
          "q": "Is my foreign income really tax-free in Hong Kong?",
          "a": "Hong Kong taxes on a territorial basis, so income sourced outside Hong Kong may be exempt from profits tax. This is subject to conditions and the FSIE rules, so we assess each case rather than promise an outcome."
        },
        {
          "q": "What profits tax will my company pay?",
          "a": "The two-tier headline rate is 8.25% on the first HK$2M of profits and 16.5% above that, on Hong Kong-sourced profits. There is no capital gains tax and no VAT or GST."
        },
        {
          "q": "Can you guarantee a bank account?",
          "a": "No one can. Banks like HSBC and Hang Seng have become more rigorous, so we make introductions and prepare a strong application. We also offer EMI options such as Airwallex for faster operational accounts."
        },
        {
          "q": "Does a Hong Kong company need audited accounts?",
          "a": "Yes. Hong Kong companies must file an annual return with the Companies Registry and submit audited accounts with the profits tax return to the IRD. We handle the full compliance calendar."
        }
      ],
      "sources": [
        {
          "label": "Hong Kong Companies Registry",
          "url": "https://www.cr.gov.hk/"
        },
        {
          "label": "Inland Revenue Department (IRD)",
          "url": "https://www.ird.gov.hk/"
        },
        {
          "label": "PwC Hong Kong Tax Summaries",
          "url": "https://taxsummaries.pwc.com/hong-kong-sar"
        }
      ]
    }
  ];
  window.JX_BY_SLUG = {};
  window.JX_DATA.forEach(function (j) { window.JX_BY_SLUG[j.slug] = j; });
})();
