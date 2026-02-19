import { locales } from '@/i18n';
import SignUpClient from './SignUpClient';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function SignUpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return <SignUpClient params={params} />;
}
