import { createContext, useContext } from "react";
import type { useBridge } from "@/hooks/useBridge";

type BridgeContextValue = ReturnType<typeof useBridge>;

export const BridgeContext = createContext<BridgeContextValue | null>(null);

export function useBridgeContext(): BridgeContextValue {
  const ctx = useContext(BridgeContext);
  if (!ctx) throw new Error("useBridgeContext must be used within BridgeContext.Provider");
  return ctx;
}
