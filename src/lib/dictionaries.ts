
import type { Locale } from '@/i18n-config';

const dictionaries = {
  en: () => import('@/locales/en.json').then((module) => module.default),
  fa: () => import('@/locales/fa.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  const loader = dictionaries[locale] || dictionaries.fa; // Fallback to Farsi
  return loader();
};
