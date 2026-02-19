'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { WzTreeNode, getLeafKeys } from '@/lib/wz-codes';
import { useTranslations } from '@/lib/i18n-context';

interface WzTreeFilterProps {
  selectedCodes: string[];
  onSelectionChange: (codes: string[]) => void;
  locale: string;
  tree: WzTreeNode[];
}

export default function WzTreeFilter({
  selectedCodes,
  onSelectionChange,
  locale,
  tree,
}: WzTreeFilterProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getLabel = useCallback(
    (node: WzTreeNode) => node[locale as 'de' | 'en'] || node.en,
    [locale]
  );

  // Filter tree based on search query
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return tree;
    const query = searchQuery.toLowerCase();

    function filterNode(node: WzTreeNode): WzTreeNode | null {
      const label = getLabel(node).toLowerCase();
      const keyMatch = node.key.toLowerCase().includes(query);
      const labelMatch = label.includes(query);

      if (node.children) {
        const filteredChildren = node.children
          .map(filterNode)
          .filter(Boolean) as WzTreeNode[];
        if (filteredChildren.length > 0 || labelMatch || keyMatch) {
          return { ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children };
        }
        return null;
      }

      return labelMatch || keyMatch ? node : null;
    }

    return tree.map(filterNode).filter(Boolean) as WzTreeNode[];
  }, [searchQuery, getLabel, tree]);

  // Auto-expand nodes when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const allKeys = new Set<string>();
      function collectKeys(nodes: WzTreeNode[]) {
        for (const node of nodes) {
          if (node.children) {
            allKeys.add(node.key);
            collectKeys(node.children);
          }
        }
      }
      collectKeys(filteredTree);
      setExpandedNodes(allKeys);
    }
  }, [searchQuery, filteredTree]);

  const toggleExpand = (key: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectedSet = useMemo(() => new Set(selectedCodes), [selectedCodes]);

  // Get checkbox state for a node
  function getCheckState(node: WzTreeNode): 'checked' | 'unchecked' | 'indeterminate' {
    const leaves = getLeafKeys(node);
    const checkedCount = leaves.filter((k) => selectedSet.has(k)).length;
    if (checkedCount === 0) return 'unchecked';
    if (checkedCount === leaves.length) return 'checked';
    return 'indeterminate';
  }

  // Toggle selection for a node
  function toggleNode(node: WzTreeNode) {
    const leaves = getLeafKeys(node);
    const state = getCheckState(node);
    if (state === 'checked') {
      // Uncheck all leaves of this node
      onSelectionChange(selectedCodes.filter((c) => !leaves.includes(c)));
    } else {
      // Check all leaves of this node
      const newCodes = new Set(selectedCodes);
      leaves.forEach((k) => newCodes.add(k));
      onSelectionChange(Array.from(newCodes));
    }
  }

  // Count selected leaf codes
  const selectedCount = selectedCodes.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`appearance-none pl-4 pr-10 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white cursor-pointer flex items-center gap-2 transition-colors ${
          selectedCount > 0
            ? 'border-primary text-primary font-medium'
            : 'border-gray-300 text-gray-700 hover:border-gray-400'
        }`}
      >
        <span>
          {selectedCount === 0
            ? t('filters.allSectors')
            : t('filters.sectorsSelected').replace('{count}', selectedCount.toString())}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full mt-1 left-0 w-80 max-h-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50 flex flex-col overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
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
              <input
                type="text"
                placeholder={t('filters.searchSectors')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Tree Content */}
          <div className="overflow-y-auto flex-1 p-2">
            {filteredTree.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                {t('search.noResults')}
              </p>
            ) : (
              filteredTree.map((node) => (
                <TreeNode
                  key={node.key}
                  node={node}
                  depth={0}
                  expandedNodes={expandedNodes}
                  toggleExpand={toggleExpand}
                  getCheckState={getCheckState}
                  toggleNode={toggleNode}
                  getLabel={getLabel}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {selectedCount > 0 && (
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={() => onSelectionChange([])}
                className="text-xs text-primary hover:underline w-full text-center py-1"
              >
                {t('search.clearAll')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tree Node Component ──────────────────────────────────

interface TreeNodeProps {
  node: WzTreeNode;
  depth: number;
  expandedNodes: Set<string>;
  toggleExpand: (key: string) => void;
  getCheckState: (node: WzTreeNode) => 'checked' | 'unchecked' | 'indeterminate';
  toggleNode: (node: WzTreeNode) => void;
  getLabel: (node: WzTreeNode) => string;
}

function TreeNode({
  node,
  depth,
  expandedNodes,
  toggleExpand,
  getCheckState,
  toggleNode,
  getLabel,
}: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.key);
  const checkState = getCheckState(node);

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {/* Expand/Collapse chevron */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(node.key);
            }}
            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-5 flex-shrink-0" />
        )}

        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleNode(node);
          }}
          className="w-4 h-4 flex-shrink-0 border rounded flex items-center justify-center transition-colors border-gray-300 hover:border-primary"
          style={{
            backgroundColor: checkState !== 'unchecked' ? 'var(--color-primary, #4F46E5)' : 'white',
            borderColor: checkState !== 'unchecked' ? 'var(--color-primary, #4F46E5)' : undefined,
          }}
        >
          {checkState === 'checked' && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {checkState === 'indeterminate' && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14" />
            </svg>
          )}
        </button>

        {/* Label */}
        <span
          className={`text-sm flex-1 ${
            depth === 0 ? 'font-medium text-gray-900' : 'text-gray-700'
          }`}
          onClick={() => {
            if (hasChildren) toggleExpand(node.key);
            else toggleNode(node);
          }}
        >
          {getLabel(node)}
        </span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.key}
              node={child}
              depth={depth + 1}
              expandedNodes={expandedNodes}
              toggleExpand={toggleExpand}
              getCheckState={getCheckState}
              toggleNode={toggleNode}
              getLabel={getLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
