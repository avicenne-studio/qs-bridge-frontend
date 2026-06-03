import { useEffect, useRef, useState } from "react";
import { fetchOrderBySourceNonce, HubApiError } from "@/lib/hub/hub-client";
import { mapHubStatus } from "@/lib/hub/hub-mappers";
import type { OrderStatus } from "@/domains/activity/activity.types";

const INITIAL_INTERVAL_MS = 3_000;
const FOUND_INTERVAL_MS = 10_000;
const MAX_DURATION_MS = 10 * 60 * 1_000;

const TERMINAL_STATUSES: OrderStatus[] = ["finalized", "failed"];

export function useOrderTracking(sourceNonce: string | null) {
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [destinationTrxHash, setDestinationTrxHash] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    if (!sourceNonce) {
      setOrderStatus(null);
      setDestinationTrxHash(null);
      setIsPolling(false);
      setTrackingError(null);
      return;
    }

    startedAt.current = Date.now();
    setIsPolling(true);
    setOrderStatus(null);
    setDestinationTrxHash(null);
    setTrackingError(null);

    let timeoutId: ReturnType<typeof setTimeout>;
    const controller = new AbortController();

    async function poll() {
      if (controller.signal.aborted) return;

      if (Date.now() - startedAt.current > MAX_DURATION_MS) {
        setIsPolling(false);
        setTrackingError("Order tracking timed out");
        return;
      }

      try {
        if (!sourceNonce) return;
        const res = await fetchOrderBySourceNonce(sourceNonce, controller.signal);
        if (controller.signal.aborted) return;

        const status = mapHubStatus(res.data.status);
        setOrderStatus(status);
        setDestinationTrxHash(res.data.destination_trx_hash ?? null);

        if (TERMINAL_STATUSES.includes(status)) {
          setIsPolling(false);
          return;
        }

        timeoutId = setTimeout(poll, FOUND_INTERVAL_MS);
      } catch (err) {
        if (controller.signal.aborted) return;

        if (err instanceof HubApiError && err.status === 404) {
          timeoutId = setTimeout(poll, INITIAL_INTERVAL_MS);
          return;
        }

        setTrackingError(err instanceof Error ? err.message : "Order tracking failed");
        setIsPolling(false);
      }
    }

    timeoutId = setTimeout(poll, INITIAL_INTERVAL_MS);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [sourceNonce]);

  return { orderStatus, destinationTrxHash, isPolling, trackingError };
}
