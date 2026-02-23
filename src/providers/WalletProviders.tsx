import type { ReactNode } from "react";
import SolanaWalletProvider from "./SolanaWalletProvider";
import QubicWalletProvider from "./QubicWalletProvider";

export default function WalletProviders({ children }: { children: ReactNode }) {
  return (
    <SolanaWalletProvider>
      <QubicWalletProvider>{children}</QubicWalletProvider>
    </SolanaWalletProvider>
  );
}
