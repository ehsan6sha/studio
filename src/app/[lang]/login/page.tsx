import { AuthForm } from '@/components/auth/auth-form';
import { getDictionary } from '@/lib/dictionaries';
import { i18n } from '@/i18n-config';
import type { Locale } from '@/i18n-config';
import { redirect } from 'next/navigation';

export default async function LoginPage({ params }: { params: { lang: Locale } }) {
  if (!params.lang || !i18n.locales.includes(params.lang)) {
     redirect(`/${i18n.defaultLocale}/login`);
  }
  const dictionary = await getDictionary(params.lang);
  return <AuthForm type="login" dictionary={dictionary.loginPage} lang={params.lang} />;
}
