import { useState } from "react";
import { Wallet } from "lucide-react";
import QubicBridgeLogomark from "@/components/core/assets/qubic-bridge-logomark";
import WalletAreaSlot from "@/components/wallet-area/wallet-area-slot";
import SolanaIcon from "@/components/core/assets/solana-icon";
import QubicIcon from "@/components/core/assets/qubic-icon";
import SolanaWalletModal from "@/components/wallet-area/modals/solana-wallet-modal";
import QubicWalletModal from "@/components/wallet-area/modals/qubic-wallet-modal";
import useSolanaWallet from "@/hooks/useSolanaWallet";
import { useQubicWallet } from "@/providers/QubicWalletProvider";
import { useToggle } from "@/hooks/use-toggle";
import cn from "@/utils/classnames";

export default function TopBar() {
  const [isMenuOpen, toggleMenu] = useToggle(false);

  const solana = useSolanaWallet();
  const qubic = useQubicWallet();

  const [solanaModalOpen, setSolanaModalOpen] = useState(false);
  const [qubicModalOpen, setQubicModalOpen] = useState(false);

  return (
    <div className="sticky left-0 top-0 z-40 flex xl:hidden flex-col">
      <div
        className={cn(
          "absolute -z-10 left-0 right-0 top-full w-full rounded-b-3xl bg-highlight pt-12 pb-6 px-6 transition-transform duration-300 ease-out",
          isMenuOpen ? "-translate-y-6" : "-translate-y-full",
        )}
        aria-hidden={!isMenuOpen}
      >
        <div className="flex flex-col gap-1">
          <WalletAreaSlot
            connectWalletLabel="Connect Solana Wallet"
            icon={<SolanaIcon />}
            address={solana.address ?? ""}
            balance={solana.balance ?? "---"}
            currency="wQUBIC"
            variant="mobile"
            isConnected={solana.connected}
            onConnect={() => setSolanaModalOpen(true)}
            onDisconnect={() => solana.disconnect()}
          />
          <div className="h-px mx-4 bg-primary/10" role="presentation" aria-hidden />
          <WalletAreaSlot
            connectWalletLabel="Connect Qubic Wallet"
            icon={<QubicIcon />}
            address={qubic.address ?? ""}
            balance={qubic.balance ?? "---"}
            currency="QUBIC"
            variant="mobile"
            isConnected={qubic.connected}
            onConnect={() => setQubicModalOpen(true)}
            onDisconnect={() => qubic.disconnect()}
          />
        </div>
      </div>

      <div className="relative z-10 flex w-full items-center bg-primary px-8 py-8 rounded-b-[24px]">
        <div className="flex-1" aria-hidden />
        <div className="flex shrink-0 justify-center">
          <QubicBridgeLogomark />
        </div>
        <div className="flex flex-1 justify-end">
          <button
            type="button"
            onClick={toggleMenu}
            className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={cn(
                "absolute inset-x-0 bottom-0 h-full bg-highlight transition-transform duration-300 ease-out rounded-lg",
                isMenuOpen ? "translate-y-0" : "translate-y-full",
              )}
              aria-hidden
            />
            <Wallet
              size={16}
              strokeWidth={1}
              className={cn(
                "relative z-10 transition-colors",
                isMenuOpen ? "text-primary" : "text-white",
              )}
              aria-hidden
            />
          </button>
        </div>
      </div>

      <SolanaWalletModal open={solanaModalOpen} onClose={() => setSolanaModalOpen(false)} />
      <QubicWalletModal open={qubicModalOpen} onClose={() => setQubicModalOpen(false)} />
    </div>
  );
}
