'use client';

import { useState } from 'react';
import type { ShareholderBackground } from '@/lib/research-types';
import type { HamburgTarget } from '@/lib/types';
import { parseShareholders, getScoreVariant } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n-context';
import Badge from '@/components/ui/Badge';

interface ShareholderBackgroundsProps {
  backgrounds: ShareholderBackground[];
  company: HamburgTarget;
  isResearching: boolean;
  onStartResearch: () => void;
}

export default function ShareholderBackgrounds({
  backgrounds,
  company,
  isResearching,
  onStartResearch,
}: ShareholderBackgroundsProps) {
  const t = useTranslations();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const shareholders = parseShareholders(company);

  if (backgrounds.length === 0 && !isResearching) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-gray-800 mb-1">
          {t('research.shareholders.emptyTitle') || 'No shareholder research yet'}
        </h4>
        <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
          {t('research.shareholders.emptyDescription') || 'Run research to discover other companies, Handelsregister entries, LinkedIn profiles, and cross-references for each shareholder.'}
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
              {t('research.researching') || 'Researching...'}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t('research.shareholders.investigate') || 'Investigate Shareholders'}
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center gap-3 text-xs text-gray-500 pb-2">
        <span>{backgrounds.length} {t('research.shareholders.investigated') || 'shareholders investigated'}</span>
        {backgrounds.some(b => b.cross_references.length > 0) && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {t('research.shareholders.crossRefsFound') || 'Cross-references found'}
          </span>
        )}
      </div>

      {/* Shareholder Cards */}
      {backgrounds.map((bg, index) => {
        const isExpanded = expandedIndex === index;
        const sh = shareholders.find(s => s.name === bg.shareholder_name);
        const isCompany = bg.enrichment_status === 'is_company';
        const isFailed = bg.enrichment_status === 'failed';
        const isPending = bg.enrichment_status === 'pending' || bg.enrichment_status === 'enriching';

        return (
          <div
            key={bg.id}
            className={`border rounded-lg overflow-hidden transition-all ${
              isExpanded ? 'border-indigo-200 shadow-sm' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Header - Always visible */}
            <button
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50/50 transition-colors"
            >
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
                isCompany ? 'bg-gray-700' : 'bg-indigo-500'
              }`}>
                {isCompany ? '🏢' : bg.shareholder_name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 text-sm truncate">
                    {bg.shareholder_name}
                  </span>
                  {isCompany && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 uppercase">
                      {t('research.shareholders.entityType') || 'Company'}
                    </span>
                  )}
                  {sh && (
                    <Badge variant={getScoreVariant(sh.nachfolgeScore)}>
                      {sh.nachfolgeScore}/10
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  {sh?.age && <span>{sh.age} {t('common.years') || 'years'}</span>}
                  {sh?.percentage && <span>{sh.percentage}%</span>}
                  {bg.other_companies.length > 0 && (
                    <span className="text-indigo-500">
                      {bg.other_companies.length} {t('research.shareholders.otherCompanies') || 'other companies'}
                    </span>
                  )}
                  {bg.cross_references.length > 0 && (
                    <span className="text-amber-600 font-medium">
                      ⚡ {bg.cross_references.length} {t('research.shareholders.crossRefs') || 'cross-ref'}
                    </span>
                  )}
                  {isPending && (
                    <span className="text-amber-500 animate-pulse">
                      {t('research.shareholders.pending') || 'Researching...'}
                    </span>
                  )}
                  {isFailed && (
                    <span className="text-red-500">
                      {t('research.shareholders.failed') || 'Failed'}
                    </span>
                  )}
                </div>
              </div>

              {/* Social links (quick access) */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {bg.linkedin_url && (
                  <a
                    href={bg.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-md bg-[#0A66C2] text-white flex items-center justify-center text-[10px] font-bold hover:opacity-80 transition-opacity"
                    title="LinkedIn"
                  >
                    in
                  </a>
                )}
                {bg.xing_url && (
                  <a
                    href={bg.xing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-md bg-[#006567] text-white flex items-center justify-center text-[10px] font-bold hover:opacity-80 transition-opacity"
                    title="XING"
                  >
                    X
                  </a>
                )}
              </div>

              {/* Expand icon */}
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-100 space-y-4">
                {/* Bio Summary */}
                {bg.bio_summary && (
                  <div className="mt-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                    <p className="text-xs text-gray-700 leading-relaxed italic">
                      "{bg.bio_summary}"
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">— AI-generated summary based on public sources</p>
                  </div>
                )}

                {/* Cross-References (highlighted) */}
                {bg.cross_references.length > 0 && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <h5 className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      {t('research.shareholders.crossReferencesTitle') || 'Also appears in your database'}
                    </h5>
                    <div className="space-y-1.5">
                      {bg.cross_references.map((ref, i) => (
                        <a
                          key={i}
                          href={`/en/company/${ref.company_id || ref.id}`}
                          className="flex items-center gap-2 text-xs text-amber-900 hover:text-indigo-700 transition-colors"
                        >
                          <span className="w-1 h-1 rounded-full bg-amber-400" />
                          {ref.company_name}
                          <svg className="w-3 h-3 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Companies */}
                {bg.other_companies.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-gray-700 mb-2">
                      {isCompany
                        ? (t('research.shareholders.relatedInfo') || 'Related Information')
                        : (t('research.shareholders.otherCompaniesTitle') || 'Other Business Activities')}
                    </h5>
                    <div className="space-y-2">
                      {bg.other_companies.map((oc, i) => (
                        <div key={i} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium text-gray-800 line-clamp-1">{oc.name}</p>
                            {oc.source_url && (
                              <a
                                href={oc.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-indigo-500 transition-colors flex-shrink-0"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>
                          {oc.snippet && (
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{oc.snippet}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Handelsregister */}
                {bg.handelsregister_entries.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-gray-700 mb-2">
                      {t('research.shareholders.handelsregister') || 'Handelsregister Entries'}
                    </h5>
                    <div className="space-y-1.5">
                      {bg.handelsregister_entries.map((entry, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                            {entry.hrb_number}
                          </span>
                          {entry.court && <span className="text-gray-500">{entry.court}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status footer */}
                {bg.enriched_at && (
                  <p className="text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                    {t('research.shareholders.enrichedAt') || 'Data collected'}:{' '}
                    {new Date(bg.enriched_at).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                )}

                {isFailed && bg.enrichment_error && (
                  <p className="text-[10px] text-red-400 pt-2">
                    Error: {bg.enrichment_error}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
