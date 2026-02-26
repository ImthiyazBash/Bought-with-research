'use client';

import { useMemo } from 'react';
import { HamburgTarget } from '@/lib/types';
import { getSimilarCompanies, getPrimarySimilarityReason } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n-context';
import { useCompanies } from '@/lib/companies-context';
import CompanyCard from './CompanyCard';

interface SimilarCompaniesProps {
  company: HamburgTarget;
}

export default function SimilarCompanies({ company }: SimilarCompaniesProps) {
  const t = useTranslations('similar');
  const { companies: allCompanies, loading } = useCompanies();

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
