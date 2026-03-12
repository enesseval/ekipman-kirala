import type { Metadata } from 'next';
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jb-mono',
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BrewOps — Ekipman Yönetim Sistemi',
  description:
    'Kahve ekipmanı kiralama ve envanter yönetim platformu. Makinelerinizi takip edin, bakımları yönetin, teklifler oluşturun.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="bg-stone-950 text-stone-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
