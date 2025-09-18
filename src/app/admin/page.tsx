'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { isAddress } from 'viem';
import { useEffect, useMemo, useState } from 'react';

import { ADDR } from '@/config/contracts';
import { partnerRegistryAbi } from '@/lib/abi/partnerRegistry';

const STATE = ['NOT_ELIGIBLE', 'ELIGIBLE', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] as const;

export default function AdminPage() {
  const { address: admin } = useAccount();
  const [input, setInput] = useState<string>('');

  // Normalize target address for calls
  const target = useMemo(() => (isAddress(input) ? (input as `0x${string}`) : undefined), [input]);

  // READS: never call hooks conditionally; use `query.enabled`
  const { data: kyc } = useReadContract({
    address: ADDR.REG,
    abi: partnerRegistryAbi,
    functionName: 'kycPassed',
    args: target ? [target] : undefined,
    query: { enabled: Boolean(target) },
  });

  const { data: stateRaw } = useReadContract({
    address: ADDR.REG,
    abi: partnerRegistryAbi,
    functionName: 'stateOf',
    args: target ? [target] : undefined,
    query: { enabled: Boolean(target) },
  });

  const stateLabel = typeof stateRaw === 'number' ? STATE[stateRaw] ?? '-' : '-';

  // WRITES
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: waiting, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
  });

  // After success, triggers refetch via focus or simple input trick if needed
  useEffect(() => {
    // no-op: wagmi/query will refetch on new block/focus; we keep this for clarity
  }, [isSuccess]);

  const onSetKYCTrue = () => {
    if (!target) return;
    writeContract({
      address: ADDR.REG,
      abi: partnerRegistryAbi,
      functionName: 'setKYC',
      args: [target, true],
    });
  };

  const onApprovePartner = () => {
    if (!target) return;
    writeContract({
      address: ADDR.REG,
      abi: partnerRegistryAbi,
      functionName: 'approve',
      args: [target, true],
    });
  };

  return (
    <main style={{ maxWidth: 900, margin: '30px auto', padding: '0 16px' }}>
      <h2>Admin Panel</h2>
      <p>Admin: {admin ?? '-'}</p>

      <section style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 8 }}>
        <h3>KYC &amp; Partner</h3>

        <label>Address</label>
        <input
          placeholder="0x..."
          value={input}
          onChange={(e) => setInput(e.target.value.trim())}
          style={{ width: '100%', margin: '8px 0' }}
        />

        <p>
          KYC: <strong>{String(Boolean(kyc))}</strong> • Partner State: <strong>{stateLabel}</strong>
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button onClick={onSetKYCTrue} disabled={!target || isPending || waiting}>
            Set KYC = true
          </button>
          <button onClick={onApprovePartner} disabled={!target || isPending || waiting}>
            Approve Partner
          </button>
        </div>

        {txHash && (
          <p>
            Tx:{' '}
            <a
              href={`https://testnet.bscscan.com/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {txHash}
            </a>
          </p>
        )}
        {isSuccess && <p style={{ color: 'green' }}>Success ✓</p>}
      </section>
    </main>
  );
}
