export const i18n = {
  defaultLocale: 'fa',
  locales: ['fa', 'en'],
  localeNames: {
    fa: 'فارسی',
    en: 'English',
  }
} as const;

export type Locale = (typeof i18n)['locales'][number];
