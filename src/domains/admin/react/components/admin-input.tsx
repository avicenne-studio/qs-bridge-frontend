import cn from "@/utils/classnames";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

export default function AdminInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  step,
}: Props) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={cn(
          "rounded border border-gray/30 bg-white/80 px-2.5 py-1.5 text-xs text-primary",
          "placeholder:text-gray/50 focus:outline-none focus:border-highlight/60",
          "font-mono",
        )}
      />
    </label>
  );
}
