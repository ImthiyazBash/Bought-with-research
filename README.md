# Bought - SME Succession & Research Platform

A data-driven platform for discovering SME succession opportunities in Hamburg, Germany — with automated company research powered by AI.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss)

## Overview

Bought helps investors, entrepreneurs, and acquisition firms identify succession opportunities among Hamburg's Mittelstand (mid-market companies). It combines financial data, shareholder age analysis, and automated web research to surface companies where aging shareholders may need successors.

**Key capabilities:**
- Browse 138+ Hamburg companies with financial data and succession scoring
- Interactive map with color-coded markers by succession urgency
- One-click automated research: website profiling, media scanning, shareholder background checks
- AI-powered summaries via Google Gemini
- Bilingual interface (English/German)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 15)                 │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │ Listings │  │  Map     │  │  Company Detail        │ │
│  │ + Search │  │ (Mapbox) │  │  + Research Tabs       │ │
│  └────┬─────┘  └────┬─────┘  └──────────┬─────────────┘ │
│       │              │                   │               │
│       └──────────────┼───────────────────┘               │
│                      │                                   │
└──────────────────────┼───────────────────────────────────┘
                       │  Supabase JS Client
┌──────────────────────┼───────────────────────────────────┐
│                  Supabase                                │
│  ┌───────────────────┴────────────────────────────────┐  │
│  │              PostgreSQL (RLS)                       │  │
│  │  Hamburg Targets | Research Tables | Lead Inquiries │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │          Edge Function: research-company            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │  │
│  │  │ Serper   │  │ Gemini   │  │ Web Crawler      │  │  │
│  │  │ (Search) │  │ (LLM)    │  │ (Impressum etc.) │  │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## Features

### Search & Filtering
- Text search by company name or city
- Advanced filters: employees, equity, net income, succession score, city, WZ sector
- URL-persisted filters (shareable/bookmarkable)
- Smart sorting by data completeness, then succession score

### Interactive Map
- Mapbox GL JS with geocoded markers
- Color-coded by succession urgency: green (65+), amber (55-64), red (<55)
- Hover sync between list and map; click to navigate

### Company Detail Pages
- Financial metrics cards (equity, total assets, net income, employees)
- Balance sheet & asset breakdown charts (Recharts)
- Shareholder ownership pie chart with age-based scoring
- Location card with Google Maps link
- Lead generation CTA with email capture

### Automated Company Research

Click "Start Research" on any company to trigger three research modules:

| Module | What it does |
|--------|-------------|
| **Website Profile** | Discovers company website (filtering out aggregators like NorthData), crawls homepage + Impressum + About pages via sitelinks, extracts contact info, parses Impressum for HRB/USt-ID, generates AI summary of products/services/team |
| **Media & News** | Searches news articles and web pages for the company name and each majority shareholder, deduplicates results, stores with parsed dates and source attribution |
| **Shareholder Background** | For each shareholder: finds Handelsregister entries, LinkedIn/Xing profiles, cross-references with other companies in the database, generates AI bio summary |

**Research stack:**
- **Serper.dev** — Google Search API wrapper for web + news search
- **Google Gemini 2.0 Flash** — LLM summarization (company descriptions, shareholder bios)
- **Web Crawler** — Fetches and parses HTML pages (Impressum, About, Kontakt)

### Internationalization
- Full English and German translations
- Locale-based routing (`/en`, `/de`)
- WZ industry code translations in both languages

### Responsive Design
- Desktop: split-screen (list + map)
- Mobile: list/map toggle, sticky filter bar, sticky CTA button

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Static Export) |
| UI | React 19, Tailwind CSS 3.4 |
| Language | TypeScript 5 |
| Database | Supabase (PostgreSQL + Row-Level Security) |
| Edge Functions | Supabase Edge Functions (Deno runtime) |
| Maps | Mapbox GL JS 3.1 |
| Charts | Recharts 2.12 |
| Search API | Serper.dev |
| LLM | Google Gemini 2.0 Flash |
| i18n | Custom React Context |
| Deployment | GitHub Pages via GitHub Actions |

---

## Project Structure

