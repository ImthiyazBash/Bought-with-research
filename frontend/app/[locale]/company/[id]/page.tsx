import { createClient } from '@supabase/supabase-js';
import { locales } from '@/i18n';
import CompanyPageClient from './CompanyPageClient';

// Create a server-side Supabase client for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Generate static pages for all companies at build time for all locales
export async function generateStaticParams() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: companies } = await supabase
    .from('Hamburg Targets')
    .select('id');

  // Generate params for each company in each locale
  const params = [];
  for (const locale of locales) {
    for (const company of companies || []) {
      params.push({
        locale,
        id: company.id.toString(),
      });
    }
  }

  return params;
}

export default function CompanyPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  return <CompanyPageClient params={params} />;
}
