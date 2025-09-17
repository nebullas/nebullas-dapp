"use client";
import { ConnectBar } from "@/components/ConnectBar";
import BuyCard from "@/components/BuyCard";
import AddNblButton from "@/components/AddNblButton";

export default function Page() {
  return (
    <main style={{ maxWidth: 920, margin: "40px auto", padding: "0 16px" }}>
      <ConnectBar />
      <div style={{ marginTop: 20 }}>
        <BuyCard />
      </div>
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <AddNblButton />
      </div>
    </main>
  );
}
