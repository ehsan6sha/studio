
'use client';

import Link from 'next/link';
import { MainNav } from '@/components/layout/main-nav';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { UserNav } from '@/components/layout/user-nav';
import type { Locale } from '@/i18n-config';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/auth-context'; // Added useAuth

interface SiteHeaderProps {
  lang: Locale;
  dictionary: Record<string, string>;
  appName: string;
}

export function SiteHeader({ lang, dictionary, appName }: SiteHeaderProps) {
  const auth = useAuth(); // Use auth context
  const isAuthenticated = auth.isAuthenticated; // Get isAuthenticated from context

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const isHomePage = pathname === `/${lang}` || pathname === `/${lang}/`;
  
  const signupStepParam = searchParams.get('step');
  const currentSignupStep = signupStepParam ? parseInt(signupStepParam, 10) : 0;
  const isOnSignupPage = pathname.includes(`/${lang}/signup`);
  const hideMobileBackButtonForSignup = isOnSignupPage && currentSignupStep > 1;

  const showMobileBackButton = isMobile && !isHomePage && !hideMobileBackButtonForSignup;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {showMobileBackButton && (
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
        <Logo locale={lang} appName={appName} className="min-w-0" />
        <MainNav lang={lang} dictionary={dictionary} isAuthenticated={isAuthenticated} />
        <div className="flex flex-1 items-center justify-end space-x-2 rtl:space-x-reverse">
          <LanguageSwitcher currentLocale={lang} />
          {/* UserNav now internally uses useAuth, so no need to pass isAuthenticated prop explicitly if it uses the hook */}
          <UserNav lang={lang} dictionary={dictionary} />
        </div>
      </div>
    </header>
  );
}
