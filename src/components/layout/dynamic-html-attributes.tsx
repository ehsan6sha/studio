'use client';

import { useEffect } from 'react';
import type { Locale } from '@/i18n-config';

interface DynamicHtmlAttributesProps {
  locale: Locale;
}

export function DynamicHtmlAttributes({ locale }: DynamicHtmlAttributesProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
  }, [locale]);

  return null; // This component doesn't render anything itself
}
