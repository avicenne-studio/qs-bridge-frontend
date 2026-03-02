import type { HistoryFilter } from "@/domains/history/history.types";
import { useState } from "react";

export type AddFilterOptions = {
  replace?: boolean;
};

export function useHistoryFilters() {
  const [filters, setFilters] = useState<HistoryFilter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  function addFilter(filter: HistoryFilter, options?: AddFilterOptions) {
    const replace = options?.replace ?? false;
    setFilters((prev) => {
      if (replace) {
        const hasSameCategory = prev.some((f) => f.category === filter.category);
        return hasSameCategory
          ? prev.map((f) => (f.category === filter.category ? filter : f))
          : [...prev, filter];
      }

      return prev.some((f) => f.category === filter.category && f.value === filter.value)
        ? prev
        : [...prev, filter];
    });
  }

  function removeFilter(index: number) {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  }

  const appliedCount = filters.length + (searchQuery.trim() ? 1 : 0);

  const filtersLabel =
    appliedCount === 0
      ? "No filter applied"
      : appliedCount === 1
        ? "1 filter applied"
        : `${appliedCount} filters applied`;

  return {
    filters,
    searchQuery,
    filtersLabel,
    addFilter,
    removeFilter,
    setSearchQuery,
  };
}
