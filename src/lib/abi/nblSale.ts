export const nblSaleAbi = [
  { type:"function", name:"buy", stateMutability:"nonpayable",
    inputs:[{name:"amount",type:"uint256"},{name:"expectedBuyer",type:"address"}], outputs:[] },
  { type:"function", name:"minUSDT", stateMutability:"view", inputs:[], outputs:[{type:"uint256"}]},
  { type:"function", name:"maxUSDT", stateMutability:"view", inputs:[], outputs:[{type:"uint256"}]},
  { type:"function", name:"usdtDecimals", stateMutability:"view", inputs:[], outputs:[{type:"uint8"}]},
  { type:"function", name:"activePhase", stateMutability:"view", inputs:[], outputs:[{type:"int8"}] }
] as const;
