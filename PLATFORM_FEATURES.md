# Bought - SME Succession Marketplace Platform Features

## Overview
Bought is a web-based platform for discovering succession opportunities in Hamburg SMEs (Small and Medium Enterprises). The platform helps identify companies with potential succession needs based on shareholder demographics, financial health, and business characteristics.

---

## Core Features

### 1. Multi-Language Support
**Languages:** English (default) & German

- **Language Switcher**: Toggle between EN/DE in the top-right navigation
- **Comprehensive Translation**: All UI elements, labels, and content translated
- **Locale-Based Routing**: URLs structured as `/en/` or `/de/` for SEO and shareability
- **Custom i18n Implementation**: Built with React Context for static export compatibility

### 2. Nachfolge-Score System (Succession Opportunity Scoring)
**Scale:** 1-10 (higher = greater succession opportunity)

**Scoring Logic:**
- **Score 10**: Shareholder age 65+ (highest succession opportunity)
- **Score 7-9**: Shareholder age 55-64 (medium-high opportunity)
- **Score 1-6**: Shareholder age <55 (lower opportunity)

**Calculation Method:**
- Based on the oldest shareholder's age
- Linear scaling within age ranges
- Displayed on both company cards and detail pages with color-coded badges:
  - Red (Score 10): High succession opportunity
  - Amber (Score 7-9): Medium succession opportunity
  - Green (Score 1-6): Lower succession opportunity

### 3. Advanced Search & Filtering

**Search Capabilities:**
- Company name search (case-insensitive)
- City-based search
- Real-time filtering with instant results

**Filter Options:**
1. **Employee Count Range**
   - Minimum: 0 employees
   - Maximum: 1,000 employees
   - Slider-based selection

2. **Equity Range**
   - Minimum: €0
   - Maximum: €50,000,000
   - Financial health indicator

3. **Net Income Range**
   - Minimum: -€1,000,000 (losses)
   - Maximum: €10,000,000 (profits)
   - Profitability assessment

4. **Minimum Nachfolge-Score**
   - Range: 1-10
   - Filter companies by succession opportunity level

5. **City Filter**
   - Hamburg
   - Buxtehude
   - "All Cities" option
   - Integrated with map zoom functionality

**Results Display:**
- Shows filtered count vs. total count
- "Clear all filters" quick reset option

### 4. Intelligent Data Completeness Sorting

**Primary Sort:** Data completeness score (highest first)

**Completeness Scoring Criteria:**
- **Core Business Data** (highest weight):
  - Company name (2 points)
  - Employee count >0 (3 points)
  - Equity ≠0 (3 points)
  - Net income ≠0 (3 points)
  - Total assets >0 (2 points)

- **Financial Details** (medium weight):
  - Retained earnings (1 point)
  - Liabilities (1 point)
  - Receivables (1 point)
  - Cash assets (1 point)

- **Location Data** (medium weight):
  - Street address (2 points)
  - ZIP code (1 point)
  - City (2 points)
  - Country (1 point)

- **Industry Classification** (medium weight):
  - WZ code (2 points)
  - WZ description (1 point)

- **Shareholder Data** (high weight):
  - Shareholder details array (3 points)
  - Shareholder names (2 points)
  - Dates of birth (2 points)
  - Last ownership change year (2 points)

- **Data Recency** (medium weight):
  - Report year ≥2020 (2 points)
  - Report year ≥2015 (1 point)

**Secondary Sort:** Nachfolge-Score (higher scores first)

**Tertiary Sort:** Alphabetical by company name

**User Benefit:** Companies with complete, actionable data appear first, reducing time spent on incomplete profiles.

### 5. Interactive Map Visualization

**Technology:** Mapbox GL JS

**Features:**
- **Real-Time Geocoding**: Converts company addresses to map coordinates
- **Clustered Markers**: Color-coded by Nachfolge-Score
  - Red circles: Score 10 (age 65+)
  - Amber circles: Score 7-9 (age 55-64)
  - Green circles: Score 1-6 (age <55)
- **Hover Interactions**:
  - Hover over marker → highlights corresponding company card
  - Hover over company card → highlights map marker
  - Synchronized highlighting between map and list
- **Click Navigation**: Click marker to view company detail page
- **Score Legend**: Visual guide showing color meanings
- **City Zoom**: Automatically zooms to selected city bounds when filtered
- **Responsive Display**: Hidden on mobile, visible on desktop (lg+ breakpoint)

**Map Coverage:**
- Default view: Hamburg metropolitan area
- Zoom levels: City-specific bounds for Hamburg and Buxtehude
- Fallback: Default Hamburg center if no city selected

