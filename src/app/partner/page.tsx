"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ADDR } from "@/config/contracts";
import { registryAbi } from "@/lib/abi/registry";
import { treeAbi } from "@/lib/abi/tree";
import { useMemo } from "react";
import { useMounted } from "@/lib/hooks/useMounted";

const STATES = ["NOT_ELIGIBLE","ELIGIBLE","PENDING","APPROVED","REJECTED","SUSPENDED"] as const;
const toLabel = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n < STATES.length ? STATES[n as 0|1|2|3|4|5] : "-";
};

export default function PartnerPage() {
  const mounted = useMounted();
  const { address } = useAccount();
  const you = address as `0x${string}` | undefined;

  const enable = mounted && !!you;

  const { data: kycOK } = useReadContract({
    address: ADDR.REG, abi: registryAbi, functionName: "kycPassed",
    args: [you!], query: { enabled: enable }
  });

  const { data: stateRaw } = useReadContract({
    address: ADDR.REG, abi: registryAbi, functionName: "stateOf",
    args: [you!], query: { enabled: enable }
  });
  const partnerState = useMemo(() => toLabel(stateRaw), [stateRaw]);

  const { data: ups } = useReadContract({
    address: ADDR.TREE, abi: treeAbi, functionName: "uplines",
    args: [you!], query: { enabled: enable }
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: mining, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const canApply = partnerState === "ELIGIBLE" || partnerState === "REJECTED";

  return (
    <main style={{ maxWidth: 900, margin: "30px auto", padding: "0 16px" }}>
      <h2>Partner Dashboard</h2>
      <p><small suppressHydrationWarning>You: {mounted && you ? you : "-"}</small></p>

      <section style={{ border:"1px solid #e5e7eb", padding:16, borderRadius:8 }}>
        <p>KYC: <b>{String(kycOK ?? "-")}</b> • Partner State: <b>{partnerState}</b></p>
        {canApply && you && (
          <button
            disabled={isPending || mining}
            onClick={() => writeContract({ address: ADDR.REG, abi: registryAbi, functionName: "applyAsPartner", args: [] })}
          >
            {isPending || mining ? "Applying…" : "Apply as Partner"}
          </button>
        )}
        {txHash && <p style={{ marginTop:8 }}><small>Tx: {txHash}</small></p>}
        {isSuccess && <p style={{ color:"green" }}>Success ✓</p>}
      </section>

      <section style={{ border:"1px solid #e5e7eb", padding:16, borderRadius:8, marginTop:16 }}>
        <h3>Uplines (6‑level)</h3>
        <ol>
          {(ups as string[] | undefined)?.map((a, i) => (
            <li key={i}><code>L{i+1}</code>: {a === "0x0000000000000000000000000000000000000000" ? "—" : a}</li>
          )) ?? <li>—</li>}
        </ol>
      </section>
    </main>
  );
}
