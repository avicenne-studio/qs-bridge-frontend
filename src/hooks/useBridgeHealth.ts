import { useEffect, useState } from "react";
import { fetchBridgeHealth, fetchOraclesHealth } from "@/lib/hub/hub-client";

const BRIDGE_POLL_MS = 30_000;
const ORACLES_POLL_MS = 60_000;

export function useBridgeHealth() {
  const [isPaused, setIsPaused] = useState(false);
  const [healthyOracles, setHealthyOracles] = useState(0);
  const [totalOracles, setTotalOracles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function pollBridge() {
      try {
        const res = await fetchBridgeHealth(controller.signal);
        if (!controller.signal.aborted) setIsPaused(res.paused);
      } catch {
        // Silently ignore — will retry
      }
    }

    pollBridge();
    const bridgeInterval = setInterval(pollBridge, BRIDGE_POLL_MS);

    return () => {
      controller.abort();
      clearInterval(bridgeInterval);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function pollOracles() {
      try {
        const res = await fetchOraclesHealth(controller.signal);
        if (controller.signal.aborted) return;
        setTotalOracles(res.oracles.length);
        setHealthyOracles(res.oracles.filter((o) => o.status === "ok").length);
      } catch {
        // Silently ignore — will retry
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    pollOracles();
    const oraclesInterval = setInterval(pollOracles, ORACLES_POLL_MS);

    return () => {
      controller.abort();
      clearInterval(oraclesInterval);
    };
  }, []);

  return { isPaused, healthyOracles, totalOracles, isLoading };
}
