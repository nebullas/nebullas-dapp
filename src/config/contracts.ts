// src/config/contracts.ts
import addresses from './addresses.testnet.json' assert { type: 'json' };

export type Address = `0x${string}`;

type AddressBook = {
  USDT: Address;
  NBL: Address;
  REG: Address;   // PartnerRegistry
  TREE: Address;  // PartnerTree
  POOL: Address;  // PoolVault
  SALE: Address;  // NBLSaleV5
};

// ✅ JSON से आए addresses को type‑safe बनाएं
export const ADDR = addresses as AddressBook;

export const CHAIN_ID = 97; // BSC Testnet

// ✅ RPC URL — .env / variable से, वरना safe fallback
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_BSC_TESTNET ||
  process.env.NEXT_PUBLIC_RPC_URL ||
  'https://data-seed-prebsc-1-s1.binance.org:8545';

export const ZERO_ADDRESS: Address =
  '0x0000000000000000000000000000000000000000';

// PartnerState (guess: 0=None, 1=ELIGIBLE, 2=PENDING, 3=APPROVED)
export function stateLabel(state?: bigint | number) {
  const n = typeof state === 'bigint' ? Number(state) : state ?? -1;
  switch (n) {
    case 1: return 'ELIGIBLE';
    case 2: return 'PENDING';
    case 3: return 'APPROVED';
    case 0: return '-';
    default: return '-';
  }
}

export function short(addr?: Address) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—';
}
