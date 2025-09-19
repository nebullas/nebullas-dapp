'use client';

import { useMemo, useState } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { ADDR } from '@/config/contracts';
import { partnerRegistryAbi } from '@/lib/abi/partnerRegistry';

type Addr = `0x${string}`;
const ZERO_ADDRESS: Addr =
  '0x0000000000000000000000000000000000000000';

const toAddr = (s: string | undefined): Addr | undefined =>
  s && s.startsWith('0x') && s.length === 42 ? (s as Addr) : undefined;

const STATE_LABEL: Record<number, string> = {
  0: '-',
  1: 'ELIGIBLE',
  2: 'PENDING',
  3: 'APPROVED',
};

export default function AdminPage() {
  const { address: connected } = useAccount();
  const [input, setInput] = useState<string>('');

  const target = useMemo(() => toAddr(input), [input]);

  // -------- Reads --------
  // kycPassed(address) -> bool
  const kycRead = useReadContract({
    address: ADDR.REG,
    abi: partnerRegistryAbi,
    functionName: 'kycPassed',
    args: [target ?? ZERO_ADDRESS] as readonly [Addr],
    // wagmi v2 में query.enable बेहतर है, पर हम ZERO भेज रहे हैं ताकि types सख़्त रहें
  });

  // stateOf(address) -> uint8
  const stateRead = useReadContract({
    address: ADDR.REG,
    abi: partnerRegistryAbi,
    functionName: 'stateOf',
    args: [target ?? ZERO_ADDRESS] as readonly [Addr],
  });

  const kyc = Boolean(kycRead.data);
  const partnerStateNum =
    typeof stateRead.data === 'number'
      ? stateRead.data
      : Number(stateRead.data ?? 0);
  const partnerState = STATE_LABEL[partnerStateNum] ?? '-';

  // -------- Writes --------
  const { writeContractAsync, data: txHash, isPending, error } =
    useWriteContract();

  const {
    isLoading: isMining,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const waiting = isPending || isMining;

  // setKYC(address,bool=true)
  async function onSetKYCTrue() {
    if (!target) return;
    await writeContractAsync({
      address: ADDR.REG,
      abi: partnerRegistryAbi,
      functionName: 'setKYC',
      args: [target, true] as readonly [Addr, boolean],
    });
  }

  // approve(address)  ← यदि आपके ABI में approve(address,bool) है
  // तो नीचे वाली पंक्ति को टिप्पणी में लिखे वेरिएंट से बदल दें।
  async function onApprovePartner() {
    if (!target) return;
    await writeContractAsync({
  address: ADDR.REG,
  abi: partnerRegistryAbi,
  functionName: 'approve',
  args: [target, true] as readonly [Addr, boolean],
});

  }

  return (
    <main style={{ maxWidth: 900, margin: '30px auto', padding: '0 16px' }}>
      <h2>Admin Panel</h2>
      <p>
        Admin:{' '}
        <code>{connected ?? '-'}</code>
      </p>

      <section
        style={{
          border: '1px solid #e5e7eb',
          padding: 16,
          borderRadius: 8,
          marginTop: 12,
        }}
      >
        <h3>KYC &amp; Partner</h3>
        <label style={{ display: 'block', margin: '12px 0 6px' }}>
          Address
        </label>
        <input
          placeholder="0x..."
          value={input}
          onChange={(e) => setInput(e.target.value.trim())}
          style={{ width: '100%', padding: 8 }}
        />

        <p style={{ marginTop: 10 }}>
          KYC: <strong>{String(kyc)}</strong> • Partner State:{' '}
          <strong>{partnerState}</strong>
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            onClick={onSetKYCTrue}
            disabled={!target || waiting}
          >
            Set KYC = true
          </button>
          <button
            onClick={onApprovePartner}
            disabled={!target || waiting}
          >
            Approve Partner
          </button>
        </div>

        {txHash && (
          <p style={{ marginTop: 8 }}>
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

        {error && (
          <p style={{ color: 'crimson', marginTop: 8 }}>
            {(error as any)?.shortMessage || (error as Error).message}
          </p>
        )}
        {isSuccess && <p style={{ color: 'green' }}>Success ✓</p>}
      </section>
    </main>
  );
}
