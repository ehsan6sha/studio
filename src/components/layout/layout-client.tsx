'use client';

import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import type { Locale } from '@/i18n-config';
import { DynamicHtmlAttributes } from '@/components/layout/dynamic-html-attributes';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { AuthProvider } from '@/context/auth-context';
import { ChatCompanionWrapper } from '@/components/chat/ChatCompanionWrapper';

export function LayoutClient({
  children,
  lang,
  dictionary,
}: {
  children: ReactNode;
  lang: Locale;
  dictionary: any;
}) {
  const pathname = usePathname();
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  
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
  }, [lang]);

  const variants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  };

  const transition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.3,
  };

  const displayYear = currentYear !== null ? currentYear : new Date().getFullYear();
  const appNameFromDict = dictionary?.appName;
  const navigationDict = dictionary?.navigation;
  const footerRightsText = dictionary?.termsPage?.contactInformation?.content1 || (lang === 'fa' ? 'تمامی حقوق محفوظ است.' : 'All rights reserved.');
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
              variants={variants}
              transition={transition}
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
