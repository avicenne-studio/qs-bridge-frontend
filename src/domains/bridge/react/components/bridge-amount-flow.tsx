import { useState } from "react";
import { ArrowDown, ChevronDown, Info } from "lucide-react";
import Tooltip from "@/components/ui/tooltip";
import Amount from "@/components/amounts/amount-input";
import type { Currency } from "@/types/currency";

interface Props {
  balance: string;
  originCurrency: Currency;
  destinationCurrency: Currency;
  feesAmount?: string;
  feesCurrency?: string;
  onAmountChange?: (amount: string) => void;
}

export default function BridgeAmountFlow({
  balance,
  originCurrency,
  destinationCurrency,
  feesAmount = "0.02",
  feesCurrency = "QUBIC",
  onAmountChange,
}: Props) {
  const [amount, setAmount] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    onAmountChange?.(value);
  };

  const setMax = () => {
    setAmount(balance);
    onAmountChange?.(balance);
  };

  const amountLength = amount.length;

  return (
    <div className="flex size-full flex-col gap-8 items-center justify-center">
      <div className="flex w-fit flex-col gap-2 items-center justify-center">
        <label htmlFor="amount-to-bridge" className="text-xs font-semibold uppercase text-primary">
          Amount to bridge
        </label>

        <div className="flex gap-2 w-fit items-center justify-center">
          <input
            id="amount-to-bridge"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={handleChange}
            className="w-fit min-w-[3ch] bg-transparent text-end font-semibold text-primary outline-none placeholder:text-primary/50 text-[32px] leading-none"
            style={{ width: `${amountLength}ch` }}
            aria-label="Amount to bridge"
          />
          <span className="font-semibold text-primary text-[32px] leading-none">
            {originCurrency}
          </span>
        </div>
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

      <div className="flex w-fit flex-col gap-2 items-center justify-center">
        <p className="text-xs font-semibold uppercase text-primary">Amount received</p>

        <Amount amount={amount} currency={destinationCurrency} />

        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs text-primary">
            Subtracted fees: {feesAmount} {feesCurrency}
          </span>

          <Tooltip content="Included gas is paid on top of the amount and covers solvers' gas costs to fulfill your trade.">
            <span
              className="inline-flex cursor-default items-center text-primary"
              aria-label="Fees info"
            >
              <Info size={14} strokeWidth={1.33} aria-hidden />
            </span>
          </Tooltip>
          <ChevronDown size={10} className="text-primary shrink-0" aria-hidden />
        </div>
      </div>
    </div>
  );
}
