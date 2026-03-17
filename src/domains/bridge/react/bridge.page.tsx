import cn from "@/utils/classnames";
import BridgeInitialStep from "./components/steps/bridge-initial-step";
import BridgeSuccessStep from "./components/steps/bridge-success-step";
import { useBridge } from "@/hooks/useBridge";
import { BridgeContext } from "@/domains/bridge/bridge.context";
import NoWalletConnectedPanel from "@/components/no-wallet-connected-panel";

export default function BridgePage() {
  const bridge = useBridge();

  const walletsConnectedPanelLabel =
    !bridge.solanaConnected && !bridge.qubicConnected
      ? "No wallet connected."
      : "One wallet missing.";

  if (!bridge.solanaConnected || !bridge.qubicConnected) {
    return (
      <NoWalletConnectedPanel
        label={walletsConnectedPanelLabel}
        description="Both wallets need to be connected to bridge your tokens."
      />
    );
  }

  return (
    <BridgeContext.Provider value={bridge}>
      <div className={cn("flex w-full flex-col gap-10", "p-0 py-8 xl:p-8")}>
        {bridge.currentBridgeStep === "initial" && <BridgeInitialStep />}
        {bridge.currentBridgeStep === "successful" && <BridgeSuccessStep />}
      </div>
    </BridgeContext.Provider>
  );
}
