
import { Heart } from 'lucide-react'; // Changed from Brain to Heart
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  locale: string;
  appName: string;
  className?: string;
}

export function Logo({ locale, appName, className }: LogoProps) {
  // Assuming appName prop will be correctly passed as "Hami" or "حامی"
  // If not, the component displaying this logo needs to handle the new name.
  return (
    <Link
      href={`/${locale}`}
      className={cn(
        'flex items-center space-x-2 rtl:space-x-reverse text-primary hover:text-primary/80 transition-colors min-w-0',
        className
      )}
    >
      <Heart className="h-8 w-8 shrink-0" /> {/* Changed from Brain to Heart */}
      <span className="font-headline text-2xl font-semibold truncate">{appName}</span>
    </Link>
  );
}
