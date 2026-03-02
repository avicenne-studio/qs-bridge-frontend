import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import type { FilterOptionComponentProps } from "./filter-option-props";

export default function StatusFilterOptions({
  category,
  values,
  itemClass,
  onAddFilter,
  isSelected,
}: FilterOptionComponentProps) {
  if (values === undefined) return null;

  return (
    <>
      {values.map((value) => (
        <DropdownMenu.Item
          key={value}
          className={itemClass}
          onSelect={() => onAddFilter({ category, value })}
        >
          {value}
          {isSelected(category, value) && <Check size={14} aria-hidden className="shrink-0" />}
        </DropdownMenu.Item>
      ))}
    </>
  );
}
