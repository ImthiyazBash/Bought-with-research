'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { HamburgTarget } from '@/lib/types';
import { formatCurrency, formatNumber, getFullAddress, getCompanyNachfolgeScore, getScoreVariant } from '@/lib/utils';
import { getWzDescription } from '@/lib/wz-codes';
import { useTranslations } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { useSavedCompanies } from '@/lib/saved-companies-context';
import MetricCard from '@/components/ui/MetricCard';
import Badge from '@/components/ui/Badge';
import RequestInfoModal from '@/components/RequestInfoModal';

// Lazy-load heavy components to reduce initial bundle and dev compilation pressure
const FinancialCharts = dynamic(() => import('@/components/FinancialCharts'), { ssr: false });
const ShareholderInfo = dynamic(() => import('@/components/ShareholderInfo'), { ssr: false });
const CompanyResearch = dynamic(() => import('@/components/CompanyResearch'), { ssr: false });
const SimilarCompanies = dynamic(() => import('@/components/SimilarCompanies'), { ssr: false });

export default function CompanyPageClient({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const [company, setCompany] = useState<HamburgTarget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedCompanies();

  useEffect(() => {
    async function fetchCompany() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('Hamburg Targets')
          .select('*')
          .eq('id', parseInt(id))
          .single();

        if (error) throw error;
        setCompany(data);
      } catch (err) {
        console.error('Error fetching company:', err);
        setError('Failed to load company details.');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchCompany();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">{t('company.detail.loadingDetails')}</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('company.detail.notFound')}
          </h2>
          <p className="text-gray-600 mb-4">{error || t('company.detail.notFoundDescription')}</p>
          <Link
            href={`/${locale}`}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors inline-block"
          >
            {t('company.detail.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  const nachfolgeScore = getCompanyNachfolgeScore(company);
  const scoreVariant = getScoreVariant(nachfolgeScore);
  const scoreDisplay = nachfolgeScore !== null ? `${nachfolgeScore.toFixed(1)}/10` : null;
  const yearsSinceChange = company.last_ownership_change_year
    ? new Date().getFullYear() - company.last_ownership_change_year
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <div className="py-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('company.detail.backToListings')}
            </button>
          </div>

          {/* Company Header */}
          <div className="pb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {company.company_name || t('company.detail.unnamedCompany')}
                  </h1>
                  <button
                    onClick={() => {
                      if (!user) {
                        router.push(`/${locale}/auth/signin`);
                        return;
                      }
                      toggleSave(company.id);
                    }}
                    className="flex-shrink-0 mt-1 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {isSaved(company.id) ? (
                      <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white/60 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-gray-300 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{getFullAddress(company)}</span>
                </div>
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  {company.source === 'google_places' ? (
                    <Badge variant="neutral">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        Google Places
                      </span>
                    </Badge>
                  ) : scoreDisplay ? (
                    <Badge variant={scoreVariant}>
                      {t('score.label')}: {scoreDisplay}
                    </Badge>
                  ) : (
                    <Badge variant="neutral">
                      {t('score.noScore')}
                    </Badge>
                  )}
                  {company.google_rating && (
                    <Badge variant="warning">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        {company.google_rating} ({company.google_reviews_count} {t('company.detail.reviews')})
                      </span>
                    </Badge>
                  )}
                  {company.source !== 'google_places' && yearsSinceChange && yearsSinceChange > 10 && (
                    <Badge variant="neutral">
                      {t('company.detail.yearsSinceChange').replace('{years}', yearsSinceChange.toString())}
                    </Badge>
                  )}
                </div>
              </div>

              {/* CTA Button - Desktop */}
              <div className="hidden lg:block flex-shrink-0">
                <div className="bg-white rounded-xl p-5 shadow-xl border-2 border-primary/20 min-w-[280px]">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('company.detail.interested')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('company.detail.interestedDescription')}
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-hover transition-colors shadow-md hover:shadow-lg"
                  >
                    {t('company.detail.requestInfo')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 -mt-12">
          <MetricCard
            label={t('company.card.equity')}
            value={formatCurrency(company.equity_eur)}
            subtext={`${t('company.detail.dataYear')} ${company.report_year || t('common.na')}`}
            className="shadow-lg"
          />
          <MetricCard
            label={t('company.card.totalAssets')}
            value={formatCurrency(company.total_assets_eur)}
            className="shadow-lg"
          />
          <MetricCard
            label={t('company.card.netIncome')}
            value={formatCurrency(company.net_income_eur)}
            trend={company.net_income_eur ? (company.net_income_eur > 0 ? 'positive' : 'negative') : undefined}
            className="shadow-lg"
          />
          <MetricCard
            label={t('company.card.employees')}
            value={company.employee_count ? formatNumber(company.employee_count) : t('common.na')}
            className="shadow-lg"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Financial Charts */}
            <FinancialCharts company={company} />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Company Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('company.detail.companyDetails')}
              </h3>
              <dl className="space-y-4">
                <DetailItem label={t('company.detail.dataYear')} value={company.report_year?.toString() || t('common.na')} />
                {(company.wz_code || company.wz_description) && (
                  <div className="py-3 border-b border-gray-100">
                    <dt className="text-sm text-gray-500 mb-2">{t('company.detail.corporatePurpose')}</dt>
                    <dd className="text-sm text-gray-900">
                      {company.wz_code && (
                        <div className="mb-2">
                          <span className="inline-block bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-700">
                            WZ {company.wz_code}
                          </span>
                        </div>
                      )}
                      {(() => {
                        const description = getWzDescription(
                          company.wz_code,
                          locale,
                          company.wz_description
                        );
                        return description ? (
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {description}
                          </p>
                        ) : null;
                      })()}
                    </dd>
                  </div>
                )}
                <DetailItem
                  label={t('company.detail.lastOwnershipChange')}
                  value={
                    company.last_ownership_change_year
                      ? `${company.last_ownership_change_year} (${t('company.detail.yearsAgo').replace('{years}', yearsSinceChange?.toString() || '')})`
                      : t('common.na')
                  }
                />
                <DetailItem label={t('company.detail.receivables')} value={formatCurrency(company.receivables_eur)} />
                <DetailItem label={t('company.detail.cashAssets')} value={formatCurrency(company.cash_assets_eur)} />
                <DetailItem label={t('company.detail.liabilities')} value={formatCurrency(company.liabilities_eur)} />
                <DetailItem label={t('company.detail.retainedEarnings')} value={formatCurrency(company.retained_earnings_eur)} />
              </dl>
            </div>

            {/* Address Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('company.detail.location')}
              </h3>
              <div className="space-y-2 text-sm">
                {company.address_street && (
                  <p className="text-gray-700">{company.address_street}</p>
                )}
                <p className="text-gray-700">
                  {[company.address_zip, company.address_city].filter(Boolean).join(' ')}
                </p>
                {company.address_country && (
                  <p className="text-gray-500">{company.address_country}</p>
                )}
              </div>
              <a
                href={company.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getFullAddress(company))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-primary hover:underline text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {t('company.detail.viewOnGoogleMaps')}
              </a>
            </div>

            {/* Contact Information */}
            {(company.website || company.email || company.tel || company.fax) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('company.detail.contact') || 'Contact Information'}
                </h3>
                <div className="space-y-3">
                  {company.website && (
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                      </svg>
                      <a
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline truncate"
                      >
                        {company.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${company.email}`} className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline truncate">
                        {company.email}
                      </a>
                    </div>
                  )}
                  {company.tel && (
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${company.tel}`} className="text-sm text-gray-700 hover:text-indigo-600">
                        {company.tel}
                      </a>
                    </div>
                  )}
                  {company.fax && (
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      <span className="text-sm text-gray-700">{company.fax}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Full Width - Shareholders */}
        <div className="mt-8">
          <ShareholderInfo company={company} />
        </div>

        {/* Similar Companies */}
        <SimilarCompanies company={company} />

        {/* Full Width - Company Research */}
        <div className="mt-8">
          <CompanyResearch company={company} />
        </div>
      </div>

      {/* Sticky CTA - Mobile Only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-2xl z-50">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-primary text-white font-medium py-4 rounded-lg hover:bg-primary-hover transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {t('company.detail.requestInfo')}
        </button>
      </div>

      {/* Request Info Modal */}
      <RequestInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        companyId={parseInt(id)}
        companyName={company.company_name || t('company.detail.unnamedCompany')}
        onSubmitSuccess={() => {
          // Success callback - can add analytics or tracking here
        }}
      />
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}
