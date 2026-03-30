import StatusItem from "./status-item";
import { useBridgeHealthContext } from "@/providers/BridgeHealthProvider";

export default function StatusSection() {
  const { isPaused, healthyOracles, totalOracles, isLoading } = useBridgeHealthContext();

  const bridgeStatus = isPaused ? "Paused" : "Operational";
  const oraclesLabel = isLoading ? "Loading..." : `${healthyOracles}/${totalOracles} online`;

  const STATUS_ITEMS = [
    { label: "Qubic → Solana", value: bridgeStatus },
    { label: "Solana → Qubic", value: bridgeStatus },
    { label: "Oracles", value: oraclesLabel },
  ];

  return (
    <section className="bg-white rounded-tl-2xl p-6 w-full">
      <h2 className="text-primary text-xs font-bold uppercase tracking-wide mb-3">Status</h2>
      <div className="flex flex-col gap-2">
        {STATUS_ITEMS.map(({ label, value }) => (
          <StatusItem key={label} label={label} value={value} variant="sidebar" />
        ))}
      </div>
    </section>
  );
}
