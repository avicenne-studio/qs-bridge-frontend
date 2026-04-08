import ComboTextStats from "@/components/stats/combo-text-stats";
import ActivityTable from "@/domains/activity/react/components/activity-table";
import { useActivityOrders } from "@/domains/activity/react/hooks/use-activity-orders";
import cn from "@/utils/classnames";
import { Lock, Network } from "lucide-react";
import type { ComponentProps } from "react";

type Stats = ComponentProps<typeof ComboTextStats>;

export default function ActivityPage() {
  const { rows, pagination, isLoading, error, goToPage } = useActivityOrders();

  const stats: Stats[] = [
    { title: "Total orders", value: pagination.total.toString(), Icon: Network },
    { title: "Total locked", value: "—", currency: "QUBIC", Icon: Lock },
  ];

  return (
    <div className="w-full pt-6 flex gap-10 flex-col">
      <section className={cn("grid w-full gap-3", "grid-cols-1 md:grid-cols-4")}>
        {stats.map(({ title, value, currency, Icon }) => (
          <ComboTextStats key={title} title={title} value={value} currency={currency} Icon={Icon} />
        ))}
      </section>

      {error && (
        <div className="w-full rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <ActivityTable
        data={rows}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={goToPage}
      />
    </div>
  );
}
