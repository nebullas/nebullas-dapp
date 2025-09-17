"use client";
import { ADDR } from "@/config/contracts";

export default function AddNblButton() {
  async function add() {
    const eth = (window as any).ethereum;
    if (!eth?.request) return alert("Wallet not found");
    try {
      await eth.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: ADDR.NBL,
            symbol: "NBL",
            decimals: 18,
            image: location.origin + "/file.svg",
          },
        },
      });
    } catch (e) {
      console.error(e);
      alert("Add token failed");
    }
  }
  return <button onClick={add} style={{padding:"6px 10px"}}>Add NBL to MetaMask</button>;
}
