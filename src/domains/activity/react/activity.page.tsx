import ComboTextStats from "@/components/stats/combo-text-stats";
import ActivityTable from "@/domains/activity/react/components/activity-table";
import cn from "@/utils/classnames";
import { Lock, Network } from "lucide-react";

export default function ActivityPage() {
  //Todo: get stats from backend
  const stats = [
    { title: "Total orders", value: "123", Icon: Network },
    { title: "Total locked", value: "123", currency: "QUBIC", Icon: Lock },
  ];

  return (
    <div className="w-full pt-6 flex gap-10 flex-col">
      <section className={cn("grid w-full gap-3", "grid-cols-1 md:grid-cols-4")}>
        {stats.map((stat) => (
          <ComboTextStats
            key={stat.title}
            title={stat.title}
            value={stat.value}
            currency={stat.currency}
            Icon={stat.Icon}
          />
        ))}
      </section>

      <ActivityTable />
    </div>
  );
}
