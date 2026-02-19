import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { I18nProvider } from '@/lib/i18n-context';
import { AuthProvider } from '@/lib/auth-context';
import { SavedCompaniesProvider } from '@/lib/saved-companies-context';
import { ComparisonProvider } from '@/lib/comparison-context';
import Nav from '@/components/Nav';
import ComparisonBar from '@/components/ComparisonBar';

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
      <AuthProvider>
        <SavedCompaniesProvider>
          <ComparisonProvider>
            <Nav locale={locale} />
            <main className="pt-16">
              {children}
            </main>
            <ComparisonBar />
          </ComparisonProvider>
        </SavedCompaniesProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
