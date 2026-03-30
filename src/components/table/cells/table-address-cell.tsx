import Tooltip from "@/components/ui/tooltip";
import { truncateAddress } from "@/utils/format";
import { ExternalLink } from "lucide-react";
import CellLayout from "./cell-layout";
import type { Chain } from "@/domains/activity/activity.types";
import { getAddressExplorerUrl } from "@/lib/explorer";

interface Props {
  address: string;
  chain: Chain;
}

export default function TableAddressCell({ address, chain }: Props) {
  const explorerUrl = getAddressExplorerUrl(address, chain);

  return (
    <CellLayout type="td">
      <Tooltip content={address}>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-primary/70"
        >
          {truncateAddress(address)}
          <ExternalLink size={12} className="shrink-0" aria-hidden />
        </a>
      </Tooltip>
    </CellLayout>
  );
}
