"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { ADDR } from "@/config/contracts";
import { usdtAbi } from "@/lib/abi/usdt";
import { nblSaleAbi } from "@/lib/abi/nblSale";
import { nblAbi } from "@/lib/abi/nbl";

const ZERO = "0x0000000000000000000000000000000000000000" as const;

export default function BuyCard() {
  // 0) Mount flag (hooks हमेशा कॉल होंगे; reads केवल enable/disable होंगे)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 1) UI base
  const { address } = useAccount();
  const owner = address ?? ZERO;
  const [amount, setAmount] = useState<string>("50");
  const [usdtDec, setUsdtDec] = useState<number>(18);

  // 2) Reads — हर render में सभी hooks कॉल; query.enabled से gate
  const { data: dUSDT } = useReadContract({
    address: ADDR.USDT,
    abi: usdtAbi,
    functionName: "decimals",
    query: { enabled: mounted },
  });
  useEffect(() => {
    if (typeof dUSDT === "number") setUsdtDec(dUSDT);
  }, [dUSDT]);

  const { data: minUSDT } = useReadContract({
    address: ADDR.SALE,
    abi: nblSaleAbi,
    functionName: "minUSDT",
    query: { enabled: mounted },
  });

  const { data: maxUSDT } = useReadContract({
    address: ADDR.SALE,
    abi: nblSaleAbi,
    functionName: "maxUSDT",
    query: { enabled: mounted },
  });

  const { data: allowance } = useReadContract({
    address: ADDR.USDT,
    abi: usdtAbi,
    functionName: "allowance",
    args: [owner, ADDR.SALE],
    query: { enabled: mounted && owner !== ZERO },
  });

  const { data: nblBal } = useReadContract({
    address: ADDR.NBL,
    abi: nblAbi,
    functionName: "balanceOf",
    args: [owner],
    query: { enabled: mounted && owner !== ZERO },
  });

  // 3) Writes (हमेशा कॉल; input बदल सकता है)
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // 4) Derived
  const amtUnits = useMemo(() => {
    try { return parseUnits(amount || "0", usdtDec); } catch { return 0n; }
  }, [amount, usdtDec]);

  const needApprove = useMemo(() => {
    const a = (allowance ?? 0n) as bigint;
    return a < amtUnits;
  }, [allowance, amtUnits]);

  // 5) Actions
  const doApprove = () =>
    writeContract({
      address: ADDR.USDT,
      abi: usdtAbi,
      functionName: "approve",
      args: [ADDR.SALE, amtUnits],
    });

  const doBuy = () =>
    address &&
    writeContract({
      address: ADDR.SALE,
      abi: nblSaleAbi,
      functionName: "buy",
      args: [amtUnits, address],
    });

  // 6) UI (कोई early return नहीं)
  return (
    <div style={{ border: "1px solid #e5e7eb", padding: 16, borderRadius: 8, maxWidth: 520 }}>
      <h3>Buy NBL with USDT</h3>

      <div style={{ marginTop: 8 }}>
        <label>USDT Amount</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="50"
          style={{ width: "100%", padding: 8, marginTop: 6 }}
          inputMode="decimal"
        />
        <small>
          Min {minUSDT ? Number(formatUnits(minUSDT as bigint, usdtDec)) : "-"} •{" "}
          Max {maxUSDT ? Number(formatUnits(maxUSDT as bigint, usdtDec)) : "-"} USDT
        </small>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {needApprove ? (
          <button onClick={doApprove} disabled={isPending || isMining || !mounted || owner===ZERO} style={{ padding: "8px 12px" }}>
            {isPending || isMining ? "Approving…" : "Approve USDT"}
          </button>
        ) : (
          <button onClick={doBuy} disabled={isPending || isMining || !mounted || owner===ZERO} style={{ padding: "8px 12px" }}>
            {isPending || isMining ? "Buying…" : "Buy NBL"}
          </button>
        )}
      </div>

      {txHash && (
        <div style={{ marginTop: 8 }}>
          <small>Tx: {txHash}</small>
        </div>
      )}
      {isSuccess && <div style={{ marginTop: 8, color: "green" }}>Success ✓</div>}

      <hr style={{ margin: "16px 0" }} />
      <div>
        <small>
          Your NBL: {nblBal ? Number(formatUnits(nblBal as bigint, 18)).toLocaleString() : "-"}
        </small>
      </div>
    </div>
  );
}
