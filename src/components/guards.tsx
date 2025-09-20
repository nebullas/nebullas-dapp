'use client';

import { ReactNode } from 'react';
import { useAccount } from 'wagmi';
import ConnectBar from '@/components/ConnectBar';
import { ADDR } from '@/config/contracts';

export function RequireConnected({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  if (!isConnected) {
    return (
      <div>
        <ConnectBar />
        <p>कृपया अपना वॉलेट connect करें।</p>
      </div>
    );
  }
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAccount();
  const ok = isConnected && address &&
    address.toLowerCase() === ADDR.GUARDIAN.toLowerCase();
  if (!ok) {
    return (
      <div>
        <ConnectBar />
        <p>यह पेज केवल Admin के लिए है। सही wallet से connect करें।</p>
      </div>
    );
  }
  return <>{children}</>;
}
