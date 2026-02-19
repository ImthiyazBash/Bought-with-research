'use client';

import { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { HamburgTarget } from '@/lib/types';
import { formatCurrency, formatNumber, getCompanyNachfolgeScore, getScoreVariant, parseShareholders } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n-context';

function CompareContent({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get('ids');
  const ids = idsParam ? idsParam.split(',').map(Number).filter(Boolean) : [];
  const t = useTranslations('compare');
  const [companies, setCompanies] = useState<HamburgTarget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    supabase
      .from('Hamburg Targets')
      .select('*')
      .in('id', ids)
      .then(({ data }) => {
        // Preserve the order from URL params
        const dataArr = data || [];
        const sorted: HamburgTarget[] = [];
        for (const id of ids) {
          const found = dataArr.find(c => c.id === id);
          if (found) sorted.push(found);
        }
        setCompanies(sorted);
        setIsLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsParam]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (companies.length < 2) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {companies.length === 0 ? t('empty') : t('needMore')}
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{t('emptyDescription')}</p>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
        >
          {t('browseCompanies')}
        </Link>
      </div>
    );
  }

  const metrics = [
    {
      key: 'city',
      label: t('city'),
      getValue: (c: HamburgTarget) => c.address_city || '-',
    },
    {
      key: 'employees',
      label: t('employees'),
      getValue: (c: HamburgTarget) => c.employee_count ? formatNumber(c.employee_count) : '-',
    },
    {
      key: 'equity',
      label: t('equity'),
      getValue: (c: HamburgTarget) => c.equity_eur ? formatCurrency(c.equity_eur) : '-',
    },
    {
      key: 'totalAssets',
      label: t('totalAssets'),
      getValue: (c: HamburgTarget) => c.total_assets_eur ? formatCurrency(c.total_assets_eur) : '-',
    },
    {
      key: 'netIncome',
      label: t('netIncome'),
      getValue: (c: HamburgTarget) => c.net_income_eur ? formatCurrency(c.net_income_eur) : '-',
      getColor: (c: HamburgTarget) => c.net_income_eur ? (c.net_income_eur > 0 ? 'text-emerald-600' : 'text-red-600') : '',
    },
    {
      key: 'wzCode',
      label: t('wzCode'),
      getValue: (c: HamburgTarget) => c.wz_code ? `${c.wz_code}${c.wz_description ? ` - ${c.wz_description}` : ''}` : '-',
    },
    {
      key: 'successionScore',
      label: t('successionScore'),
      getValue: (c: HamburgTarget) => {
        const score = getCompanyNachfolgeScore(c);
        return `${score}/10`;
      },
      getVariant: (c: HamburgTarget) => getScoreVariant(getCompanyNachfolgeScore(c)),
    },
    {
      key: 'shareholders',
      label: t('shareholders'),
      getValue: (c: HamburgTarget) => {
        const parsed = parseShareholders(c);
        if (parsed.length === 0) return '-';
        return parsed.map(s => `${s.name}${s.age ? ` (${s.age})` : ''}`).join(', ');
      },
    },
    {
      key: 'reportYear',
      label: t('reportYear'),
      getValue: (c: HamburgTarget) => c.report_year?.toString() || '-',
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 min-w-[160px] sticky left-0 z-10">
              {t('metric')}
            </th>
            {companies.map((company) => (
              <th key={company.id} className="text-left p-4 bg-gray-50 border-b border-gray-200 min-w-[200px]">
                <Link
                  href={`/${locale}/company/${company.id}`}
                  className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors"
                >
                  {company.company_name || 'Unnamed'}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric, i) => (
            <tr key={metric.key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
              <td className="p-4 border-b border-gray-100 text-sm font-medium text-gray-600 sticky left-0 z-10" style={{ backgroundColor: i % 2 === 0 ? 'white' : 'rgb(249 250 251 / 0.5)' }}>
                {metric.label}
              </td>
              {companies.map((company) => {
                const value = metric.getValue(company);
                const color = metric.getColor?.(company) || '';
                const variant = metric.getVariant?.(company);
                return (
                  <td key={company.id} className={`p-4 border-b border-gray-100 text-sm ${color || 'text-gray-900'}`}>
                    {variant ? (
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        variant === 'high' ? 'bg-emerald-100 text-emerald-800' :
                        variant === 'medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {value}
                      </span>
                    ) : (
                      <span className="font-medium">{value}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ComparePageClient({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const t = useTranslations('compare');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/${locale}`} className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
            ← {t('browseCompanies')}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          }>
            <CompareContent locale={locale} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
