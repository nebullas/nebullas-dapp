'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ADDR } from '@/config/contracts';
import { partnerRegistryAbi } from '@/lib/abi/partnerRegistry';
import { partnerTreeAbi } from '@/lib/abi/partnerTree';
import ConnectBar from '@/components/ConnectBar';
import { useMemo } from 'react';

function stateLabel(s?: number) {
  switch (s) {
    case 1: return 'ELIGIBLE';
    case 2: return 'PENDING';
    case 3: return 'APPROVED';
    default: return '-';
  }
}

export default function PartnerPage() {
  const { address, isConnected } = useAccount();

  const kycRead = useReadContract({
    address: ADDR.REGISTRY,
    abi: partnerRegistryAbi,
    functionName: 'kycPassed',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: isConnected }
  });

  const stateRead = useReadContract({
    address: ADDR.REGISTRY,
    abi: partnerRegistryAbi,
    functionName: 'stateOf',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: isConnected }
  });

  const uplines = useReadContract({
    address: ADDR.TREE,
    abi: partnerTreeAbi,
    functionName: 'getUplines',
    args: [address ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: isConnected }
  });

  // Apply as Partner
  const { writeContract, data: txApply, isPending: isWriting, error } = useWriteContract();
  const waitApply = useWaitForTransactionReceipt({ hash: txApply });
  const onApply = () => writeContract({ address: ADDR.REGISTRY, abi: partnerRegistryAbi, functionName: 'applyAsPartner', args: [] });

  const refLink = useMemo(() => {
    if (!address) return '-';
    const base = typeof window === 'undefined'
      ? 'https://example.invalid'
      : `${window.location.origin}/buy`;
    return `${base}?ref=${address}`;
  }, [address]);

  return (
    <main>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>Partner Dashboard</h2>
        <ConnectBar />
      </div>

      <section className="card">
        <p>KYC: <strong>{String(Boolean(kycRead.data))}</strong> • Partner State: <strong>{stateLabel(Number(stateRead.data))}</strong></p>
        <button onClick={onApply} disabled={!isConnected || isWriting}>Apply as Partner</button>
        {txApply && <p>Tx: <a href={`https://testnet.bscscan.com/tx/${txApply}`} target="_blank">open</a></p>}
        {waitApply.isSuccess && <p>Success ✓</p>}
        {error && <p style={{color:'crimson'}}>Error: {String((error as any)?.shortMessage ?? error.message)}</p>}

        <p style={{marginTop:10}}>Your Referral Link: <a href={refLink} target="_blank">{refLink}</a></p>
      </section>

      <section className="card">
        <h3>Uplines (6‑level)</h3>
        {Array.from({length:6}).map((_,i) => (
          <p key={i}>L{i+1}: <code>{(uplines.data as readonly `0x${string}`[] | undefined)?.[i] ?? '—'}</code></p>
        ))}
      </section>
    </main>
  );
}
