import StatusItem from "./status-item";

export default function StatusSection() {
  //Todo: get status from backend
  const STATUS_ITEMS = [
    { label: "Qubic → Solana", value: "Operational" },
    { label: "Solana → Qubic", value: "Operational" },
    { label: "Oracles", value: "12/12 online" },
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
