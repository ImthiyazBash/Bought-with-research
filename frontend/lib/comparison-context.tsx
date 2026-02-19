'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ComparisonState {
  selectedIds: number[];
  isSelected: (id: number) => boolean;
  toggleCompare: (id: number) => void;
  clearAll: () => void;
  canAddMore: boolean;
}

const ComparisonContext = createContext<ComparisonState>({
  selectedIds: [],
  isSelected: () => false,
  toggleCompare: () => {},
  clearAll: () => {},
  canAddMore: true,
});

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const isSelected = useCallback(
    (id: number) => selectedIds.includes(id),
    [selectedIds]
  );

  const toggleCompare = useCallback((id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }, []);

  const clearAll = useCallback(() => setSelectedIds([]), []);
  const canAddMore = selectedIds.length < 4;

  return (
    <ComparisonContext.Provider value={{ selectedIds, isSelected, toggleCompare, clearAll, canAddMore }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  return useContext(ComparisonContext);
}
