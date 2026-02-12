// ─── Company Research Types ──────────────────────────────────

export interface WebsiteProfile {
  id: string;
  company_id: number;
  website_url: string | null;
  domain: string | null;
  impressum_url: string | null;
  company_description: string | null;
  products_services: string[];
  team_members: TeamMember[];
  contact_email: string | null;
  contact_phone: string | null;
  contact_fax: string | null;
  social_links: Record<string, string>;
  impressum_data: ImpressumData;
  crawl_status: 'pending' | 'crawling' | 'completed' | 'failed' | 'not_found';
  crawl_error: string | null;
  raw_pages: RawPage[];
  search_results: SearchResultEntry[];
  crawled_at: string | null;
  created_at: string;
}

export interface TeamMember {
  name: string;
  role?: string;
  image_url?: string;
}

export interface ImpressumData {
  geschaeftsfuehrer?: string;
  hrb_number?: string;
  amtsgericht?: string;
  ust_id?: string;
  steuernummer?: string;
}

export interface RawPage {
  url: string;
  title: string;
  text_excerpt: string;
}

export interface SearchResultEntry {
  title: string;
  link: string;
  snippet: string;
  position: number;
  sitelinks?: { title: string; link: string }[];
}

export interface MediaMention {
  id: string;
  company_id: number;
  title: string;
  url: string | null;
  source: string | null;
  published_at: string | null;
  snippet: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
  mention_type: 'company' | 'shareholder' | 'industry';
  related_shareholder: string | null;
  search_query: string | null;
  created_at: string;
}

export interface MediaSearchStatus {
  id: string;
  company_id: number;
  search_status: 'pending' | 'searching' | 'completed' | 'failed';
  search_error: string | null;
  mentions_found: number;
  media_summary: string | null;
  last_searched_at: string | null;
}

export interface ShareholderBackground {
  id: string;
  company_id: number;
  shareholder_name: string;
  shareholder_dob: string | null;
  other_companies: OtherCompany[];
  handelsregister_entries: HandelsregisterEntry[];
  linkedin_url: string | null;
  xing_url: string | null;
  public_roles: string[];
  bio_summary: string | null;
  cross_references: CrossReference[];
  enrichment_status: 'pending' | 'enriching' | 'completed' | 'failed' | 'is_company';
  enrichment_error: string | null;
  enriched_at: string | null;
}

export interface OtherCompany {
  name: string;
  role?: string;
  hrb_number?: string;
  status?: string;
  source_url?: string;
  snippet?: string;
}

export interface HandelsregisterEntry {
  hrb_number: string;
  court?: string;
  company_name?: string;
  role?: string;
  source?: string;
  context?: string;
}

export interface CrossReference {
  company_id?: number;
  company_name?: string;
  id?: number;
}

export interface ResearchStatus {
  id: string;
  company_id: number;
  website_status: string;
  media_status: string;
  shareholders_status: string;
  overall_status: 'not_started' | 'in_progress' | 'completed' | 'partial' | 'failed';
  triggered_at: string | null;
  completed_at: string | null;
}

export interface CompanyResearchData {
  status: ResearchStatus | null;
  website: WebsiteProfile | null;
  mediaMentions: MediaMention[];
  mediaSearch: MediaSearchStatus | null;
  shareholderBackgrounds: ShareholderBackground[];
}
