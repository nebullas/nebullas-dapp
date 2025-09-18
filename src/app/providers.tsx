'use client';

import { ReactNode, useMemo } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { bscTestnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RPC_URL } from "@/config/contracts";

// एक ही chain object, लेकिन हमारे RPC_URL के साथ
const chain = {
  ...bscTestnet,
  rpcUrls: { public: { http: [RPC_URL] }, default: { http: [RPC_URL] } },
};

// SSR=false ताकि hydration mismatch कम हों
export const wagmiConfig = createConfig({
  chains: [chain],
  transports: { [chain.id]: http(RPC_URL) },
  ssr: false,
});

export default function Providers({ children }: { children: ReactNode }) {
  const qc = useMemo(() => new QueryClient(), []);
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
