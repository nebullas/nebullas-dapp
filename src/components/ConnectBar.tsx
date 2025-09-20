"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export default function ConnectBar() {
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  // SSR ↔ CSR mismatch रोकने के लिए
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Hydration-safe skeleton
  if (!mounted) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center", minHeight: 32 }}>
        <span style={{ width: 100, height: 12, background: "#eee", borderRadius: 6 }} />
      </div>
    );
  }

  if (isConnected) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span
          style={{
            padding: "6px 10px",
            border: "1px solid #eee",
            borderRadius: 8,
            background: "#fafafa",
          }}
        >
          {address?.slice(0, 6)}…{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          style={{
            padding: "6px 10px",
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#fff",
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      disabled={isConnecting}
      style={{
        padding: "6px 10px",
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "#fff",
      }}
    >
      Connect
    </button>
  );
}
