import ComboTextStats from "@/domains/activity/react/components/combo-text-stats/combo-text-stats";
import ActivityTable from "@/domains/activity/react/components/table/activity-table";
import { Lock, Network } from "lucide-react";

export default function ActivityPage() {
  const stats = [
    { title: "Total orders", value: "123", Icon: Network },
    { title: "Total locked", value: "123", currency: "QUBIC", Icon: Lock },
  ];

  return (
    <div className="w-full pt-6 flex gap-10 flex-col">
      <section className="grid w-full grid-cols-4 gap-3">
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
