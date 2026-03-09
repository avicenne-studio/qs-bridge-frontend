import Tooltip from "@/components/ui/tooltip";
import { truncateAddress } from "@/utils/format";
import type { Address } from "viem";
import CellLayout from "./cell-layout";

interface Props {
  address: Address;
}

export default function TableAddressCell({ address }: Props) {
  return (
    <CellLayout type="td">
      <Tooltip content={address}>
        <span className="cursor-default underline decoration-dotted underline-offset-2">
          {truncateAddress(address)}
        </span>
      </Tooltip>
    </CellLayout>
  );
}
