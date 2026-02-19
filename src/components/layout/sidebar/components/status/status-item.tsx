import cn from "@/utils/classnames";

interface Props {
  label: string;
  value: string;
  color?: "green" | "red" | "orange";
}

export default function StatusItem({ label, value, color = "green" }: Props) {
  return (
    <div
      className={cn("flex items-center justify-between rounded-lg px-3 py-2", {
        "bg-success-100": color === "green",
        "bg-warning-100": color === "orange",
        "bg-error-100": color === "red",
      })}
    >
      <label className="text-primary text-sm">{label}</label>
      <span
        className={cn("text-xs", {
          "text-success": color === "green",
          "text-warning": color === "orange",
          "text-error": color === "red",
        })}
      >
        {value}
      </span>
    </div>
  );
}
