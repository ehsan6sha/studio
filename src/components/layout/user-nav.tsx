
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Locale } from '@/i18n-config';
import { User, LogIn, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface UserNavProps {
  lang: Locale;
  dictionary: Record<string, string>; // Keep as non-null, SiteHeader passes {} if null
}

export function UserNav({ lang, dictionary }: UserNavProps) {
  const auth = useAuth();

  const loginLabel = dictionary.login || 'Login';
  const signupLabel = dictionary.signup || 'Sign Up';
  const profileLabel = dictionary.profile || 'Profile';
  const settingsLabel = dictionary.settings || 'Settings';
  const logoutLabel = dictionary.logout || 'Logout';


  if (!auth.isAuthenticated) {
    return (
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Button variant="ghost" asChild>
          <Link href={`/${lang}/login`}>{loginLabel}</Link>
        </Button>
        <Button asChild>
          <Link href={`/${lang}/signup`}>{signupLabel}</Link>
        </Button>
      </div>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + (names.length > 1 ? names[names.length - 1][0] : '')).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://placehold.co/100x100.png" alt={auth.user?.name || 'User Avatar'} data-ai-hint="user avatar" />
            <AvatarFallback>
              {auth.user?.name ? getInitials(auth.user.name) : <User className="h-5 w-5"/>}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{auth.user?.name || (lang === 'fa' ? 'کاربر' : 'User')}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {auth.user?.emailOrPhone}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
             <Link href={`/${lang}/profile`}> 
                <User className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                <span>{profileLabel}</span>
             </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${lang}/settings`}>
              <Settings className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              <span>{settingsLabel}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => auth.logout(lang)}>
          <LogOut className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
          <span>{logoutLabel}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
