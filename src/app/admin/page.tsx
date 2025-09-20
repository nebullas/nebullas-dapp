'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ADDR } from '@/config/contracts';
import { partnerRegistryAbi } from '@/lib/abi/partnerRegistry';
import ConnectBar from '@/components/ConnectBar';

function stateLabel(s?: number) {
  switch (s) {
    case 1: return 'ELIGIBLE';
    case 2: return 'PENDING';
    case 3: return 'APPROVED';
    default: return '-';
  }
}

export default function AdminPage() {
  const { address: admin } = useAccount();
  const [target, setTarget] = useState<`0x${string}` | ''>('');

  const kycRead = useReadContract({
    address: ADDR.REGISTRY,
    abi: partnerRegistryAbi,
    functionName: 'kycPassed',
    args: [target || '0x0000000000000000000000000000000000000000'],
    query: { enabled: Boolean(target) }
  });

  const stateRead = useReadContract({
    address: ADDR.REGISTRY,
    abi: partnerRegistryAbi,
    functionName: 'stateOf',
    args: [target || '0x0000000000000000000000000000000000000000'],
    query: { enabled: Boolean(target) }
  });

  // writes
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const wait = useWaitForTransactionReceipt({ hash });

  const onSetKYCTrue = () =>
    writeContract({ address: ADDR.REGISTRY, abi: partnerRegistryAbi, functionName: 'setKYC', args: [target as `0x${string}`, true] });

  const onApprovePartner = () =>
    writeContract({ address: ADDR.REGISTRY, abi: partnerRegistryAbi, functionName: 'approve', args: [target as `0x${string}`] });

  return (
    <main>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>Admin Panel</h2>
        <ConnectBar />
      </div>

      <section className="card">
        <h3>KYC & Partner</h3>
        <p><strong>Admin:</strong> <code>{admin ?? '-'}</code></p>

        <label>Address</label>
        <input
          placeholder="0x..."
          value={target}
          onChange={e => setTarget(e.target.value as any)}
          style={{ width:'100%', margin:'6px 0 10px' }}
        />

        <p>KYC: <strong>{String(Boolean(kycRead.data))}</strong> • Partner State: <strong>{stateLabel(Number(stateRead.data))}</strong></p>

        <div style={{ display:'flex', gap:12, marginTop:8 }}>
          <button onClick={onSetKYCTrue} disabled={!target || isPending || wait.isPending}>Set KYC = true</button>
          <button onClick={onApprovePartner} disabled={!target || isPending || wait.isPending}>Approve Partner</button>
        </div>

        {hash && <p>Tx: <a href={`https://testnet.bscscan.com/tx/${hash}`} target="_blank">open</a></p>}
        {wait.isSuccess && <p>Success ✓</p>}
        {error && <p style={{color:'crimson'}}>Error: {String((error as any)?.shortMessage ?? error.message)}</p>}
      </section>
    </main>
  );
}
