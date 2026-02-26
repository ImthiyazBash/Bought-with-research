'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useTranslations } from '@/lib/i18n-context';
import LanguageSwitcher from './LanguageSwitcher';
import BuyerProfileModal from './BuyerProfileModal';

interface NavProps {
  locale: string;
}

export default function Nav({ locale }: NavProps) {
  const { user, profile, isLoading, signOut } = useAuth();
  const t = useTranslations();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [buyerProfileOpen, setBuyerProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
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
              <div className="relative" ref={dropdownRef}>
                {/* Avatar button */}
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium hover:opacity-90 transition-opacity"
                  aria-label="Profil-Menü"
                >
                  {(profile?.display_name || user.email || '?')[0].toUpperCase()}
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-10 w-52 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {profile?.display_name || user.email}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { setDropdownOpen(false); setBuyerProfileOpen(true); }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Käuferprofil bearbeiten
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); signOut(); }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {t('nav.signOut')}
                    </button>
                  </div>
                )}
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

      <BuyerProfileModal
        isOpen={buyerProfileOpen}
        onClose={() => setBuyerProfileOpen(false)}
        onSave={() => setBuyerProfileOpen(false)}
      />
    </>
  );
}
