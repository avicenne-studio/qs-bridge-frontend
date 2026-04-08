import { useEffect, useState } from "react";
import { fetchOrders } from "@/lib/hub/hub-client";
import { mapHubOrderToRow } from "@/lib/hub/hub-mappers";
import type { ActivityRow } from "@/domains/activity/activity.types";
import type { HubPagination } from "@/lib/hub/hub.types";

const PAGE_SIZE = 5;

export function useActivityOrders() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [pagination, setPagination] = useState<HubPagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchOrders({ page, limit: PAGE_SIZE, order: "desc" }, controller.signal);
        const mapped = await Promise.all(res.data.map(mapHubOrderToRow));
        setRows(mapped);
        setPagination(res.pagination);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [page]);

  return {
    rows,
    pagination,
    isLoading,
    error,
    goToPage: setPage,
  };
}
