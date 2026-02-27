import { useState } from "react";
import useSolanaWallet from "@/hooks/useSolanaWallet";
import { useQubicWallet } from "@/providers/QubicWalletProvider";
import WalletAreaSlot from "./wallet-area-slot";
import SolanaIcon from "@/components/core/assets/solana-icon";
import QubicIcon from "@/components/core/assets/qubic-icon";
import SolanaWalletModal from "./modals/solana-wallet-modal";
import QubicWalletModal from "./modals/qubic-wallet-modal";
import cn from "@/utils/classnames";

export default function WalletArea() {
  const solana = useSolanaWallet();
  const qubic = useQubicWallet();

  const [solanaModalOpen, setSolanaModalOpen] = useState(false);
  const [qubicModalOpen, setQubicModalOpen] = useState(false);

  const showSeparator = solana.connected && qubic.connected;

  return (
    <div className="flex w-fit bg-white shrink-0">
      <div className="flex items-center gap-4 w-fit shrink-0 h-full px-12 bg-primary rounded-bl-4xl">
        <div className={cn("items-center gap-4 w-fit shrink-0 h-full", "hidden xl:flex")}>
          <WalletAreaSlot
            variant="desktop"
            connectWalletLabel="Connect Solana Wallet"
            icon={<SolanaIcon />}
            address={solana.address}
            balance={solana.balance ?? "—"}
            currency="wQUBIC"
            isConnected={solana.connected}
            onConnect={() => setSolanaModalOpen(true)}
            onDisconnect={() => solana.disconnect()}
          />

          {showSeparator && (
            <div className="w-px h-8 mx-2 shrink-0 bg-white" role="presentation" aria-hidden />
          )}

          <WalletAreaSlot
            variant="desktop"
            connectWalletLabel="Connect Qubic Wallet"
            icon={<QubicIcon />}
            address={qubic.address}
            balance={qubic.balance ?? "—"}
            currency="QUBIC"
            isConnected={qubic.connected}
            onConnect={() => setQubicModalOpen(true)}
            onDisconnect={() => qubic.disconnect()}
          />
        </div>

        <SolanaWalletModal open={solanaModalOpen} onClose={() => setSolanaModalOpen(false)} />
        <QubicWalletModal open={qubicModalOpen} onClose={() => setQubicModalOpen(false)} />
      </div>
    </div>
  );
}
