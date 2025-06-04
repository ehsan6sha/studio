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
import { User, LogIn, LogOut, Settings } from 'lucide-react'; // Removed PlusCircle as it's not used

interface UserNavProps {
  lang: Locale;
  dictionary: Record<string, string>;
  isAuthenticated: boolean; 
}

export function UserNav({ lang, dictionary, isAuthenticated }: UserNavProps) {

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Button variant="ghost" asChild>
          <Link href={`/${lang}/login`}>{dictionary.login}</Link>
        </Button>
        <Button asChild>
          <Link href={`/${lang}/signup`}>{dictionary.signup}</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
            <AvatarFallback>
              <User className="h-5 w-5"/>
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">User Name</p> {/* Placeholder */}
            <p className="text-xs leading-none text-muted-foreground">
              user@example.com {/* Placeholder */}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
             <Link href={`/${lang}/profile`}> {/* Assuming /profile is an authenticated route */}
                <User className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                <span>{dictionary.profile}</span>
             </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${lang}/settings`}>
              <Settings className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              <span>{dictionary.settings}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem> {/* Add actual logout functionality here */}
          <LogOut className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
          <span>{dictionary.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
