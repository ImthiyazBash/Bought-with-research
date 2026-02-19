import { locales } from '@/i18n';
import SavedPageClient from './SavedPageClient';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function SavedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <SavedPageClient params={params} />;
}
