// src/lib/abi/partnerRegistry.ts
export const partnerRegistryAbi = [
  // view: kycPassed(address) -> bool
  {
    "inputs": [{"internalType":"address","name":"u","type":"address"}],
    "name":"kycPassed",
    "outputs":[{"internalType":"bool","name":"","type":"bool"}],
    "stateMutability":"view","type":"function"
  },
  // view: stateOf(address) -> uint8 (enum State का underlying)
  {
    "inputs":[{"internalType":"address","name":"","type":"address"}],
    "name":"stateOf",
    "outputs":[{"internalType":"uint8","name":"","type":"uint8"}],
    "stateMutability":"view","type":"function"
  },
  // admin helpers (अगर UI में लगें)
  {
    "inputs":[], "name":"ADMIN_ROLE",
    "outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],
    "stateMutability":"view","type":"function"
  },
  // onlyAdmin: setKYC(address,bool)
  {
    "inputs":[
      {"internalType":"address","name":"u","type":"address"},
      {"internalType":"bool","name":"ok","type":"bool"}
    ],
    "name":"setKYC","outputs":[],"stateMutability":"nonpayable","type":"function"
  },
  // user action: applyAsPartner()
  {
    "inputs":[], "name":"applyAsPartner",
    "outputs":[], "stateMutability":"nonpayable","type":"function"
  },
  // onlyAdmin: approve(address,bool)
  {
    "inputs":[
      {"internalType":"address","name":"u","type":"address"},
      {"internalType":"bool","name":"ok","type":"bool"}
    ],
    "name":"approve","outputs":[],
    "stateMutability":"nonpayable","type":"function"
  }
] as const;

export default partnerRegistryAbi;