```
Bought-with-research/
├── .github/workflows/
│   └── deploy.yml                      # GitHub Pages CI/CD
├── frontend/
│   ├── app/
│   │   ├── [locale]/                   # Internationalized routes
│   │   │   ├── page.tsx                # Home (listings + map split view)
│   │   │   └── company/[id]/
│   │   │       ├── page.tsx            # Static generation wrapper
│   │   │       └── CompanyPageClient.tsx # Company detail + research tabs
│   │   ├── page.tsx                    # Root redirect to default locale
│   │   └── layout.tsx                  # Root layout
│   ├── components/
│   │   ├── research/
│   │   │   ├── WebsiteProfile.tsx      # Website crawl results + web presence
│   │   │   ├── MediaMentions.tsx       # News/media results with filters
│   │   │   └── ShareholderBackgrounds.tsx # Enriched shareholder data
│   │   ├── ui/
│   │   │   ├── Badge.tsx               # Score badges
│   │   │   └── MetricCard.tsx          # Financial metric cards
│   │   ├── CompanyCard.tsx             # Listing card
│   │   ├── CompanyMap.tsx              # Mapbox map
│   │   ├── CompanyResearch.tsx         # Research tabs container
│   │   ├── FinancialCharts.tsx         # Recharts visualizations
│   │   ├── SearchFilters.tsx           # Filter panel
│   │   ├── ShareholderInfo.tsx         # Ownership chart + table
│   │   └── RequestInfoModal.tsx        # Lead capture modal
│   ├── lib/
│   │   ├── supabase.ts                # Supabase client init
│   │   ├── types.ts                   # Core TypeScript interfaces
│   │   ├── research.ts               # Research API calls
│   │   ├── research-types.ts         # Research data types
│   │   ├── utils.ts                  # Score calc, formatting, sorting
│   │   ├── wz-codes.ts              # 100+ WZ industry codes (EN/DE)
│   │   └── i18n-context.tsx          # i18n provider
│   ├── messages/
│   │   ├── en.json                   # English translations
│   │   └── de.json                   # German translations
│   ├── .env.local                    # Environment variables (not committed)
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── package.json
└── supabase/
    ├── functions/
    │   └── research-company/
    │       └── index.ts              # Edge Function (search + crawl + LLM)
    ├── migrations/
    │   ├── create_lead_inquiries.sql
    │   └── create_company_research.sql
    └── config.toml
```

---

## Setup

### Prerequisites

