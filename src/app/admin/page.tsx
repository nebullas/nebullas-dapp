"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ADDR } from "@/config/contracts";
import { registryAbi } from "@/lib/abi/registry";
import { saleAdminAbi } from "@/lib/abi/saleAdmin";
import { useMemo, useState } from "react";

const STATE_LABELS = [
  "NOT_ELIGIBLE", "ELIGIBLE", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"
] as const;

export default function AdminPage() {
  const { address: admin } = useAccount();
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: mining, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // Read sale status
  const { data: activeIdx } = useReadContract({ address: ADDR.SALE, abi: saleAdminAbi, functionName: "activePhase" });
  const { data: closed }    = useReadContract({ address: ADDR.SALE, abi: saleAdminAbi, functionName: "saleClosed" });

  // KYC panel state
  const [target, setTarget] = useState<string>("");
  const { data: kycOK } = useReadContract({
    address: ADDR.REG, abi: registryAbi, functionName: "kycPassed",
    args: [ (target && target.length===42 ? (target as `0x${string}`) : ADDR.NBL) ] // dummy arg when empty
  });
  const { data: stateRaw } = useReadContract({
    address: ADDR.REG, abi: registryAbi, functionName: "stateOf",
    args: [ (target && target.length===42 ? (target as `0x${string}`) : ADDR.NBL) ]
  });

  const partnerState = useMemo(() => {
    if (typeof stateRaw === "bigint") return STATE_LABELS[Number(stateRaw)] ?? "UNKNOWN";
    return "-";
  }, [stateRaw]);

  return (
    <main style={{ maxWidth: 900, margin: "30px auto", padding: "0 16px" }}>
      <h2>Admin Panel</h2>
      <p><small>Admin: {admin ?? "-"}</small></p>

      <section style={{ border: "1px solid #e5e7eb", padding: 16, borderRadius: 8, marginTop: 16 }}>
        <h3>Sale Controls</h3>
        <p>Active Phase: <b>{typeof activeIdx === "bigint" ? Number(activeIdx) : String(activeIdx ?? "-")}</b></p>
        <p>Sale Closed: <b>{typeof closed === "boolean" ? String(closed) : "-"}</b></p>
        <div style={{ display: "flex", gap: 8 }}>
          <button disabled={isPending || mining}
                  onClick={() => writeContract({ address: ADDR.SALE, abi: saleAdminAbi, functionName: "pause", args: [] })}>
            {isPending || mining ? "Pausing…" : "Pause Sale"}
          </button>
          <button disabled={isPending || mining}
                  onClick={() => writeContract({ address: ADDR.SALE, abi: saleAdminAbi, functionName: "unpause", args: [] })}>
            {isPending || mining ? "Unpausing…" : "Unpause Sale"}
          </button>
        </div>
      </section>

      <section style={{ border: "1px solid #e5e7eb", padding: 16, borderRadius: 8, marginTop: 16 }}>
        <h3>KYC & Partner</h3>
        <label>Address</label>
        <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0x..." style={{ width: "100%", padding: 8, margin: "6px 0 10px" }} />
        <p>KYC: <b>{String(kycOK ?? "-")}</b> • Partner State: <b>{partnerState}</b></p>
        <div style={{ display: "flex", gap: 8 }}>
          <button disabled={!target || isPending || mining}
                  onClick={() => writeContract({ address: ADDR.REG, abi: registryAbi, functionName: "setKYC",
                    args: [target as `0x${string}`, true] })}>
            {isPending || mining ? "Setting…" : "Set KYC = true"}
          </button>
          <button disabled={!target || isPending || mining}
                  onClick={() => writeContract({ address: ADDR.REG, abi: registryAbi, functionName: "approve",
                    args: [target as `0x${string}`, true] })}>
            {isPending || mining ? "Approving…" : "Approve Partner"}
          </button>
        </div>
        {txHash && <p style={{ marginTop: 8 }}><small>Tx: {txHash}</small></p>}
        {isSuccess && <p style={{ color: "green" }}>Success ✓</p>}
      </section>
    </main>
  );
}