### 6. Company Cards (List View)

**Display Format:** 2-column responsive grid

**Card Components:**

1. **Header Section** (Gradient background)
   - Company name (large, bold)
   - Short address (city display)

2. **Badge Row**
   - Nachfolge-Score badge (color-coded)
   - "Years since ownership change" badge (if >10 years)

3. **Industry Classification**
   - WZ code badge (e.g., "WZ 47.11.1")
   - Industry description (2-line truncated text)
   - Separated by border for clarity

4. **Financial Metrics Grid** (2x2)
   - Equity (€)
   - Net Income (€, color-coded: green=profit, red=loss)
   - Total Assets (€)
   - Employee count

5. **Footer**
   - Data year: "Data from {year}"
   - "View Details →" link with hover underline

**Interaction:**
- Hover effect: Border color change, shadow, slight scale increase
- Synchronized with map markers
- Click anywhere to navigate to detail page

### 7. Company Detail Pages

**URL Structure:** `/{locale}/company/{id}`

**Page Sections:**

1. **Hero Section** (Dark gradient background)
   - Company name (large heading)
   - Full address with location icon
   - Nachfolge-Score badge
   - Years since ownership change badge
   - "Back to listings" link

2. **Key Metrics** (4 elevated cards)
   - Equity (with report year subtext)
   - Total Assets
   - Net Income (with trend indicator: ↑ positive, ↓ negative)
   - Employee count

3. **Financial Charts** (Left column, 2/3 width)
   - Multi-year financial trends (if historical data available)
   - Visualizations for equity, assets, income over time
   - Built with Recharts library
   - Fallback message if insufficient historical data

4. **Company Details Card** (Right column, 1/3 width)
   - **Data Year**: Report year for financial data
   - **Corporate Purpose**:
     - WZ code badge (on separate line)
     - Full industry description (readable paragraph)
   - **Last Ownership Change**: Year and "X years ago" calculation
   - **Financial Details**:
     - Receivables
     - Cash Assets
     - Liabilities
     - Retained Earnings

5. **Location Card**
   - Full street address
   - ZIP code and city
   - Country
   - "View on Google Maps" link (opens in new tab)

6. **Contact CTA Card** (Gradient background)
   - "Interested in this opportunity?" heading
   - Description text
   - "Request Information" button
   - Positioned for high visibility

7. **Shareholder Information Section**
   - **High Opportunity Alert**: Banner if shareholders age 65+
   - **Ownership Distribution Chart**: Pie chart showing percentage ownership
   - **Shareholder Details Table**:
     - Name
     - Ownership percentage
     - Date of birth
     - Age (calculated)
     - Nachfolge-Score (individual, color-coded badge)
   - **Missing Data Handling**: "No shareholder information available" message

### 8. Shareholder Analysis

**Data Processing:**
- Parses shareholder_names and shareholder_dobs fields
- Calculates current age from date of birth
- Computes individual Nachfolge-Scores
- Identifies multiple shareholders with ownership percentages
- Handles missing or incomplete data gracefully

**Visualization:**
- Ownership distribution pie chart (Recharts)
- Table view with sortable columns
- Age-based color coding in badges
- Clear indication of high succession opportunities

### 9. Navigation & User Experience

**Navigation Bar:**
- Fixed position at top
- Logo/brand name with home link
- Language switcher (EN/DE toggle)
- Sign In button (styled, currently non-functional)
- Responsive on all screen sizes

**Routing:**
- Locale-aware URLs for all pages
- Breadcrumb-style "Back to listings" on detail pages
- Automatic locale preservation when navigating
- Clean URLs with trailing slashes

**Loading States:**
- Spinner with "Loading companies..." text on main page
- "Loading company details..." on individual pages
- Centered, branded loading indicators

**Error Handling:**
- Connection error messages with retry button
- 404 "Company Not Found" page with home link
- "No companies found" state with filter reset option
- Graceful handling of missing data fields (displays "N/A")

### 10. Performance & Optimization

**Static Site Generation:**
- Pre-rendered pages at build time
- 202+ static pages generated (2 locales × 101 companies)
- Instant page loads with static HTML
- No server-side rendering overhead

**Data Fetching:**
- Direct Supabase client-side queries
- Cached company data in component state
- Efficient filtering with useMemo hooks
- Real-time search without API calls

**Map Performance:**
- Custom marker implementation for better control
- Efficient event listeners with cleanup
- Throttled hover events
- Conditional rendering (desktop only)

**Code Splitting:**
- Next.js automatic code splitting
- Lazy loading of map components
- Optimized bundle sizes

### 11. Responsive Design

