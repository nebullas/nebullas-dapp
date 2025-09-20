'use client';
import { injected } from 'wagmi/connectors';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function ConnectBar() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <button onClick={() => connect({ connector: injected() })} disabled={isPending}>
        Connect MetaMask
      </button>
    );
  }
  return (
    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
      <code>{address?.slice(0,6)}…{address?.slice(-4)}</code>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  );
}
