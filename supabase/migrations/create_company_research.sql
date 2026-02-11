-- ============================================================
-- Company Research: Website Crawl, Media Search, Shareholder BG
-- ============================================================

-- 1. Website crawl results
CREATE TABLE IF NOT EXISTS company_website_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id INTEGER REFERENCES "Hamburg Targets"(id) ON DELETE CASCADE,
  website_url TEXT,
  domain TEXT,
  impressum_url TEXT,
  -- Extracted data
  company_description TEXT,         -- LLM-summarized description
  products_services TEXT[],         -- Array of products/services found
  team_members JSONB DEFAULT '[]',  -- [{name, role, image_url}]
  contact_email TEXT,
  contact_phone TEXT,
  social_links JSONB DEFAULT '{}',  -- {linkedin, xing, facebook, instagram, ...}
  technologies TEXT[],              -- Tech stack if detectable
  impressum_data JSONB DEFAULT '{}',-- Parsed Impressum: {geschaeftsfuehrer, hrb_number, ust_id, ...}
  -- Meta
  crawl_status TEXT DEFAULT 'pending' CHECK (crawl_status IN ('pending', 'crawling', 'completed', 'failed', 'not_found')),
  crawl_error TEXT,
  raw_pages JSONB DEFAULT '[]',     -- [{url, title, text_excerpt}] for reference
  crawled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id)
);

-- 2. Media / news mentions
CREATE TABLE IF NOT EXISTS company_media_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id INTEGER REFERENCES "Hamburg Targets"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  source TEXT,                      -- e.g. "Hamburger Abendblatt", "NDR", etc.
  published_at DATE,
  snippet TEXT,                     -- Short excerpt
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'unknown')),
  mention_type TEXT DEFAULT 'company' CHECK (mention_type IN ('company', 'shareholder', 'industry')),
  related_shareholder TEXT,         -- If mention_type = 'shareholder'
  search_query TEXT,                -- The query that found this result
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Media search tracking (to avoid re-searching too often)
CREATE TABLE IF NOT EXISTS company_media_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id INTEGER REFERENCES "Hamburg Targets"(id) ON DELETE CASCADE,
  search_status TEXT DEFAULT 'pending' CHECK (search_status IN ('pending', 'searching', 'completed', 'failed')),
  search_error TEXT,
  mentions_found INTEGER DEFAULT 0,
  last_searched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id)
);

-- 4. Shareholder background enrichment
CREATE TABLE IF NOT EXISTS shareholder_backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id INTEGER REFERENCES "Hamburg Targets"(id) ON DELETE CASCADE,
  shareholder_name TEXT NOT NULL,
  shareholder_dob TEXT,
  -- Enriched data
  other_companies JSONB DEFAULT '[]',    -- [{name, role, hrb_number, status}]
  handelsregister_entries JSONB DEFAULT '[]', -- [{hrb_number, court, company_name, role, date}]
  linkedin_url TEXT,
  xing_url TEXT,
  public_roles TEXT[],                    -- ["Geschäftsführer at X", "Beirat at Y"]
  education TEXT[],
  bio_summary TEXT,                       -- LLM-summarized background
  cross_references JSONB DEFAULT '[]',    -- [{company_id, company_name}] links within our own DB
  -- Meta
  enrichment_status TEXT DEFAULT 'pending' CHECK (enrichment_status IN ('pending', 'enriching', 'completed', 'failed', 'is_company')),
  enrichment_error TEXT,
  enriched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, shareholder_name)
);

-- 5. Overall research status per company (aggregation convenience)
CREATE TABLE IF NOT EXISTS company_research_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id INTEGER REFERENCES "Hamburg Targets"(id) ON DELETE CASCADE,
  website_status TEXT DEFAULT 'not_started',
  media_status TEXT DEFAULT 'not_started',
  shareholders_status TEXT DEFAULT 'not_started',
  overall_status TEXT DEFAULT 'not_started' CHECK (overall_status IN ('not_started', 'in_progress', 'completed', 'partial', 'failed')),
  triggered_by TEXT,                -- email or 'system'
  triggered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_website_profiles_company ON company_website_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_media_mentions_company ON company_media_mentions(company_id);
CREATE INDEX IF NOT EXISTS idx_media_mentions_published ON company_media_mentions(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_searches_company ON company_media_searches(company_id);
CREATE INDEX IF NOT EXISTS idx_shareholder_bg_company ON shareholder_backgrounds(company_id);
CREATE INDEX IF NOT EXISTS idx_shareholder_bg_name ON shareholder_backgrounds(shareholder_name);
CREATE INDEX IF NOT EXISTS idx_research_status_company ON company_research_status(company_id);

-- RLS Policies
ALTER TABLE company_website_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_media_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_media_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareholder_backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_research_status ENABLE ROW LEVEL SECURITY;

-- Public read access (research data is visible to all)
CREATE POLICY "Public can read website profiles" ON company_website_profiles FOR SELECT USING (true);
CREATE POLICY "Public can read media mentions" ON company_media_mentions FOR SELECT USING (true);
CREATE POLICY "Public can read media searches" ON company_media_searches FOR SELECT USING (true);
CREATE POLICY "Public can read shareholder backgrounds" ON shareholder_backgrounds FOR SELECT USING (true);
CREATE POLICY "Public can read research status" ON company_research_status FOR SELECT USING (true);

-- Service role can write (Edge Functions use service role key)
CREATE POLICY "Service can manage website profiles" ON company_website_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can manage media mentions" ON company_media_mentions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can manage media searches" ON company_media_searches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can manage shareholder backgrounds" ON shareholder_backgrounds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can manage research status" ON company_research_status FOR ALL USING (true) WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_website_profiles_updated_at BEFORE UPDATE ON company_website_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shareholder_bg_updated_at BEFORE UPDATE ON shareholder_backgrounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_research_status_updated_at BEFORE UPDATE ON company_research_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
