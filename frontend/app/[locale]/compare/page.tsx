import { locales } from '@/i18n';
import ComparePageClient from './ComparePageClient';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function ComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <ComparePageClient params={params} />;
}
