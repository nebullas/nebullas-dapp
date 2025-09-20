import type { Metadata } from 'next';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = { title: 'Nebullas — DApp', description: 'BSC Testnet' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
