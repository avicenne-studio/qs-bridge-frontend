import { Calendar } from "@/components/ui/calendar";
import cn from "@/utils/classnames";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { FilterOptionComponentProps } from "./filter-option-props";

export default function DateFilterOptions({
  category,
  menuPanelClass,
  selectedDateFilter,
  onAddFilter,
  setDatePickerOpen,
}: FilterOptionComponentProps) {
  const [datePickerOpen, setDatePickerOpenLocal] = useState(false);

  const setDatePickerOpenState = setDatePickerOpen ?? setDatePickerOpenLocal;

  function handleDateSelect(date: Date | undefined) {
    if (date === undefined) return;

    onAddFilter({ category, value: format(date, "yyyy-MM-dd") }, { replace: true });
  }

  const label = selectedDateFilter ? format(selectedDateFilter, "dd MMM yyyy") : "Pick a date";

  return (
    <DropdownMenu.Root open={datePickerOpen} onOpenChange={setDatePickerOpenState}>
      <DropdownMenu.Trigger
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-primary",
          "hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
          !selectedDateFilter && "text-gray",
        )}
      >
        {label}
        <ChevronDown size={14} aria-hidden />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={menuPanelClass}
          alignOffset={-8}
          sideOffset={16}
          align="start"
        >
          <Calendar selected={selectedDateFilter} onSelect={handleDateSelect} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
