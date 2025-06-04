import Link from 'next/link';
import { MainNav } from '@/components/layout/main-nav';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { UserNav } from '@/components/layout/user-nav';
import type { Locale } from '@/i18n-config';
import { Logo } from '@/components/logo';

interface SiteHeaderProps {
  lang: Locale;
  dictionary: Record<string, string>;
  appName: string;
}

export function SiteHeader({ lang, dictionary, appName }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Logo locale={lang} appName={appName} />
        <MainNav lang={lang} dictionary={dictionary} />
        <div className="flex flex-1 items-center justify-end space-x-4 rtl:space-x-reverse">
          <LanguageSwitcher currentLocale={lang} />
          <UserNav lang={lang} dictionary={dictionary} />
        </div>
      </div>
    </header>
  );
}
