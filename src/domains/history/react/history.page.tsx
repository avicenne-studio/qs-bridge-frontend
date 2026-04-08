import ComboTextStats from "@/components/stats/combo-text-stats";
import EmptyHistory from "@/domains/history/react/components/empty-history";
import NoWalletConnectedPanel from "@/components/no-wallet-connected-panel";
import HistoryFilters from "@/domains/history/react/components/filters/history-filters";
import HistoryTable from "@/domains/history/react/components/table/history-table";
import { useHistoryFilters } from "@/domains/history/react/hooks/use-history-filters";
import { useHistoryOrders } from "@/domains/history/react/hooks/use-history-orders";
import useSolanaWallet from "@/hooks/useSolanaWallet";
import { useQubicWallet } from "@/providers/QubicWalletProvider";
import cn from "@/utils/classnames";
import { Lock, Network } from "lucide-react";
import type { ComponentProps } from "react";

type Stats = ComponentProps<typeof ComboTextStats>;

export default function HistoryPage() {
  const solana = useSolanaWallet();
  const qubic = useQubicWallet();

  const { filters, searchQuery, filtersLabel, addFilter, removeFilter, setSearchQuery } =
    useHistoryFilters();

  const { rows, pagination, isLoading, error, goToPage } = useHistoryOrders({
    filters,
    searchQuery,
    solanaAddress: solana.address ?? null,
    qubicAddress: (qubic.address as string) ?? null,
  });

  const stats: Stats[] = [
    { title: "Total transactions", value: pagination.total.toString(), Icon: Network },
    { title: "Total locked", value: "—", currency: "QUBIC", Icon: Lock },
  ];

  if (!solana.connected && !qubic.connected) {
    return (
      <NoWalletConnectedPanel
        label="No wallet connected"
        description="Connect a wallet to view your transaction history."
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

      <HistoryFilters
        filters={filters}
        searchQuery={searchQuery}
        filtersLabel={filtersLabel}
        addFilter={addFilter}
        removeFilter={removeFilter}
        setSearchQuery={setSearchQuery}
      />

      {error && (
        <div className="w-full rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {rows.length > 0 || isLoading ? (
        <HistoryTable
          data={rows}
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={goToPage}
        />
      ) : (
        <EmptyHistory />
      )}
    </div>
  );
}
