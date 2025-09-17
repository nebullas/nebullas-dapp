"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import ADDRJSON from "@/config/addresses.testnet.json";               // { REG, ... }
import { partnerRegistryAbi } from "@/lib/abi/partnerRegistry";

const ADDR = ADDRJSON as unknown as { REG: `0x${string}` };
const STATES = ["NOT_ELIGIBLE","ELIGIBLE","PENDING","APPROVED","REJECTED","SUSPENDED"] as const;

export default function AdminPage() {
  const { address: connected } = useAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Target address (auto-fill: connected)
  const [target, setTarget] = useState<`0x${string}` | "" >("");
  useEffect(() => { if (connected && !target) setTarget(connected as `0x${string}`); }, [connected]); // auto-fill once

  const zero = "0x0000000000000000000000000000000000000000" as `0x${string}`;
  const who = (target && target.length === 42 ? target : zero);

  const kycRead = useReadContract({
    address: ADDR.REG, abi: partnerRegistryAbi, functionName: "kycPassed",
    args: [who], query: { enabled: who !== zero }
  });
  const stateRead = useReadContract({
    address: ADDR.REG, abi: partnerRegistryAbi, functionName: "stateOf",
    args: [who], query: { enabled: who !== zero }
  });

  const stateLabel = useMemo(() => STATES[Number(stateRead.data ?? 0)] ?? "-", [stateRead.data]);

  const { writeContractAsync, isPending } = useWriteContract();
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [err, setErr] = useState<string | null>(null);

  async function onSetKYCTrue() {
    if (!who || who === zero) return;
    setErr(null); setHash(undefined);
    try {
      const h = await writeContractAsync({
        address: ADDR.REG, abi: partnerRegistryAbi, functionName: "setKYC",
        args: [who, true], account: connected
      });
      setHash(h as `0x${string}`);
    } catch (e: any) { setErr(e?.shortMessage || e?.message || "KYC failed"); }
  }

  async function onApprovePartner() {
    if (!who || who === zero) return;
    setErr(null); setHash(undefined);
    try {
      const h = await writeContractAsync({
        address: ADDR.REG, abi: partnerRegistryAbi, functionName: "approve",
        args: [who, true], account: connected
      });
      setHash(h as `0x${string}`);
    } catch (e: any) { setErr(e?.shortMessage || e?.message || "Approve failed"); }
  }

  const { isSuccess, isLoading: waiting } = useWaitForTransactionReceipt({ hash, query: { enabled: !!hash } });
  useEffect(() => { if (isSuccess) { kycRead.refetch(); stateRead.refetch(); } }, [isSuccess]); // eslint-disable-line

  return (
    <main style={{ maxWidth: 900, margin: "30px auto", padding: "0 16px" }}>
      <h2>Admin Panel</h2>
      <p>Admin: {mounted && connected ? connected : "-"}</p>

      <section style={{ border: "1px solid #e5e7eb", padding:16, borderRadius:8 }}>
        <h3>KYC & Partner</h3>
        <label>Address</label>
        <input
          value={target} onChange={(e)=>setTarget(e.target.value as any)}
          placeholder="0x..." style={{ width:"100%", padding:"6px", margin:"6px 0 10px" }}
        />
        <p>KYC: <strong>{String(Boolean(kycRead.data))}</strong> • Partner State: <strong>{stateLabel}</strong></p>
        <div style={{ display:"flex", gap:12, marginTop:8 }}>
          <button onClick={onSetKYCTrue} disabled={!connected || isPending || waiting}>Set KYC = true</button>
          <button onClick={onApprovePartner} disabled={!connected || isPending || waiting}>Approve Partner</button>
        </div>
        {hash && <p>Tx: <a href={`https://testnet.bscscan.com/tx/${hash}`} target="_blank" rel="noreferrer">{hash}</a></p>}
        {isSuccess && <p style={{ color:"green" }}>Success ✓</p>}
        {err && <p style={{ color:"crimson" }}>Error: {err}</p>}
      </section>
    </main>
  );
}
