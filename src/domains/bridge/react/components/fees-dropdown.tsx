import { useState } from "react";
import { ChevronDown, ChevronUp, Edit, Info } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Tooltip from "@/components/ui/tooltip";
import type { Currency } from "@/types/currency";

interface Props {
  feesAmount: string;
  relayFeesAmount: string;
  currency: Currency;
  canEdit?: boolean;
}

export default function FeesDropdown({
  feesAmount,
  relayFeesAmount,
  currency,
  canEdit = false,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <div className="flex flex-wrap items-center gap-1 cursor-pointer">
          <span className="text-xs text-primary">
            Subtracted fees: {feesAmount} {currency}
          </span>

          <Tooltip content="Included gas is paid on top of the amount and covers solvers' gas costs to fulfill your trade.">
            <span
              className="inline-flex cursor-default items-center text-primary"
              aria-label="Fees info"
            >
              <Info size={14} strokeWidth={1.33} aria-hidden />
            </span>
          </Tooltip>

          <button
            type="button"
            className="inline-flex cursor-pointer items-center text-primary outline-none focus:ring-2 focus:ring-primary/50 rounded"
            aria-label="Show fees details"
            aria-expanded={open}
          >
            {open ? (
              <ChevronUp size={10} className="text-primary shrink-0" aria-hidden />
            ) : (
              <ChevronDown size={10} className="text-primary shrink-0" aria-hidden />
            )}
          </button>
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 flex flex-col gap-3 bg-primary p-4 rounded-lg min-w-[400px] shadow-lg"
          sideOffset={8}
          align="center"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-white">Estimated fees</span>
              <span className="text-sm font-semibold text-white">
                {feesAmount} {currency}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-white">Relayer fees</span>

                {canEdit && (
                  <button className="flex items-center gap-1 cursor-pointer">
                    <span className="text-sm text-white underline">Edit</span>
                    <Edit size={14} className="text-white shrink-0" aria-hidden />
                  </button>
                )}
              </div>

              <span className="text-sm font-semibold text-white">
                {relayFeesAmount} {currency}
              </span>
            </div>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
