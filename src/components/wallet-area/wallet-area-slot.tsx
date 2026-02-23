import { type ReactNode } from "react";
import { Coins } from "lucide-react";
import { truncateAddress } from "@/utils/address";
import cn from "@/utils/classnames";
import ConnectWalletButton from "./connect-wallet-button/connect-wallet-button";
import DisconnectWalletButton from "./disconnect-wallet-button/disconnect-wallet-button";

export interface Props {
  connectWalletLabel: string;
  icon: ReactNode;
  address: string;
  balance: string;
  currency: string;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function WalletAreaSlot({
  connectWalletLabel,
  icon,
  address,
  balance,
  currency,
  isConnected,
  onConnect,
  onDisconnect,
}: Props) {
  if (!isConnected) {
    return <ConnectWalletButton label={connectWalletLabel} icon={icon} onConnect={onConnect} />;
  }

  return (
    <div className="flex items-center gap-4 rounded-lg py-3 px-4 text-white text-base leading-none bg-primary shrink-0">
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
          <DisconnectWalletButton onDisconnect={onDisconnect} />
        </div>
      </div>

      <span className="shrink-0 flex items-center gap-1">
        <Coins className="size-4 text-white" aria-hidden />
        <span className="text-base text-white leading-none font-semibold">{balance}</span>
        <span className="text-base text-white leading-none font-semibold">{currency}</span>
      </span>
    </div>
  );
}
