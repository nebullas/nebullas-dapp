/**
 * PartnerRegistry ABI — read & admin writes:
 * - kycPassed(address) -> bool
 * - stateOf(address)   -> uint8   (0:none,1:eligible,2:pending,3:approved जैसी कोई भी enum)
 * - applyAsPartner()
 * - setKYC(address,bool)
 * - approve(address)
 */
export const partnerRegistryAbi = [
  { type:'function', name:'kycPassed', stateMutability:'view',
    inputs:[{name:'u',type:'address'}], outputs:[{type:'bool'}] },

  { type:'function', name:'stateOf', stateMutability:'view',
    inputs:[{name:'u',type:'address'}], outputs:[{type:'uint8'}] },

  { type:'function', name:'applyAsPartner', stateMutability:'nonpayable', inputs:[], outputs:[] },

  { type:'function', name:'setKYC', stateMutability:'nonpayable',
    inputs:[{name:'u',type:'address'},{name:'v',type:'bool'}], outputs:[] },

  { type:'function', name:'approve', stateMutability:'nonpayable',
    inputs:[{name:'u',type:'address'}], outputs:[] }
] as const;
