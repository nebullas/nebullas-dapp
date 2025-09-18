'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import ADDR from '@/config/addresses.testnet.json';
import { partnerRegistryAbi } from '@/lib/abi/partnerRegistry';

const ZERO = '0x0000000000000000000000000000000000000000' as `0x${string}`;

export default function AdminPage() {
  const { address: admin, isConnected } = useAccount();

  // SSR hydration-safe UI
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Address input (जिस यूज़र के लिए KYC/Approve करना है)
  const [input, setInput] = useState<string>('');
  const target = useMemo(
    () => ((input && input.startsWith('0x') && input.length === 42) ? (input as `0x${string}`) : ZERO),
    [input]
  );

  // Reads — hooks हमेशा कॉल हों, भले target ZERO हो (no conditional hooks)
  const { data: kyc } = useReadContract({
    address: ADDR.REG as `0x${string}`,
    abi: partnerRegistryAbi,
    functionName: 'kycPassed',
    args: [target],
  });

  const { data: stateRaw } = useReadContract({
    address: ADDR.REG as `0x${string}`,
    abi: partnerRegistryAbi,
    functionName: 'stateOf',
    args: [target],
  });

  const stateLabel = useMemo(() => {
    if (typeof stateRaw === 'bigint') {
      const L = ['NOT_ELIGIBLE','ELIGIBLE','PENDING','APPROVED','REJECTED','SUSPENDED'] as const;
      return L[Number(stateRaw)] ?? '-';
    }
    return '-';
  }, [stateRaw]);

  // Writes
  const { writeContract, data: hash, isPending } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash }); // unconditional
  const waiting = isPending || receipt.isLoading;

  const onSetKYCTrue = () =>
    writeContract({
      address: ADDR.REG as `0x${string}`,
      abi: partnerRegistryAbi,
      functionName: 'setKYC',
      args: [target, true],
    });

  const onApprovePartner = () =>
    writeContract({
      address: ADDR.REG as `0x${string}`,
      abi: partnerRegistryAbi,
      functionName: 'approve',
      args: [target, true],
    });

  return (
    <main style={{ maxWidth: 900, margin: '30px auto', padding: '0 16px' }}>
      <h2>Admin Panel</h2>
      <p>Admin: {mounted ? (admin ?? '—') : '—'}</p>

      <section style={{ border:'1px solid #e5e7eb', padding:16, borderRadius:8 }}>
        <h3>KYC & Partner</h3>

        <label style={{ display:'block', marginBottom:8 }}>Address</label>
        <input
          value={input}
          onChange={(e)=> setInput(e.currentTarget.value.trim())}
          placeholder="0x..."
          style={{ width:'100%', padding:8 }}
        />

        <p style={{ marginTop:8 }}>
          KYC: <strong>{String(Boolean(kyc))}</strong> • Partner State: <strong>{stateLabel}</strong>
        </p>

        <div style={{ display:'flex', gap:12, marginTop:8 }}>
          <button onClick={onSetKYCTrue} disabled={!mounted || !isConnected || waiting}>Set KYC = true</button>
          <button onClick={onApprovePartner} disabled={!mounted || !isConnected || waiting}>Approve Partner</button>
        </div>

        {hash && (
          <p style={{ marginTop:8 }}>
            Tx: <a href={`https://testnet.bscscan.com/tx/${hash}`} target="_blank" rel="noreferrer">{hash}</a>
          </p>
        )}
        {receipt.isSuccess && <p style={{ color:'green' }}>Success ✓</p>}
      </section>
    </main>
  );
}
