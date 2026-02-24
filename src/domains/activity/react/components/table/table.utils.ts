import type { ActivityRow } from "@/domains/activity/activity.types";
import type { Header, SortDirection } from "@tanstack/react-table";

export function getHeadCellSortDirection(header: Header<ActivityRow, unknown>) {
  return header.column.getIsSorted() === false
    ? undefined
    : (header.column.getIsSorted() as SortDirection);
}

export function getHeadCellSortTitle(header: Header<ActivityRow, unknown>) {
  return header.column.getCanSort()
    ? header.column.getNextSortingOrder() === "asc"
      ? "Sort by ascending order"
      : header.column.getNextSortingOrder() === "desc"
        ? "Sort by descending order"
        : "Cancel sorting"
    : undefined;
}
