import NetworkTag from "@/components/network-tag/network-tag";
import type { NetworkTagNetwork } from "@/components/network-tag/network-tag";
import Tooltip from "@/components/ui/tooltip";
import type { Currency } from "@/types/currency";
import { truncateAddress } from "@/utils/format";
import { TextMorph } from "torph/react";
import type { Address } from "viem";

interface Props {
  network: NetworkTagNetwork;
  walletAddress: Address;
  balance: string;
  direction: "origin" | "destination";
  currency: Currency;
  hideBalance?: boolean;
}

export default function NetworkDirectionInformation({
  network,
  walletAddress,
  balance,
  direction,
  currency,
  hideBalance = false,
}: Props) {
  const DIRECTION_LABEL: Record<Props["direction"], string> = {
    origin: "From",
    destination: "To",
  };

  return (
    <div className="flex flex-col w-full gap-4 rounded-lg bg-[#FAFAFA] p-6">
      <div className="flex w-full items-center justify-between gap-6">
        <span className="text-base text-primary">{DIRECTION_LABEL[direction]}</span>
        <NetworkTag network={network} />
      </div>

      <div className="flex w-full items-center justify-between">
        <span className="text-base text-primary">Wallet address</span>
        <Tooltip content={walletAddress}>
          <TextMorph className="cursor-default text-base font-semibold text-primary underline decoration-dotted underline-offset-2">
            {truncateAddress(walletAddress)}
          </TextMorph>
        </Tooltip>
      </div>

      {!hideBalance && (
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