**Breakpoints:**
- Mobile: Single column layout
- Tablet (md): 2-column company cards
- Desktop (lg): Split view with map + cards

**Mobile Optimizations:**
- Map hidden on mobile devices
- Touch-friendly button sizes
- Simplified navigation
- Readable font sizes
- Proper spacing and padding

**Desktop Features:**
- Side-by-side map and list view
- Hover interactions
- Larger data displays
- Multi-column layouts

### 12. Data Integration

**Database Schema:**
- **Table**: "Hamburg Targets"
- **Key Fields**:
  - `id`, `created_at`, `company_name`
  - `report_year`, `equity_eur`, `total_assets_eur`, `net_income_eur`
  - `retained_earnings_eur`, `liabilities_eur`, `receivables_eur`, `cash_assets_eur`
  - `employee_count`
  - `shareholder_names`, `shareholder_dobs`, `shareholder_details`
  - `last_ownership_change_year`
  - `address_street`, `address_zip`, `address_city`, `address_country`
  - `wz_code`, `wz_description`

**Data Quality:**
- Handles null values gracefully
- Formats currencies with proper locale (€ symbol, comma separators)
- Calculates derived metrics (age, years since change, scores)
- Validates and parses complex fields (shareholder arrays)

### 13. Industry Classification

**WZ Code System** (Wirtschaftszweig / Economic Sector):
- German standard industry classification
- Displayed as badge (e.g., "WZ 47.11.1")
- Full text description provided
- Helps users quickly identify business sectors
- Searchable and filterable

**Display Locations:**
- Company cards (truncated to 2 lines)
- Company detail pages (full description)
- Part of data completeness scoring

### 14. Deployment & Hosting

**Platform:** GitHub Pages

**Build Configuration:**
- Next.js static export (`output: 'export'`)
- Base path: `/Bought` for GitHub Pages subdirectory
- Environment variables for Supabase and Mapbox credentials
- Automatic deployment via GitHub Actions

**CI/CD Pipeline:**
1. Push to main branch triggers workflow
2. Checkout code and setup Node.js
3. Install dependencies with `npm ci`
4. Build with production environment variables
5. Add `.nojekyll` file for proper routing
6. Upload build artifact
7. Deploy to GitHub Pages

**Accessibility:**
- Public URL: `https://imthiyazbasha13.github.io/Bought/`
- HTTPS enabled by default
- Fast CDN delivery via GitHub

---

## Technical Stack

### Frontend
- **Framework**: Next.js 15.5.11 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks (useState, useEffect, useMemo)
- **Routing**: Next.js file-based routing with locale support

### Libraries
- **Mapping**: Mapbox GL JS
- **Charts**: Recharts
- **Internationalization**: Custom React Context implementation
- **Database**: Supabase (PostgreSQL)

### Development Tools
- **Package Manager**: npm
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Code Quality**: TypeScript strict mode, ESLint

---

## Platform Value Proposition

### What Bought Does
Bought is a specialized B2B marketplace that connects potential buyers with succession-ready SMEs in Hamburg, Germany. The platform solves a critical business challenge: identifying companies where aging shareholders may be looking to exit, creating acquisition opportunities for investors, entrepreneurs, and strategic buyers.

### Core Value Delivered

**For Buyers/Investors:**
1. **Time Savings**: Eliminates months of manual research by aggregating and scoring 100+ Hamburg SMEs in one place
2. **Data-Driven Insights**: Nachfolge-Score algorithm instantly identifies high-probability succession opportunities based on shareholder age demographics
3. **Financial Transparency**: Complete financial profiles with equity, assets, income, and cash flow metrics for quick due diligence
4. **Quality Filtering**: Data completeness scoring surfaces well-documented companies first, reducing wasted effort on incomplete profiles
5. **Geographic Intelligence**: Interactive maps and city filters help identify location-specific opportunities
6. **Sector Discovery**: WZ code classification enables industry-focused search strategies

**For the SME Succession Market:**
1. **Market Transparency**: Makes succession opportunities visible and accessible
2. **Efficient Matching**: Connects sellers (aging shareholders) with qualified buyers
3. **Demographic Trends**: Highlights the scale of succession challenges in Hamburg's Mittelstand
4. **Professional Presentation**: Showcases companies with comprehensive data packages

### Key Differentiators

**1. Succession-Specific Intelligence**
- Unlike general business directories, Bought focuses exclusively on succession readiness
- Shareholder age analysis provides unique insight not available elsewhere
- Scoring algorithm prioritizes companies with imminent succession needs (65+ shareholders)

