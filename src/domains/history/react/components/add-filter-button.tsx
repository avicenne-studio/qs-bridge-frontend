import Button from "@/components/core/buttons/button/button";
import cn from "@/utils/classnames";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import type { ComponentType } from "react";
import type { HistoryFilter } from "@/domains/history/history.types";
import type { FilterOptionComponentProps } from "./filters/options/filter-option-props";
import DateFilterOptions from "./filters/options/date-filter-options";
import DirectionFilterOptions from "./filters/options/direction-filter-options";
import FromFilterOptions from "./filters/options/from-filter-options";
import StatusFilterOptions from "./filters/options/status-filter-options";
import ToFilterOptions from "./filters/options/to-filter-options";
import type { AddFilterOptions } from "../hooks/use-history-filters";
import { stringToDate } from "@/utils/format";

const FILTER_OPTIONS: Record<
  string,
  { Component: ComponentType<FilterOptionComponentProps>; values: readonly string[] | null }
> = {
  status: {
    Component: StatusFilterOptions,
    values: ["Pending", "In Progress", "Ready for relay", "Finalized", "Failed"],
  },
  direction: {
    Component: DirectionFilterOptions,
    values: ["QUBIC to Solana", "Solana to QUBIC"],
  },
  from: {
    Component: FromFilterOptions,
    values: ["QUBIC", "Solana"],
  },
  to: {
    Component: ToFilterOptions,
    values: ["QUBIC", "Solana"],
  },
  date: {
    Component: DateFilterOptions,
    values: null,
  },
};

const FILTER_ENTRIES = Object.entries(FILTER_OPTIONS);

interface Props {
  activeFilters: HistoryFilter[];
  onAddFilter: (filter: HistoryFilter, options?: AddFilterOptions) => void;
}

export default function AddFilterButton({ activeFilters, onAddFilter }: Props) {
  const [open, setOpen] = useState(false);

  const isSelected = (category: string, value: string) =>
    activeFilters.some((f) => f.category === category && f.value === value);

  const dateFilterValue = activeFilters.find((f) => f.category === "date")?.value;

  const selectedDateFilter = dateFilterValue ? stringToDate(dateFilterValue) : undefined;

  const menuPanelClass = cn(
    "z-50 min-w-[180px] border border-[#e5e7eb] rounded-lg bg-white p-2 flex flex-col gap-4",
  );

  const subTriggerClass = cn(
    "flex cursor-default select-none capitalize items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-primary outline-none",
    "focus:bg-primary/5 data-[state=open]:bg-primary/5",
  );

  const itemClass = cn(
    "relative flex cursor-default select-none items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-primary outline-none",
    "focus:bg-primary/5 data-highlighted:bg-primary/5",
  );

  const labelClass = "px-2 text-sm text-[#B2B2B2] capitalize";

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger>
        <Button variant="default" label="Add new filter" icon={<Plus size={16} aria-hidden />} />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className={menuPanelClass} sideOffset={8} align="start">
          <DropdownMenu.Label className={labelClass}>Filter by</DropdownMenu.Label>

          <div className="flex flex-col gap-2">
            {FILTER_ENTRIES.map(([category, { Component: FilterComponent, values }]) => (
              <DropdownMenu.Sub key={category}>
                <DropdownMenu.SubTrigger className={subTriggerClass}>
                  {category}
                  <ChevronRight size={14} aria-hidden />
                </DropdownMenu.SubTrigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent className={menuPanelClass} sideOffset={16}>
                    <DropdownMenu.Label className={labelClass}>{category}</DropdownMenu.Label>
                    <FilterComponent
                      category={category}
                      values={values ?? undefined}
                      onAddFilter={onAddFilter}
                      isSelected={isSelected}
                      itemClass={itemClass}
                      menuPanelClass={menuPanelClass}
                      selectedDateFilter={selectedDateFilter}
                    />
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>
            ))}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
