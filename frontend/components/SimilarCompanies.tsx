'use client';

import { useState, useEffect, useMemo } from 'react';
import { HamburgTarget } from '@/lib/types';
import { getSimilarCompanies, getPrimarySimilarityReason } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n-context';
import { supabase } from '@/lib/supabase';
import CompanyCard from './CompanyCard';

interface SimilarCompaniesProps {
  company: HamburgTarget;
}

export default function SimilarCompanies({ company }: SimilarCompaniesProps) {
  const t = useTranslations('similar');
  const [allCompanies, setAllCompanies] = useState<HamburgTarget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchCandidates() {
      try {
        // Only fetch potential matches — same city or same WZ prefix, not all 184
        const wzPrefix = company.wz_code?.split('.')[0] ?? '';
        const city = company.address_city ?? '';

        const queries = [];
        if (wzPrefix) {
          queries.push(
            supabase.from('Hamburg Targets').select('*')
              .like('wz_code', `${wzPrefix}%`).neq('id', company.id).limit(10)
          );
        }
        if (city) {
          queries.push(
            supabase.from('Hamburg Targets').select('*')
              .eq('address_city', city).neq('id', company.id).limit(10)
          );
        }

        const results = await Promise.all(queries);
        if (cancelled) return;

        // Merge and deduplicate
        const seen = new Set<number>();
        const candidates: HamburgTarget[] = [];
        for (const { data } of results) {
          if (data) {
            for (const c of data as HamburgTarget[]) {
              if (!seen.has(c.id)) { seen.add(c.id); candidates.push(c); }
            }
          }
        }
        setAllCompanies(candidates);
      } catch (err) {
        console.error('SimilarCompanies fetch exception:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCandidates();
    return () => { cancelled = true; };
  }, [company.id, company.wz_code, company.address_city]);

  const similar = useMemo(
    () => (allCompanies.length > 0 ? getSimilarCompanies(company, allCompanies, 4) : []),
    [company, allCompanies],
  );

  const reasons = useMemo(
    () => similar.map(c => getPrimarySimilarityReason(company, c)),
    [company, similar],
  );

  if (loading) {
    return (
      <div className="mt-8">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (similar.length < 2) return null;

  return (
    <div className="mt-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {similar.map((c, i) => (
          <div key={c.id} className="relative">
            <span className="absolute top-3 left-3 z-10 px-2 py-0.5 text-[10px] font-medium bg-white rounded-full text-gray-800 shadow-sm">
              {t(reasons[i])}
            </span>
            <CompanyCard company={c} />
          </div>
        ))}
      </div>
    </div>
  );
}