- Node.js 20+
- npm
- Supabase account (free tier works)
- Mapbox account (free tier)
- Serper.dev account (free tier: 2,500 queries)
- Google AI Studio account (free Gemini API key)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/Bought-with-research.git
cd Bought-with-research/frontend
npm install
```

### 2. Frontend Environment

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### 3. Supabase Database

Run the SQL migrations in your Supabase SQL Editor:

**a) Main companies table:**

```sql
CREATE TABLE "Hamburg Targets" (
  id BIGSERIAL PRIMARY KEY,
  company_name TEXT,
  report_year INTEGER,
  equity_eur NUMERIC,
  total_assets_eur NUMERIC,
  net_income_eur NUMERIC,
  retained_earnings_eur NUMERIC,
  liabilities_eur NUMERIC,
  receivables_eur NUMERIC,
  cash_assets_eur NUMERIC,
  employee_count INTEGER,
  shareholder_names TEXT,
  shareholder_dobs TEXT,
  shareholder_details JSONB,
  last_ownership_change_year INTEGER,
  address_street TEXT,
  address_zip TEXT,
  address_city TEXT,
  address_country TEXT,
  wz_code TEXT,
  wz_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE "Hamburg Targets" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access"
ON "Hamburg Targets" FOR SELECT TO anon USING (true);
```

**b) Research tables:** Run `supabase/migrations/create_company_research.sql`

**c) Lead inquiries:** Run `supabase/migrations/create_lead_inquiries.sql`

### 4. Edge Function Secrets

Set these in your Supabase project (Dashboard > Edge Functions > Secrets):

```bash
# Using Supabase CLI:
supabase secrets set SERPER_API_KEY=your_serper_key
supabase secrets set GEMINI_API_KEY=your_gemini_key
```

| Secret | Source | Purpose |
|--------|--------|---------|
| `SERPER_API_KEY` | [serper.dev](https://serper.dev) | Web + news search |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/apikey) | LLM summarization |
| `SUPABASE_URL` | Auto-provided | Database connection |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-provided | Bypass RLS for writes |

### 5. Deploy Edge Function

```bash
supabase link --project-ref your-project-ref
supabase functions deploy research-company
```

### 6. Run

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database Schema

### Hamburg Targets

Core company data with financials, shareholders, and address information.

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `company_name` | text | Legal company name |
| `report_year` | integer | Financial data year |
| `equity_eur` | numeric | Shareholder equity |
| `total_assets_eur` | numeric | Balance sheet total |
| `net_income_eur` | numeric | Annual profit/loss |
| `employee_count` | integer | Headcount |
| `shareholder_names` | text | Comma-separated names |
| `shareholder_dobs` | text | Comma-separated DOBs |
| `shareholder_details` | jsonb | `[{name, dob, percentage, role}]` |
| `address_city` | text | City |
| `wz_code` | text | WZ 2008 industry code |

### Research Tables

| Table | Purpose |
|-------|---------|
| `company_website_profiles` | Website URL, description, team, products, contact info, Impressum data, search results |
| `company_media_mentions` | News articles and web mentions with source, date, sentiment, mention type |
| `company_media_searches` | Search status tracking per company |
| `shareholder_backgrounds` | Other companies, HRB entries, LinkedIn/Xing, bio summary, cross-references |
| `company_research_status` | Overall research progress per company |
| `lead_inquiries` | Email leads from the "Request Information" CTA |

---

## Succession Score

The Nachfolge-Score (1-10) quantifies succession planning urgency based on shareholder age:

| Score | Age Range | Color | Interpretation |
|-------|-----------|-------|----------------|
| 10 | 65+ | Green | Highest succession opportunity |
| 7-9 | 55-64 | Amber | Medium-high opportunity |
| 1-6 | <55 | Red | Lower urgency |

The company-level score is the **maximum** among all shareholders (oldest = highest risk).

---

## Research Pipeline

When "Start Research" is triggered, the Edge Function runs three modules sequentially:

```
1. Website Profile
   ├── Serper search: "{company_name} {city}"
   ├── Select best non-aggregator domain (skip NorthData, LinkedIn, etc.)
   ├── Use Google sitelinks to find Impressum / About / Kontakt pages
   ├── Crawl & extract: contact info, HRB number, USt-ID, social links
   └── Gemini LLM: generate description, products/services, team members

2. Media & News
   ├── Serper news search: company name
   ├── Serper web search: company name
   ├── Serper news + web search: each majority shareholder
   ├── Deduplicate by URL
   └── Parse Serper dates (dd.MM.yyyy / relative) to ISO format

3. Shareholder Backgrounds
   ├── Per shareholder:
   │   ├── Handelsregister / business role search
   │   ├── LinkedIn profile search
   │   ├── Xing profile search
   │   ├── Cross-reference within database
   │   └── Gemini LLM: bio summary
   └── Corporate shareholders: search parent company info
```

All results are saved to Supabase with `upsert` (idempotent — re-running updates, not duplicates).

---

## Deployment

### GitHub Pages (Automated)

Push to `main` triggers the CI/CD pipeline:

```bash
git push origin main
```

The workflow (`.github/workflows/deploy.yml`):
1. Installs dependencies
2. Builds Next.js static export
3. Deploys to GitHub Pages

**Required GitHub Secrets:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_MAPBOX_TOKEN`

### Manual Build

```bash
cd frontend
npm run build    # Output in frontend/out/
```

---

## Development

### Adding Translations

Edit `frontend/messages/en.json` and `frontend/messages/de.json`, then use in components:

```typescript
const t = useTranslations();
<h1>{t('company.detail.title')}</h1>
```

### Adding WZ Industry Codes

Edit `frontend/lib/wz-codes.ts`:

```typescript
'43.22.0': {
  de: 'Klempnerei, Gas-, Wasser-, Heizungs- und Klimainstallation',
  en: 'Plumbing, heat and air-conditioning installation',
},
```

### Modifying the Research Function

```bash
# Edit the function
vim supabase/functions/research-company/index.ts

# Deploy
supabase functions deploy research-company

# Test
curl -X POST https://your-project.supabase.co/functions/v1/research-company \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"company_id": 8, "modules": ["website", "media", "shareholders"]}'
```

---

## License

Private project.

## Acknowledgments

- Design inspired by Airbnb
- Industry codes from Statistisches Bundesamt (WZ 2008)
- Company data sourced from NorthData
- Search powered by Serper.dev
- AI summaries by Google Gemini
- Built in Hamburg
