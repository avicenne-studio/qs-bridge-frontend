import { ArrowRightLeft } from "lucide-react";
import Button from "@/components/core/buttons/button/button";
import NetworkTag from "@/components/network-tag/network-tag";
import type { NetworkTagNetwork } from "@/components/network-tag/network-tag";
import cn from "@/utils/classnames";

interface Props {
  originNetwork: NetworkTagNetwork;
  destinationNetwork: NetworkTagNetwork;
  onSwitchDirection?: () => void;
}

export default function BridgeDirectionSection({
  originNetwork,
  destinationNetwork,
  onSwitchDirection,
}: Props) {
  const switchDirectionButtonDisabled = onSwitchDirection === undefined;

  return (
    <section className="col-span-2 flex gap-4 flex-col items-end" aria-label="Bridge direction">
      <Button
        variant="default"
        className="flex xl:hidden"
        label="Switch direction"
        icon={<ArrowRightLeft size={16} aria-hidden strokeWidth={1} />}
        action={onSwitchDirection}
      />

      <div className="w-full flex items-center gap-4">
        <label className="text-sm font-semibold uppercase text-primary">Direction</label>

        <div
          className={cn(
            "flex w-full items-center gap-6 rounded-lg bg-[#FAFAFA] p-2",
            "justify-end xl:justify-between",
          )}
        >
          <div className="flex items-center gap-2">
            <NetworkTag network={originNetwork} />
            <span className="text-base font-semibold text-primary">to</span>
            <NetworkTag network={destinationNetwork} />
          </div>

          <Button
            variant="default"
            className="hidden xl:flex"
            label="Switch direction"
            isDisabled={switchDirectionButtonDisabled}
            icon={<ArrowRightLeft size={16} aria-hidden strokeWidth={1} />}
            action={onSwitchDirection}
          />
        </div>
      </div>
    </section>
  );
}
