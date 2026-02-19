'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { HamburgTarget } from '@/lib/types';
import { useTranslations } from '@/lib/i18n-context';
import { useSavedCompanies } from '@/lib/saved-companies-context';
import AuthGuard from '@/components/AuthGuard';
import CompanyCard from '@/components/CompanyCard';

export default function SavedPageClient({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const t = useTranslations('saved');
  const { savedIds, isLoading: isSavedLoading } = useSavedCompanies();
  const [companies, setCompanies] = useState<HamburgTarget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSavedLoading) return;

    if (savedIds.size === 0) {
      setCompanies([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    supabase
      .from('Hamburg Targets')
      .select('*')
      .in('id', Array.from(savedIds))
      .then(({ data }) => {
        setCompanies(data || []);
        setIsLoading(false);
      });
  }, [savedIds, isSavedLoading]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : companies.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('empty')}</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{t('emptyDescription')}</p>
              <Link
                href={`/${locale}`}
                className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
              >
                {t('browseCompanies')}
              </Link>
            </div>
          ) : (
            /* Company Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