**2. Data Quality Over Quantity**
- Completeness scoring ensures users see actionable profiles first
- Multi-factor data validation (23 database fields)
- Recent financial data prioritized (2020+ years weighted higher)

**3. User-Centric Design**
- No login required for browsing (low friction)
- Instant filtering with real-time results
- Bilingual support for local and international buyers
- Mobile-responsive for on-the-go research

**4. Geographic Focus**
- Deep coverage of Hamburg market (Germany's second-largest city)
- Neighborhood-level insights via interactive maps
- City-specific filtering with automatic zoom

### Business Impact

**Reduced Transaction Costs:**
- Hours saved in company discovery (vs. manual research)
- Pre-screened leads reduce broker fees
- Comprehensive data reduces due diligence time

**Improved Match Quality:**
- Shareholder age data indicates seller motivation
- Financial metrics filter unprofitable targets early
- Industry classification enables strategic fit assessment

**Market Efficiency:**
- Brings liquidity to illiquid SME market
- Reduces information asymmetry
- Accelerates succession planning decisions

---

## Detailed User Journeys

### Journey 1: First-Time Visitor Discovery

**Persona:** International investor exploring Hamburg acquisition opportunities

**Steps:**

1. **Landing (0:00)**
   - User arrives at homepage via Google search or referral
   - Sees loading spinner with "Loading companies..." message
   - Within 2 seconds, sees grid of company cards with map

2. **Initial Orientation (0:05)**
   - Scans navigation bar: Logo, language switcher (EN/DE), Sign In button
   - Notices dual-pane layout: company cards (left) + interactive map (right)
   - Observes filter bar at top showing "X of Y companies"
   - Sees companies ordered with complete data first

3. **Visual Engagement (0:15)**
   - Notices color-coded badges on company cards (red/amber/green)
   - Hovers over a company card → sees corresponding map marker pulse/highlight
   - Reads WZ code descriptions to understand business sectors
   - Observes financial metrics in grid format

4. **Language Preference (0:30)**
   - Clicks "DE" in language switcher
   - Entire interface translates to German instantly
   - URL changes from `/en/` to `/de/`
   - Navigates through site with German labels

5. **Exploratory Filtering (1:00)**
   - Opens "Filters" panel
   - Adjusts minimum Nachfolge-Score slider to 8
   - Results instantly filter to show high-opportunity companies
   - Count updates: "12 of 98 companies"
   - Map markers reduce to show only filtered results

6. **Geographic Exploration (2:00)**
   - Clicks "Hamburg" city filter button
   - Map smoothly zooms to Hamburg city bounds
   - Sees concentrated clusters of companies in business districts
   - Hovers over map markers to preview company names in popups

7. **Card Investigation (3:00)**
   - Clicks on company card with "Nachfolge-Score: 10/10" badge
   - Card has subtle hover effect: border highlight, shadow, slight scale
   - Sees "View Details →" text underline on hover

8. **Detail Page Deep Dive (3:05)**
   - Navigates to individual company page
   - Greeted with dark gradient hero section showing company name
   - Sees 4 elevated metric cards (Equity, Assets, Income, Employees)
   - Scrolls to shareholder section with pie chart
   - Notices "High Succession Opportunity" alert banner (1 shareholder age 65+)
   - Reviews ownership distribution and individual shareholder ages

9. **Action Consideration (4:00)**
   - Scrolls to "Interested in this opportunity?" CTA card (gradient background)
   - Reads "Request Information" button
   - Clicks "View on Google Maps" to verify location
   - Uses "Back to listings" link to return to search

10. **Bookmark & Exit (5:00)**
    - Returns to main page, applies filters again
    - Bookmarks specific company detail pages
    - Notes URL structure includes language (`/de/company/57`)
    - Plans to return later for deeper analysis

**Key Observations:**
- Total time to first meaningful action: <1 minute
- Number of clicks to see detailed company info: 1 (very low friction)
- Multiple discovery paths (cards, map, filters) accommodate different search styles
- No account required reduces barrier to entry

---

### Journey 2: Strategic Buyer with Specific Criteria

**Persona:** German entrepreneur seeking retail sector acquisition in Hamburg

**Steps:**

1. **Targeted Search (0:00)**
   - Arrives with clear criteria: retail sector, Hamburg, 10-50 employees
   - Immediately opens filter panel

2. **Filter Application (0:15)**
   - Sets city filter to "Hamburg"
   - Adjusts employee range: 10 minimum, 50 maximum
   - Sets minimum Nachfolge-Score to 7 (medium-high opportunity)
   - Sees results narrow from 98 → 15 companies

3. **Sector Identification (0:45)**
   - Scans WZ code descriptions on company cards
   - Looks for keywords: "Einzelhandel" (retail), "Handel" (trade)
   - Identifies 3 promising retail businesses

4. **Comparative Analysis (2:00)**
   - Opens each retail company in new tab
   - Compares equity levels, profitability, shareholder ages
   - Takes notes on ownership structures

5. **Decision & Next Steps (5:00)**
   - Shortlists 2 companies with 65+ year-old shareholders
   - Checks Google Maps locations for foot traffic assessment
   - Plans to contact via "Request Information" button
   - Shares URLs with business partner via email

**Efficiency Gains:**
- Found qualified targets in 5 minutes (vs. weeks of manual research)
- Pre-filtered by succession readiness saved outreach to unmotivated sellers
- Financial data enabled quick go/no-go decisions

---

### Journey 3: Geographic Investor Pattern

**Persona:** Real estate fund evaluating neighborhood-based opportunities

**Steps:**

1. **Map-First Exploration (0:00)**
   - Focuses on map view (right pane)
   - Observes cluster patterns in Hamburg districts

2. **Neighborhood Drilling (0:30)**
   - Clicks city filter "Buxtehude" to explore suburb
   - Map zooms to show 8 companies in small city
   - Studies concentration along main streets

3. **Company-Location Correlation (2:00)**
   - Clicks map markers to view companies
   - Assesses business addresses for real estate value
   - Cross-references employee counts with building size needs

4. **Portfolio Building (5:00)**
   - Identifies 3 companies in same neighborhood
   - Considers acquisition + real estate consolidation play
   - Documents findings for investment committee

**Unique Insight:**
- Map visualization revealed geographic clusters not obvious from list view
- Location data became primary screening criteria
- Visual interface enabled pattern recognition at scale

---

### Journey 4: Mobile User Quick Check

**Persona:** Advisor on-the-go checking client opportunity

**Steps:**

1. **Mobile Access (0:00)**
   - Opens site on smartphone during commute
   - Single-column layout adapts perfectly
   - Map hidden on mobile (focus on list)

2. **Search by Name (0:10)**
   - Uses search bar to find specific company
   - Types company name, instant filtering

3. **Quick Review (0:30)**
   - Taps company card to open detail page
   - Reads shareholder ages and financial metrics
   - Takes screenshot of ownership chart

4. **Share (1:00)**
   - Copies URL from browser
   - Sends via WhatsApp to client
   - Conversation continues in messaging app

**Mobile Optimization:**
- Touch-friendly targets (buttons, cards)
- Readable font sizes without zooming
- Fast page loads on cellular connection

---

## Platform Look & Feel

### Design Philosophy

**Professional Business Aesthetic**
- Clean, corporate styling suitable for B2B audience
- Serious tone matching financial decision-making context
- Trustworthy presentation of numerical data
- German Mittelstand sensibility (conservative, data-focused)

**Modern Web Standards**
- 2026 contemporary design patterns
- Glass-morphism avoided (too trendy)
- Subtle gradients and shadows (depth without distraction)
- High information density without overwhelming users

**Data-First Approach**
- Metrics and numbers prominently displayed
- Visual hierarchy guides eye to key information
- Color used functionally (status indicators) not decoratively
- Whitespace creates breathing room between dense content

---

### Visual Design Elements

#### Color Palette

**Primary Brand Colors:**
- **Primary (Action)**: Deep blue/indigo - Used for interactive elements, CTAs, brand touches
- **Dark Grays**: `#1F2937` to `#374151` - Professional, corporate feel for headers and navigation
- **White**: `#FFFFFF` - Clean backgrounds for cards and content areas
- **Light Grays**: `#F3F4F6` to `#E5E7EB` - Subtle backgrounds, borders, dividers

**Functional Colors (Nachfolge-Score System):**
- **Red** (`#EF4444`): Score 10 - High succession opportunity (urgent attention)
- **Amber** (`#F59E0B`): Score 7-9 - Medium opportunity (moderate attention)
- **Green** (`#10B981`): Score 1-6 - Lower opportunity (background context)

**Data Visualization Colors:**
- **Positive/Profit**: Emerald green (`#059669`) - Net income gains, positive trends
- **Negative/Loss**: Red (`#DC2626`) - Losses, negative metrics
- **Neutral**: Gray tones - N/A values, missing data

#### Typography

**Font Stack:**
```
font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif
```

**Hierarchy:**
- **H1 (Page Titles)**: 2.25rem (36px), Bold (700), Used in hero sections
- **H2 (Section Headers)**: 1.5rem (24px), Semibold (600), Section breaks
- **H3 (Subsections)**: 1.125rem (18px), Semibold (600), Card headers
- **Body Text**: 0.875rem-1rem (14-16px), Regular (400), Main content
- **Small Text**: 0.75rem (12px), Regular/Medium, Metadata, labels
- **Financial Numbers**: 0.875rem (14px), Semibold (600), Emphasis on metrics

**Monospace (Data):**
- WZ codes displayed in `font-mono` for technical classification codes
- Maintains alignment and readability of numeric identifiers

#### Spacing & Layout

**Grid System:**
- **2-column** company cards on desktop (50/50 split)
- **Single column** on mobile (100% width)
- **Consistent gap**: 1rem (16px) between cards
- **Page padding**: 1-2rem responsive padding for content breathing room

**Card Padding:**
- **Internal**: 1rem (16px) consistent padding within cards
- **Section separation**: 0.75-1rem vertical spacing between card sections
- **Border radius**: 0.75rem (12px) rounded corners for modern feel

**Whitespace Strategy:**
- Generous padding around text blocks (prevents claustrophobia)
- Clear section separators (borders, spacing)
- Breathing room between interactive elements (prevents mis-taps)

---

### Component-Level Design Details

#### Company Cards

**Visual Structure:**
```
┌─────────────────────────────────┐
│ [GRADIENT HEADER - Gray-900]   │ ← 96px height, company name overlay
│ Company Name                     │
│ Hamburg                          │
├─────────────────────────────────┤
│ [Badge: Score 10] [Badge: 12y]  │ ← Color-coded status indicators
├─────────────────────────────────┤
│ WZ 47.11.1 | Description text   │ ← Industry classification
│ (truncated to 2 lines)          │
├─────────────────────────────────┤
│ Equity        Net Income        │ ← 2x2 metrics grid
│ €2.5M         €450K             │
│ Total Assets  Employees         │
│ €5.2M         45                │
├─────────────────────────────────┤
│ Data from 2023    View Details→ │ ← Footer with metadata
└─────────────────────────────────┘
```

**Interactive States:**
- **Default**: `border-gray-200`, subtle shadow
- **Hover**: `border-primary`, increased shadow, `scale-[1.02]` (2% growth)
- **Map Synchronized**: When map marker hovered, card gets hover state
- **Transition**: 200ms smooth animation for all state changes

**Typography within Cards:**
- Company name: 18px, semibold, white text on dark background
- Address: 14px, light gray, secondary information
- Badges: 12px, medium weight, pill-shaped with colored backgrounds
- Metrics: 14px labels (gray-500), 14px values (semibold, gray-900)
- WZ description: 12px, gray-600, line-clamped

#### Navigation Bar

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo] Bought              [EN|DE]  [Sign In]          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Styling:**
- **Background**: Pure white with subtle bottom border
- **Height**: 64px (4rem) - standard touch-friendly height
- **Position**: Fixed to top, z-index 50 (always visible during scroll)
- **Logo**: Building icon in primary color + bold text
- **Language Switcher**: Pill-shaped toggle, active state has dark background
- **Sign In Button**: Rounded-full, dark background, white text, hover state lightens

