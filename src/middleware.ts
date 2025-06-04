
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n-config';
// The import for matchLocale and Negotiator are no longer needed if we always default to i18n.defaultLocale.
// import { match as matchLocale } from '@formatjs/intl-localematcher';
// import Negotiator from 'negotiator';

function getLocale(request: NextRequest): string | undefined {
  // Always return the default locale if no locale is in the path.
  // This overrides browser preference for the initial redirect.
  return i18n.defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow Firebase App Hosting specific paths
  if (pathname.startsWith('/__/') || pathname.startsWith('/.well-known/')) {
    return NextResponse.next();
  }
  
  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request); // This will now always be 'fa'

    // Add the locale prefix to the pathname
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        request.url
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
