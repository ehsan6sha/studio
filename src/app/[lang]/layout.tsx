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

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const params = useParams();
  // Ensure lang is a valid Locale, falling back to default if necessary.
  // This handles cases where params.lang might be undefined or an array.
  let lang: Locale = i18n.defaultLocale;
  if (params.lang && typeof params.lang === 'string' && i18n.locales.includes(params.lang as Locale)) {
    lang = params.lang as Locale;
  } else if (Array.isArray(params.lang) && params.lang.length > 0 && i18n.locales.includes(params.lang[0] as Locale)) {
    lang = params.lang[0] as Locale;
  }


  const pathname = usePathname();
  const [dictionary, setDictionary] = useState<any>(null); // Consider defining a more specific type for dictionary

  useEffect(() => {
    // This effect hook will run on the client after the component mounts
    // and whenever `lang` changes.
    if (lang) {
      getDictionary(lang).then(setDictionary);
    }
  }, [lang]);

  if (!dictionary) {
    // Render a basic loading state or a skeleton screen
    // Ensure essential html structure for DynamicHtmlAttributes to work if it relies on documentElement
    return (
      <html lang={lang} dir={lang === 'fa' ? 'rtl' : 'ltr'} suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
        </head>
        <body>
          <div className="flex min-h-screen flex-col items-center justify-center">
            Loading...
          </div>
        </body>
      </html>
    );
  }

  const pageVariants = {
    initial: {
      opacity: 0,
      x: '100vw', // Start from right
    },
    in: {
      opacity: 1,
      x: 0,
    },
    out: {
      opacity: 0,
      x: '-100vw', // Exit to left
    },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  };

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
          © {new Date().getFullYear()} {dictionary.appName}. {lang === 'fa' ? 'تمامی حقوق محفوظ است.' : 'All rights reserved.'}
        </footer>
      </div>
    </>
  );
}
