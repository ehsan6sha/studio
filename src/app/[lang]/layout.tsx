'use client';

import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n-config';
import { DynamicHtmlAttributes } from '@/components/layout/dynamic-html-attributes';
import { i18n } from '@/i18n-config';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const params = useParams();
  let lang: Locale = i18n.defaultLocale;
  if (params.lang && typeof params.lang === 'string' && i18n.locales.includes(params.lang as Locale)) {
    lang = params.lang as Locale;
  } else if (Array.isArray(params.lang) && params.lang.length > 0 && i18n.locales.includes(params.lang[0] as Locale)) {
    lang = params.lang[0] as Locale;
  }

  const pathname = usePathname();
  const [dictionary, setDictionary] = useState<any>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null); 

  useEffect(() => {
    if (lang) {
      getDictionary(lang).then(setDictionary);
    }
  }, [lang]);

  useEffect(() => {
    // This ensures new Date() is only called on the client, after initial hydration
    setCurrentYear(new Date().getFullYear());
  }, []); // Empty dependency array ensures this runs once on mount

  if (!dictionary) {
    // This loading state is rendered on the client if the dictionary hasn't loaded yet.
    // It should match what the server would render if it also couldn't resolve the dictionary synchronously.
    return (
      <>
        <DynamicHtmlAttributes locale={lang} />
        <div className="flex min-h-screen flex-col items-center justify-center">
          Loading...
        </div>
      </>
    );
  }

  const pageVariants = {
    initial: {
      opacity: 0,
      x: lang === 'fa' ? '-100vw' : '100vw',
    },
    in: {
      opacity: 1,
      x: 0,
    },
    out: {
      opacity: 0,
      x: lang === 'fa' ? '100vw' : '-100vw',
    },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  };

  // displayYear will be an empty string for server render and initial client render if currentYear is null.
  // It will update to the actual year on the client after useEffect runs.
  const displayYear = currentYear !== null ? currentYear : ""; 

  return (
    <>
      <DynamicHtmlAttributes locale={lang} />
      <div className="flex min-h-screen flex-col">
        <SiteHeader lang={lang} dictionary={dictionary.navigation} appName={dictionary.appName} />
        <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8 overflow-x-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="py-6 text-center text-sm text-muted-foreground">
          © {displayYear} {dictionary.appName}. {lang === 'fa' ? 'تمامی حقوق محفوظ است.' : 'All rights reserved.'}
        </footer>
      </div>
    </>
  );
}
