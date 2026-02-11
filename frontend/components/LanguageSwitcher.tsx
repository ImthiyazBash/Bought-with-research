'use client';

import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n';

interface LanguageSwitcherProps {
  currentLocale: string;
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Replace locale in path
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-1 border border-gray-300 rounded-full p-1 bg-white">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            currentLocale === loc
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
