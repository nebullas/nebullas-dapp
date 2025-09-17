export const partnerRegistryAbi = [
  { "inputs": [], "name": "applyAsPartner", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType":"address","name":"u","type":"address"}],
    "name": "kycPassed", "outputs":[{"internalType":"bool","name":"","type":"bool"}],
    "stateMutability":"view","type":"function" },
  { "inputs": [{"internalType":"address","name":"u","type":"address"}],
    "name": "stateOf", "outputs":[{"internalType":"uint8","name":"","type":"uint8"}],
    "stateMutability":"view","type":"function" }
] as const;
