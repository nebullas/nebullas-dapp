// src/lib/abi/partnerRegistry.ts
// Minimal ABI needed by admin/partner pages.
export const partnerRegistryAbi = [
  {
    type: "function",
    name: "kycPassed",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "stateOf",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "setKYC",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "ok", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "ok", type: "bool" },
    ],
    outputs: [],
  },
] as const;
