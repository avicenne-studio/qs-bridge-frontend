import { useState } from "react";
import { Wallet } from "lucide-react";
import QubicBridgeLogomark from "@/components/core/assets/qubic-bridge-logomark";
import WalletAreaSlot from "@/components/wallet-area/wallet-area-slot";
import SolanaIcon from "@/components/core/assets/solana-icon";
import QubicIcon from "@/components/core/assets/qubic-icon";
import { useToggleState } from "@/hooks/use-toggle-state";
import cn from "@/utils/classnames";

const SOLANA_WALLET_CONFIG = {
  connectWalletLabel: "Connect Solana Wallet",
  icon: <SolanaIcon />,
  address: "9xA4b2c3d4e5f6K8Lm",
  balance: "122",
  currency: "SOL",
} as const;

const QUBIC_WALLET_CONFIG = {
  connectWalletLabel: "Connect Qubic Wallet",
  icon: <QubicIcon />,
  address: "DQJQp4k2m8nYAHN",
  balance: "450",
  currency: "QUBIC",
} as const;

export default function TopBar() {
  const [isMenuOpen, toggleMenu] = useToggleState(false);
  const [solanaConnected, setSolanaConnected] = useState(false);
  const [qubicConnected, setQubicConnected] = useState(false);

  return (
    <div className="fixed left-0 right-0 top-0 z-40 flex xl:hidden flex-col">
      <div
        className={cn(
          "absolute -z-10 left-0 right-0 top-full w-full rounded-b-3xl bg-highlight pt-12 pb-6 px-6 transition-transform duration-300 ease-out",
          isMenuOpen ? "-translate-y-6" : "-translate-y-full",
        )}
        aria-hidden={!isMenuOpen}
      >
        <div className="flex flex-col">
          <WalletAreaSlot
            {...SOLANA_WALLET_CONFIG}
            variant="mobile"
            isConnected={solanaConnected}
            onConnect={() => setSolanaConnected(true)}
            onDisconnect={() => setSolanaConnected(false)}
          />
          <WalletAreaSlot
            {...QUBIC_WALLET_CONFIG}
            variant="mobile"
            isConnected={qubicConnected}
            onConnect={() => setQubicConnected(true)}
            onDisconnect={() => setQubicConnected(false)}
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
    </div>
  );
}
