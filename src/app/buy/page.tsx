'use client';
import React, { useMemo, useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useSearchParams } from 'next/navigation';
import { usdtAbi } from '@/lib/abi/usdt';
import { nblSaleAbi } from '@/lib/abi/nblSale';
import { ADDR } from '@/config/contracts';

type EAddr = `0x${string}`;

export default function BuyPage() {
  const { address } = useAccount();
  const params = useSearchParams();
  const ref = (params.get('ref') as EAddr | null) ?? null;

  const [amount, setAmount] = useState<number>(50);

  const decRead = useReadContract({ address: ADDR.USDT, abi: usdtAbi, functionName: 'decimals', args: [] as const });
  const minRead = useReadContract({ address: ADDR.SALE, abi: nblSaleAbi, functionName: 'minUSDT', args: [] as const });

  const usdtDec = Number(decRead.data ?? 18);
  const min = Number(minRead.data ?? 50);

  const { writeContract: write, isPending, data: hash } = useWriteContract();

  const parsedAmt = useMemo(() => BigInt(Math.round(amount * 10 ** usdtDec)), [amount, usdtDec]);

  const onApprove = () => {
    if (!address) return;
    write({
      address: ADDR.USDT,
      abi: usdtAbi,
      functionName: 'approve',
      args: [ ADDR.SALE, parsedAmt ] as const,
    });
  };

  const onBuy = () => {
    if (!address) return;
    write({
      address: ADDR.SALE,
      abi: nblSaleAbi,
      functionName: 'buy',
      args: [ parsedAmt, (ref as EAddr) ?? (address as EAddr) ] as const,
    });
  };

  return (
    <>
      <h1 style={{fontSize:32,margin:'8px 0 18px'}}>Buy NBL with USDT</h1>

      {!address ? <p style={{textAlign:'right',margin:'-28px 0 12px'}}>कृपया ऊपर‑दायें **Connect Wallet** दबाएँ।</p> : null}

      <section style={{border:'1px solid #eee',borderRadius:8,padding:18}}>
        <label>USDT Amount</label>
        <input
          type="number"
          min={min}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{display:'block',width:240,padding:10,margin:'6px 0 10px',border:'1px solid #ddd',borderRadius:8}}
        />

        <p>Min {min} • Max 10000 USDT</p>

        <p style={{margin:'10px 0 16px'}}>Referral: <code>{ref ?? '—'}</code></p>

        <div style={{display:'flex',gap:10}}>
          <button onClick={onApprove} disabled={!address || isPending}>Approve USDT</button>
          <button onClick={onBuy} disabled={!address || isPending}>Buy</button>
        </div>

        {hash ? (
          <p style={{marginTop:8}}>
            Tx:{' '}
            <a href={`https://testnet.bscscan.com/tx/${hash}`} target="_blank" rel="noreferrer">{hash}</a>
          </p>
        ) : null}
      </section>
    </>
  );
}
