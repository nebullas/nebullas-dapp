"use client";

import Link from "next/link";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { ADDR } from "@/config/contracts";
import { partnerRegistryAbi } from "@/lib/abi/partnerRegistry";
import { partnerTreeAbi } from "@/lib/abi/partnerTree";

const STATE = ["NONE", "ELIGIBLE", "PENDING", "APPROVED", "BLOCKED"] as const;
const ZERO = "0x0000000000000000000000000000000000000000";

export default function PartnerPage() {
  const { address } = useAccount();

  const kyc = useReadContract({
    address: ADDR.REGISTRY,
    abi: partnerRegistryAbi,
    functionName: "kycPassed",
    args: address ? ([address] as const) : undefined,
    query: { enabled: Boolean(address) },
  });

  const st = useReadContract({
    address: ADDR.REGISTRY,
    abi: partnerRegistryAbi,
    functionName: "stateOf",
    args: address ? ([address] as const) : undefined,
    query: { enabled: Boolean(address) },
  });

  const stateLabel =
    typeof st.data === "number" ? STATE[st.data] ?? "-" : "-";

  const upl = useReadContract({
    address: ADDR.TREE,
    abi: partnerTreeAbi,
    functionName: "getUplines",
    args: address ? ([address] as const) : undefined,
    query: { enabled: Boolean(address) },
  });

  const showApply = Boolean(kyc.data === true && stateLabel === "ELIGIBLE");

  const { writeContractAsync, isPending } = useWriteContract();
  async function onApply() {
    await writeContractAsync({
      address: ADDR.REGISTRY,
      abi: partnerRegistryAbi,
      functionName: "applyAsPartner",
    });
  }

  const refLink = address ? `/buy?ref=${address}` : undefined;

  return (
    <main style={{ maxWidth: 1000, margin: "30px auto", padding: "0 16px" }}>
      <h1>Partner Dashboard</h1>

      <section style={{ border: "1px solid #eee", borderRadius: 10, padding: 16 }}>
        <p>
          KYC: <strong>{String(Boolean(kyc.data))}</strong> • Partner State:{" "}
          <strong>{stateLabel}</strong>
        </p>

        {showApply ? (
          <button onClick={onApply} disabled={isPending}>
            Apply as Partner
          </button>
        ) : null}

        {refLink && (
          <p style={{ marginTop: 12 }}>
            Your Referral Link:{" "}
            <Link href={refLink}>{refLink}</Link>
          </p>
        )}
      </section>

      <section style={{ border: "1px solid #eee", borderRadius: 10, padding: 16, marginTop: 24 }}>
        <h3>Uplines (6‑level)</h3>
        {Array.from({ length: 6 }).map((_, i) => {
          const arr = Array.isArray(upl.data) ? (upl.data as readonly `0x${string}`[]) : undefined;
          const a = arr?.[i];
          const show = a && a !== ZERO ? a : "—";
          return (
            <p key={i}>
              L{i + 1}: {show}
            </p>
          );
        })}
      </section>
    </main>
  );
}
