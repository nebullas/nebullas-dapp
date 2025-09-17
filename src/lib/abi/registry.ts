export const registryAbi = [
  { type: "function", name: "kycPassed", stateMutability: "view",
    inputs: [{ name: "u", type: "address" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "stateOf", stateMutability: "view",
    inputs: [{ name: "u", type: "address" }], outputs: [{ type: "uint8" }] },
  { type: "function", name: "apply", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "approve", stateMutability: "nonpayable",
    inputs: [{ name: "u", type: "address" }, { name: "ok", type: "bool" }], outputs: [] },
  { type: "function", name: "setKYC", stateMutability: "nonpayable",
    inputs: [{ name: "u", type: "address" }, { name: "ok", type: "bool" }], outputs: [] }
] as const;
