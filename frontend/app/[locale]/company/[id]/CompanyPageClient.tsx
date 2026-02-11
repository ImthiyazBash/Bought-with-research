'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { HamburgTarget } from '@/lib/types';
import { formatCurrency, formatNumber, getFullAddress, getCompanyNachfolgeScore, getScoreVariant } from '@/lib/utils';
import { getWzDescription } from '@/lib/wz-codes';
import { useTranslations } from '@/lib/i18n-context';
import MetricCard from '@/components/ui/MetricCard';
import Badge from '@/components/ui/Badge';
import FinancialCharts from '@/components/FinancialCharts';
import ShareholderInfo from '@/components/ShareholderInfo';
import RequestInfoModal from '@/components/RequestInfoModal';
import CompanyResearch from '@/components/CompanyResearch';

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
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {company.company_name || t('company.detail.unnamedCompany')}
                </h1>
                <div className="flex items-center gap-2 text-gray-300 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{getFullAddress(company)}</span>
                </div>
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant={scoreVariant}>
                    {t('score.label')}: {nachfolgeScore}/10
                  </Badge>
                  {yearsSinceChange && yearsSinceChange > 10 && (
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
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getFullAddress(company))}`}
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

          </div>
        </div>

        {/* Full Width - Shareholders */}
        <div className="mt-8">
          <ShareholderInfo company={company} />
        </div>

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
