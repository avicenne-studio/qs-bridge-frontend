import type { Chain } from "@/domains/activity/activity.types";

const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK || "devnet";

const SOLANA_CLUSTER_PARAM = SOLANA_NETWORK === "mainnet-beta" ? "" : `?cluster=${SOLANA_NETWORK}`;

export function getAddressExplorerUrl(address: string, chain: Chain): string {
  if (chain === "solana") {
    return `https://solscan.io/account/${address}${SOLANA_CLUSTER_PARAM}`;
  }
  return `https://explorer.qubic.org/network/address/${address}`;
}

export function getTxExplorerUrl(hash: string, chain: Chain): string {
  if (chain === "solana") {
    return `https://solscan.io/tx/${hash}${SOLANA_CLUSTER_PARAM}`;
  }
  return `https://explorer.qubic.org/network/tx/${hash}`;
}
