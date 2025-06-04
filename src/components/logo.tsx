import { Brain } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  locale: string;
  appName: string;
  className?: string;
}

export function Logo({ locale, appName, className }: LogoProps) {
  return (
    <Link href={`/${locale}`} className={`flex items-center space-x-2 rtl:space-x-reverse text-primary hover:text-primary/80 transition-colors ${className}`}>
      <Brain className="h-8 w-8" />
      <span className="font-headline text-2xl font-semibold">{appName}</span>
    </Link>
  );
}
