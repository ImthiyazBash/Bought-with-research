'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HamburgTarget } from '@/lib/types';
import { formatCurrency, getShortAddress, getCompanyNachfolgeScore, getScoreVariant, formatNumber } from '@/lib/utils';
import { getWzDescription } from '@/lib/wz-codes';
import { useTranslations } from '@/lib/i18n-context';
import Badge from './ui/Badge';

interface CompanyCardProps {
  company: HamburgTarget;
  isHovered?: boolean;
  onHover?: (id: number | null) => void;
}

export default function CompanyCard({ company, isHovered, onHover }: CompanyCardProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const score = getCompanyNachfolgeScore(company);
  const scoreVariant = getScoreVariant(score);
  const yearsSinceChange = company.last_ownership_change_year
    ? new Date().getFullYear() - company.last_ownership_change_year
    : null;

  return (
    <Link href={`/${locale}/company/${company.id}`}>
      <div
        className={`group bg-white rounded-xl border transition-all duration-200 cursor-pointer ${
          isHovered
            ? 'border-primary shadow-lg scale-[1.02]'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
        onMouseEnter={() => onHover?.(company.id)}
        onMouseLeave={() => onHover?.(null)}
      >
        {/* Header with gradient */}
        <div className="h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white font-semibold text-lg truncate">
              {company.company_name || t('company.detail.unnamedCompany')}
            </h3>
            <p className="text-gray-300 text-sm truncate">
              {getShortAddress(company)}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {company.source === 'google_places' ? (
              <Badge variant="neutral">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  Google Places
                </span>
              </Badge>
            ) : (
              <Badge variant={scoreVariant}>
                {t('score.label')}: {score}/10
              </Badge>
            )}
            {company.google_rating && (
              <Badge variant="warning">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  {company.google_rating} ({company.google_reviews_count})
                </span>
              </Badge>
            )}
            {company.source !== 'google_places' && yearsSinceChange && yearsSinceChange > 10 && (
              <Badge variant="neutral">
                {t('company.detail.yearsSinceChange').replace('{years}', yearsSinceChange.toString())}
              </Badge>
            )}
          </div>

          {/* Industry Classification */}
          {(company.wz_code || company.wz_description) && (
            <div className="mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-start gap-2">
                {company.wz_code && (
                  <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-gray-700 flex-shrink-0">
                    WZ {company.wz_code}
                  </span>
                )}
                {(() => {
                  const description = getWzDescription(
                    company.wz_code,
                    locale,
                    company.wz_description
                  );
                  return description ? (
                    <p className="text-xs text-gray-600 line-clamp-2 flex-1">
                      {description}
                    </p>
                  ) : null;
                })()}
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          {company.source === 'google_places' ? (
            <div className="space-y-2">
              {company.business_type && (
                <p className="text-xs text-gray-500">
                  {company.business_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </p>
              )}
              {company.tel && (
                <p className="text-xs text-gray-600 truncate">{company.tel}</p>
              )}
              {company.website && (
                <p className="text-xs text-indigo-600 truncate">{company.website.replace(/^https?:\/\//, '')}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <MetricItem
                label={t('company.card.equity')}
                value={formatCurrency(company.equity_eur)}
              />
              <MetricItem
                label={t('company.card.netIncome')}
                value={formatCurrency(company.net_income_eur)}
                isPositive={company.net_income_eur ? company.net_income_eur > 0 : undefined}
              />
              <MetricItem
                label={t('company.card.totalAssets')}
                value={formatCurrency(company.total_assets_eur)}
              />
              <MetricItem
                label={t('company.card.employees')}
                value={company.employee_count ? formatNumber(company.employee_count) : t('common.na')}
              />
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {t('company.card.dataFrom').replace('{year}', company.report_year?.toString() || t('common.na'))}
            </span>
            <span className="text-primary text-sm font-medium group-hover:underline">
              {t('company.card.viewDetails')} →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function MetricItem({
  label,
  value,
  isPositive,
}: {
  label: string;
  value: string;
  isPositive?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`text-sm font-semibold ${
          isPositive === true
            ? 'text-emerald-600'
            : isPositive === false
            ? 'text-red-600'
            : 'text-gray-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
