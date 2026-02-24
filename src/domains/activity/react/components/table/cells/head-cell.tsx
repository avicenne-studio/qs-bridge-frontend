import cn from "@/utils/classnames";
import { ArrowUpDown } from "lucide-react";
import type { MouseEvent, PropsWithChildren } from "react";
import CellLayout from "./cell-layout";

interface Props extends PropsWithChildren {
  canSort?: boolean;
  isSorted?: false | "asc" | "desc";
  title?: string;
  onSort?: (event: MouseEvent) => void;
}

const sortDataAttr = (isSorted: false | "asc" | "desc" | undefined) =>
  isSorted === "asc" || isSorted === "desc" ? isSorted : "none";

export default function HeadCell({ children, canSort = true, isSorted, title, onSort }: Props) {
  return (
    <CellLayout type="th">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          if (canSort) onSort?.(e);
        }}
        aria-label={title}
        className={cn(
          "flex flex-row items-center gap-[6px] border-none bg-transparent p-0 text-left",
          canSort && "cursor-pointer select-none",
        )}
      >
        <span className="text-primary text-sm font-normal">{children}</span>
        <span className="inline-flex shrink-0" data-sort={sortDataAttr(isSorted)} aria-hidden>
          <ArrowUpDown size={12} strokeWidth={1} />
        </span>
      </button>
    </CellLayout>
  );
}
