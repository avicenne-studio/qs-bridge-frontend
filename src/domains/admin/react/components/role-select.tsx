import { QUBIC_ROLE_ORACLE, QUBIC_ROLE_PAUSER } from "@/lib/bridge/qubic/admin-payloads";

const roleOptions = [
  { value: QUBIC_ROLE_ORACLE, label: "Oracle" },
  { value: QUBIC_ROLE_PAUSER, label: "Pauser" },
];

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export default function RoleSelect({ value, onChange }: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray">Role</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded border border-gray/30 bg-white/80 px-2.5 py-1.5 text-xs text-primary focus:outline-none focus:border-highlight/60"
      >
        {roleOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
