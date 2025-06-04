
import { Brain } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  locale: string;
  appName: string | null; // Can be null while loading
  className?: string;
}

export function Logo({ locale, appName, className }: LogoProps) {
  const displayName = appName || (locale === 'fa' ? 'روان‌همراه' : 'RavanHamrah'); // Default app name
  return (
    <Link
      href={`/${locale}`}
      className={cn(
        'flex items-center space-x-2 rtl:space-x-reverse text-primary hover:text-primary/80 transition-colors min-w-0',
        className
      )}
    >
      <Brain className="h-8 w-8 shrink-0" />
      <span className="font-headline text-2xl font-semibold truncate">{displayName}</span>
    </Link>
  );
}
