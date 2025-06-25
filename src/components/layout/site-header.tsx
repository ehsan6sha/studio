
'use client';

import * as React from 'react';
import { MainNav } from '@/components/layout/main-nav';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { UserNav } from '@/components/layout/user-nav';
import type { Locale } from '@/i18n-config';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { MobileNav } from '@/components/layout/mobile-nav';

interface SiteHeaderProps {
  lang: Locale;
  dictionary: Record<string, string> | null;
  appName: string | null;
}

export function SiteHeader({ lang, dictionary, appName }: SiteHeaderProps) {
  const auth = useAuth();
  const isAuthenticated = auth.isAuthenticated;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center">
          {/* Left aligned: mobile hamburger and desktop nav */}
          <div className="flex items-center gap-6 md:flex-1">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}
            <Logo locale={lang} appName={appName} className="hidden md:flex" />
            <MainNav lang={lang} dictionary={dictionary || {}} isAuthenticated={isAuthenticated} />
          </div>
          
          {/* Centered logo on mobile */}
          <div className="flex md:hidden flex-1 justify-center">
             {/* The container has items-center, so this logo is vertically centered */}
            <Logo locale={lang} appName={appName} />
          </div>

          {/* Right aligned: actions */}
          <div className="flex flex-1 items-center justify-end space-x-2 rtl:space-x-reverse">
            <LanguageSwitcher currentLocale={lang} />
            <div className="hidden md:block">
              <UserNav lang={lang} dictionary={dictionary || {}} />
            </div>
          </div>
        </div>
      </header>
      {isAuthenticated && (
          <MobileNav
            isOpen={isMobileMenuOpen}
            onOpenChange={setIsMobileMenuOpen}
            lang={lang}
            dictionary={dictionary || {}}
            appName={appName}
          />
      )}
    </>
  );
}
