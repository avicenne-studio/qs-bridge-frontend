import cn from "@/utils/classnames";

interface Props {
  label: string;
  value: string;
  highlight?: "ok" | "warn";
}

export default function Stat({ label, value, highlight }: Props) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-gray">{label}</p>
      <p
        className={cn(
          "text-sm font-medium",
          highlight === "ok" && "text-emerald-400",
          highlight === "warn" && "text-amber-400",
          !highlight && "text-primary",
        )}
      >
        {value}
      </p>
    </div>
  );
}
