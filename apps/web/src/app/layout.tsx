import type { Metadata, Viewport } from 'next';
import SessionProvider from '@/lib/session-provider';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SmartShopper — Real specials at Coles, Woolworths, ALDI & IGA',
    template: '%s · SmartShopper',
  },
  description:
    'Track every supermarket special across Australia. Spot genuine lows, forecast the next drop, optimise your basket, and pick delivery or pickup based on your real total cost.',
  applicationName: 'SmartShopper',
  authors: [{ name: 'SmartShopper' }],
  keywords: [
    'supermarket prices',
    'Coles specials',
    'Woolworths specials',
    'ALDI',
    'IGA',
    'grocery savings',
    'Australia',
  ],
  openGraph: {
    title: 'SmartShopper — Real specials at Coles, Woolworths, ALDI & IGA',
    description:
      'Track every supermarket special. Spot genuine lows, forecast the next drop, optimise your basket.',
    type: 'website',
    locale: 'en_AU',
  },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0c' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
