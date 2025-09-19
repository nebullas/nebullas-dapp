'use client';

import { useMemo } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { ADDR } from '@/config/contracts';
import { partnerRegistryAbi } from '@/lib/abi/partnerRegistry';
import { partnerTreeAbi } from '@/lib/abi/partnerTree';

type Addr = `0x${string}`;
const ZERO_ADDRESS: Addr =
  '0x0000000000000000000000000000000000000000';

const STATE_LABEL: Record<number, string> = {
  0: '-',
  1: 'ELIGIBLE',
  2: 'PENDING',
  3: 'APPROVED',
};

export default function PartnerPage() {
  const { address } = useAccount();

  const me: Addr | undefined =
    address && address.length === 42 ? (address as Addr) : undefined;

  // ---------- Reads ----------
  // KYC + State
  const kycRead = useReadContract({
    address: ADDR.REG,
    abi: partnerRegistryAbi,
    functionName: 'kycPassed',
    args: [me ?? ZERO_ADDRESS] as readonly [Addr],
  });

  const stateRead = useReadContract({
    address: ADDR.REG,
    abi: partnerRegistryAbi,
    functionName: 'stateOf',
    args: [me ?? ZERO_ADDRESS] as readonly [Addr],
  });

  const kyc = Boolean(kycRead.data);
  const partnerStateNum =
    typeof stateRead.data === 'number'
      ? stateRead.data
      : Number(stateRead.data ?? 0);
  const partnerState = STATE_LABEL[partnerStateNum] ?? '-';

  // Uplines (address[6])
  const upsRead = useReadContract({
    address: ADDR.TREE,
    abi: partnerTreeAbi,
    functionName: 'uplines', // ← ABI में यही नाम है
    args: [me ?? ZERO_ADDRESS] as readonly [Addr],
  });

  const uplines: Addr[] = useMemo(() => {
    const v = upsRead.data as unknown;
    if (Array.isArray(v)) return v as Addr[];
    return [];
  }, [upsRead.data]);

  // ---------- Write: applyAsPartner() ----------
  const { writeContractAsync, data: hash, isPending, error } =
    useWriteContract();
  const { isLoading: mining, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const waiting = isPending || mining;

  async function onApply() {
    if (!me) return;
    await writeContractAsync({
      address: ADDR.REG,
      abi: partnerRegistryAbi,
      functionName: 'applyAsPartner',
      args: [] as const,
    });
  }

  const approved = partnerState === 'APPROVED';
  const referral =
    approved && me
      ? `${location.origin}/buy?ref=${me}`
      : '';

  return (
    <main style={{ maxWidth: 900, margin: '30px auto', padding: '0 16px' }}>
      <h2>Partner Dashboard</h2>
      <p>You: <code>{me ?? '-'}</code></p>

      <section
        style={{
          border: '1px solid #e5e7eb',
          padding: 16,
          borderRadius: 8,
          marginTop: 12,
        }}
      >
        <p>
          KYC: <strong>{String(kyc)}</strong> • Partner State:{' '}
          <strong>{partnerState}</strong>
        </p>

        <button onClick={onApply} disabled={!me || waiting || approved}>
          Apply as Partner
        </button>

        {hash && (
          <p style={{ marginTop: 8 }}>
            Tx:{' '}
            <a
              href={`https://testnet.bscscan.com/tx/${hash}`}
              target="_blank"
              rel="noreferrer"
            >
              {hash}
            </a>
          </p>
        )}
        {error && (
          <p style={{ color: 'crimson', marginTop: 8 }}>
            {(error as any)?.shortMessage || (error as Error).message}
          </p>
        )}
        {isSuccess && <p style={{ color: 'green' }}>Success ✓</p>}

        {approved && referral && (
          <p style={{ marginTop: 12 }}>
            <strong>Your Referral Link:</strong>{' '}
            <a href={referral} target="_blank" rel="noreferrer">
              {referral}
            </a>
          </p>
        )}
      </section>

      <section
        style={{
          border: '1px solid #e5e7eb',
          padding: 16,
          borderRadius: 8,
          marginTop: 16,
        }}
      >
        <h3>Uplines (6‑level)</h3>
        {Array.from({ length: 6 }).map((_, i) => (
          <p key={i}>
            L{i + 1}: <code>{uplines?.[i] ?? '—'}</code>
          </p>
        ))}
      </section>
    </main>
  );
}
