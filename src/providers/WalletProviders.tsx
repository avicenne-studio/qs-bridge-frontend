import { useEffect, type PropsWithChildren } from "react";
import SolanaWalletProvider from "./SolanaWalletProvider";
import QubicWalletProvider from "./QubicWalletProvider";
import { useQubicWallet } from "./QubicWalletProvider";
import useSolanaWallet from "@/hooks/useSolanaWallet";
import { useWalletStore } from "@/stores/wallet.store";

function SyncWallets() {
  const qubic = useQubicWallet();
  const solana = useSolanaWallet();
  const setQubic = useWalletStore((s) => s.setQubic);
  const setSolana = useWalletStore((s) => s.setSolana);

  useEffect(() => {
    setQubic({ address: qubic.address, balance: qubic.balance });
  }, [qubic.address, qubic.balance]);

  useEffect(() => {
    setSolana({ address: solana.address, balance: solana.balance });
  }, [solana.address, solana.balance]);

  return null;
}

export default function WalletProviders({ children }: PropsWithChildren) {
  return (
    <SolanaWalletProvider>
      <QubicWalletProvider>
        <SyncWallets />
        {children}
      </QubicWalletProvider>
    </SolanaWalletProvider>
  );
}
