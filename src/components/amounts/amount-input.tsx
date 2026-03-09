import type { Currency } from "@/types/currency";
import type { ChangeEvent } from "react";
import { formatAmountParts } from "./amounts.utils";
import cn from "@/utils/classnames";
import { replaceCommaByDot } from "@/utils/format";

interface Props {
  amount: string;
  currency: Currency;
  setAmount?: (amount: string) => void;
}

export default function Amount({ amount, currency, setAmount }: Props) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (setAmount === undefined) return;

    let value = e.target.value;

    value = replaceCommaByDot(value);

    setAmount(value);
  };

  const { integer, decimal } = formatAmountParts(amount);

  const isPlaceholder = amount === "";
  const hasSetAmount = setAmount !== undefined;

  return (
    <div className="flex gap-2 w-fit items-center justify-center">
      <div className="relative flex min-w-[4ch] items-end justify-end text-end font-semibold text-primary text-[32px] leading-none">
        <span className={cn(isPlaceholder ? "text-primary/50" : "text-primary", "text-[32px]")}>
          {integer}
        </span>
        <span className={cn(isPlaceholder ? "text-primary/50" : "text-primary", "text-[24px]")}>
          {decimal}
        </span>

        {hasSetAmount && (
          <input
            id="amount-to-bridge"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={handleChange}
            className="absolute inset-0 w-full cursor-text bg-transparent opacity-0 font-semibold text-[32px] leading-none"
            aria-label="Amount to bridge"
          />
        )}
      </div>

      <span className="font-semibold text-primary text-[32px] leading-none">{currency}</span>
    </div>
  );
}
