import AddFilterButton from "@/domains/history/react/components/add-filter-button";
import FilterTag from "@/domains/history/react/components/filters/filter-tag";
import { useHistoryFilters } from "@/domains/history/react/hooks/use-history-filters";
import { useToggle } from "@/hooks/use-toggle";
import cn from "@/utils/classnames";
import { ChevronDown, Filter, Search } from "lucide-react";

export default function HistoryFilters() {
  const [isPanelOpen, togglePanel] = useToggle(false);

  const { filters, searchQuery, filtersLabel, addFilter, removeFilter, setSearchQuery } =
    useHistoryFilters();

  const hasSearchQuery = searchQuery.trim() !== "";

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <label htmlFor="history-search" className="sr-only">
            Search orders
          </label>
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray"
              aria-hidden
              size={16}
            />
            <input
              id="history-search"
              type="search"
              placeholder="Search by Order ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full rounded-lg border border-gray bg-white py-2 pl-10 h-8 pr-4 text-sm leading-4 text-primary",
                "focus:border-primary focus:outline-none focus:ring-[1.5px] focus:ring-primary focus:ring-offset-[1.5px] focus:ring-offset-white",
                "placeholder:text-gray",
              )}
            />
          </div>
        </div>

        <div className="col-span-1 flex flex-col items-end gap-2">
          <div className="flex w-full items-center justify-end gap-4">
            <span className="text-sm text-primary">{filtersLabel}</span>
            <button
              type="button"
              onClick={togglePanel}
              className={cn(
                "flex items-center h-8 justify-center gap-2 rounded-lg border border-gray bg-transparent py-2 px-4 text-sm text-primary",
                "hover:border-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 focus:ring-offset-white",
              )}
            >
              <Filter size={16} aria-hidden />
              Filters
              <ChevronDown
                size={16}
                aria-hidden
                className={cn("transition-transform", isPanelOpen && "rotate-180")}
              />
            </button>
          </div>
        </div>
      </div>

      {isPanelOpen && (
        <div className="w-full" role="region" aria-label="Filters">
          <div className="flex flex-wrap items-center gap-2">
            <AddFilterButton activeFilters={filters} onAddFilter={addFilter} />

            {hasSearchQuery && (
              <FilterTag
                category="Search"
                value={searchQuery.trim()}
                onRemove={() => setSearchQuery("")}
              />
            )}

            {filters.map((filter, index) => (
              <FilterTag
                key={`${filter.category}-${filter.value}-${index}`}
                category={filter.category}
                value={filter.value}
                onRemove={() => removeFilter(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
