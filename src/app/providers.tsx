'use client';

import { ReactNode, useMemo } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RPC_URL } from '@/config/contracts';

const chain = bscTestnet;
const config = createConfig({
  chains: [chain],
  transports: { [chain.id]: http(RPC_URL) },
  ssr: true,
});

export default function Providers({ children }: { children: ReactNode }) {
  const qc = useMemo(() => new QueryClient(), []);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
