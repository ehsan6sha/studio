
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
import { AuthProvider } from '@/context/auth-context'; // Added AuthProvider

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
    setCurrentYear(new Date().getFullYear());
  }, []); 

  if (!dictionary) {
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
      x: lang === 'fa' ? -50 : 50, // Gentler slide using pixel values
    },
    in: {
      opacity: 1,
      x: 0,
    },
    out: {
      opacity: 0,
      x: lang === 'fa' ? 50 : -50, // Opposite direction for exit
    },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut', // Smoother easing
    duration: 0.3,    // Slightly adjusted duration
  };

  const displayYear = currentYear !== null ? currentYear : ""; 

  return (
    <AuthProvider> {/* Added AuthProvider Wrapper */}
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
    </AuthProvider>
  );
}
