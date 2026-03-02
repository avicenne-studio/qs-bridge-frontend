import cn from "@/utils/classnames";
import { X } from "lucide-react";

interface Props {
  category: string;
  value: string;
  onRemove: () => void;
}

export default function FilterTag({ category, value, onRemove }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/5 px-3 py-1.5">
      <span className="capitalize text-sm text-primary">
        {category}: {value}
      </span>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove filter ${category}: ${value}`}
        className={cn(
          "rounded p-0.5 text-gray",
          "hover:bg-primary/10 hover:text-primary",
          "focus:outline-none focus:ring-1 focus:ring-primary",
        )}
      >
        <X size={14} aria-hidden />
      </button>
    </span>
  );
}
