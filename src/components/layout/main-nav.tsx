
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n-config';

interface MainNavProps {
  lang: Locale;
  dictionary: Record<string, string>; // Keep as non-null, SiteHeader passes {} if null
  isAuthenticated: boolean;
}

export function MainNav({ lang, dictionary, isAuthenticated }: MainNavProps) {
  const pathname = usePathname();

  if (!isAuthenticated) {
    return null;
  }

  // Define default labels in English in case dictionary is not yet loaded or key is missing
  const navItemDefinitions = [
    { key: 'dashboard', defaultLabel: 'Dashboard', href: `/${lang}/dashboard` },
    { key: 'journal', defaultLabel: 'Journal', href: `/${lang}/journal` },
    { key: 'insights', defaultLabel: 'Insights', href: `/${lang}/insights` },
    { key: 'specialists', defaultLabel: 'Specialists', href: `/${lang}/specialists` },
    { key: 'settings', defaultLabel: 'Settings', href: `/${lang}/settings` },
  ];

  return (
    <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse text-sm font-medium mx-6">
      {navItemDefinitions.map((itemDef) => {
        const label = dictionary[itemDef.key] || itemDef.defaultLabel;
        return (
          <Link
            key={itemDef.href}
            href={itemDef.href}
            className={cn(
              'transition-colors hover:text-foreground/80',
              pathname === itemDef.href ? 'text-foreground' : 'text-foreground/60'
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
