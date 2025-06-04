'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n-config';

interface MainNavProps {
  lang: Locale;
  dictionary: Record<string, string>;
}

export function MainNav({ lang, dictionary }: MainNavProps) {
  const pathname = usePathname();
  const navItems = [
    { href: `/${lang}/dashboard`, label: dictionary.dashboard },
    { href: `/${lang}/journal`, label: dictionary.journal },
    { href: `/${lang}/insights`, label: dictionary.insights },
    { href: `/${lang}/specialists`, label: dictionary.specialists },
    { href: `/${lang}/settings`, label: dictionary.settings },
  ];

  return (
    <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse text-sm font-medium mx-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === item.href ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
