'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useTranslations } from '@/lib/i18n-context';

interface RequestInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: number;
  companyName: string;
  onSubmitSuccess: () => void;
}

export default function RequestInfoModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  onSubmitSuccess,
}: RequestInfoModalProps) {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Insert lead inquiry into Supabase
      const { error: supabaseError } = await (supabase as any)
        .from('lead_inquiries')
        .insert({
          company_id: companyId,
          company_name: companyName,
          email: email.trim().toLowerCase(),
        });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error(supabaseError.message);
      }

      setIsSuccess(true);
      setEmail('');
      onSubmitSuccess();

      // Auto close after 3 seconds
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError(null);
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('modal.requestInfo.title')}
              </h2>
              <p className="text-sm text-gray-600">
                {t('modal.requestInfo.subtitle').replace('{company}', companyName)}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('modal.requestInfo.emailLabel')}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder={t('modal.requestInfo.emailPlaceholder')}
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-hover transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('modal.requestInfo.submitting')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {t('modal.requestInfo.submit')}
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-8">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {t('modal.requestInfo.successTitle')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('modal.requestInfo.successMessage')}
            </p>
            <p className="text-lg font-medium text-primary">
              {t('modal.requestInfo.stayTuned')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
