'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ADDR } from '@/config/contracts';
import { usdtAbi } from '@/lib/abi/usdt';
import { nblSaleAbi } from '@/lib/abi/nblSale';

function toWei(amount: string | number, decimals: number) {
  const bn = BigInt(Math.round(Number(amount) * 10 ** 6)) * (10n ** BigInt(decimals - 6)); // safe for 6..18
  return bn;
}

export default function BuyPage() {
  const { address, isConnected } = useAccount();

  // referral पकड़ें (URL / localStorage)
  const [ref, setRef] = useState<`0x${string}` | undefined>();
  useEffect(() => {
    const u = new URL(window.location.href);
    const r = u.searchParams.get('ref') as `0x${string}` | null;
    const saved = window.localStorage.getItem('ref') as `0x${string}` | null;
    const finalRef = (r ?? saved ?? undefined) as `0x${string}` | undefined;
    if (r) window.localStorage.setItem('ref', r);
    setRef(finalRef);
  }, []);

  const [amount, setAmount] = useState('50'); // USDT

  // USDT.decimals
  const decRead = useReadContract({
    address: ADDR.USDT,
    abi: usdtAbi,
    functionName: 'decimals',
    args: [],
    query: { enabled: Boolean(ADDR.USDT) }
  });

  // allowance(o,s)
  const allowance = useReadContract({
    address: ADDR.USDT,
    abi: usdtAbi,
    functionName: 'allowance',
    args: [address ?? '0x0000000000000000000000000000000000000000', ADDR.SALE],
    query: { enabled: isConnected }
  });

  const needApprove = useMemo(() => {
    const dec = Number(decRead.data ?? 18);
    const wei = toWei(amount, dec);
    const cur = BigInt(allowance.data ?? 0n);
    return cur < wei;
  }, [allowance.data, decRead.data, amount]);

  // Approve
  const { writeContract, data: hashApprove, isPending: isWritingApprove, error: errApprove } = useWriteContract();
  const waitApprove = useWaitForTransactionReceipt({ hash: hashApprove });

  // Buy
  const { writeContract: writeBuy, data: hashBuy, isPending: isWritingBuy, error: errBuy } = useWriteContract();
  const waitBuy = useWaitForTransactionReceipt({ hash: hashBuy });

  const onApprove = () => {
    const dec = Number(decRead.data ?? 18);
    const wei = toWei(amount, dec);
    writeContract({
      address: ADDR.USDT,
      abi: usdtAbi,
      functionName: 'approve',
      args: [ADDR.SALE, wei]
    });
  };

  const onBuy = () => {
    const dec = Number(decRead.data ?? 18);
    const wei = toWei(amount, dec);
    writeBuy({
      address: ADDR.SALE,
      abi: nblSaleAbi,
      functionName: 'buy',
      args: [wei, ref ?? '0x0000000000000000000000000000000000000000']
    });
  };

  return (
    <main>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2>Nebullas • BSC Testnet</h2>
        {/* ऊपर लेआउट में ConnectBar है; buy में कंडीशनल टेक्स्ट */}
        <div>{isConnected ? <code>{address?.slice(0,6)}…{address?.slice(-4)}</code> : <span>Connect wallet (top‑right)</span>}</div>
      </div>

      <section className="card">
        <h3>Buy NBL with USDT</h3>

        <p>USDT Amount</p>
        <input value={amount} onChange={e => setAmount(e.target.value)} style={{ width:220 }} />

        <p style={{ marginTop:8 }}>Min 50 • Max 10000 USDT</p>
        <p>Referral: <code>{ref ?? '-'}</code></p>

        <div style={{ display:'flex', gap:8, marginTop:10 }}>
          <button onClick={onApprove} disabled={!isConnected || !needApprove || isWritingApprove}>
            {isWritingApprove ? 'Approving…' : 'Approve USDT'}
          </button>
          <button onClick={onBuy} disabled={!isConnected || needApprove || isWritingBuy}>
            {isWritingBuy ? 'Buying…' : 'Buy'}
          </button>
        </div>

        {hashApprove && <p>Approve Tx: <a href={`https://testnet.bscscan.com/tx/${hashApprove}`} target="_blank">open</a></p>}
        {waitApprove.isSuccess && <p>Approval Success ✓</p>}
        {errApprove && <p style={{color:'crimson'}}>Error: {String((errApprove as any)?.shortMessage ?? errApprove.message)}</p>}

        {hashBuy && <p>Buy Tx: <a href={`https://testnet.bscscan.com/tx/${hashBuy}`} target="_blank">open</a></p>}
        {waitBuy.isSuccess && <p>Success ✓</p>}
        {errBuy && <p style={{color:'crimson'}}>Error: {String((errBuy as any)?.shortMessage ?? errBuy.message)}</p>}
      </section>
    </main>
  );
}
