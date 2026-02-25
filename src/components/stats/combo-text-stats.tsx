import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  currency?: string;
  Icon: LucideIcon;
}

export default function ComboTextStats({ title, value, currency, Icon }: Props) {
  return (
    <div className="flex flex-col rounded-lg bg-[#fafafa] p-4 gap-4 text-primary">
      <div className="flex flex-row items-center gap-2">
        <Icon size={16} className="shrink-0" aria-hidden strokeWidth={1} />
        <span className="text-sm font-normal">{title}</span>
      </div>

      <div className="flex flex-row items-center gap-2">
        <p className="text-2xl font-medium">{value}</p>
        {currency && (
          <span className="text-[10px] font-semibold uppercase leading-8">{currency}</span>
        )}
      </div>
    </div>
  );
}
