
'use client';

import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n-config';
import { DynamicHtmlAttributes } from '@/components/layout/dynamic-html-attributes';
import { i18n } from '@/i18n-config';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useParams } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react'; // Import React and useRef
import { AuthProvider } from '@/context/auth-context';

export default function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const params = useParams();
  let lang: Locale = i18n.defaultLocale;
  const langFromParams = Array.isArray(params.lang) ? params.lang[0] : params.lang;
  if (langFromParams && i18n.locales.includes(langFromParams as Locale)) {
    lang = langFromParams as Locale;
  }

  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null);

  const [dictionary, setDictionary] = useState<any>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

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

  const minimalTransitionRoutes = React.useMemo(() => [
    `/${lang}`,
    `/${lang}/login`,
    `/${lang}/signup`,
  ], [lang]);

  const isTransitionBetweenMinimalRoutes = () => {
    const fromPath = previousPathnameRef.current;
    const toPath = pathname;

    if (!fromPath) return false; // Initial load or no previous path recorded

    const isFromMinimal = minimalTransitionRoutes.includes(fromPath);
    const isToMinimal = minimalTransitionRoutes.includes(toPath);
    
    // Only consider it a "minimal transition" if both from and to are in the set
    return isFromMinimal && isToMinimal;
  };
  
  const currentTransitionIsMinimal = isTransitionBetweenMinimalRoutes();

  const pageVariants = React.useMemo(() => {
    if (currentTransitionIsMinimal) {
      return { // Variants for an instant (no-animation) transition
        initial: { opacity: 1, x: 0 },
        in: { opacity: 1, x: 0 },
        out: { opacity: 1, x: 0 },
      };
    }
    // Standard animation variants for other routes
    return {
      initial: {
        opacity: 0,
        x: lang === 'fa' ? -50 : 50,
      },
      in: {
        opacity: 1,
        x: 0,
      },
      out: {
        opacity: 0,
        x: lang === 'fa' ? 50 : -50,
      },
    };
  }, [lang, currentTransitionIsMinimal]);

  const pageTransition = React.useMemo(() => {
    if (currentTransitionIsMinimal) {
      return { duration: 0 }; // Instant transition
    }
    return {
      type: 'tween',
      ease: 'easeInOut',
      duration: 0.3,
    };
  }, [currentTransitionIsMinimal]);

  const displayYear = currentYear !== null ? currentYear : "";
  const appNameFromDict = dictionary?.appName;
  const navigationDict = dictionary?.navigation;

  const defaultFooterText = lang === 'fa' ? 'تمامی حقوق محفوظ است.' : 'All rights reserved.';
  const footerRightsText = dictionary?.termsPage?.contactInformation
    ? (lang === 'fa' ? 'تمامی حقوق محفوظ است.' : 'All rights reserved.')
    : defaultFooterText;

  const defaultAppName = lang === 'fa' ? 'اپلیکیشن' : 'Application';


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
              variants={pageVariants}
              transition={pageTransition}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground">
          © {displayYear} {appNameFromDict || defaultAppName}. {footerRightsText}
        </footer>
      </div>
    </AuthProvider>
  );
}
