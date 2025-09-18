'use client';

import { useAccount, useReadContract } from 'wagmi';
import { ADDR } from '@/config/contracts';
import { partnerRegistryAbi } from '@/lib/abi/partnerRegistry';

const STATE = ['NOT_ELIGIBLE', 'ELIGIBLE', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] as const;

export default function PartnerPage() {
  const { address } = useAccount();

  const { data: kyc } = useReadContract({
    address: ADDR.REG,
    abi: partnerRegistryAbi,
    functionName: 'kycPassed',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const { data: stateRaw } = useReadContract({
    address: ADDR.REG,
    abi: partnerRegistryAbi,
    functionName: 'stateOf',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const stateLabel = typeof stateRaw === 'number' ? STATE[stateRaw] ?? '-' : '-';

  return (
    <main style={{ maxWidth: 900, margin: '30px auto', padding: '0 16px' }}>
      <h2>Partner Dashboard</h2>
      <p>You: {address ?? '-'}</p>

      <section style={{ border: '1px solid #e5e7eb', padding: 16, borderRadius: 8 }}>
        <p>
          KYC: <strong>{String(Boolean(kyc))}</strong> • Partner State: <strong>{stateLabel}</strong>
        </p>
      </section>
    </main>
  );
}
