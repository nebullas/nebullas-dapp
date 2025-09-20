'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useMemo } from 'react';

// चाहें तो .env से दें: NEXT_PUBLIC_BSC_RPC
const RPC_URL = process.env.NEXT_PUBLIC_BSC_RPC ?? 'https://data-seed-prebsc-1-s1.bnbchain.org:8545';

const config = createConfig({
  chains: [bscTestnet],
  connectors: [injected()],
  transports: { [bscTestnet.id]: http(RPC_URL) },
  ssr: false, // hydration mismatch से बचने के लिए
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const qc = useMemo(() => new QueryClient(), []);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
