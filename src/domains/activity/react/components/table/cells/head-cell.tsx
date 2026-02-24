import cn from "@/utils/classnames";
import { ArrowUpDown } from "lucide-react";
import type { MouseEvent, PropsWithChildren } from "react";
import type { SortDirection } from "@tanstack/react-table";
import CellLayout from "./cell-layout";

interface Props extends PropsWithChildren {
  canSort?: boolean;
  sortDirection?: SortDirection;
  title?: string;
  onSort?: (event: unknown) => void;
}

export default function HeadCell({
  canSort = true,
  sortDirection,
  title,
  children,
  onSort,
}: Props) {
  const sort = sortDirection ? sortDirection : "none";

  function handleSort(e: MouseEvent<HTMLButtonElement>) {
    if (canSort) onSort?.(e);
  }

  return (
    <CellLayout type="th">
      <button
        type="button"
        onClick={handleSort}
        aria-label={title}
        className={cn(
          "flex flex-row items-center gap-[6px] border-none bg-transparent p-0 text-left",
          canSort && "cursor-pointer select-none",
        )}
      >
        <span className="text-primary text-sm font-normal">{children}</span>
        <span className="inline-flex shrink-0" data-sort={sort} aria-hidden>
          <ArrowUpDown size={12} strokeWidth={1} />
        </span>
      </button>
    </CellLayout>
  );
}
