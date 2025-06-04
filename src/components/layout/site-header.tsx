'use client';

import Link from 'next/link';
import { MainNav } from '@/components/layout/main-nav';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { UserNav } from '@/components/layout/user-nav';
import type { Locale } from '@/i18n-config';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface SiteHeaderProps {
  lang: Locale;
  dictionary: Record<string, string>;
  appName: string;
}

export function SiteHeader({ lang, dictionary, appName }: SiteHeaderProps) {
  const isAuthenticated = false; 

  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const isHomePage = pathname === `/${lang}` || pathname === `/${lang}/`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {isMobile && !isHomePage && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="ltr:mr-2 rtl:ml-2 shrink-0"
            aria-label={lang === 'fa' ? 'بازگشت' : 'Go back'}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Logo locale={lang} appName={appName} />
        <MainNav lang={lang} dictionary={dictionary} isAuthenticated={isAuthenticated} />
        <div className="flex flex-1 items-center justify-end space-x-2 rtl:space-x-reverse">
          <LanguageSwitcher currentLocale={lang} />
          <UserNav lang={lang} dictionary={dictionary} isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </header>
  );
}
