import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pay2Roast — Coming Soon',
  description: 'Pay crypto to roast your fren on-chain. Launching soon on Solana.',
  openGraph: {
    title: 'Pay2Roast — Coming Soon',
    description: 'Pay crypto to roast your fren on-chain. Launching soon on Solana.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ margin: 0, padding: 0, overflow: 'hidden', height: '100%', background: '#08040A' }}>
        {children}
      </body>
    </html>
  );
}
