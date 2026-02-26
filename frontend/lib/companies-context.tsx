'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from './supabase';
import { HamburgTarget } from './types';

interface CompaniesState {
  companies: HamburgTarget[];
  loading: boolean;
}

const CompaniesContext = createContext<CompaniesState>({
  companies: [],
  loading: true,
});

export function CompaniesProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<HamburgTarget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchCompanies() {
      try {
        const { data, error } = await supabase
          .from('Hamburg Targets')
          .select('*')
          .order('company_name', { ascending: true });
        if (cancelled) return;
        if (error) console.error('CompaniesProvider fetch error:', error);
        if (data) setCompanies(data as HamburgTarget[]);
      } catch (err) {
        console.error('CompaniesProvider fetch exception:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCompanies();
    return () => { cancelled = true; };
  }, []);

  return (
    <CompaniesContext.Provider value={{ companies, loading }}>
      {children}
    </CompaniesContext.Provider>
  );
}

export function useCompanies() {
  return useContext(CompaniesContext);
}
