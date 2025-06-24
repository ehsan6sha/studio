import type { ReactNode } from 'react';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n-config';
import { i18n } from '@/i18n-config';
import { LayoutClient } from '@/components/layout/layout-client';

export default async function LocaleLayout({
  children,
  params: { lang },
}: {
  children: ReactNode;
  params: { lang: Locale };
}) {
  // Ensure lang is a valid locale, fallback to default
  const validLang = i18n.locales.includes(lang) ? lang : i18n.defaultLocale;
  const dictionary = await getDictionary(validLang);

  return (
    <LayoutClient lang={validLang} dictionary={dictionary}>
      {children}
    </LayoutClient>
  );
}
