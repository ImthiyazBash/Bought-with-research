import { locales } from '@/i18n';
import SignInClient from './SignInClient';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <SignInClient params={params} />;
}
