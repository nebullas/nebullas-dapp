'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import ADDR from '@/config/addresses.testnet.json';
import { partnerRegistryAbi } from '@/lib/abi/partnerRegistry';

const ZERO = '0x0000000000000000000000000000000000000000' as `0x${string}`;

export default function PartnerPage() {
  const { address } = useAccount();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const self = useMemo(() => (address ?? ZERO) as `0x${string}`, [address]);

  const { data: kyc } = useReadContract({
    address: ADDR.REG as `0x${string}`,
    abi: partnerRegistryAbi,
    functionName: 'kycPassed',
    args: [self],
  });

  const { data: stateRaw } = useReadContract({
    address: ADDR.REG as `0x${string}`,
    abi: partnerRegistryAbi,
    functionName: 'stateOf',
    args: [self],
  });

  const stateLabel = useMemo(() => {
    if (typeof stateRaw === 'bigint') {
      const L = ['NOT_ELIGIBLE','ELIGIBLE','PENDING','APPROVED','REJECTED','SUSPENDED'] as const;
      return L[Number(stateRaw)] ?? '-';
    }
    return '-';
  }, [stateRaw]);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  const onApply = () =>
    writeContract({
      address: ADDR.REG as `0x${string}`,
      abi: partnerRegistryAbi,
      functionName: 'applyAsPartner'
    });

  return (
    <main style={{ maxWidth:900, margin:'30px auto', padding:'0 16px' }}>
      <h2>Partner Dashboard</h2>
      <p>You: {mounted ? (address ?? '—') : '—'}</p>

      <section style={{ border:'1px solid #e5e7eb', padding:16, borderRadius:8 }}>
        <p>KYC: <strong>{String(Boolean(kyc))}</strong> • Partner State: <strong>{stateLabel}</strong></p>

        {(stateLabel === 'ELIGIBLE') && Boolean(kyc) && (
          <button onClick={onApply} disabled={isPending}>Apply as Partner</button>
        )}

        {hash && <p>Tx: <a href={`https://testnet.bscscan.com/tx/${hash}`} target="_blank" rel="noreferrer">{hash}</a></p>}
        {receipt.isSuccess && <p style={{ color:'green' }}>Success ✓</p>}
      </section>

      <section style={{ border:'1px solid #e5e7eb', padding:16, borderRadius:8, marginTop:16 }}>
        <h3>Uplines (6‑level)</h3>
        <div>L1: —</div><div>L2: —</div><div>L3: —</div><div>L4: —</div><div>L5: —</div><div>L6: —</div>
      </section>
    </main>
  );
}
