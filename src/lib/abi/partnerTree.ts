// src/lib/abi/partnerTree.ts
export const partnerTreeAbi = [
  // view: uplines(address) -> address[6]
  {
    "inputs":[{"internalType":"address","name":"u","type":"address"}],
    "name":"uplines",
    "outputs":[{"internalType":"address[6]","name":"","type":"address[6]"}],
    "stateMutability":"view","type":"function"
  },
  // view: referrerOf(address) -> address
  {
    "inputs":[{"internalType":"address","name":"","type":"address"}],
    "name":"referrerOf",
    "outputs":[{"internalType":"address","name":"","type":"address"}],
    "stateMutability":"view","type":"function"
  },
  // onlyAdmin: bindReferrer(user, ref)
  {
    "inputs":[
      {"internalType":"address","name":"user","type":"address"},
      {"internalType":"address","name":"ref","type":"address"}
    ],
    "name":"bindReferrer","outputs":[],
    "stateMutability":"nonpayable","type":"function"
  }
] as const;

export default partnerTreeAbi;