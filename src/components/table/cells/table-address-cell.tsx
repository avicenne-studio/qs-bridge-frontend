import Tooltip from "@/components/ui/tooltip";
import { truncateAddress } from "@/utils/format";
import { ExternalLink } from "lucide-react";
import CellLayout from "./cell-layout";
import type { Chain } from "@/domains/activity/activity.types";

function getExplorerUrl(address: string, chain: Chain): string {
  if (chain === "solana") {
    return `https://solscan.io/account/${address}?cluster=devnet`;
  }
  return `https://explorer.qubic.org/network/address/${address}`;
}

interface Props {
  address: string;
  chain: Chain;
}

export default function TableAddressCell({ address, chain }: Props) {
  const explorerUrl = getExplorerUrl(address, chain);

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
