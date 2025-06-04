import { AuthForm } from '@/components/auth/auth-form';
import { getDictionary } from '@/lib/dictionaries';
import { i18n } from '@/i18n-config';
import type { Locale } from '@/i18n-config';
import { redirect } from 'next/navigation';


// This page will exist outside the [lang] route group if users can access it directly
// However, it's better to integrate it into [lang] for consistency.
// For now, assuming it might be accessed without a lang param and will redirect.
// Or, make it part of [lang] routes. Let's assume part of [lang] for now.

// If we want it under [lang], the folder structure would be src/app/[lang]/login/page.tsx
// This file will now be src/app/[lang]/login/page.tsx

export default async function LoginPage({ params }: { params: { lang: Locale } }) {
  if (!params.lang || !i18n.locales.includes(params.lang)) {
     redirect(`/${i18n.defaultLocale}/login`);
  }
  const dictionary = await getDictionary(params.lang);
  return <AuthForm type="login" dictionary={dictionary.loginPage} lang={params.lang} />;
}
