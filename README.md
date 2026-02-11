# Bought - SME Succession Marketplace

An Airbnb-style platform for discovering SME succession opportunities in Hamburg, Germany.

## Overview

Bought helps identify and visualize SME succession opportunities by displaying companies with aging shareholders who may be looking for successors. The platform features an intuitive interface with bilingual support (English/German), advanced filtering, interactive maps, and lead generation capabilities.

## Features

### 🌍 Internationalization
- **Bilingual Support**: Full English and German translations
- **Locale-based Routing**: `/en` and `/de` URL paths
- **WZ Code Translations**: Industry classifications in both languages
- **Translated Terminology**: "Succession Score" (EN) / "Nachfolge-Score" (DE)

### 🔍 Search & Filtering
- **Text Search**: Search by company name or city
- **Advanced Filters**:
  - Employee count range (0-1000)
  - Equity range (€0-50M)
  - Net Income range (-€1M to €10M)
  - Minimum Succession Score (1-10)
  - City selector
- **URL Persistence**: Filters are saved in URL for sharing and bookmarking
- **Back Navigation**: Clicking "Back to listings" preserves filter state

### 🗺️ Interactive Map
- **Mapbox Integration**: High-quality interactive maps
- **Color-coded Markers**: Visual succession risk indicators
  - 🔴 Red: Score 1-6 (Age <55) 
  - 🟡 Yellow: Score 7-9 (Age 55-64)
  - 🟢 Green: Score 10 (Age 65+)
- **Hover Sync**: Hovering over company cards highlights map markers
- **Click Navigation**: Click markers to view company details
- **Geocoding**: Automatic address-to-coordinates conversion

### 📊 Company Listings
- **Split View** (Desktop): Company cards on left, map on right
- **Mobile Toggle**: Switch between list and map views
- **Company Cards Display**:
  - Company name and location
  - Succession Score badge
  - Key metrics: Equity, Total Assets, Net Income, Employees
  - WZ Code (industry classification)
  - Data year indicator
- **Smart Sorting**: Companies sorted by:
  1. Data completeness score
  2. Succession Score (higher risk first)
  3. Company name (alphabetical)

### 🏢 Company Detail Pages
- **Hero Section**: Company name, location, succession score, ownership change info
- **Key Metrics Cards**: Equity, Total Assets, Net Income, Employees
- **Financial Charts** (via Recharts):
  - Historical trends (if multiple years available)
  - Balance sheet structure
  - Asset breakdown pie chart
  - Profitability metrics
- **Company Details Sidebar**:
  - Data year
  - Corporate purpose (WZ code with bilingual descriptions)
  - Last ownership change
  - Receivables, Cash Assets, Liabilities, Retained Earnings
- **Location Card**: Full address with Google Maps link
- **Shareholder Information**:
  - Ownership distribution chart
  - Detailed shareholder table with ages
  - High opportunity indicators (65+ shareholders)
- **Back Navigation**: Returns to previous page with filters intact

### 📧 Lead Generation
- **Request Information Modal**:
  - Professional email collection form
  - Email validation
  - Success message with "Stay tuned!" confirmation
  - Auto-close after 3 seconds
  - Bilingual translations
- **Dual CTA Placement**:
  - Desktop: Prominent card in company header
  - Mobile: Sticky bottom button
- **Lead Storage**: All inquiries saved to Supabase with:
  - Company ID and name
  - Visitor email (normalized)
  - Timestamp
- **Row-Level Security**: Public can submit, authenticated users can view

### 📱 Responsive Design
- **Desktop**: Full split-screen experience with all features
- **Tablet**: Optimized layout with responsive grid
- **Mobile**:
  - List/Map toggle for better UX
  - Sticky filter bar
  - Sticky CTA button
  - Touch-optimized controls
- **Airbnb-inspired Design**: Clean, modern interface

### 🚀 Performance & SEO
- **Static Export**: Pre-rendered pages for fast loading
- **GitHub Pages**: Automated deployment via GitHub Actions
- **Image Optimization**: Unoptimized for static export compatibility
- **Dynamic Routes**: 138+ static pages generated at build time

## Tech Stack

- **Next.js 15** (App Router, Static Export)
- **React 19** (Server Components, Suspense)
- **TypeScript** (Type-safe development)
- **Tailwind CSS** (Utility-first styling)
- **Supabase** (PostgreSQL database, Row-Level Security)
- **Mapbox GL JS** (Interactive maps & geocoding)
- **Recharts** (Data visualization & charts)
- **i18n** (Custom internationalization context)

## Project Structure

```
Bought/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages deployment
├── frontend/
│   ├── app/
│   │   ├── [locale]/           # Internationalized routes
│   │   │   ├── page.tsx        # Home page (split view)
│   │   │   └── company/[id]/
│   │   │       ├── page.tsx
│   │   │       └── CompanyPageClient.tsx
│   │   ├── page.tsx            # Root redirect
│   │   ├── layout.tsx          # Root layout with i18n
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Badge.tsx
│   │   │   └── MetricCard.tsx
│   │   ├── CompanyCard.tsx
│   │   ├── CompanyMap.tsx
│   │   ├── FinancialCharts.tsx
│   │   ├── SearchFilters.tsx
│   │   ├── ShareholderInfo.tsx
│   │   └── RequestInfoModal.tsx
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── utils.ts            # Utility functions
│   │   ├── wz-codes.ts         # Industry codes with translations
│   │   └── i18n-context.tsx    # Internationalization context
│   ├── messages/
│   │   ├── en.json             # English translations
│   │   └── de.json             # German translations
│   ├── next.config.ts
│   └── package.json
└── supabase/
    └── migrations/
        └── create_lead_inquiries.sql
```

