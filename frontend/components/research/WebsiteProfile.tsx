'use client';

import type { WebsiteProfile as WebsiteProfileType, SearchResultEntry } from '@/lib/research-types';
import { useTranslations } from '@/lib/i18n-context';

interface WebsiteProfileProps {
  profile: WebsiteProfileType | null;
  isResearching: boolean;
  onStartResearch: () => void;
}

const SOCIAL_ICONS: Record<string, { icon: string; color: string }> = {
  linkedin: { icon: 'in', color: 'bg-[#0A66C2]' },
  xing: { icon: 'X', color: 'bg-[#006567]' },
  facebook: { icon: 'f', color: 'bg-[#1877F2]' },
  instagram: { icon: '📷', color: 'bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]' },
  youtube: { icon: '▶', color: 'bg-[#FF0000]' },
};

export default function WebsiteProfile({ profile, isResearching, onStartResearch }: WebsiteProfileProps) {
  const t = useTranslations();

  if (!profile || profile.crawl_status === 'pending') {
    return <EmptyState isResearching={isResearching} onStart={onStartResearch} t={t} />;
  }

  if (profile.crawl_status === 'crawling') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-medium">
            {t('research.website.crawling') || 'Crawling website...'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {t('research.website.crawlingDescription') || 'Discovering website, reading Impressum, extracting data'}
          </p>
        </div>
      </div>
    );
  }

  if (profile.crawl_status === 'not_found') {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700">
          {t('research.website.notFound') || 'No website found'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {t('research.website.notFoundDescription') || 'We could not find a website for this company.'}
        </p>
      </div>
    );
  }

  if (profile.crawl_status === 'failed') {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-red-700">
          {t('research.website.failed') || 'Website crawl failed'}
        </p>
        <p className="text-xs text-gray-500 mt-1">{profile.crawl_error}</p>
        <button onClick={onStartResearch} className="mt-3 text-sm text-indigo-600 hover:underline">
          {t('common.tryAgain') || 'Try Again'}
        </button>
      </div>
    );
  }

  // ── Completed State ──
  const socialEntries = Object.entries(profile.social_links || {}).filter(([, url]) => url);
  const hasImpressum = profile.impressum_data && Object.keys(profile.impressum_data).length > 0;
  const hasTeam = profile.team_members && profile.team_members.length > 0;
  const hasProducts = profile.products_services && profile.products_services.length > 0;
  const hasSearchResults = profile.search_results && profile.search_results.length > 0;

  return (
    <div className="space-y-6">
      {/* Website URL + Description */}
      <div>
        {profile.website_url && (
          <a
            href={profile.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors group mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="group-hover:underline">{profile.domain || profile.website_url}</span>
          </a>
        )}

        {profile.company_description && (
          <p className="text-sm text-gray-700 leading-relaxed">
            {profile.company_description}
          </p>
        )}
      </div>

      {/* Products & Services */}
      {hasProducts && (
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-2.5">
            {t('research.website.productsServices') || 'Products & Services'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.products_services.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Impressum Data */}
        {hasImpressum && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('research.website.impressum') || 'Impressum Data'}
            </h4>
            <dl className="space-y-2.5">
              {profile.impressum_data.geschaeftsfuehrer && (
                <ImpressumRow
                  label={t('research.website.managingDirector') || 'Managing Director'}
                  value={profile.impressum_data.geschaeftsfuehrer}
                />
              )}
              {profile.impressum_data.hrb_number && (
                <ImpressumRow
                  label={t('research.website.hrbNumber') || 'HRB Number'}
                  value={profile.impressum_data.hrb_number}
                />
              )}
              {profile.impressum_data.amtsgericht && (
                <ImpressumRow
                  label={t('research.website.court') || 'Registry Court'}
                  value={profile.impressum_data.amtsgericht}
                />
              )}
              {profile.impressum_data.ust_id && (
                <ImpressumRow
                  label={t('research.website.vatId') || 'VAT ID'}
                  value={profile.impressum_data.ust_id}
                />
              )}
            </dl>
            {profile.impressum_url && (
              <a
                href={profile.impressum_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 transition-colors"
              >
                {t('research.website.viewImpressum') || 'View Impressum'} →
              </a>
            )}
          </div>
        )}

        {/* Contact & Social */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {t('research.website.contact') || 'Contact & Social'}
          </h4>
          <div className="space-y-2.5">
            {profile.contact_email && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">✉</span>
                <a href={`mailto:${profile.contact_email}`} className="text-indigo-600 hover:underline">
                  {profile.contact_email}
                </a>
              </div>
            )}
            {profile.contact_phone && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">📞</span>
                <a href={`tel:${profile.contact_phone}`} className="text-gray-700 hover:text-indigo-600">
                  {profile.contact_phone}
                </a>
              </div>
            )}
            {socialEntries.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {socialEntries.map(([platform, url]) => {
                  const config = SOCIAL_ICONS[platform] || { icon: '🔗', color: 'bg-gray-500' };
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-8 h-8 rounded-lg ${config.color} text-white flex items-center justify-center text-xs font-bold hover:opacity-80 transition-opacity`}
                      title={platform}
                    >
                      {config.icon}
                    </a>
                  );
                })}
              </div>
            )}
            {!profile.contact_email && !profile.contact_phone && socialEntries.length === 0 && (
              <p className="text-xs text-gray-400 italic">
                {t('research.website.noContactFound') || 'No contact information found'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Team Members */}
      {hasTeam && (
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3">
            {t('research.website.teamMembers') || 'Team Members Found'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {profile.team_members.map((member, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm flex-shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                  {member.role && (
                    <p className="text-xs text-gray-500 truncate">{member.role}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Web Presence — Search Results */}
      {hasSearchResults && (
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {t('research.website.webPresence') || 'Web Presence'}
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
              {profile.search_results.length}
            </span>
          </h4>
          <div className="space-y-3">
            {profile.search_results.map((result, i) => (
              <SearchResultCard key={i} result={result} isMain={result.link === profile.website_url} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchResultCard({ result, isMain }: { result: SearchResultEntry; isMain: boolean }) {
  let hostname = '';
  try {
    hostname = new URL(result.link).hostname.replace('www.', '');
  } catch {
    hostname = result.link;
  }

  return (
    <div className={`rounded-lg border p-3.5 transition-colors ${
      isMain ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{hostname}</span>
            {isMain && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700">
                Main Site
              </span>
            )}
          </div>
          <a
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-indigo-700 hover:text-indigo-900 hover:underline line-clamp-1"
          >
            {result.title}
          </a>
          {result.snippet && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
              {result.snippet}
            </p>
          )}
          {result.sitelinks && result.sitelinks.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              {result.sitelinks.map((sl, j) => (
                <a
                  key={j}
                  href={sl.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-indigo-500 hover:text-indigo-700 hover:underline"
                >
                  {sl.title}
                </a>
              ))}
            </div>
          )}
        </div>
        <a
          href={result.link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:border-indigo-300 transition-colors"
        >
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function ImpressumRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <dt className="text-xs text-gray-500 flex-shrink-0">{label}</dt>
      <dd className="text-xs font-medium text-gray-800 text-right">{value}</dd>
    </div>
  );
}

function EmptyState({
  isResearching,
  onStart,
  t,
}: {
  isResearching: boolean;
  onStart: () => void;
  t: (key: string) => string;
}) {
  return (
    <div className="text-center py-10">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      </div>
      <h4 className="text-sm font-semibold text-gray-800 mb-1">
        {t('research.website.emptyTitle') || 'No website data yet'}
      </h4>
      <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
        {t('research.website.emptyDescription') || 'Run research to discover the company website, extract Impressum data, find team members, and identify products/services.'}
      </p>
      <button
        onClick={onStart}
        disabled={isResearching}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {isResearching ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {t('research.researching') || 'Researching...'}
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {t('research.website.discover') || 'Discover Website'}
          </>
        )}
      </button>
    </div>
  );
}
