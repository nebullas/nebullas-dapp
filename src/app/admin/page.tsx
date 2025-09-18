'use client';

import { useEffect, useState } from 'react';
import { useAccount, usePublicClient, useReadContract, useWriteContract } from 'wagmi';
import type { Address } from 'viem';
import { BaseError } from 'viem';

import { ADDR } from '@/config/contracts';
import { partnerRegistryAbi } from '@/lib/abi/partnerRegistry';

const STATE_LABEL: Record<number, string> = {
  0: '-',
  1: 'PENDING',
  2: 'APPROVED',
  3: 'BANNED',
  4: 'ELIGIBLE',
};

export default function AdminPage() {
  const { address: admin } = useAccount();
  const client = usePublicClient();

  const [addr, setAddr] = useState<`0x${string}` | ''>('');
  const [tx, setTx] = useState<Address | undefined>();
  const [waiting, setWaiting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Reads
  const kycRead = useReadContract({
    address: ADDR.REG as Address,
    abi: partnerRegistryAbi,
    functionName: 'kyc',
    args: [addr || ('0x0000000000000000000000000000000000000000' as Address)],
    query: { enabled: Boolean(addr) },
  });

  const stateRead = useReadContract({
    address: ADDR.REG as Address,
    abi: partnerRegistryAbi,
    functionName: 'partnerState',
    args: [addr || ('0x0000000000000000000000000000000000000000' as Address)],
    query: { enabled: Boolean(addr) },
  });

  const kyc = (kycRead.data as boolean | undefined) ?? false;
  const stateNum = Number(stateRead.data ?? 0);
  const stateLabel = STATE_LABEL[stateNum] ?? '-';

  // Writes
  const { writeContractAsync } = useWriteContract();

  const call = async (fn: 'setKYCTrue' | 'approvePartner') => {
    if (!addr) return;
    setErr(null);
    setWaiting(true);
    try {
      const hash = await writeContractAsync({
        address: ADDR.REG as Address,
        abi: partnerRegistryAbi,
        functionName: fn,
        args: fn === 'setKYCTrue' ? [addr] : [addr],
      });
      setTx(hash as Address);
      await client.waitForTransactionReceipt({ hash });
      kycRead.refetch?.();
      stateRead.refetch?.();
    } catch (e: unknown) {
      // ❌ पहले shortMessage की TS error आ रही थी — अब BaseError से safe handling
      const msg = e instanceof BaseError ? e.shortMessage ?? e.message : (e as Error).message;
      setErr(msg);
    } finally {
      setWaiting(false);
    }
  };

  useEffect(() => {
    setTx(undefined);
    setErr(null);
  }, [addr]);

  return (
    <main style={{ maxWidth: 900, margin: '30px auto', padding: '0 16px' }}>
      <h2>Admin Panel</h2>
      <p>Admin: {admin ?? '-'}</p>

      <section style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 8 }}>
        <h3>KYC & Partner</h3>
        <label>Address</label>
        <input
          placeholder="0x..."
          value={addr}
          onChange={(e) => setAddr(e.target.value as `0x${string}` | '')}
          style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
        />

        <p style={{ marginTop: 10 }}>
          KYC: <strong>{String(kyc)}</strong> • Partner State: <strong>{stateLabel}</strong>
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button onClick={() => call('setKYCTrue')} disabled={!addr || waiting}>
            Set KYC = true
          </button>
          <button onClick={() => call('approvePartner')} disabled={!addr || waiting}>
            Approve Partner
          </button>
        </div>

        {tx && (
          <p style={{ marginTop: 8 }}>
            Tx:{' '}
            <a
              href={`https://testnet.bscscan.com/tx/${tx}`}
              target="_blank"
              rel="noreferrer"
            >
              {tx}
            </a>{' '}
            Success ✓
          </p>
        )}
        {err && <p style={{ color: '#b91c1c' }}>Error: {err}</p>}
      </section>
    </main>
  );
}
