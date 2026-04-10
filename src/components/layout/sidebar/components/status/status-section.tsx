import StatusItem from "./status-item";
import { useBridgeHealthContext } from "@/providers/BridgeHealthProvider";

export default function StatusSection() {
  const { isPaused, healthyOracles, totalOracles, isLoading } = useBridgeHealthContext();

  const bridgeStatus = isPaused ? "Paused" : healthyOracles === 0 ? "Offline" : "Operational";
  const oraclesLabel = isLoading ? "Loading..." : `${healthyOracles}/${totalOracles} online`;

  const bridgeColor = bridgeStatus === "Operational" ? ("green" as const) : ("red" as const);
  const oraclesColor = healthyOracles === 0 && !isLoading ? ("red" as const) : ("green" as const);

  const STATUS_ITEMS = [
    { label: "Qubic → Solana", value: bridgeStatus, color: bridgeColor },
    { label: "Solana → Qubic", value: bridgeStatus, color: bridgeColor },
    { label: "Oracles", value: oraclesLabel, color: oraclesColor },
  ];

  return (
    <section className="bg-white rounded-tl-2xl p-6 w-full">
      <h2 className="text-primary text-xs font-bold uppercase tracking-wide mb-3">Status</h2>
      <div className="flex flex-col gap-2">
        {STATUS_ITEMS.map(({ label, value, color }) => (
          <StatusItem key={label} label={label} value={value} color={color} variant="sidebar" />
        ))}
      </div>
    </section>
  );
}
