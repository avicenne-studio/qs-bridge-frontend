import { useAppKitProvider } from "@reown/appkit/react";
import type { SolanaWalletProvider } from "@/lib/bridge/solana/send";

export function useSolanaProvider() {
  const { walletProvider } = useAppKitProvider<SolanaWalletProvider>("solana");
  return walletProvider;
}
