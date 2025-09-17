export const treeAbi = [
  { type: "function", name: "uplines", stateMutability: "view",
    inputs: [{ name: "u", type: "address" }], outputs: [{ type: "address[6]" }] }
] as const;
