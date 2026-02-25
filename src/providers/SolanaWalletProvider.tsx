import { type PropsWithChildren, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";

export default function SolanaWalletProvider({ children }: PropsWithChildren) {
  const endpoint = useMemo(
    () => import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl("mainnet-beta"),
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={[]}
        autoConnect
        onError={(error) => console.error("[Solana Wallet]", error)}
      >
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
