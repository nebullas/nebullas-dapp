"use client";

import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { isAddress } from "viem";
import { ADDR } from "@/config/contracts";
import { partnerRegistryAbi } from "@/lib/abi/partnerRegistry";

const STATE = ["NONE", "ELIGIBLE", "PENDING", "APPROVED", "BLOCKED"] as const;

export default function AdminPage() {
  const { address: admin } = useAccount();
  const [input, setInput] = useState("");
  const target = useMemo(
    () => (isAddress(input) ? (input as `0x${string}`) : undefined),
    [input],
  );

  const kycRead = useReadContract({
    address: ADDR.REGISTRY,
    abi: partnerRegistryAbi,
    functionName: "kycPassed",
    // वैध 0x पर ही call
    args: target ? ([target] as const) : undefined,
    query: { enabled: Boolean(target) },
  });

  const stateRead = useReadContract({
    address: ADDR.REGISTRY,
    abi: partnerRegistryAbi,
    functionName: "stateOf",
    args: target ? ([target] as const) : undefined,
    query: { enabled: Boolean(target) },
  });

  const stateLabel =
    typeof stateRead.data === "number" ? STATE[stateRead.data] ?? "-" : "-";

  const { writeContractAsync, isPending } = useWriteContract();
  const [waiting, setWaiting] = useState(false);

  async function setKYCTrue() {
    if (!target) return;
    setWaiting(true);
    try {
      await writeContractAsync({
        address: ADDR.REGISTRY,
        abi: partnerRegistryAbi,
        functionName: "setKYC",
        args: [target, true] as const,
      });
    } finally {
      setWaiting(false);
    }
  }

  async function approvePartner() {
    if (!target) return;
    setWaiting(true);
    try {
      await writeContractAsync({
        address: ADDR.REGISTRY,
        abi: partnerRegistryAbi,
        functionName: "approve",
        args: [target] as const,
      });
    } finally {
      setWaiting(false);
    }
  }

  return (
    <main style={{ maxWidth: 1000, margin: "30px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 24 }}>Admin Panel</h1>

      <section style={{ border: "1px solid #eee", borderRadius: 10, padding: 16 }}>
        <h3>KYC & Partner</h3>

        <p>
          <strong>Admin:</strong>{" "}
          <code>{admin ?? "-"}</code>
        </p>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="0x..."
          style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8 }}
        />

        <p style={{ marginTop: 12 }}>
          KYC: <strong>{String(Boolean(kycRead.data))}</strong> • Partner State:{" "}
          <strong>{stateLabel}</strong>
        </p>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={setKYCTrue} disabled={!target || isPending || waiting}>
            Set KYC = true
          </button>
          <button onClick={approvePartner} disabled={!target || isPending || waiting}>
            Approve Partner
          </button>
        </div>
      </section>
    </main>
  );
}
