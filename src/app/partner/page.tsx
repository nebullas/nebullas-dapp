"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import ADDRJSON from "@/config/addresses.testnet.json";            // { REG, ... }
import { partnerRegistryAbi } from "@/lib/abi/partnerRegistry";

const ADDR = ADDRJSON as unknown as { REG: `0x${string}` };
const STATES = ["NOT_ELIGIBLE","ELIGIBLE","PENDING","APPROVED","REJECTED","SUSPENDED"] as const;

export default function PartnerPage() {
  const { address } = useAccount();
  const zero = "0x0000000000000000000000000000000000000000" as `0x${string}`;

  // Hydration-safe mount gate
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const kycRead = useReadContract({
    address: ADDR.REG, abi: partnerRegistryAbi, functionName: "kycPassed",
    args: [address ?? zero], query: { enabled: !!address }
  });
  const stateRead = useReadContract({
    address: ADDR.REG, abi: partnerRegistryAbi, functionName: "stateOf",
    args: [address ?? zero], query: { enabled: !!address }
  });

  const kyc = Boolean(kycRead.data);
  const stateLabel = useMemo(() => {
    const i = Number(stateRead.data ?? 0);
    return STATES[i] ?? "-";
  }, [stateRead.data]);

  const { writeContractAsync, isPending } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [err, setErr] = useState<string | null>(null);

  async function onApply() {
    if (!address) return;
    setErr(null); setTxHash(undefined);
    try {
      const h = await writeContractAsync({
        address: ADDR.REG, abi: partnerRegistryAbi, functionName: "applyAsPartner", account: address
      });
      setTxHash(h as `0x${string}`);
    } catch (e: any) {
      setErr(e?.shortMessage || e?.message || "Apply failed");
    }
  }

  const { isSuccess, isLoading: waiting } = useWaitForTransactionReceipt({ hash: txHash, query: { enabled: !!txHash } });
  // tx success → fresh reads
  useEffect(() => { if (isSuccess) { stateRead.refetch(); kycRead.refetch(); } }, [isSuccess]); // eslint-disable-line

  return (
    <main style={{ maxWidth: 900, margin: "30px auto", padding: "0 16px" }}>
      <h2>Partner Dashboard</h2>
      <p>You: {mounted && address ? address : "-"}</p>

      <section style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
        <p>KYC: <strong>{kyc.toString()}</strong> • Partner State: <strong>{stateLabel}</strong></p>

        {stateLabel === "ELIGIBLE" && (
          <button onClick={onApply} disabled={!address || isPending || waiting} style={{ padding: "6px 12px" }}>
            {(isPending || waiting) ? "Applying…" : "Apply as Partner"}
          </button>
        )}

        {txHash && (
          <p>Tx: <a href={`https://testnet.bscscan.com/tx/${txHash}`} target="_blank" rel="noreferrer">{txHash}</a></p>
        )}
        {isSuccess && <p style={{ color: "green" }}>Success ✓</p>}
        {err && <p style={{ color: "crimson" }}>Error: {err}</p>}
      </section>

      <section style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, marginTop: 18 }}>
        <h3>Uplines (6‑level)</h3>
        <p>L1: —</p><p>L2: —</p><p>L3: —</p><p>L4: —</p><p>L5: —</p><p>L6: —</p>
      </section>
    </main>
  );
}
