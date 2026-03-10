import ComboTextStats from "@/components/stats/combo-text-stats";
import EmptyHistory from "@/domains/history/react/components/empty-history";
import NoWalletConnected from "@/domains/history/react/components/no-wallet-connected";
import HistoryFilters from "@/domains/history/react/components/filters/history-filters";
import HistoryTable from "@/domains/history/react/components/table/history-table";
import { MOCKED_HISTORY_DATA } from "@/domains/history/history.constants";
import useSolanaWallet from "@/hooks/useSolanaWallet";
import { useQubicWallet } from "@/providers/QubicWalletProvider";
import cn from "@/utils/classnames";
import { Lock, Network } from "lucide-react";
import type { ComponentProps } from "react";

type Stats = ComponentProps<typeof ComboTextStats>;

export default function HistoryPage() {
  const solana = useSolanaWallet();
  const qubic = useQubicWallet();

  const isWalletConnected = solana.connected || qubic.connected;

  // Todo: get stats from backend
  const orders = MOCKED_HISTORY_DATA;

  const stats: Stats[] = [
    { title: "Total transactions", value: orders.length.toString(), Icon: Network },
    { title: "Total locked", value: "123", currency: "QUBIC", Icon: Lock },
  ];

  const hasOrders = orders.length > 0;

  if (!isWalletConnected) {
    return (
      <NoWalletConnected
        description="Connect a wallet to view your transaction history."
        walletRequired="one"
      />
    );
  }

  return (
    <div className="w-full pt-6 flex gap-10 flex-col h-full">
      <section className={cn("grid w-full gap-3", "grid-cols-1 md:grid-cols-4")}>
        {stats.map(({ title, value, currency, Icon }) => (
          <ComboTextStats key={title} title={title} value={value} currency={currency} Icon={Icon} />
        ))}
      </section>

      <HistoryFilters />
      {hasOrders ? <HistoryTable data={orders} /> : <EmptyHistory />}
    </div>
  );
}
