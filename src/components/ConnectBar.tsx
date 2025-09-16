"use client";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectBar() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div style={{display:"flex",gap:12,alignItems:"center",justifyContent:"space-between"}}>
      <strong>Nebullas • BSC Testnet</strong>
      {!isConnected ? (
        <div style={{display:"flex",gap:8}}>
          {connectors.map((c) => (
            <button key={c.uid} onClick={() => connect({ connector: c })} style={{padding:"6px 10px"}}>
              Connect {c.name}
            </button>
          ))}
          {status === "error" && <span style={{color:"crimson"}}>{String(error?.message||"")}</span>}
        </div>
      ) : (
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <code>{address?.slice(0,6)}…{address?.slice(-4)}</code>
          <button onClick={() => disconnect()} style={{padding:"6px 10px"}}>Disconnect</button>
        </div>
      )}
    </div>
  );
}
