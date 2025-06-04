
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/i18n-config";
import { i18n } from "@/i18n-config";
import { LandingPageClient } from '@/components/landing/landing-page-client';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function LangRootPage({ params }: { params: { lang: Locale } }) {
  const { lang } = params;
  const dictionary = await getDictionary(lang);

  // Pass only the necessary parts of the dictionary to the client component
  const landingPageDictionary = {
    appName: dictionary.appName,
    landingPage: dictionary.landingPage,
  };

  return <LandingPageClient lang={lang} dictionary={landingPageDictionary} />;
}

