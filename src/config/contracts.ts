import addrs from "./addresses.testnet.json";

export const ADDR = {
  USDT: addrs.USDT as `0x${string}`,
  NBL:  addrs.NBL  as `0x${string}`,
  REG:  addrs.REG  as `0x${string}`,
  TREE: addrs.TREE as `0x${string}`,
  POOL: addrs.POOL as `0x${string}`,
  SALE: addrs.SALE as `0x${string}`,
};

export const CHAIN_ID = 97; // BSC Testnet
export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  process.env.NEXT_PUBLIC_RPC_BSC_TESTNET ||
  "https://bsc-testnet.publicnode.com";
