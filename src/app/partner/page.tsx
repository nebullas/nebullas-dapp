"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ADDR } from "@/config/contracts";
import { registryAbi } from "@/lib/abi/registry";
import { treeAbi } from "@/lib/abi/tree";
import { useMemo } from "react";

const STATE_LABELS = [
  "NOT_ELIGIBLE", "ELIGIBLE", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"
] as const;

export default function PartnerPage() {
  const { address } = useAccount();
  const who = address ?? "0x0000000000000000000000000000000000000000";

  const { data: kycOK } = useReadContract({ address: ADDR.REG, abi: registryAbi, functionName: "kycPassed", args: [who] });
  const { data: stateRaw } = useReadContract({ address: ADDR.REG, abi: registryAbi, functionName: "stateOf", args: [who] });
  const partnerState = useMemo(() => (typeof stateRaw === "bigint" ? STATE_LABELS[Number(stateRaw)] : "-"), [stateRaw]);

  const { data: ups } = useReadContract({ address: ADDR.TREE, abi: treeAbi, functionName: "uplines", args: [who] });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: mining, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const canApply = partnerState === "ELIGIBLE" || partnerState === "REJECTED";

  return (
    <main style={{ maxWidth: 900, margin: "30px auto", padding: "0 16px" }}>
      <h2>Partner Dashboard</h2>
      <p><small>You: {address ?? "-"}</small></p>

      <section style={{ border: "1px solid #e5e7eb", padding: 16, borderRadius: 8 }}>
        <p>KYC: <b>{String(kycOK ?? "-")}</b> • Partner State: <b>{partnerState}</b></p>
        {canApply && (
          <button disabled={isPending || mining || !address}
                  onClick={() => writeContract({ address: ADDR.REG, abi: registryAbi, functionName: "apply", args: [] })}>
            {isPending || mining ? "Applying…" : "Apply as Partner"}
          </button>
        )}
        {txHash && <p style={{ marginTop: 8 }}><small>Tx: {txHash}</small></p>}
        {isSuccess && <p style={{ color: "green" }}>Success ✓</p>}
      </section>

      <section style={{ border: "1px solid #e5e7eb", padding: 16, borderRadius: 8, marginTop: 16 }}>
        <h3>Uplines (6‑level)</h3>
        <ol>
          {(ups as string[] | undefined)?.map((a, i) => (
            <li key={i}><code>L{i + 1}</code>: {a === "0x0000000000000000000000000000000000000000" ? "—" : a}</li>
          )) ?? <li>—</li>}
        </ol>
      </section>
    </main>
  );
}
