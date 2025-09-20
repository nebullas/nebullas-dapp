/**
 * कॉन्ट्रैक्ट एड्रेस लोडर (BSC Testnet)
 * नोट: src/config/addresses.testnet.json से मैप करें।
 */
import addrs from './addresses.testnet.json';

export const ADDR = {
  USDT: (addrs as any).USDT as `0x${string}`,
  NBL:  (addrs as any).NBL as `0x${string}`,
  SALE: (addrs as any).NBLSale as `0x${string}`,
  REGISTRY: (addrs as any).PartnerRegistry as `0x${string}`,
  TREE: (addrs as any).PartnerTree as `0x${string}`,
} as const;

/** RPC — अगर .env में न हो तो पब्लिक टेस्टनेट नोड पर fallback */
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_BSC_TESTNET ??
  'https://data-seed-prebsc-2-s3.binance.org:8545/';
