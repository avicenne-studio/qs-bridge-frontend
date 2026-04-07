import { useEffect, useRef, useState } from "react";
import { fetchOrders } from "@/lib/hub/hub-client";
import {
  mapHubOrderToRow,
  filtersToHubQuery,
  solanaAddressToHex,
  qubicAddressToHex,
} from "@/lib/hub/hub-mappers";
import type { ActivityRow } from "@/domains/activity/activity.types";
import type { HubPagination, HubOrdersQuery } from "@/lib/hub/hub.types";
import type { HistoryFilter } from "@/domains/history/history.types";

const PAGE_SIZE = 5;

interface UseHistoryOrdersParams {
  filters: HistoryFilter[];
  searchQuery: string;
  solanaAddress: string | null;
  qubicAddress: string | null;
}

export function useHistoryOrders({
  filters,
  searchQuery,
  solanaAddress,
  qubicAddress,
}: UseHistoryOrdersParams) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [pagination, setPagination] = useState<HubPagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track previous filter deps to reset page atomically
  const prevDepsRef = useRef({ filters, searchQuery, solanaAddress, qubicAddress });

  useEffect(() => {
    const prev = prevDepsRef.current;
    const filtersChanged =
      prev.filters !== filters ||
      prev.searchQuery !== searchQuery ||
      prev.solanaAddress !== solanaAddress ||
      prev.qubicAddress !== qubicAddress;
    prevDepsRef.current = { filters, searchQuery, solanaAddress, qubicAddress };

    // When filters change and we're not on page 1, reset page and let
    // the next effect run handle the fetch (avoids a double fetch).
    if (filtersChanged && page !== 1) {
      setPage(1);
      return;
    }
    const effectivePage = filtersChanged ? 1 : page;

    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);

      const filterQuery = filtersToHubQuery(filters, searchQuery);

      const participant: string[] = [];
      if (solanaAddress) participant.push(solanaAddressToHex(solanaAddress));
      if (qubicAddress) participant.push(qubicAddressToHex(qubicAddress));
      if (participant.length === 0) {
        setRows([]);
        setPagination({ page: 1, limit: PAGE_SIZE, total: 0 });
        setIsLoading(false);
        return;
      }

      const query: HubOrdersQuery = {
        page: effectivePage,
        limit: PAGE_SIZE,
        order: "desc",
        participant,
        ...filterQuery,
      };

      try {
        const res = await fetchOrders(query, controller.signal);
        const mapped = await Promise.all(res.data.map(mapHubOrderToRow));
        setRows(mapped);
        setPagination(res.pagination);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load history");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [page, filters, searchQuery, solanaAddress, qubicAddress]);

  return {
    rows,
    pagination,
    isLoading,
    error,
    goToPage: setPage,
  };
}
