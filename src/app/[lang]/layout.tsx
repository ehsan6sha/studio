import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n-config';
import { DynamicHtmlAttributes } from '@/components/layout/dynamic-html-attributes';
import { i18n } from '@/i18n-config';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function LocaleLayout({
  children,
  params: { lang },
}: {
  children: ReactNode;
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);

  return (
    <>
      <DynamicHtmlAttributes locale={lang} />
      <div className="flex min-h-screen flex-col">
        <SiteHeader lang={lang} dictionary={dictionary.navigation} appName={dictionary.appName} />
        <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {dictionary.appName}. {lang === 'fa' ? 'تمامی حقوق محفوظ است.' : 'All rights reserved.'}
        </footer>
      </div>
    </>
  );
}