#### Filter Panel

**Design Pattern:**
```
┌──────────────────────────────────────────────────────┐
│ [Search: ____________] [Filters ▼] 45 of 98 companies│
└──────────────────────────────────────────────────────┘

[Expanded state:]
┌──────────────────────────────────────────────────────┐
│ Employees: [====●====] 10-50                         │
│ Equity: [===●=====] €0 - €5M                         │
│ Nachfolge-Score: [======●==] 7-10                    │
│ City: [All] [Hamburg] [Buxtehude]                    │
│ [Clear all filters]                                   │
└──────────────────────────────────────────────────────┘
```

**Interactive Elements:**
- **Search Box**: White background, border, focus state shows blue outline
- **Sliders**: Custom styled with primary color thumb, gray track
- **City Buttons**: Pill-shaped, active state has solid background
- **Clear Link**: Text-only, primary color, underline on hover

#### Map Visualization

**Marker Design:**
- **Shape**: Circular dots with size variation
- **Colors**: Red (score 10), Amber (7-9), Green (1-6)
- **Size**: Scales with zoom level
- **Hover State**: Enlarges 1.5x, shows popup with company name
- **Click State**: Navigates to company detail page

**Legend (Bottom-left):**
```
┌────────────────────────┐
│ Nachfolge-Score        │
│ ● 10 (65+ years)       │
│ ● 7-9 (55-64 years)    │
│ ● 1-6 (<55 years)      │
└────────────────────────┘
```

