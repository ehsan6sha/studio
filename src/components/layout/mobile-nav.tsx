
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/i18n-config';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet';
import { Logo } from '@/components/layout/logo';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/auth-context';
import { User, LogOut, Settings } from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lang: Locale;
  dictionary: Record<string, string>;
  appName: string | null;
}

export function MobileNav({ isOpen, onOpenChange, lang, dictionary, appName }: MobileNavProps) {
  const pathname = usePathname();
  const auth = useAuth();
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    const updateCount = () => {
      const count = localStorage.getItem('unreadNotifications');
      setUnreadCount(count ? parseInt(count, 10) : 0);
    };
    updateCount();
    window.addEventListener('storage', updateCount);
    return () => window.removeEventListener('storage', updateCount);
  }, []);

  const navItemDefinitions = [
    { key: 'dashboard', defaultLabel: 'Dashboard', href: `/${lang}/dashboard` },
    { key: 'journal', defaultLabel: 'Journal History', href: `/${lang}/journal` },
    { key: 'notifications', defaultLabel: 'Notifications', href: `/${lang}/insights` },
    { key: 'questionnaires', defaultLabel: 'Questionnaires', href: `/${lang}/questionnaires` },
    { key: 'specialists', defaultLabel: 'Specialists', href: `/${lang}/specialists` },
  ];

  const userNavItemDefinitions = [
    { key: 'profile', defaultLabel: 'Profile', href: `/${lang}/profile`, icon: User },
    { key: 'settings', defaultLabel: 'Settings', href: `/${lang}/settings`, icon: Settings },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side={lang === 'fa' ? 'right' : 'left'} className="p-0" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Logo locale={lang} appName={appName} />
          </div>
          <nav className="flex-1 flex flex-col gap-1 p-4">
            {navItemDefinitions.map((item) => {
              const isNotifications = item.key === 'notifications';
              return (
                <SheetClose asChild key={item.key}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-accent',
                      pathname.startsWith(item.href) ? 'bg-accent' : ''
                    )}
                  >
                    <span>{dictionary[item.key] || item.defaultLabel}</span>
                    {isNotifications && unreadCount > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </SheetClose>
              )
            })}
            <Separator className="my-4" />
            {userNavItemDefinitions.map((item) => (
              <SheetClose asChild key={item.key}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-accent',
                    pathname.startsWith(item.href) ? 'bg-accent' : ''
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {dictionary[item.key] || item.defaultLabel}
                </Link>
              </SheetClose>
            ))}
          </nav>
          <div className="mt-auto p-4 border-t">
            <SheetClose asChild>
                <Button variant="ghost" className="w-full justify-start text-lg" onClick={() => auth.logout(lang)}>
                    <LogOut className="ltr:mr-3 rtl:ml-3 h-5 w-5" />
                    {dictionary.logout || 'Logout'}
                </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
