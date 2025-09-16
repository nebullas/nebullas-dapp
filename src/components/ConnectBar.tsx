"use client";
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from "wagmi";
import { bscTestnet } from "wagmi/chains";
import { useEffect, useState } from "react";

export function ConnectBar() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  // ✅ Client‑only render guard (SSR→CSR mismatch रोकने के लिए)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <strong>Nebullas • BSC Testnet</strong>

      {/* SSR दौरान कुछ भी dynamic न दिखाएँ */}
      {!mounted ? (
        <div suppressHydrationWarning style={{ height: 34 }} />
      ) : !isConnected ? (
        <div style={{ display: "flex", gap: 8 }}>
          {connectors.map((c) => (
            <button key={c.uid} onClick={() => connect({ connector: c })} style={{ padding: "6px 10px" }}>
              Connect {c.name}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }} suppressHydrationWarning>
          {chainId !== bscTestnet.id && (
            <button onClick={() => switchChain({ chainId: bscTestnet.id })} style={{ padding: "6px 10px" }}>
              Switch to BSC Testnet
            </button>
          )}
          <code>{address?.slice(0, 6)}…{address?.slice(-4)}</code>
          <button onClick={() => disconnect()} style={{ padding: "6px 10px" }}>Disconnect</button>
        </div>
      )}
    </div>
  );
}
