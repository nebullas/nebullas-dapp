/**
 * PartnerTree ABI — रेफ़रल/अपलाइन पढ़ना:
 * - getUplines(address) -> address[6]
 * - referrerOf(address) -> address
 * - bindReferrer(address user, address referrer)   (optional write)
 */
export const partnerTreeAbi = [
  { type:'function', name:'getUplines', stateMutability:'view',
    inputs:[{name:'u',type:'address'}], outputs:[{type:'address[6]'}] },

  { type:'function', name:'referrerOf', stateMutability:'view',
    inputs:[{name:'u',type:'address'}], outputs:[{type:'address'}] },

  { type:'function', name:'bindReferrer', stateMutability:'nonpayable',
    inputs:[{name:'user',type:'address'},{name:'referrer',type:'address'}], outputs:[] }
] as const;
