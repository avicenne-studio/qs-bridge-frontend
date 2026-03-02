import type { PropsWithChildren } from "react";
import SolanaWalletProvider from "./SolanaWalletProvider";
import QubicWalletProvider from "./QubicWalletProvider";

export default function WalletProviders({ children }: PropsWithChildren) {
  return (
    <SolanaWalletProvider>
      <QubicWalletProvider>{children}</QubicWalletProvider>
    </SolanaWalletProvider>
  );
}
