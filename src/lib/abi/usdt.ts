export const usdtAbi = [
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{type:'uint8'}] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{name:'a',type:'address'}], outputs: [{type:'uint256'}] },
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{name:'o',type:'address'},{name:'s',type:'address'}], outputs: [{type:'uint256'}] },
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{name:'s',type:'address'},{name:'amt',type:'uint256'}], outputs: [{type:'bool'}] }
] as const;
