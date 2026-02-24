'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { FilterState, HamburgTarget } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n-context';
import { buildWzTree } from '@/lib/wz-codes';
import WzTreeFilter from '@/components/WzTreeFilter';

interface SearchFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
  companies: HamburgTarget[];
}

export default function SearchFilters({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  companies,
}: SearchFiltersProps) {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const [isExpanded, setIsExpanded] = useState(false);
  const wzTree = useMemo(() => buildWzTree(companies), [companies]);

  const handleChange = (key: keyof FilterState, value: string | number | boolean | string[] | null) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      minEmployees: 0,
      maxEmployees: 1000,
      minEquity: 0,
      maxEquity: 50000000,
      minIncome: -1000000,
      maxIncome: 10000000,
      minNachfolgeScore: 1,
      selectedCity: null,
      selectedSector: null,
      selectedWzCodes: [],
      selectedSource: null,
      highSuccessionRiskOnly: false,
    });
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.minEmployees > 0 ||
    filters.maxEmployees < 1000 ||
    filters.minEquity > 0 ||
    filters.maxEquity < 50000000 ||
    filters.minIncome > -1000000 ||
    filters.maxIncome < 10000000 ||
    filters.minNachfolgeScore > 1 ||
    filters.selectedCity !== null ||
    filters.selectedWzCodes.length > 0 ||
    filters.selectedSource !== null;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="px-4 py-3">
        {/* Search and Quick Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={filters.searchQuery}
              onChange={(e) => handleChange('searchQuery', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* City Filter Chips */}
          <div className="flex gap-2">
            <button
              onClick={() => handleChange('selectedCity', null)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                filters.selectedCity === null
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {t('search.allCities')}
            </button>
            <button
              onClick={() => handleChange('selectedCity', 'Hamburg')}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                filters.selectedCity === 'Hamburg'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              Hamburg
            </button>
            <button
              onClick={() => handleChange('selectedCity', 'Buxtehude')}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                filters.selectedCity === 'Buxtehude'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              Buxtehude
            </button>
          </div>

          {/* Sector Tree Filter */}
          <WzTreeFilter
            selectedCodes={filters.selectedWzCodes}
            onSelectionChange={(codes) => handleChange('selectedWzCodes', codes)}
            locale={locale}
            tree={wzTree}
          />

          {/* Filter Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors flex items-center gap-2 ${
              isExpanded || hasActiveFilters
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {t('search.filters')}
            {hasActiveFilters && (
              <span className="bg-white text-gray-900 text-xs px-1.5 py-0.5 rounded-full">
                {[
                  filters.searchQuery,
                  filters.minEmployees > 0 || filters.maxEmployees < 1000,
                  filters.minEquity > 0 || filters.maxEquity < 50000000,
                  filters.minIncome > -1000000 || filters.maxIncome < 10000000,
                  filters.minNachfolgeScore > 1,
                  filters.selectedCity !== null,
                  filters.selectedWzCodes.length > 0,
                  filters.selectedSource !== null,
                ].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Results Count */}
          <span className="text-sm text-gray-500 ml-auto">
            {filteredCount === totalCount
              ? t('search.resultsCount').replace('{count}', totalCount.toString())
              : t('search.resultsCountFiltered').replace('{filtered}', filteredCount.toString()).replace('{total}', totalCount.toString())}
          </span>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {/* Source & Score Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Data Source Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filters.source')}
                </label>
                <div className="flex gap-2">
                  {[
                    { value: null, label: t('filters.allSources') },
                    { value: 'bundesanzeiger', label: t('company.detail.sourceBundesanzeiger') },
                    { value: 'google_places', label: t('company.detail.sourceGooglePlaces') },
                    { value: 'new_batch', label: t('filters.newBatch') },
                  ].map((option) => (
                    <button
                      key={option.value || 'all'}
                      onClick={() => handleChange('selectedSource', option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        filters.selectedSource === option.value
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nachfolge-Score Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filters.minScore')}: {filters.minNachfolgeScore}/10
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">1</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={filters.minNachfolgeScore}
                    onChange={(e) => handleChange('minNachfolgeScore', parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-xs text-gray-500">10</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('filters.scoreDescription')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Employees Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filters.employees')}: {filters.minEmployees} - {filters.maxEmployees}+
                </label>
                <div className="flex gap-3">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={filters.minEmployees}
                    onChange={(e) => handleChange('minEmployees', parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.maxEmployees}
                    onChange={(e) => handleChange('maxEmployees', parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                </div>
              </div>

              {/* Equity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filters.equity')}: {formatCurrency(filters.minEquity)} - {formatCurrency(filters.maxEquity)}
                </label>
                <div className="flex gap-3">
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={filters.minEquity}
                    onChange={(e) => handleChange('minEquity', parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <input
                    type="range"
                    min="0"
                    max="50000000"
                    step="500000"
                    value={filters.maxEquity}
                    onChange={(e) => handleChange('maxEquity', parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                </div>
              </div>

              {/* Net Income Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filters.income')}: {formatCurrency(filters.minIncome)} - {formatCurrency(filters.maxIncome)}
                </label>
                <div className="flex gap-3">
                  <input
                    type="range"
                    min="-1000000"
                    max="5000000"
                    step="50000"
                    value={filters.minIncome}
                    onChange={(e) => handleChange('minIncome', parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={filters.maxIncome}
                    onChange={(e) => handleChange('maxIncome', parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-sm text-primary hover:underline"
              >
                {t('search.clearAll')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
