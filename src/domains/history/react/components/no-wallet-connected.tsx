import QubicIcon from "@/components/core/assets/qubic-icon";
import SolanaIcon from "@/components/core/assets/solana-icon";
import ConnectWalletButton from "@/components/wallet-area/connect-wallet-button/connect-wallet-button";
import QubicWalletModal from "@/components/wallet-area/modals/qubic-wallet-modal";
import useSolanaWallet from "@/hooks/useSolanaWallet";
import { useQubicWallet } from "@/providers/QubicWalletProvider";
import { useState } from "react";

interface Props {
  description: string;
  walletRequired: "one" | "all";
}

export default function NoWalletConnected({ description, walletRequired }: Props) {
  const solana = useSolanaWallet();
  const qubic = useQubicWallet();

  const [qubicModalOpen, setQubicModalOpen] = useState(false);

  const label =
    (!solana.connected && !qubic.connected) || walletRequired === "one"
      ? "No wallet connected."
      : "One wallet missing.";

  return (
    <>
      <div className="flex flex-col items-center gap-6 h-[calc(100%-90px-32px-16px)] justify-center">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-base font-medium text-primary">{label}</h2>
          <p className="text-base font-normal text-gray">{description}</p>
        </div>

        <div className="flex gap-4">
          {!solana.connected && (
            <ConnectWalletButton
              label="Connect Solana Wallet"
              icon={<SolanaIcon />}
              onConnect={() => solana.openModal()}
              variant="desktop"
            />
          )}
          {!qubic.connected && (
            <ConnectWalletButton
              label="Connect Qubic Wallet"
              icon={<QubicIcon />}
              onConnect={() => setQubicModalOpen(true)}
              variant="desktop"
            />
          )}
        </div>
      </div>

      <QubicWalletModal open={qubicModalOpen} onClose={() => setQubicModalOpen(false)} />
    </>
  );
}