## Setup

### Prerequisites

- Node.js 20+
- Supabase account
- Mapbox account (free tier)

### Environment Variables

Create `.env.local` in the frontend folder:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_BASE_PATH=/Bought  # For GitHub Pages, leave empty for custom domain
```

### Installation

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Supabase Setup

#### 1. Hamburg Targets Table

Create the main companies table:

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

-- Enable Row Level Security
ALTER TABLE "Hamburg Targets" ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access"
ON "Hamburg Targets"
FOR SELECT
TO anon
USING (true);
```

#### 2. Lead Inquiries Table

Run the migration from `supabase/migrations/create_lead_inquiries.sql`:

```sql
CREATE TABLE IF NOT EXISTS lead_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id INTEGER REFERENCES "Hamburg Targets"(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_lead_inquiries_company_id ON lead_inquiries(company_id);
CREATE INDEX idx_lead_inquiries_created_at ON lead_inquiries(created_at DESC);
CREATE INDEX idx_lead_inquiries_email ON lead_inquiries(email);

-- Enable Row Level Security
ALTER TABLE lead_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit inquiries
CREATE POLICY "Anyone can submit lead inquiries" ON lead_inquiries
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to view inquiries (for admin dashboard)
CREATE POLICY "Authenticated users can view lead inquiries" ON lead_inquiries
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

## Database Schema

### Hamburg Targets Table

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| company_name | text | Company name |
| report_year | integer | Financial data year |
| equity_eur | numeric | Shareholder equity (EUR) |
| total_assets_eur | numeric | Total assets (EUR) |
| net_income_eur | numeric | Net income (EUR) |
| retained_earnings_eur | numeric | Retained earnings (EUR) |
| liabilities_eur | numeric | Total liabilities (EUR) |
| receivables_eur | numeric | Receivables (EUR) |
| cash_assets_eur | numeric | Cash and equivalents (EUR) |
| employee_count | integer | Number of employees |
| shareholder_names | text | Comma-separated shareholder names |
| shareholder_dobs | text | Comma-separated dates of birth |
| shareholder_details | jsonb | Structured shareholder data with ownership % |
| last_ownership_change_year | integer | Year of last ownership transfer |
| address_street | text | Street address |
| address_zip | text | Postal code |
| address_city | text | City |
| address_country | text | Country |
| wz_code | text | WZ 2008 industry classification code |
| wz_description | text | Industry description (from northdata.com) |
| created_at | timestamp | Record creation timestamp |

### Lead Inquiries Table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| company_id | integer | Reference to Hamburg Targets |
| company_name | text | Company name (denormalized) |
| email | text | Inquirer's email (lowercase, trimmed) |
| created_at | timestamp | Inquiry submission time |

## Succession Score Calculation

The Succession Score (1-10) is calculated based on shareholder ages:

- **Score 10**: One or more shareholders aged 65+
- **Score 7-9**: One or more shareholders aged 55-64
- **Score 1-6**: All shareholders aged <55

The score helps identify companies with higher succession planning urgency.

## WZ Code Industry Classifications

WZ 2008 (Wirtschaftszweige) codes classify companies by industry. The platform includes:

- **Bilingual Translations**: German and English descriptions
- **Official Codes**: From Statistisches Bundesamt
- **Fallback Support**: Uses northdata.com descriptions if translation not available
- **Display Format**: Code badge + description

Example: `WZ 43.22.0` → "Plumbing, heat and air-conditioning installation" (EN) / "Klempnerei, Gas-, Wasser-, Heizungs- sowie Lüftungs- und Klimainstallation" (DE)

## Deployment

### GitHub Pages (Automated)

Push to `main` branch triggers automatic deployment:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

The GitHub Actions workflow:
1. Installs dependencies
2. Builds Next.js static export
3. Uploads to GitHub Pages
4. Deploys (available at `https://username.github.io/Bought`)

### Manual Build

```bash
cd frontend
npm run build
```

Output is generated in `frontend/out/` directory.

## Development

### Adding Translations

1. Edit `frontend/messages/en.json` for English
2. Edit `frontend/messages/de.json` for German
3. Use in components via `useTranslations()` hook

### Adding WZ Codes

Edit `frontend/lib/wz-codes.ts`:

```typescript
export const WZ_CODES: Record<string, { de: string; en: string }> = {
  '43.22.0': {
    de: 'German description',
    en: 'English description',
  },
  // Add more codes...
};
```

### Accessing Lead Inquiries

Query Supabase as authenticated user:

```sql
SELECT * FROM lead_inquiries ORDER BY created_at DESC;
```

Or build an admin dashboard with authentication.

## Future Enhancements

- [ ] Advanced search with boolean operators
- [ ] Saved searches and email alerts
- [ ] Company comparison feature
- [ ] Export to PDF/Excel
- [ ] Admin dashboard for lead management
- [ ] Email notifications for new leads
- [ ] Historical financial trend predictions
- [ ] Integration with company registries (Handelsregister)
- [ ] More WZ code translations
- [ ] French/Spanish language support

## License

Private project.

## Acknowledgments

- Design inspired by Airbnb
- Industry codes from Statistisches Bundesamt (WZ 2008)
- Company data from northdata.com
- Built with ❤️ in Hamburg
