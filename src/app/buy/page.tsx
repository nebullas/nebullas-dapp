"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useSearchParams } from "next/navigation";

import { ADDR } from "@/config/contracts";
import { usdtAbi } from "@/lib/abi/usdt";
import { nblSaleAbi } from "@/lib/abi/nblSale";

const ZERO = "0x0000000000000000000000000000000000000000" as const;
const asAddr = (s?: string | null): (`0x${string}` | undefined) =>
  s && /^0x[0-9a-fA-F]{40}$/.test(s) ? (s as `0x${string}`) : undefined;

export default function BuyPage() {
  const { address } = useAccount();
  const search = useSearchParams();
  const refParam = asAddr(search.get("ref")) ?? (ZERO as `0x${string}`);

  const [amount, setAmount] = useState<number>(50);

  // USDT decimals
  const decRead = useReadContract({
    address: ADDR.USDT,
    abi: usdtAbi,
    functionName: "decimals",
  });
  const dec = Number(decRead.data ?? 18);

  const amountWei = useMemo(() => {
    const a = BigInt(Math.floor((amount || 0) * 10 ** 6)); // अगर mUSDT=6 हो तो ओवरराइड
    return BigInt(Math.floor((amount || 0) * 10 ** dec));
  }, [amount, dec]);

  // Approve
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: approvePending,
    error: approveErr,
  } = useWriteContract();

  const approveRec = useWaitForTransactionReceipt({
    hash: approveHash,
    query: { enabled: !!approveHash },
  });

  function onApprove() {
    writeApprove({
      address: ADDR.USDT,
      abi: usdtAbi,
      functionName: "approve",
      args: [ADDR.SALE, amountWei],
    });
  }

  // Buy
  const {
    writeContract: writeBuy,
    data: buyHash,
    isPending: buyPending,
    error: buyErr,
  } = useWriteContract();

  const buyRec = useWaitForTransactionReceipt({
    hash: buyHash,
    query: { enabled: !!buyHash },
  });

  function onBuy() {
    writeBuy({
      address: ADDR.SALE,
      abi: nblSaleAbi,
      functionName: "buy", // ABI में buy(uint256 usdt, address ref)
      args: [amountWei, refParam],
    });
  }

  const waitingApprove = approvePending || approveRec.isLoading;
  const waitingBuy = buyPending || buyRec.isLoading;

  return (
    <main style={{ maxWidth: 920, margin: "30px auto", padding: "0 16px" }}>
      <h2>Nebullas • BSC Testnet</h2>

      <section style={{ border: "1px solid #e5e7eb", padding: 16, borderRadius: 8 }}>
        <h3>Buy NBL with USDT</h3>

        <label>USDT Amount</label>
        <input
          type="number"
          min={50}
          max={10000}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{ width: 160, padding: 8 }}
        />
        <p>Min 50 • Max 10000 USDT</p>

        <p>Referral: <code>{refParam === ZERO ? "—" : refParam}</code></p>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button onClick={onApprove} disabled={!address || waitingApprove}>
            Approve USDT
          </button>
          <button onClick={onBuy} disabled={!address || waitingBuy}>
            Buy
          </button>
        </div>

        {/* Approve status */}
        {approveHash && (
          <p style={{ marginTop: 8 }}>
            Approve Tx:{" "}
            <a
              href={`https://testnet.bscscan.com/tx/${approveHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {approveHash}
            </a>
          </p>
        )}
        {approveErr && (
          <p style={{ color: "crimson" }}>{String(approveErr.message ?? approveErr)}</p>
        )}
        {approveRec.isSuccess && <p style={{ color: "green" }}>Approve Success ✓</p>}

        {/* Buy status */}
        {buyHash && (
          <p style={{ marginTop: 8 }}>
            Buy Tx:{" "}
            <a
              href={`https://testnet.bscscan.com/tx/${buyHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {buyHash}
            </a>
          </p>
        )}
        {buyErr && <p style={{ color: "crimson" }}>{String(buyErr.message ?? buyErr)}</p>}
        {buyRec.isSuccess && <p style={{ color: "green" }}>Buy Success ✓</p>}
      </section>
    </main>
  );
}
