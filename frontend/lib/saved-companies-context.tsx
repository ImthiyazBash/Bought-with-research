'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth-context';

interface SavedCompaniesState {
  savedIds: Set<number>;
  isLoading: boolean;
  isSaved: (companyId: number) => boolean;
  toggleSave: (companyId: number) => Promise<void>;
}

const SavedCompaniesContext = createContext<SavedCompaniesState>({
  savedIds: new Set(),
  isLoading: false,
  isSaved: () => false,
  toggleSave: async () => {},
});

export function SavedCompaniesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }

    setIsLoading(true);
    supabase
      .from('saved_companies')
      .select('company_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setSavedIds(new Set((data || []).map(d => d.company_id)));
        setIsLoading(false);
      });
  }, [user]);

  const isSaved = useCallback(
    (companyId: number) => savedIds.has(companyId),
    [savedIds]
  );

  const toggleSave = useCallback(async (companyId: number) => {
    if (!user) return;

    const currentlySaved = savedIds.has(companyId);

    // Optimistic update
    setSavedIds(prev => {
      const next = new Set(prev);
      if (currentlySaved) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });

    try {
      if (currentlySaved) {
        await supabase
          .from('saved_companies')
          .delete()
          .eq('user_id', user.id)
          .eq('company_id', companyId);
      } else {
        await supabase
          .from('saved_companies')
          .insert({ user_id: user.id, company_id: companyId });
      }
    } catch {
      // Revert on error
      setSavedIds(prev => {
        const next = new Set(prev);
        if (currentlySaved) {
          next.add(companyId);
        } else {
          next.delete(companyId);
        }
        return next;
      });
    }
  }, [user, savedIds]);

  return (
    <SavedCompaniesContext.Provider value={{ savedIds, isLoading, isSaved, toggleSave }}>
      {children}
    </SavedCompaniesContext.Provider>
  );
}

export function useSavedCompanies() {
  return useContext(SavedCompaniesContext);
}
