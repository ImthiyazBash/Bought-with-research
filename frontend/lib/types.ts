export interface HamburgTarget {
  id: number;
  created_at: string;
  company_name: string | null;
  report_year: number | null;
  equity_eur: number | null;
  total_assets_eur: number | null;
  net_income_eur: number | null;
  retained_earnings_eur: number | null;
  liabilities_eur: number | null;
  receivables_eur: number | null;
  cash_assets_eur: number | null;
  employee_count: number | null;
  shareholder_names: string | null;
  shareholder_dobs: string | null;
  shareholder_details: ShareholderDetail[] | null;
  last_ownership_change_year: number | null;
  address_street: string | null;
  address_zip: string | null;
  address_city: string | null;
  address_country: string | null;
  wz_code: string | null;
  wz_description: string | null;
  tel: string | null;
  fax: string | null;
  email: string | null;
  website: string | null;
  source: string | null;
  google_rating: number | null;
  google_reviews_count: number | null;
  google_place_id: string | null;
  google_maps_url: string | null;
  business_type: string | null;
  succession_score: number | null;
  succession_age_score: number | null;
  succession_concentration_score: number | null;
  succession_stability_score: number | null;
  succession_gap_score: number | null;
  succession_simplicity_score: number | null;
}

export interface ShareholderDetail {
  name?: string;
  dob?: string;
  percentage?: number;
  ownership_percentage?: number;
  role?: string;
}

export interface ParsedShareholder {
  name: string;
  dob: string | null;
  age: number | null;
  nachfolgeScore: number; // 1-10 scale
  /** @deprecated Use nachfolgeScore instead */
  successionRisk: 'high' | 'medium' | 'low' | 'neutral';
  percentage: number | null;
  isPerson: boolean;
}

export interface SuccessionScoreBreakdown {
  total: number | null;
  ageScore: number;
  concentrationScore: number;
  stabilityScore: number;
  gapScore: number;
  simplicityScore: number;
}

export interface CompanyWithCoordinates extends HamburgTarget {
  latitude?: number;
  longitude?: number;
}

export interface FilterState {
  searchQuery: string;
  minEmployees: number;
  maxEmployees: number;
  minEquity: number;
  maxEquity: number;
  minIncome: number;
  maxIncome: number;
  minNachfolgeScore: number; // 1-10 scale
  selectedCity: string | null; // 'Hamburg', 'Buxtehude', or null for all
  selectedSector: string | null; // WZ sector key or null for all (legacy, kept for compat)
  selectedWzCodes: string[]; // WZ code leaf keys from tree filter
  selectedSource: string | null; // 'bundesanzeiger', 'google_places', or null for all
  /** @deprecated Use minNachfolgeScore instead */
  highSuccessionRiskOnly: boolean;
}

export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedCompany {
  id: number;
  user_id: string;
  company_id: number;
  created_at: string;
}

// Supabase Database types
export interface Database {
  public: {
    Tables: {
      'Hamburg Targets': {
        Row: HamburgTarget;
        Insert: Omit<HamburgTarget, 'id' | 'created_at'>;
        Update: Partial<Omit<HamburgTarget, 'id' | 'created_at'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      saved_companies: {
        Row: SavedCompany;
        Insert: Omit<SavedCompany, 'id' | 'created_at'>;
        Update: Partial<Omit<SavedCompany, 'id' | 'created_at'>>;
      };
    };
  };
}
