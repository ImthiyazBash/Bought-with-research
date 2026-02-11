'use client';

import { useState, useMemo } from 'react';
import type { MediaMention, MediaSearchStatus } from '@/lib/research-types';
import { useTranslations } from '@/lib/i18n-context';

interface MediaMentionsProps {
  mentions: MediaMention[];
  searchStatus: MediaSearchStatus | null;
  isResearching: boolean;
  onStartResearch: () => void;
}

type MentionFilter = 'all' | 'company' | 'shareholder' | 'industry';

export default function MediaMentions({
  mentions,
  searchStatus,
  isResearching,
  onStartResearch,
}: MediaMentionsProps) {
  const t = useTranslations();
  const [filter, setFilter] = useState<MentionFilter>('all');

  const filteredMentions = useMemo(() => {
    if (filter === 'all') return mentions;
    return mentions.filter((m) => m.mention_type === filter);
  }, [mentions, filter]);

  const counts = useMemo(() => ({
    all: mentions.length,
    company: mentions.filter((m) => m.mention_type === 'company').length,
    shareholder: mentions.filter((m) => m.mention_type === 'shareholder').length,
    industry: mentions.filter((m) => m.mention_type === 'industry').length,
  }), [mentions]);

  if (mentions.length === 0 && !isResearching) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-gray-800 mb-1">
          {t('research.media.emptyTitle') || 'No media mentions yet'}
        </h4>
        <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
          {t('research.media.emptyDescription') || 'Run research to search for news articles, press releases, and public mentions of this company and its shareholders.'}
        </p>
        <button
          onClick={onStartResearch}
          disabled={isResearching}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isResearching ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t('research.researching') || 'Searching...'}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t('research.media.search') || 'Search Media'}
            </>
          )}
        </button>
      </div>
    );
  }

  const FILTER_LABELS: Record<MentionFilter, string> = {
    all: t('research.media.filterAll') || 'All',
    company: t('research.media.filterCompany') || 'Company',
    shareholder: t('research.media.filterShareholder') || 'Shareholder',
    industry: t('research.media.filterIndustry') || 'Industry',
  };

  const TYPE_COLORS: Record<string, string> = {
    company: 'bg-blue-100 text-blue-700',
    shareholder: 'bg-purple-100 text-purple-700',
    industry: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {(Object.keys(FILTER_LABELS) as MentionFilter[]).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === key
                ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {FILTER_LABELS[key]}
            {counts[key] > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                filter === key ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-500'
              }`}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* AI Summary */}
      {searchStatus?.media_summary && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-indigo-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-xs font-semibold text-indigo-900 uppercase tracking-wide">
              {t('research.media.summary') || 'AI Summary'}
            </h4>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {searchStatus.media_summary}
          </p>
        </div>
      )}

      {/* Search Info */}
      {searchStatus?.last_searched_at && (
        <p className="text-xs text-gray-400">
          {t('research.media.searchedAt') || 'Searched'}:{' '}
          {new Date(searchStatus.last_searched_at).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
          {' · '}
          {searchStatus.mentions_found} {t('research.media.resultsFound') || 'results found'}
        </p>
      )}

      {/* Mentions List */}
      <div className="space-y-3">
        {filteredMentions.map((mention) => (
          <MentionCard key={mention.id} mention={mention} typeColors={TYPE_COLORS} t={t} />
        ))}
      </div>

      {filteredMentions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            {t('research.media.noResults') || 'No mentions match this filter.'}
          </p>
        </div>
      )}
    </div>
  );
}

function MentionCard({
  mention,
  typeColors,
  t,
}: {
  mention: MediaMention;
  typeColors: Record<string, string>;
  t: (key: string) => string;
}) {
  const colorClass = typeColors[mention.mention_type] || 'bg-gray-100 text-gray-700';
  const sourceDomain = mention.source || (mention.url ? new URL(mention.url).hostname : null);

  return (
    <div className="group relative bg-white border border-gray-150 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3">
        {/* Source favicon placeholder */}
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs font-bold text-gray-400 uppercase">
            {(sourceDomain || '?').charAt(0)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {mention.url ? (
                <a
                  href={mention.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2"
                >
                  {mention.title}
                </a>
              ) : (
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{mention.title}</p>
              )}
            </div>

            <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${colorClass}`}>
              {mention.mention_type}
            </span>
          </div>

          {mention.snippet && (
            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
              {mention.snippet}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2.5">
            {sourceDomain && (
              <span className="text-[11px] text-gray-400 font-medium">
                {sourceDomain}
              </span>
            )}
            {mention.published_at && (
              <span className="text-[11px] text-gray-400">
                {new Date(mention.published_at).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
            {mention.related_shareholder && (
              <span className="text-[11px] text-purple-500 font-medium">
                → {mention.related_shareholder}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
