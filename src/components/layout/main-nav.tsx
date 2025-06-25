
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n-config';
import { useState, useEffect } from 'react';

interface MainNavProps {
  lang: Locale;
  dictionary: Record<string, string>; // Keep as non-null, SiteHeader passes {} if null
  isAuthenticated: boolean;
}

export function MainNav({ lang, dictionary, isAuthenticated }: MainNavProps) {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const count = localStorage.getItem('unreadNotifications');
      setUnreadCount(count ? parseInt(count, 10) : 0);
    };

    updateCount(); // Initial check

    window.addEventListener('storage', updateCount);
    return () => {
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  // Define default labels in English in case dictionary is not yet loaded or key is missing
  const navItemDefinitions = [
    { key: 'dashboard', defaultLabel: 'Dashboard', href: `/${lang}/dashboard` },
    { key: 'journal', defaultLabel: 'Journal', href: `/${lang}/journal` },
    { key: 'notifications', defaultLabel: 'Notifications', href: `/${lang}/insights` },
    { key: 'questionnaires', defaultLabel: 'Questionnaires', href: `/${lang}/questionnaires` },
    { key: 'specialists', defaultLabel: 'Specialists', href: `/${lang}/specialists` },
    { key: 'settings', defaultLabel: 'Settings', href: `/${lang}/settings` },
  ];

  return (
    <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse text-sm font-medium mx-6">
      {navItemDefinitions.map((itemDef) => {
        const label = dictionary[itemDef.key] || itemDef.defaultLabel;
        const isNotifications = itemDef.key === 'notifications';
        return (
          <Link
            key={itemDef.href}
            href={itemDef.href}
            className={cn(
              'transition-colors hover:text-foreground/80 flex items-center gap-2 relative',
              pathname.startsWith(itemDef.href) ? 'text-foreground' : 'text-foreground/60'
            )}
          >
            {label}
            {isNotifications && unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {unreadCount}
                </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
