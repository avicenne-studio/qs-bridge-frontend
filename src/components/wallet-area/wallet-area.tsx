import { useState } from "react";
import WalletAreaSlot from "./wallet-area-slot";
import SolanaIcon from "@/components/core/assets/solana-icon";
import QubicIcon from "@/components/core/assets/qubic-icon";
import cn from "@/utils/classnames";

export default function WalletArea() {
  const [solanaConnected, setSolanaConnected] = useState(false);
  const [qubicConnected, setQubicConnected] = useState(false);

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

  const showSeparator = solanaConnected && qubicConnected;

  return (
    <div className="w-fit bg-white shrink-0">
      <div
        className={cn(
          "items-center gap-4 w-fit shrink-0 h-full px-12 bg-primary",
          "rounded-bl-3xl xl:rounded-bl-4xl",
        )}
      >
        <div className={cn("items-center gap-4 w-fit shrink-0 h-full", "hidden xl:flex")}>
          <WalletAreaSlot
            {...SOLANA_WALLET_CONFIG}
            isConnected={solanaConnected}
            onConnect={() => setSolanaConnected(true)}
            onDisconnect={() => setSolanaConnected(false)}
          />

          {showSeparator && (
            <div className="w-px h-8 mx-2 shrink-0 bg-white" role="presentation" aria-hidden />
          )}

          <WalletAreaSlot
            {...QUBIC_WALLET_CONFIG}
            isConnected={qubicConnected}
            onConnect={() => setQubicConnected(true)}
            onDisconnect={() => setQubicConnected(false)}
          />
        </div>
      </div>
    </div>
  );
}
