import cn from "@/utils/classnames";
import type { LucideIcon } from "lucide-react";

interface Props {
  disabled: boolean;
  Icon: LucideIcon;
  action: () => void;
}

export default function PaginationButton({ disabled, Icon, action }: Props) {
  return (
    <button
      type="button"
      onClick={action}
      disabled={disabled}
      className={cn(
        "text-xs font-medium text-primary",
        disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer",
      )}
    >
      <Icon size={14} strokeWidth={1} className="text-primary" />
    </button>
  );
}
