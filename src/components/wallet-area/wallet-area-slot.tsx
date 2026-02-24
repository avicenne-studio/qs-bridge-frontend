import { type ReactNode, useState, useCallback } from "react";
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
  const [showDisconnect, setShowDisconnect] = useState(false);

  const handleTap = useCallback(() => {
    if (isMobile) setShowDisconnect((prev) => !prev);
  }, [isMobile]);

  if (!isConnected) {
    return (
      <ConnectWalletButton
        label={connectWalletLabel}
        icon={icon}
        onConnect={onConnect}
        variant={variant}
        isFullWidth={isMobile}
      />
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col w-full">
        <button
          type="button"
          onClick={handleTap}
          className={cn(
            "flex items-center justify-between gap-4 rounded-lg py-3 px-4",
            "text-sm leading-none text-primary w-full active:bg-primary/5 transition-colors cursor-pointer",
          )}
        >
          <span className="flex items-center gap-2">
            {icon}
            <span className="truncate">{truncateAddress(address)}</span>
          </span>
          <span className="shrink-0 flex items-center gap-1">
            <Coins className="size-4 text-primary" aria-hidden />
            <span className="font-semibold">{balance}</span>
            <span className="font-semibold">{currency}</span>
          </span>
        </button>
        <div
          className={cn(
            "overflow-hidden transition-all duration-200 ease-out px-4",
            showDisconnect ? "max-h-12 opacity-100 pb-2" : "max-h-0 opacity-0",
          )}
        >
          <DisconnectWalletButton onDisconnect={onDisconnect} variant={variant} isFullWidth />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-lg py-3 px-4 text-base leading-none shrink-0 bg-primary text-white">
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
        <Coins className="size-4 text-white" aria-hidden />
        <span className="text-base leading-none font-semibold text-white">{balance}</span>
        <span className="text-base leading-none font-semibold text-white">{currency}</span>
      </span>
    </div>
  );
}
