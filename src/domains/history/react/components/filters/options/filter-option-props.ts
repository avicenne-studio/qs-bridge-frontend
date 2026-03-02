import type { AddFilterOptions } from "@/domains/history/react/hooks/use-history-filters";
import type { HistoryFilter } from "@/domains/history/history.types";

export interface FilterOptionComponentProps {
  category: string;
  values?: readonly string[];
  onAddFilter: (filter: HistoryFilter, options?: AddFilterOptions) => void;
  isSelected: (category: string, value: string) => boolean;
  itemClass: string;
  menuPanelClass?: string;
  selectedDateFilter?: Date;
  setDatePickerOpen?: (open: boolean) => void;
  setOpen?: (open: boolean) => void;
}
