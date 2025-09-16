"use client";
import { ConnectBar } from "@/components/ConnectBar";
import BuyCard from "@/components/BuyCard";

export default function Page() {
  return (
    <main style={{maxWidth:920, margin:"40px auto", padding:"0 16px"}}>
      <ConnectBar />
      <div style={{marginTop:20}}><BuyCard /></div>
    </main>
  );
}
