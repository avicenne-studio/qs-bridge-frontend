import cn from "@/utils/classnames";

interface Props {
  label: string;
  active: boolean;
}

export default function RoleBadge({ label, active }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
        active
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
          : "bg-white/6 text-gray border border-white/10",
      )}
    >
      {label}
    </span>
  );
}
