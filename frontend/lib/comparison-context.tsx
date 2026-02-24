'use client';

import { ReactNode, useSyncExternalStore, useCallback } from 'react';

// Module-level store — no context re-renders
let selectedIds: number[] = [];
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach(l => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function getSelectedIds() {
  return selectedIds;
}

function toggleCompare(id: number) {
  if (selectedIds.includes(id)) {
    selectedIds = selectedIds.filter(x => x !== id);
  } else if (selectedIds.length < 4) {
    selectedIds = [...selectedIds, id];
  } else {
    return; // at max, no change
  }
  emitChange();
}

function clearAll() {
  if (selectedIds.length === 0) return;
  selectedIds = [];
  emitChange();
}

// Hook: only re-renders when THIS company's selected boolean changes
export function useIsCompareSelected(companyId: number): boolean {
  return useSyncExternalStore(
    subscribe,
    () => selectedIds.includes(companyId),
    () => false // server snapshot
  );
}

// Hook: re-renders when the count changes (for ComparisonBar)
export function useCompareSelectedIds(): number[] {
  return useSyncExternalStore(subscribe, getSelectedIds, () => []);
}

export function useCanAddMore(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => selectedIds.length < 4,
    () => true
  );
}

// Stable action references (never change)
export function useCompareActions() {
  return { toggleCompare, clearAll };
}

// Keep the provider as a pass-through so layout.tsx doesn't need changes
export function ComparisonProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Legacy hook — still works but prefer the granular hooks above
export function useComparison() {
  const ids = useCompareSelectedIds();
  const canAddMore = useCanAddMore();
  const isSelected = useCallback((id: number) => ids.includes(id), [ids]);
  return { selectedIds: ids, isSelected, toggleCompare, clearAll, canAddMore };
}
