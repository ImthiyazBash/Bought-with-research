'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { HamburgTarget, FilterState } from '@/lib/types';
import { getCompanyNachfolgeScore } from '@/lib/utils';
import { getWzSector } from '@/lib/wz-codes';
import { useTranslations } from '@/lib/i18n-context';
import CompanyCard from '@/components/CompanyCard';
import CompanyMap from '@/components/CompanyMap';
import SearchFilters from '@/components/SearchFilters';

export const dynamic = 'force-dynamic';

const initialFilters: FilterState = {
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
  highSuccessionRiskOnly: false,
};

function HomeContent() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const [companies, setCompanies] = useState<HamburgTarget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [hoveredCompanyId, setHoveredCompanyId] = useState<number | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  // Load filters from URL on mount
  useEffect(() => {
    const urlFilters: FilterState = { ...initialFilters };

    const query = searchParams.get('q');
    if (query) urlFilters.searchQuery = query;

    const minEmp = searchParams.get('minEmp');
    if (minEmp) urlFilters.minEmployees = parseInt(minEmp);

    const maxEmp = searchParams.get('maxEmp');
    if (maxEmp) urlFilters.maxEmployees = parseInt(maxEmp);

    const minEq = searchParams.get('minEq');
    if (minEq) urlFilters.minEquity = parseInt(minEq);

    const maxEq = searchParams.get('maxEq');
    if (maxEq) urlFilters.maxEquity = parseInt(maxEq);

    const minInc = searchParams.get('minInc');
    if (minInc) urlFilters.minIncome = parseInt(minInc);

    const maxInc = searchParams.get('maxInc');
    if (maxInc) urlFilters.maxIncome = parseInt(maxInc);

    const minScore = searchParams.get('minScore');
    if (minScore) urlFilters.minNachfolgeScore = parseInt(minScore);

    const city = searchParams.get('city');
    if (city) urlFilters.selectedCity = city;

    const sector = searchParams.get('sector');
    if (sector) urlFilters.selectedSector = sector;

    setFilters(urlFilters);
  }, [searchParams]);

  // Update URL when filters change
  const updateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);

    // Build query string
    const params = new URLSearchParams();

    if (newFilters.searchQuery) params.set('q', newFilters.searchQuery);
    if (newFilters.minEmployees !== initialFilters.minEmployees) params.set('minEmp', newFilters.minEmployees.toString());
    if (newFilters.maxEmployees !== initialFilters.maxEmployees) params.set('maxEmp', newFilters.maxEmployees.toString());
    if (newFilters.minEquity !== initialFilters.minEquity) params.set('minEq', newFilters.minEquity.toString());
    if (newFilters.maxEquity !== initialFilters.maxEquity) params.set('maxEq', newFilters.maxEquity.toString());
    if (newFilters.minIncome !== initialFilters.minIncome) params.set('minInc', newFilters.minIncome.toString());
    if (newFilters.maxIncome !== initialFilters.maxIncome) params.set('maxInc', newFilters.maxIncome.toString());
    if (newFilters.minNachfolgeScore !== initialFilters.minNachfolgeScore) params.set('minScore', newFilters.minNachfolgeScore.toString());
    if (newFilters.selectedCity) params.set('city', newFilters.selectedCity);
    if (newFilters.selectedSector) params.set('sector', newFilters.selectedSector);

    // Update URL without reloading page
    const queryString = params.toString();
    const newUrl = queryString ? `/${locale}?${queryString}` : `/${locale}`;
    router.replace(newUrl, { scroll: false });
  };

  // Fetch companies from Supabase
  useEffect(() => {
    async function fetchCompanies() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('Hamburg Targets')
          .select('*')
          .order('company_name', { ascending: true });

        if (error) throw error;
        setCompanies(data || []);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  // Calculate data completeness score for sorting
  const getCompletenessScore = (company: HamburgTarget): number => {
    let score = 0;

    // Core business data (most important)
    if (company.company_name) score += 2;
    if (company.employee_count && company.employee_count > 0) score += 3;
    if (company.equity_eur && company.equity_eur !== 0) score += 3;
    if (company.net_income_eur !== null && company.net_income_eur !== 0) score += 3;
    if (company.total_assets_eur && company.total_assets_eur > 0) score += 2;

    // Financial details
    if (company.retained_earnings_eur !== null && company.retained_earnings_eur !== 0) score += 1;
    if (company.liabilities_eur && company.liabilities_eur > 0) score += 1;
    if (company.receivables_eur !== null && company.receivables_eur !== 0) score += 1;
    if (company.cash_assets_eur !== null && company.cash_assets_eur !== 0) score += 1;

    // Location data
    if (company.address_street) score += 2;
    if (company.address_zip) score += 1;
    if (company.address_city) score += 2;
    if (company.address_country) score += 1;

    // Industry classification
    if (company.wz_code) score += 2;
    if (company.wz_description) score += 1;

    // Shareholder data
    if (company.shareholder_details && company.shareholder_details.length > 0) score += 3;
    else if (company.shareholder_names) score += 2;
    if (company.shareholder_dobs) score += 2;
    if (company.last_ownership_change_year) score += 2;

    // Data recency
    if (company.report_year && company.report_year >= 2020) score += 2;
    else if (company.report_year && company.report_year >= 2015) score += 1;

    return score;
  };

  // Filter and sort companies
  const filteredCompanies = useMemo(() => {
    const filtered = companies.filter((company) => {
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const nameMatch = company.company_name?.toLowerCase().includes(query);
        const cityMatch = company.address_city?.toLowerCase().includes(query);
        if (!nameMatch && !cityMatch) return false;
      }

      // Employee count
      const employees = company.employee_count || 0;
      if (employees < filters.minEmployees || employees > filters.maxEmployees) {
        return false;
      }

      // Equity
      const equity = company.equity_eur || 0;
      if (equity < filters.minEquity || equity > filters.maxEquity) {
        return false;
      }

      // Net income
      const income = company.net_income_eur || 0;
      if (income < filters.minIncome || income > filters.maxIncome) {
        return false;
      }

      // Nachfolge-Score filter
      const score = getCompanyNachfolgeScore(company);
      if (score < filters.minNachfolgeScore) {
        return false;
      }

      // City filter
      if (filters.selectedCity && company.address_city !== filters.selectedCity) {
        return false;
      }

      // Sector filter
      if (filters.selectedSector) {
        const companySector = getWzSector(company.wz_code);
        if (companySector !== filters.selectedSector) {
          return false;
        }
      }

      return true;
    });

    // Sort by completeness score (highest first), then by Nachfolge-Score, then by name
    return filtered.sort((a, b) => {
      const scoreA = getCompletenessScore(a);
      const scoreB = getCompletenessScore(b);

      // Primary sort: completeness score
      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      // Secondary sort: Nachfolge-Score (higher is better)
      const nachfolgeA = getCompanyNachfolgeScore(a);
      const nachfolgeB = getCompanyNachfolgeScore(b);
      if (nachfolgeB !== nachfolgeA) {
        return nachfolgeB - nachfolgeA;
      }

      // Tertiary sort: company name
      return (a.company_name || '').localeCompare(b.company_name || '');
    });
  }, [companies, filters]);

  const handleMarkerClick = (company: HamburgTarget) => {
    router.push(`/${locale}/company/${company.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('common.error')}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Filters */}
      <SearchFilters
        filters={filters}
        onFiltersChange={updateFilters}
        totalCount={companies.length}
        filteredCount={filteredCompanies.length}
      />

      {/* Mobile View Toggle - Only visible on mobile */}
      <div className="lg:hidden sticky top-[calc(4rem+3.5rem)] z-30 bg-gray-100 border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setMobileView('list')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              mobileView === 'list'
                ? 'bg-white text-gray-900 border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {t('search.listView')}
            </div>
          </button>
          <button
            onClick={() => setMobileView('map')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              mobileView === 'map'
                ? 'bg-white text-gray-900 border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              {t('search.mapView')}
            </div>
          </button>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Company List - Show on desktop always, on mobile only when list view selected */}
        <div className={`w-full lg:w-1/2 overflow-y-auto p-4 bg-gray-50 ${mobileView === 'map' ? 'hidden lg:block' : ''}`}>
          {filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-gray-400 text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('search.noResults')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('search.noResultsDescription')}
              </p>
              <button
                onClick={() => updateFilters(initialFilters)}
                className="text-primary hover:underline"
              >
                {t('search.clearAll')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  isHovered={hoveredCompanyId === company.id}
                  onHover={setHoveredCompanyId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Map - Show on desktop always, on mobile only when map view selected */}
        <div className={`w-full lg:w-1/2 sticky top-0 ${mobileView === 'list' ? 'hidden lg:block' : ''}`}>
          <CompanyMap
            companies={filteredCompanies}
            hoveredCompanyId={hoveredCompanyId}
            selectedCity={filters.selectedCity}
            onMarkerClick={handleMarkerClick}
            onMarkerHover={setHoveredCompanyId}
          />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
