// src/app/providers.tsx
'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useMemo } from 'react';
import { RPC_URL } from '@/config/contracts';

const chain = {
  ...bscTestnet,
  rpcUrls: {
    ...bscTestnet.rpcUrls,
    public: { http: [RPC_URL] },
    default: { http: [RPC_URL] },
  },
} as const;

const config = createConfig({
  chains: [chain],
  transports: { [chain.id]: http(RPC_URL) },
  ssr: false,
});

export default function Providers({ children }: { children: ReactNode }) {
  const qc = useMemo(() => new QueryClient(), []);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
