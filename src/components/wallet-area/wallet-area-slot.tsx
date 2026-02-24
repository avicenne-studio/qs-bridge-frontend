import { type ReactNode } from "react";
import { Coins } from "lucide-react";
import type { Address } from "viem";
import { truncateAddress } from "@/utils/address";
import cn from "@/utils/classnames";
import ConnectWalletButton from "./connect-wallet-button/connect-wallet-button";
import DisconnectWalletButton from "./disconnect-wallet-button/disconnect-wallet-button";

export interface Props {
  connectWalletLabel: string;
  icon: ReactNode;
  address: Address;
  balance: string;
  currency: string;
  isConnected: boolean;
  variant: "desktop" | "mobile";
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function WalletAreaSlot({
  connectWalletLabel,
  icon,
  address,
  balance,
  currency,
  variant,
  isConnected,
  onConnect,
  onDisconnect,
}: Props) {
  const isMobile = variant === "mobile";

  if (!isConnected) {
    return (
      <ConnectWalletButton
        label={connectWalletLabel}
        icon={icon}
        onConnect={onConnect}
        variant={variant}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg py-3 px-4 text-base leading-none shrink-0",
        isMobile ? "bg-transparent text-primary w-full justify-between" : "bg-primary text-white",
      )}
    >
      <div className="relative flex shrink-0 items-center gap-2 group">
        <div
          className={cn(
            "flex items-center gap-2 transition-opacity",
            "group-hover:opacity-0 opacity-100",
            "group-hover:pointer-events-none pointer-events-auto",
          )}
        >
          {icon}
          <span className="truncate text-base leading-none">{truncateAddress(address)}</span>
        </div>
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity",
            "group-hover:opacity-100 opacity-0",
            "group-hover:pointer-events-auto pointer-events-none",
          )}
        >
          <DisconnectWalletButton onDisconnect={onDisconnect} variant={variant} />
        </div>
      </div>

      <span className="shrink-0 flex items-center gap-1">
        <Coins className={cn("size-4", isMobile ? "text-primary" : "text-white")} aria-hidden />
        <span
          className={cn(
            "text-base leading-none font-semibold",
            isMobile ? "text-primary" : "text-white",
          )}
        >
          {balance}
        </span>
        <span
          className={cn(
            "text-base leading-none font-semibold",
            isMobile ? "text-primary" : "text-white",
          )}
        >
          {currency}
        </span>
      </span>
    </div>
  );
}
