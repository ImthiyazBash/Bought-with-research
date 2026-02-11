import { notFound } from 'next/navigation';
import Link from 'next/link';
import { locales } from '@/i18n';
import { I18nProvider } from '@/lib/i18n-context';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

async function getMessages(locale: string) {
  return (await import(`@/messages/${locale}.json`)).default;
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <I18nProvider messages={messages}>
      {/* Navigation */}
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
              <span className="text-xl font-bold text-gray-900">{messages.nav.title}</span>
            </Link>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher currentLocale={locale} />
              <button className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">
                {messages.nav.signIn}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>
    </I18nProvider>
  );
}
