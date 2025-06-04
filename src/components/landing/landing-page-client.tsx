
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import type { Locale } from "@/i18n-config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from '@/components/layout/logo'; // Changed import from next/image to the Logo component

interface LandingPageTexts {
  welcomeTitle: string;
  welcomeMessage: string;
  registerButton: string;
  loginButton: string;
  termsPolicyLink: string;
  redirectingMessage: string;
}

interface LandingPageClientProps {
  lang: Locale;
  dictionary: {
    appName: string;
    landingPage: LandingPageTexts;
  };
}

export function LandingPageClient({ lang, dictionary }: LandingPageClientProps) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.isAuthenticated) {
      router.push(`/${lang}/dashboard`);
    }
  }, [auth.isAuthenticated, lang, router]);

  if (auth.isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow py-6 md:py-12 px-4 text-foreground">
        {dictionary.landingPage.redirectingMessage || "Redirecting..."}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-4 sm:py-6 md:py-8 flex-grow">
      <Logo
        locale={lang}
        appName={dictionary.appName}
        className="mb-6 sm:mb-8 [&_svg]:h-16 [&_svg]:w-16 sm:[&_svg]:h-20 sm:[&_svg]:w-20 [&_span]:text-4xl sm:[&_span]:text-5xl"
      />
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-headline font-bold tracking-tight text-primary">
        {dictionary.landingPage.welcomeTitle}
      </h1>
      <p className="mt-2 sm:mt-3 md:mt-4 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-foreground/80">
        {dictionary.landingPage.welcomeMessage}
      </p>
      <div className="mt-4 sm:mt-6 md:mt-8 flex flex-col items-center space-y-2 sm:space-y-3 w-full max-w-[280px] sm:max-w-xs">
        <Button asChild size="default" className="w-full h-10 text-sm sm:text-base">
          <Link href={`/${lang}/signup`}>{dictionary.landingPage.registerButton}</Link>
        </Button>
        <Button asChild size="default" variant="outline" className="w-full h-10 text-sm sm:text-base">
          <Link href={`/${lang}/login`}>{dictionary.landingPage.loginButton}</Link>
        </Button>
      </div>
      <div className="mt-6 sm:mt-8 md:mt-10">
        <Link href={`/${lang}/terms`} className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
          {dictionary.landingPage.termsPolicyLink}
        </Link>
      </div>
    </div>
  );
}
