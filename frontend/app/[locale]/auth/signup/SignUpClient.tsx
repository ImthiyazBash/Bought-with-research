'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTranslations } from '@/lib/i18n-context';
import BuyerProfileModal from '@/components/BuyerProfileModal';

export default function SignUpClient({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const t = useTranslations('auth.signUp');
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBuyerProfile, setShowBuyerProfile] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });

      if (error) {
        setError(t('error'));
        return;
      }

      setSuccess(true);
      setShowBuyerProfile(true);
    } catch {
      setError(t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyerProfileClose = () => {
    setShowBuyerProfile(false);
    router.push(`/${locale}/auth/signin`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-sm text-gray-500 mt-2">{t('subtitle')}</p>
          </div>

          {/* Success */}
          {success && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
              {t('success')}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('displayName')}
                </label>
                <input
                  id="displayName"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('displayNamePlaceholder')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('email')}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('password')}
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-medium py-2.5 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('submitting') : t('submit')}
              </button>
            </form>
          )}

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {t('hasAccount')}{' '}
            <Link href={`/${locale}/auth/signin`} className="text-primary font-medium hover:underline">
              {t('signInLink')}
            </Link>
          </p>
        </div>
      </div>

      {/* Buyer profile onboarding — auto-opens after successful signup */}
      <BuyerProfileModal
        isOpen={showBuyerProfile}
        onClose={handleBuyerProfileClose}
        onSave={handleBuyerProfileClose}
      />
    </div>
  );
}
