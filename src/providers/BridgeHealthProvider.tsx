import { createContext, useContext, type PropsWithChildren } from "react";
import { useBridgeHealth } from "@/hooks/useBridgeHealth";

type BridgeHealthState = ReturnType<typeof useBridgeHealth>;

const BridgeHealthContext = createContext<BridgeHealthState>({
  isPaused: false,
  healthyOracles: 0,
  totalOracles: 0,
  isLoading: true,
});

export function BridgeHealthProvider({ children }: PropsWithChildren) {
  const health = useBridgeHealth();
  return <BridgeHealthContext.Provider value={health}>{children}</BridgeHealthContext.Provider>;
}

export function useBridgeHealthContext() {
  return useContext(BridgeHealthContext);
}
