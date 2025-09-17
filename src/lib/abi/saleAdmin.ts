export const saleAdminAbi = [
  { type: "function", name: "pause", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "unpause", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "saleClosed", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "activePhase", stateMutability: "view", inputs: [], outputs: [{ type: "int8" }] }
] as const;
