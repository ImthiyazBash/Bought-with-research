import { supabase } from './supabase';
import type { CompanyResearchData } from './research-types';

/**
 * Fetch all research data for a company
 */
export async function fetchCompanyResearch(companyId: number): Promise<CompanyResearchData> {
  const [statusRes, websiteRes, mentionsRes, searchRes, shareholdersRes] = await Promise.all([
    supabase
      .from('company_research_status')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle(),
    supabase
      .from('company_website_profiles')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle(),
    supabase
      .from('company_media_mentions')
      .select('*')
      .eq('company_id', companyId)
      .order('published_at', { ascending: false, nullsFirst: false }),
    supabase
      .from('company_media_searches')
      .select('*')
      .eq('company_id', companyId)
      .maybeSingle(),
    supabase
      .from('shareholder_backgrounds')
      .select('*')
      .eq('company_id', companyId)
      .order('shareholder_name'),
  ]);

  return {
    status: statusRes.data || null,
    website: websiteRes.data || null,
    mediaMentions: mentionsRes.data || [],
    mediaSearch: searchRes.data || null,
    shareholderBackgrounds: shareholdersRes.data || [],
  };
}

/**
 * Trigger research for a company via the Edge Function.
 * Modules: 'website', 'media', 'shareholders'
 */
export async function triggerResearch(
  companyId: number,
  modules: string[] = ['website', 'media', 'shareholders']
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/research-company`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey || '',
        },
        body: JSON.stringify({ company_id: companyId, modules }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Request failed with status ${response.status}`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Check if research data is stale (older than N days)
 */
export function isResearchStale(completedAt: string | null, maxAgeDays = 7): boolean {
  if (!completedAt) return true;
  const completed = new Date(completedAt);
  const now = new Date();
  const diffMs = now.getTime() - completed.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays > maxAgeDays;
}
