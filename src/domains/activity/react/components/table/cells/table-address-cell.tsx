import * as Tooltip from "@radix-ui/react-tooltip";
import { truncateAddress } from "@/utils/address";
import CellLayout from "./cell-layout";

interface Props {
  address: string;
}

export default function TableAddressCell({ address }: Props) {
  return (
    <CellLayout type="td">
      <Tooltip.Provider delayDuration={300}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <span className="cursor-default underline decoration-dotted underline-offset-2">
              {truncateAddress(address)}
            </span>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              sideOffset={4}
              className="max-w-[320px] break-all rounded-md bg-primary px-3 py-2 text-sm text-white shadow-md"
            >
              {address}
              <Tooltip.Arrow className="fill-primary" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </CellLayout>
  );
}
