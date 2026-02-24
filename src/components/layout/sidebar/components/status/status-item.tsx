import cn from "@/utils/classnames";

interface Props {
  label: string;
  value: string;
  color?: "green" | "red" | "orange";
  variant: "sidebar" | "tab-bar";
}

export default function StatusItem({ label, value, color = "green", variant }: Props) {
  return (
    <div
      className={cn("flex items-center justify-between rounded-lg", {
        "px-3 py-2": variant === "sidebar",
        "bg-success-100": variant === "sidebar" && color === "green",
        "bg-warning-100": variant === "sidebar" && color === "orange",
        "bg-error-100": variant === "sidebar" && color === "red",
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
