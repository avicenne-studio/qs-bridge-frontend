import NetworkTag from "@/components/network-tag/network-tag";
import type { NetworkTagNetwork } from "@/components/network-tag/network-tag";
import Tooltip from "@/components/ui/tooltip";
import type { Currency } from "@/types/currency";
import { truncateAddress } from "@/utils/format";
import { TextMorph } from "torph/react";
import type { Address } from "viem";
import cn from "@/utils/classnames";

export interface NetworkDirectionInformationProps {
  network: NetworkTagNetwork;
  walletAddress: Address;
  balance: string;
  direction: "origin" | "destination";
  currency: Currency;
  hideBalance?: boolean;
  // Custom recipient props (destination only)
  destinationWalletConnected?: boolean;
  isEditingRecipient?: boolean;
  customRecipientAddress?: string;
  onCustomRecipientChange?: (v: string) => void;
  onStartEditRecipient?: () => void;
  onCancelEditRecipient?: () => void;
  customAddressError?: string | null;
  destinationChain?: NetworkTagNetwork;
  onConnectDestinationWallet?: () => void;
}

type Props = NetworkDirectionInformationProps;

export default function NetworkDirectionInformation({
  network,
  walletAddress,
  balance,
  direction,
  currency,
  hideBalance = false,
  destinationWalletConnected,
  isEditingRecipient,
  customRecipientAddress,
  onCustomRecipientChange,
  onStartEditRecipient,
  onCancelEditRecipient,
  customAddressError,
  destinationChain,
  onConnectDestinationWallet,
}: Props) {
  const DIRECTION_LABEL: Record<Props["direction"], string> = {
    origin: "From",
    destination: "To",
  };

  const isDestination = direction === "destination";
  const showNoWalletOptions = isDestination && !destinationWalletConnected && !isEditingRecipient;
  const showCustomInput =
    isDestination && !showNoWalletOptions && (isEditingRecipient || !destinationWalletConnected);
  const showBalance = !hideBalance && !(isDestination && (showCustomInput || showNoWalletOptions));

  return (
    <div className="flex flex-col w-full gap-4 rounded-lg bg-[#FAFAFA] p-6">
      <div className="flex w-full items-center justify-between gap-6">
        <span className="text-base text-primary">{DIRECTION_LABEL[direction]}</span>
        <NetworkTag network={network} />
      </div>

      {showNoWalletOptions ? (
        <div className="flex w-full items-center justify-between">
          <span className="text-base text-primary">No wallet connected</span>
          <div className="flex flex-col items-end gap-1">
            {onConnectDestinationWallet && (
              <button
                type="button"
                onClick={onConnectDestinationWallet}
                className="text-sm font-medium text-primary hover:opacity-70 transition-opacity"
              >
                Connect
              </button>
            )}
            {onStartEditRecipient && (
              <button
                type="button"
                onClick={onStartEditRecipient}
                className="text-xs text-gray-500 hover:text-primary transition-colors underline underline-offset-2"
              >
                Enter an address
              </button>
            )}
          </div>
        </div>
      ) : showCustomInput ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex w-full items-center justify-between">
            <span className="text-base text-primary">Recipient address</span>
            {isEditingRecipient && onCancelEditRecipient && (
              <button
                type="button"
                onClick={onCancelEditRecipient}
                className="text-sm text-gray-500 hover:text-primary transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
          <input
            type="text"
            value={customRecipientAddress ?? ""}
            onChange={(e) => onCustomRecipientChange?.(e.target.value)}
            placeholder={`Enter ${destinationChain ?? network} address`}
            className={cn(
              "w-full rounded border bg-white/80 px-3 py-2 text-sm text-primary font-mono",
              "placeholder:text-gray-400 focus:outline-none",
              customAddressError
                ? "border-red-400 focus:border-red-400"
                : "border-gray-200 focus:border-highlight/60",
            )}
          />
          {customAddressError && <span className="text-xs text-red-500">{customAddressError}</span>}
        </div>
      ) : (
        <div className="flex w-full items-center justify-between">
          <span className="text-base text-primary">Wallet address</span>
          <div className="flex items-center gap-2">
            <Tooltip content={walletAddress}>
              <TextMorph className="cursor-default text-base font-semibold text-primary underline decoration-dotted underline-offset-2">
                {truncateAddress(walletAddress)}
              </TextMorph>
            </Tooltip>
            {isDestination && destinationWalletConnected && onStartEditRecipient && (
              <button
                type="button"
                onClick={onStartEditRecipient}
                className="text-xs text-gray-500 hover:text-primary transition-colors whitespace-nowrap underline underline-offset-2"
              >
                Change recipient
              </button>
            )}
          </div>
        </div>
      )}

      {showBalance && (
        <div className="flex w-full items-center justify-between">
          <span className="text-base text-primary">Balance</span>
          <div className="flex items-center gap-1">
            <TextMorph className="text-base text-primary font-semibold">{balance}</TextMorph>
            <TextMorph className="text-base text-primary font-semibold">{currency}</TextMorph>
          </div>
        </div>
      )}
    </div>
  );
}
