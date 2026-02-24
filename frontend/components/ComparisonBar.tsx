'use client';

import { useCompareSelectedIds, useCompareActions } from '@/lib/comparison-context';
import { useTranslations } from '@/lib/i18n-context';
import { usePathname, useRouter } from 'next/navigation';

export default function ComparisonBar() {
  const selectedIds = useCompareSelectedIds();
  const { clearAll } = useCompareActions();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const router = useRouter();

  if (selectedIds.length === 0) return null;

  const handleCompare = () => {
    const params = selectedIds.join(',');
    router.push(`/${locale}/compare?ids=${params}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-2xl z-40">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-900">
            {t('compare.selected').replace('{count}', selectedIds.length.toString())}
          </span>
          <button onClick={clearAll} className="ml-3 text-xs text-gray-500 hover:text-gray-700 underline">
            {t('compare.clearAll')}
          </button>
        </div>
        <button
          onClick={handleCompare}
          disabled={selectedIds.length < 2}
          className="bg-primary text-white font-medium px-6 py-2.5 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('compare.compareNow')}
        </button>
      </div>
    </div>
  );
}
