'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useTranslations } from '@/lib/i18n-context';
import LanguageSwitcher from './LanguageSwitcher';

interface NavProps {
  locale: string;
}

export default function Nav({ locale }: NavProps) {
  const { user, profile, isLoading, signOut } = useAuth();
  const t = useTranslations();

  return (
    <nav className="border-b border-gray-200 bg-white fixed top-0 left-0 right-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">{t('nav.title')}</span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user && (
              <Link
                href={`/${locale}/saved`}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {t('nav.saved')}
              </Link>
            )}

            <LanguageSwitcher currentLocale={locale} />

            {isLoading ? (
              <div className="w-20 h-9 bg-gray-100 rounded-full animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                  {(profile?.display_name || user.email || '?')[0].toUpperCase()}
                </div>
                <button
                  onClick={signOut}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  {t('nav.signOut')}
                </button>
              </div>
            ) : (
              <Link
                href={`/${locale}/auth/signin`}
                className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
              >
                {t('nav.signIn')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
