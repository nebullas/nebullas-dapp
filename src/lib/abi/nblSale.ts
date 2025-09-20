export const nblSaleAbi = [
  // buy(usdtAmount, referrer) — बहुत‐सी ICO sales ऐसा सिग्नेचर रखती हैं
  { type:'function', name:'buy', stateMutability:'nonpayable',
    inputs:[{name:'usdtAmount',type:'uint256'},{name:'referrer',type:'address'}], outputs:[] },
  // वैकल्पिक: यूज़र का NBL बैलेंस क्वेरी कर लें (sale से ही mint/transfer हो)
  { type:'function', name:'nbl', stateMutability:'view', inputs:[], outputs:[{type:'address'}] }
] as const;
