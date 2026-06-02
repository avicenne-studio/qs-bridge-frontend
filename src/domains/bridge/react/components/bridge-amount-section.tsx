import { ArrowDown } from "lucide-react";
import Amount from "@/components/amounts/amount-input";
import type { Currency } from "@/types/currency";
import { computeReceivedAmount } from "@/utils/format";
import FeesDropdown from "./fees-dropdown";

interface Props {
  amount: string;
  balance: string;
  originCurrency: Currency;
  destinationCurrency: Currency;
  feesAmount?: string;
  relayFeesDisplay: string;
  setAmount: (amount: string) => void;
  isLoadingFees?: boolean;
}

export default function BridgeAmountSection({
  amount,
  balance,
  originCurrency,
  destinationCurrency,
  feesAmount = "0",
  relayFeesDisplay,
  setAmount,
  isLoadingFees = false,
}: Props) {
  function setMax() {
    setAmount(balance);
  }

  const receivedAmountFormatted = computeReceivedAmount(amount, feesAmount, relayFeesDisplay);

  return (
    <div className="flex size-full flex-col gap-8 items-center justify-center">
      <div className="flex w-fit flex-col gap-2 items-center justify-center py-6">
        <label htmlFor="amount-to-bridge" className="text-xs font-semibold uppercase text-primary">
          Amount to bridge
        </label>

        <Amount amount={amount} setAmount={setAmount} currency={originCurrency} />

        <div className="flex items-center gap-2">
          <span className="text-xs text-primary">Balance available</span>
          <span className="text-xs text-primary">
            {balance} {originCurrency}
          </span>
          <button
            type="button"
            onClick={setMax}
            className="rounded px-2 py-0.5 text-xs text-primary bg-highlight"
          >
            Max
          </button>
        </div>
      </div>

      <ArrowDown className="text-primary shrink-0" size={16} aria-hidden strokeWidth={1.33} />

      <div className="flex w-fit flex-col gap-2 items-center justify-center py-6">
        <p className="text-xs font-semibold uppercase text-primary">Amount received</p>

        <Amount amount={receivedAmountFormatted} currency={destinationCurrency} />

        <FeesDropdown
          feesAmount={feesAmount}
          relayFeesAmount={relayFeesDisplay}
          currency={destinationCurrency}
          isLoading={isLoadingFees}
        />
      </div>
    </div>
  );
}
