'use client';

import { useState, useMemo } from 'react';
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

const STATES = [
  'NOT_ELIGIBLE',
  'ELIGIBLE',
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
] as const;

export default function AdminPage() {
  const { address: connected, isConnected } = useAccount();

  // ---------------- KYC & Partner (Registry) ----------------
  const [who, setWho] = useState<string>('');
  const whoAddr: Addr | undefined =
    who && who.startsWith('0x') && who.length === 42 ? (who as Addr) : undefined;

  const kycRead = useReadContract({
    address: ADDR.REG,
    abi: partnerRegistryAbi,
    functionName: 'kycPassed',
    args: [whoAddr ?? ('0x0000000000000000000000000000000000000000' as Addr)],
    query: { enabled: Boolean(whoAddr) },
  });

  const stateRead = useReadContract({
    address: ADDR.REG,
    abi: partnerRegistryAbi,
    functionName: 'stateOf',
    args: [whoAddr ?? ('0x0000000000000000000000000000000000000000' as Addr)],
    query: { enabled: Boolean(whoAddr) },
  });

  const stateLabel = useMemo(() => {
    const v = stateRead.data as number | undefined;
    return typeof v === 'number' ? STATES[v] : '-';
  }, [stateRead.data]);

  const { writeContract, data: txHash, isPending, reset, error } = useWriteContract();
  const waitTx = useWaitForTransactionReceipt({ hash: txHash });

  const waiting = isPending || waitTx.isLoading;

  const onSetKYCTrue = () => {
    if (!whoAddr) return;
    writeContract({
      address: ADDR.REG,
      abi: partnerRegistryAbi,
      functionName: 'setKYC',
      args: [whoAddr, true],
    });
  };

  const onApprovePartner = () => {
    if (!whoAddr) return;
    writeContract({
      address: ADDR.REG,
      abi: partnerRegistryAbi,
      functionName: 'approve',
      args: [whoAddr, true],
    });
  };

  // ---------------- Partner Network — Bind Upline (Tree) ----------------
  const [user, setUser] = useState<string>('');
  const [referrer, setReferrer] = useState<string>('');
  const userAddr: Addr | undefined =
    user && user.startsWith('0x') && user.length === 42 ? (user as Addr) : undefined;
  const refAddr: Addr | undefined =
    referrer && referrer.startsWith('0x') && referrer.length === 42
      ? (referrer as Addr)
      : undefined;

  const {
    writeContract: writeBind,
    data: bindHash,
    isPending: bindPending,
    error: bindError,
  } = useWriteContract();

  const bindWait = useWaitForTransactionReceipt({ hash: bindHash });
  const bindWaiting = bindPending || bindWait.isLoading;

  const onBindReferrer = () => {
    if (!userAddr || !refAddr) return;
    writeBind({
      address: ADDR.TREE,
      abi: partnerTreeAbi,
      functionName: 'bindReferrer',
      args: [userAddr, refAddr],
    });
  };

  // ---------------- UI ----------------
  return (
    <main style={{ maxWidth: 900, margin: '30px auto', padding: '0 16px' }}>
      <h2>Admin Panel</h2>
      <p style={{ marginBottom: 12 }}>
        <small>Admin: {connected ?? '-'}</small>
      </p>

      {/* KYC & Partner */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 20 }}>
        <h3>KYC & Partner</h3>

        <label htmlFor="who">Address</label>
        <input
          id="who"
          placeholder="0x..."
          value={who}
          onChange={(e) => setWho(e.target.value.trim())}
          style={{ width: '100%', padding: 8, margin: '6px 0 12px', fontFamily: 'monospace' }}
        />

        <p>
          KYC: <strong>{String(Boolean(kycRead.data))}</strong> • Partner State:{' '}
          <strong>{stateLabel}</strong>
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button onClick={onSetKYCTrue} disabled={!isConnected || !whoAddr || waiting}>
            Set KYC = true
          </button>
          <button onClick={onApprovePartner} disabled={!isConnected || !whoAddr || waiting}>
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
        {waitTx.isSuccess && <p style={{ color: 'green' }}>Success ✓</p>}
        {error && <p style={{ color: 'crimson' }}>Error: {String(error.shortMessage || error.message)}</p>}
      </section>

      {/* Partner Network — Bind Upline */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        <h3>Partner Network — Bind Upline</h3>

        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <label htmlFor="user">User (0x...)</label>
            <input
              id="user"
              placeholder="0x..."
              value={user}
              onChange={(e) => setUser(e.target.value.trim())}
              style={{ width: '100%', padding: 8, marginTop: 6, fontFamily: 'monospace' }}
            />
          </div>

          <div>
            <label htmlFor="ref">Referrer (0x...)</label>
            <input
              id="ref"
              placeholder="0x..."
              value={referrer}
              onChange={(e) => setReferrer(e.target.value.trim())}
              style={{ width: '100%', padding: 8, marginTop: 6, fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ marginTop: 6 }}>
            <button
              onClick={onBindReferrer}
              disabled={!isConnected || !userAddr || !refAddr || bindWaiting}
            >
              Bind Referrer
            </button>
          </div>

          {bindHash && (
            <p style={{ marginTop: 8 }}>
              Tx:{' '}
              <a
                href={`https://testnet.bscscan.com/tx/${bindHash}`}
                target="_blank"
                rel="noreferrer"
              >
                {bindHash}
              </a>
            </p>
          )}
          {bindWait.isSuccess && <p style={{ color: 'green' }}>Success ✓</p>}
          {bindError && (
            <p style={{ color: 'crimson' }}>Error: {String(bindError.shortMessage || bindError.message)}</p>
          )}
        </div>
      </section>
    </main>
  );
}
