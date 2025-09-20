import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';
import ConnectBar from '@/components/ConnectBar';

export const metadata: Metadata = {
  title: 'Nebullas • BSC Testnet',
  description: 'Buy NBL • Partner • Admin',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 18px',borderBottom:'1px solid #eee'}}>
            <strong>Nebullas • BSC Testnet</strong>
            <ConnectBar />
          </header>
          <main style={{maxWidth:1100,margin:'24px auto',padding:'0 16px'}}>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