**Map Style**: Light theme with minimal labels (focus on business locations)

---

### Detail Page Design

#### Hero Section

**Visual Treatment:**
```
┌─────────────────────────────────────────────────────┐
│ [Dark Gradient Background: Gray-900 to Gray-800]    │
│                                                      │
│ ← Back to listings                                   │
│                                                      │
│ COMPANY NAME (36px, bold, white)                    │
│ 📍 Street, City (14px, gray-300)                     │
│                                                      │
│ [Badge: Score 10] [Badge: 15y since change]         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

**Effect**: Creates visual hierarchy, draws attention to company name, professional dark-mode aesthetic

#### Metric Cards (Elevated)

**Card Styling:**
- **Background**: White with subtle shadow-lg (elevated appearance)
- **Position**: -48px margin-top (overlaps hero section)
- **Grid**: 4 columns on desktop, 2 columns on mobile
- **Content**: Large number (24px, semibold) + small label (12px, gray-500)
- **Icons**: None (number-focused design)

#### Content Sections

**White Card Containers:**
- Background: white
- Border: subtle gray-200
- Padding: 1.5rem (24px)
- Border radius: 12px
- Spacing: 2rem (32px) between sections

**Information Display:**
- Label-value pairs in `<dl>` semantic structure
- Labels: 14px, gray-500 (subdued)
- Values: 14px, semibold, gray-900 (prominent)
- Dividers: 1px gray-100 lines between items

---

### Responsive Design Approach

#### Breakpoints

**Mobile (< 768px):**
- Single column layout
- Map hidden (complexity reduction)
- Stacked filter controls
- Full-width company cards
- Larger touch targets (44px minimum)

**Tablet (768px - 1024px):**
- 2-column company grid
- Map still hidden
- Side-by-side filter layout
- Optimized for portrait/landscape

**Desktop (> 1024px):**
- Split view: cards (50%) + map (50%)
- Maximum content width: none (full bleed)
- Hover interactions enabled
- Multi-column layouts for dense information

#### Mobile Optimizations

**Touch-Friendly:**
- Button height: minimum 44px
- Clickable card area: entire card surface
- Spacing between tappable elements: 8px minimum
- No hover-dependent features

**Performance:**
- Lazy loading images
- Reduced map complexity
- Simplified animations
- Optimized bundle size

---

### Micro-Interactions & Animations

#### Hover Effects

**Company Cards:**
- Border color transition: gray → primary (200ms ease)
- Shadow growth: shadow-sm → shadow-lg (200ms ease)
- Scale transform: 1.0 → 1.02 (200ms ease-out)
- Arrow underline: transparent → underline (200ms)

**Buttons:**
- Background darken on hover (200ms)
- Scale down on click: 1.0 → 0.98 (100ms)
- Cursor changes to pointer

**Map Markers:**
- Size increase on hover: 1.0 → 1.5 (150ms)
- Popup fade-in: opacity 0 → 1 (200ms)
- Synchronized highlight with cards

#### Loading States

**Initial Page Load:**
- Centered spinner with animation
- "Loading companies..." text below
- Smooth fade-in when data loads (300ms)

**Filter Application:**
- Instant update (no loading indicator needed)
- Results count updates immediately
- Map re-renders smoothly

#### Transitions

**Page Navigation:**
- Next.js instant client-side routing
- Progress indicator in browser
- Smooth content swap

**Language Switch:**
- Instant text replacement
- URL updates
- No flash of content

---

### Accessibility Considerations in Design

**Color Contrast:**
- All text meets WCAG AA standards
- Minimum 4.5:1 ratio for body text
- 3:1 for large text and UI components
- Color not sole indicator (badges have text + color)

**Focus States:**
- Blue outline on keyboard focus
- Visible tab order through interface
- Skip links for navigation

**Semantic Structure:**
- Proper heading hierarchy (H1 → H2 → H3)
- ARIA labels on interactive elements
- Semantic HTML (`<nav>`, `<main>`, `<article>`)

**Readability:**
- Line height: 1.5 for body text
- Line length: max 80 characters
- Sufficient whitespace prevents overcrowding
- Font sizes never below 12px

---

### Brand Identity Elements

**Logo:**
- Building icon in rounded square
- Primary color background
- White icon foreground
- Appears in navigation and favicon

**Voice & Tone:**
- Professional, trustworthy
- Data-driven, factual
- No marketing hyperbole
- German and English equally prioritized

**Imagery:**
- No stock photos (data-first approach)
- Charts and graphs for financial data
- Maps for geographic visualization
- Icons minimal and functional

---

### Design System Consistency

**Reusable Components:**
- Badge component (3 variants: high/medium/low)
- MetricCard component (standardized financial display)
- DetailItem component (label-value pairs)
- Button styles (primary, secondary, ghost)

**Spacing Scale:**
- 0.25rem (4px) increments
- Standardized: 4px, 8px, 12px, 16px, 24px, 32px, 48px
- Applied consistently across components

**Border Radius Scale:**
- Small (0.25rem): badges, inputs
- Medium (0.5rem): buttons
- Large (0.75rem): cards, modals
- Full (9999px): pills, language switcher

---

### Performance-Driven Design Choices

**Static Generation:**
- Pre-rendered HTML eliminates layout shift
- Instant paint on page load
- No JavaScript required for initial view

**Optimized Assets:**
- SVG icons (scalable, small file size)
- System fonts (no web font downloads)
- Minimal CSS bundle via Tailwind purging
- No large images (text and data focused)

**Progressive Enhancement:**
- Core content accessible without JavaScript
- Map enhances experience but not required
- Filters work client-side (no server dependency)

---

## Data Privacy & Security

### Current Implementation
- **Read-Only Access**: Application uses Supabase anonymous key (read-only)
- **Public Data**: All displayed data is publicly accessible
- **No User Authentication**: Sign In button currently non-functional
- **Client-Side Processing**: All calculations performed in browser
- **No Personal Data Collection**: No cookies, tracking, or analytics

### Future Considerations
- Authentication system for gated content
- Role-based access control for sensitive data
- Contact form submissions with encryption
- GDPR compliance for European users
- Privacy policy and terms of service

---

## Future Enhancement Opportunities

1. **Advanced Filtering**
   - Industry sector filters
   - Revenue growth trends
   - Profitability ratios
   - Multi-select city filters

2. **Comparison Features**
   - Side-by-side company comparison
   - Benchmark against industry averages
   - Save favorites/watchlist

3. **Analytics Dashboard**
   - Market trends visualization
   - Sector analysis
   - Succession opportunity heatmaps

4. **User Accounts**
   - Saved searches
   - Email alerts for new matches
   - Custom filter presets
   - Interaction history

5. **Data Enrichment**
   - News integration (company mentions)
   - Social media presence
   - Website quality assessment
   - Review/rating system

6. **Export Capabilities**
   - PDF company reports
   - Excel export of filtered results
   - Email sharing functionality

7. **Communication Features**
   - Direct messaging to company owners
   - Request information workflow
   - Schedule meeting/call functionality

---

## Success Metrics

### Current Capabilities
- Total companies in database: ~100 Hamburg SMEs
- Data completeness range: 1-40 points
- Average Nachfolge-Score: Distribution across 1-10 scale
- Page load time: <2s for static pages
- Mobile responsive: 100% functional on all devices

### KPIs to Track (Future)
- User engagement: Time on site, pages per session
- Conversion: Information requests per visit
- Search effectiveness: Filters used, results clicked
- Geographic reach: User locations accessing platform
- Language preference: EN vs DE usage ratio

---

## Accessibility Features

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast ratios meeting WCAG standards
- Screen reader compatible
- Responsive text sizing
- Touch-friendly tap targets (44px minimum)

---

## Browser Compatibility

**Tested Browsers:**
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

**Requirements:**
- JavaScript enabled
- Modern CSS support (Grid, Flexbox)
- ES6+ JavaScript features

---

## Maintenance & Updates

### Content Updates
- Database refreshed via Supabase admin panel
- New companies automatically appear after page rebuild
- Financial data updated annually (based on report_year)

### Code Updates
- Continuous deployment via GitHub Actions
- Version control with Git
- Pull request workflow for changes
- Automated build verification before deployment

### Dependencies
- Regular npm package updates
- Security vulnerability monitoring
- Next.js framework updates as released
- Tailwind CSS updates for new features

---

## Contact & Support

**Repository**: https://github.com/ImthiyazBasha13/Bought

**Live Site**: https://imthiyazbasha13.github.io/Bought/

**Documentation**: This file (PLATFORM_FEATURES.md)

---

## Conclusion

Bought is a comprehensive, production-ready platform for discovering SME succession opportunities in Hamburg. The platform combines intelligent scoring algorithms, advanced filtering, interactive mapping, and multi-language support to provide users with actionable insights into potential business acquisition targets.

The data completeness scoring ensures users spend time on high-quality leads, while the Nachfolge-Score system prioritizes companies with imminent succession needs. The dual-language support makes the platform accessible to both local German businesses and international investors.

With its modern tech stack, responsive design, and user-friendly interface, Bought demonstrates best practices in web development while solving a real-world business challenge in the SME succession market.

---

**Last Updated**: February 1, 2026
**Version**: 1.0
**Platform Status**: Production Ready
