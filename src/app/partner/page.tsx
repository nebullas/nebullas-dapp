'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, usePublicClient, useReadContract, useWriteContract } from 'wagmi';
import type { Address } from 'viem';
import { BaseError } from 'viem';

import { ADDR } from '@/config/contracts';
import { partnerRegistryAbi } from '@/lib/abi/partnerRegistry';
import { partnerTreeAbi } from '@/lib/abi/partnerTree';

const fmt = (a?: Address | string | null) =>
  !a || /^0x0{40}$/i.test(a as string) ? '—' : (a as string);

const STATE_LABEL: Record<number, string> = {
  0: '-',        // unknown / none
  1: 'PENDING',
  2: 'APPROVED',
  3: 'BANNED',
  4: 'ELIGIBLE',
};

export default function PartnerPage() {
  const { address } = useAccount();
  const client = usePublicClient();
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tx, setTx] = useState<Address | undefined>();
  const [waiting, setWaiting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => setHydrated(true), []);

  // Reads
  const kycRead = useReadContract({
    address: ADDR.REG as Address,
    abi: partnerRegistryAbi,
    functionName: 'kyc',
    args: [address as Address],
    query: { enabled: Boolean(address) },
  });

  const stateRead = useReadContract({
    address: ADDR.REG as Address,
    abi: partnerRegistryAbi,
    functionName: 'partnerState',
    args: [address as Address],
    query: { enabled: Boolean(address) },
  });

  const uplinesRead = useReadContract({
    address: ADDR.TREE as Address,
    abi: partnerTreeAbi,
    functionName: 'getUplines',
    args: [address as Address],
    query: { enabled: Boolean(address) },
  });

  const kyc = (kycRead.data as boolean | undefined) ?? false;
  const stateNum = Number(stateRead.data ?? 0);
  const stateLabel = STATE_LABEL[stateNum] ?? '-';

  const refLink = useMemo(() => {
    if (!hydrated || !address) return '';
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://example.com';
    return `${origin}/buy?ref=${address}`;
  }, [address, hydrated]);

  // Writes
  const { writeContractAsync } = useWriteContract();

  const onApply = async () => {
    if (!address) return;
    setErr(null);
    setWaiting(true);
    try {
      const hash = await writeContractAsync({
        address: ADDR.REG as Address,
        abi: partnerRegistryAbi,
        functionName: 'applyAsPartner',
      });
      setTx(hash as Address);
      await client.waitForTransactionReceipt({ hash });
      stateRead.refetch?.();
    } catch (e: unknown) {
      const msg = e instanceof BaseError ? e.shortMessage ?? e.message : (e as Error).message;
      setErr(msg);
    } finally {
      setWaiting(false);
    }
  };

  return (
    <main style={{ maxWidth: 900, margin: '30px auto', padding: '0 16px' }}>
      <h2>Partner Dashboard</h2>
      <p>You: {address ?? '-'}</p>

      <section style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 8 }}>
        <p>
          KYC: <strong>{String(kyc)}</strong> • Partner State:{' '}
          <strong>{stateLabel}</strong>
        </p>

        {stateLabel !== 'APPROVED' && (
          <button onClick={onApply} disabled={!address || waiting}>
            Apply as Partner
          </button>
        )}

        {stateLabel === 'APPROVED' && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontWeight: 600 }}>Your referral link:</label>
              <code style={{ padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: 6 }}>
                {refLink || '—'}
              </code>
              <button
                onClick={async () => {
                  if (!refLink) return;
                  await navigator.clipboard.writeText(refLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1000);
                }}
              >
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
            <small>Share this link; buyers will auto‑bind as your L1 before purchase.</small>
          </div>
        )}

        {tx && (
          <p>
            Tx:{' '}
            <a
              href={`https://testnet.bscscan.com/tx/${tx}`}
              target="_blank"
              rel="noreferrer"
            >
              {tx}
            </a>
            &nbsp;Success ✓
          </p>
        )}
        {err && <p style={{ color: '#b91c1c' }}>Error: {err}</p>}
      </section>

      <section style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 8, marginTop: 20 }}>
        <h3>Uplines (6‑level)</h3>
        <p>L1: {fmt((uplinesRead.data as Address[] | undefined)?.[0])}</p>
        <p>L2: {fmt((uplinesRead.data as Address[] | undefined)?.[1])}</p>
        <p>L3: {fmt((uplinesRead.data as Address[] | undefined)?.[2])}</p>
        <p>L4: {fmt((uplinesRead.data as Address[] | undefined)?.[3])}</p>
        <p>L5: {fmt((uplinesRead.data as Address[] | undefined)?.[4])}</p>
        <p>L6: {fmt((uplinesRead.data as Address[] | undefined)?.[5])}</p>
      </section>
    </main>
  );
}
