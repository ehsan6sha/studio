
'use client';

import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n-config';
import { DynamicHtmlAttributes } from '@/components/layout/dynamic-html-attributes';
import { i18n } from '@/i18n-config';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useParams } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { AuthProvider } from '@/context/auth-context';
import { ChatCompanionWrapper } from '@/components/chat/ChatCompanionWrapper';

export default function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const params = useParams();
  let lang: Locale = i18n.defaultLocale;
  const langFromParamsRaw = Array.isArray(params?.lang) ? params.lang[0] : params?.lang;

  if (langFromParamsRaw && i18n.locales.includes(langFromParamsRaw as Locale)) {
    lang = langFromParamsRaw as Locale;
  }
  
  const pathname = usePathname();
  const [dictionary, setDictionary] = useState<any>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const previousPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (lang) {
      getDictionary(lang).then(setDictionary);
    }
  }, [lang]);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (lang === 'fa') {
      document.body.classList.add('font-vazir');
      document.body.classList.remove('font-body');
    } else {
      document.body.classList.add('font-body');
      document.body.classList.remove('font-vazir');
    }
    return () => {
      document.body.classList.remove('font-vazir');
      document.body.classList.remove('font-body');
    };
  }, [lang]);

  useEffect(() => {
    previousPathnameRef.current = pathname;
  }, [pathname]);

  const minimalTransitionRoutesRegex = React.useMemo(() => [
    new RegExp(`^/${lang}/?$`), // Home page (e.g., /fa or /fa/)
    new RegExp(`^/${lang}/login/?$`),
    new RegExp(`^/${lang}/signup/?$`),
  ], [lang]);

  const isCurrentPathMinimal = minimalTransitionRoutesRegex.some(regex => regex.test(pathname));
  const isPreviousPathMinimal = previousPathnameRef.current ? minimalTransitionRoutesRegex.some(regex => regex.test(previousPathnameRef.current!)) : false;
  
  // Disable animation if transitioning between two different minimal routes
  const disableAnimation = 
    isCurrentPathMinimal && 
    isPreviousPathMinimal && 
    previousPathnameRef.current !== null && // Ensure previousPathnameRef is set
    previousPathnameRef.current !== pathname; // Ensure it's an actual navigation

  const animatedPageVariants = React.useMemo(() => ({
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  }), []);

  const noAnimationPageVariants = React.useMemo(() => ({
    initial: { opacity: 1 },
    in: { opacity: 1 },
    out: { opacity: 1 },
  }), []);
  
  const animatedPageTransition = React.useMemo(() => ({
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
  }), []);

  const noAnimationPageTransition = React.useMemo(() => ({
    duration: 0, // Instant
  }), []);

  const currentVariants = disableAnimation ? noAnimationPageVariants : animatedPageVariants;
  const currentTransition = disableAnimation ? noAnimationPageTransition : animatedPageTransition;
  
  const displayYear = currentYear !== null ? currentYear : "";
  const appNameFromDict = dictionary?.appName;
  const navigationDict = dictionary?.navigation;
  const defaultFooterText = lang === 'fa' ? 'تمامی حقوق محفوظ است.' : 'All rights reserved.';
  const footerRightsText = dictionary?.termsPage?.contactInformation
    ? (lang === 'fa' ? 'تمامی حقوق محفوظ است.' : 'All rights reserved.')
    : defaultFooterText;
  const defaultAppName = lang === 'fa' ? 'حامی' : 'Hami';

  return (
    <AuthProvider>
      <DynamicHtmlAttributes locale={lang} />
      <div className="flex min-h-screen flex-col">
        <SiteHeader
          lang={lang}
          dictionary={navigationDict}
          appName={appNameFromDict}
        />
        <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8 overflow-x-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={currentVariants}
              transition={currentTransition}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <ChatCompanionWrapper />
        <footer className="py-6 text-center text-sm text-muted-foreground">
          © {displayYear} {appNameFromDict || defaultAppName}. {footerRightsText}
        </footer>
      </div>
    </AuthProvider>
  );
}
