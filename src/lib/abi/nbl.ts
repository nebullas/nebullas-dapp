export const nblAbi = [
  { type:"function", name:"decimals", stateMutability:"view", inputs:[], outputs:[{type:"uint8"}]},
  { type:"function", name:"balanceOf", stateMutability:"view", inputs:[{name:"a",type:"address"}], outputs:[{type:"uint256"}]}
] as const;
