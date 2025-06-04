
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  locale: string;
  appName: string | null;
  className?: string;
  iconOnly?: boolean; // New prop
}

export function Logo({ locale, appName, className, iconOnly = false }: LogoProps) {
  const displayName = appName || (locale === 'fa' ? 'حامی' : 'Hami');
  return (
    <Link
      href={`/${locale}`}
      className={cn(
        'flex items-center text-primary hover:text-primary/80 transition-colors min-w-0',
        !iconOnly && 'space-x-2 rtl:space-x-reverse', // Conditionally add spacing if text is present
        className
      )}
    >
      <Heart className="h-8 w-8 shrink-0" /> {/* Base size, can be overridden by parent's className */}
      {!iconOnly && (
        <span className="font-headline text-2xl font-semibold truncate">{displayName}</span>
      )}
    </Link>
  );
}
