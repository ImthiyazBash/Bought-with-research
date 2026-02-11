'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HamburgTarget } from '@/lib/types';
import { useTranslations } from '@/lib/i18n-context';
import { fetchCompanyResearch, triggerResearch, isResearchStale } from '@/lib/research';
import type { CompanyResearchData } from '@/lib/research-types';
import WebsiteProfile from './research/WebsiteProfile';
import MediaMentions from './research/MediaMentions';
import ShareholderBackgrounds from './research/ShareholderBackgrounds';

interface CompanyResearchProps {
  company: HamburgTarget;
}

type TabKey = 'website' | 'media' | 'shareholders';

const TAB_ICONS: Record<TabKey, React.ReactElement> = {
  website: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  media: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  shareholders: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

export default function CompanyResearch({ company }: CompanyResearchProps) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<TabKey>('website');
  const [data, setData] = useState<CompanyResearchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResearching, setIsResearching] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async () => {
    try {
      const researchData = await fetchCompanyResearch(company.id);
      setData(researchData);
      return researchData;
    } catch (err) {
      console.error('Failed to load research data:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [company.id]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling while research is in progress
  useEffect(() => {
    if (data?.status?.overall_status === 'in_progress') {
      const interval = setInterval(async () => {
        const updated = await loadData();
        if (updated?.status?.overall_status !== 'in_progress') {
          clearInterval(interval);
          setIsResearching(false);
        }
      }, 5000);
      setPollingInterval(interval);
      return () => clearInterval(interval);
    }
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [data?.status?.overall_status, loadData]);

  const handleStartResearch = async (modules?: TabKey[]) => {
    setIsResearching(true);
    setResearchError(null);

    const result = await triggerResearch(
      company.id,
      modules || ['website', 'media', 'shareholders']
    );

    if (!result.success) {
      setResearchError(result.error || 'Research failed');
      setIsResearching(false);
      return;
    }

    // Start polling
    await loadData();
  };

  const hasAnyData = data && (
    data.website?.crawl_status === 'completed' ||
    data.mediaMentions.length > 0 ||
    data.shareholderBackgrounds.length > 0
  );

  const isStale = data?.status ? isResearchStale(data.status.completed_at) : true;
  const isInProgress = data?.status?.overall_status === 'in_progress' || isResearching;

  // Tab status indicators
  const getTabStatus = (tab: TabKey): 'ready' | 'empty' | 'loading' | 'error' => {
    if (isInProgress) return 'loading';
    if (!data) return 'empty';
    switch (tab) {
      case 'website':
        if (data.website?.crawl_status === 'completed') return 'ready';
        if (data.website?.crawl_status === 'failed') return 'error';
        return 'empty';
      case 'media':
        if (data.mediaMentions.length > 0) return 'ready';
        if (data.mediaSearch?.search_status === 'failed') return 'error';
        return 'empty';
      case 'shareholders':
        if (data.shareholderBackgrounds.some(s => s.enrichment_status === 'completed' || s.enrichment_status === 'is_company'))
          return 'ready';
        if (data.shareholderBackgrounds.some(s => s.enrichment_status === 'failed')) return 'error';
        return 'empty';
    }
  };

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    {
      key: 'website',
      label: t('research.tabs.website') || 'Website Profile',
    },
    {
      key: 'media',
      label: t('research.tabs.media') || 'Media & News',
      count: data?.mediaMentions.length || 0,
    },
    {
      key: 'shareholders',
      label: t('research.tabs.shareholders') || 'Shareholder Background',
      count: data?.shareholderBackgrounds.filter(s =>
        s.enrichment_status === 'completed' || s.enrichment_status === 'is_company'
      ).length || 0,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <svg className="w-4.5 h-4.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('research.title') || 'Company Research'}
              </h3>
              {isInProgress && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {t('research.inProgress') || 'Researching...'}
                </span>
              )}
              {hasAnyData && !isInProgress && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {t('research.completed') || 'Data Available'}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {t('research.subtitle') || 'Website crawl, media mentions, and shareholder background checks'}
            </p>
          </div>

          <button
            onClick={() => handleStartResearch()}
            disabled={isInProgress}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow"
          >
            {isInProgress ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('research.researching') || 'Researching...'}
              </>
            ) : hasAnyData ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('research.refresh') || 'Refresh Research'}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {t('research.start') || 'Start Research'}
              </>
            )}
          </button>
        </div>

        {researchError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{researchError}</p>
          </div>
        )}

        {data?.status?.completed_at && !isInProgress && (
          <p className="mt-2 text-xs text-gray-400">
            {t('research.lastUpdated') || 'Last updated'}: {new Date(data.status.completed_at).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {isStale && (
              <span className="ml-2 text-amber-500">
                ({t('research.staleWarning') || 'Data may be outdated'})
              </span>
            )}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50/50">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const status = getTabStatus(tab.key);
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className={isActive ? 'text-indigo-600' : 'text-gray-400'}>
                  {TAB_ICONS[tab.key]}
                </span>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {status === 'loading' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
                {status === 'error' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">{t('common.loading') || 'Loading'}...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'website' && (
              <WebsiteProfile
                profile={data?.website || null}
                isResearching={isInProgress}
                onStartResearch={() => handleStartResearch(['website'])}
              />
            )}
            {activeTab === 'media' && (
              <MediaMentions
                mentions={data?.mediaMentions || []}
                searchStatus={data?.mediaSearch || null}
                isResearching={isInProgress}
                onStartResearch={() => handleStartResearch(['media'])}
              />
            )}
            {activeTab === 'shareholders' && (
              <ShareholderBackgrounds
                backgrounds={data?.shareholderBackgrounds || []}
                company={company}
                isResearching={isInProgress}
                onStartResearch={() => handleStartResearch(['shareholders'])}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
