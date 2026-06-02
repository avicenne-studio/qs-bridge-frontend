import cn from "@/utils/classnames";
import BridgeInitialStep from "./components/steps/bridge-initial-step";
import BridgeSuccessStep from "./components/steps/bridge-success-step";
import { useBridge } from "@/hooks/useBridge";
import { useBridgeHealthContext } from "@/providers/BridgeHealthProvider";

export default function BridgePage() {
  const bridge = useBridge();
  const { isPaused } = useBridgeHealthContext();

  return (
    <div className={cn("flex w-full flex-col gap-10", "p-0 py-8 xl:p-8")}>
      {isPaused && (
        <div className="w-full rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          The bridge is currently paused. Transactions are temporarily disabled.
        </div>
      )}

      {bridge.currentBridgeStep === "initial" && (
        <BridgeInitialStep
          bridgeAmount={bridge.bridgeAmount}
          setBridgeAmount={bridge.setBridgeAmount}
          relayFeeDisplay={bridge.relayFeeDisplay}
          originNetwork={bridge.originNetwork}
          destinationNetwork={bridge.destinationNetwork}
          onSwitchDirection={bridge.switchDirection}
          onBridge={bridge.handleBridge}
          isBridging={bridge.isBridging}
          canBridge={bridge.canBridge}
          isEstimating={bridge.isEstimating}
          originWalletConfig={bridge.originWalletConfig}
          destinationWalletConfig={bridge.destinationWalletConfig}
          feesAmount={bridge.totalProgramFees}
          error={bridge.error}
          isSolanaToQubic={bridge.isSolanaToQubic}
          isPaused={isPaused}
        />
      )}

      {bridge.currentBridgeStep === "successful" && (
        <BridgeSuccessStep
          originNetwork={bridge.originNetwork}
          destinationNetwork={bridge.destinationNetwork}
          originWalletConfig={bridge.originWalletConfig}
          destinationWalletConfig={bridge.destinationWalletConfig}
          amount={bridge.bridgeAmount}
          feesAmount={bridge.totalProgramFees}
          relayFeesAmount={bridge.relayFeeDisplay}
          newBridge={bridge.handleNewBridge}
          txSignature={bridge.txResult?.signature}
          orderStatus={bridge.orderStatus}
          destinationTrxHash={bridge.destinationTrxHash}
          isTrackingOrder={bridge.isTrackingOrder}
        />
      )}
    </div>
  );
}
