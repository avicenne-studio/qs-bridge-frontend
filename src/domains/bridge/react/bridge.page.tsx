import cn from "@/utils/classnames";
import BridgeInitialStep from "./components/steps/bridge-initial-step";
import BridgeSuccessStep from "./components/steps/bridge-success-step";
import { useBridge } from "@/hooks/useBridge";

export default function BridgePage() {
  const bridge = useBridge();

  return (
    <div className={cn("flex w-full flex-col gap-10", "p-0 py-8 xl:p-8")}>
      {bridge.currentBridgeStep === "initial" && (
        <BridgeInitialStep
          bridgeAmount={bridge.bridgeAmount}
          setBridgeAmount={bridge.setBridgeAmount}
          relayFeeDisplay={bridge.relayFeeDisplay}
          onRelayFeeDisplayChange={bridge.setRelayFeeDisplay}
          originNetwork={bridge.originNetwork}
          destinationNetwork={bridge.destinationNetwork}
          onSwitchDirection={bridge.switchDirection}
          onBridge={bridge.handleBridge}
          isBridging={bridge.isBridging}
          originWalletConfig={bridge.originWalletConfig}
          destinationWalletConfig={bridge.destinationWalletConfig}
          feesAmount={bridge.totalProgramFees}
          error={bridge.error}
          isSolanaToQubic={bridge.isSolanaToQubic}
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
          explorerUrl={bridge.txResult?.explorerUrl}
          onOverride={bridge.lastOrder ? bridge.handleOverride : undefined}
          isOverriding={bridge.isOverriding}
          overrideError={bridge.overrideError}
        />
      )}
    </div>
  );
}
