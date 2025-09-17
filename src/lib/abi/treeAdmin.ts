export const treeAdminAbi = [
  {
    type: "function",
    name: "bindReferrer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "ref",  type: "address" }
    ],
    outputs: []
  }
] as const;
