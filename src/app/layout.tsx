import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { DynamicHtmlAttributes } from '@/components/layout/dynamic-html-attributes';

export const metadata: Metadata = {
  title: 'RavanHamrah | روان‌همراه',
  description: 'Personalized mental wellness companion | همراه شخصی سلامت روان شما',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Lang and dir will be set by DynamicHtmlAttributes component within [lang]/layout.tsx
    <html suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {/* DynamicHtmlAttributes will be rendered by [lang]/layout.tsx to set html attributes */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
