import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  icons: { icon: '/favicon.svg' },
  title: 'Rush Hour — Neon Puzzle',
  description:
    'A neon-themed browser adaptation of the classic Rush Hour sliding-block puzzle. ' +
    'Slide cars and trucks to free the red car and escape the traffic jam.',
  keywords: ['rush hour', 'puzzle', 'sliding block', 'neon', 'browser game'],
  authors: [{ name: 'Rush Hour Game' }],
  openGraph: {
    title: 'Rush Hour — Neon Puzzle',
    description: 'Free the red car! A neon sliding-block puzzle in your browser.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080814',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
