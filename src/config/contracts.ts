// src/config/contracts.ts
// Addresses JSON से आते हैं; tsconfig में resolveJsonModule=true होना चाहिए.
import ADDR_JSON from "./addresses.testnet.json";

export type Address = `0x${string}`;

// Dapp में centralized, typed addresses
export const ADDR = ADDR_JSON as {
  USDT: Address;
  NBL: Address;
  REG: Address;
  TREE: Address;
  POOL: Address;
  SALE: Address;
};

// Public RPC (env से), fallback BSC testnet public RPC
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_BSC_TESTNET ||
  "https://data-seed-prebsc-1-s1.binance.org:8545";
