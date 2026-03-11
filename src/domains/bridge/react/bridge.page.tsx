import { useState } from "react";
import type { NetworkTagNetwork } from "@/components/network-tag/network-tag";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import cn from "@/utils/classnames";
import BridgeInitialStep from "./components/steps/bridge-initial-step";
import BridgeSuccessStep from "./components/steps/bridge-success-step";
import { NETWORK } from "@/types/network";
import NoWalletConnected from "@/domains/history/react/components/no-wallet-connected";
import { useWalletStore } from "@/stores/wallet.store";

export type BridgeSteps = "initial" | "successful";

export default function BridgePage() {
  const [currentBridgeStep, setCurrentBridgeStep] = useState<BridgeSteps>("initial");
  const [bridgeAmount, setBridgeAmount] = useState("");
  const [originNetwork, setOriginNetwork] = useState<NetworkTagNetwork>(NETWORK.Qubic);
  const [destinationNetwork, setDestinationNetwork] = useState<NetworkTagNetwork>(NETWORK.Solana);

  const { qubic, solana } = useWalletStore();

  const { isLoading: isBridging, start: handleBridge } = useFakeLoading({
    delayMs: 2500,
    succeeds: true,
    onSuccess: () => setCurrentBridgeStep("successful"),
  });

  function switchDirection() {
    setOriginNetwork((direction) => (direction === NETWORK.Qubic ? NETWORK.Solana : NETWORK.Qubic));
    setDestinationNetwork((direction) =>
      direction === NETWORK.Qubic ? NETWORK.Solana : NETWORK.Qubic,
    );
  }

  const FEES_AMOUNT_MOCKED = "0.02";

  const isWalletConnected = solana.address && qubic.address;

  if (!isWalletConnected) {
    return (
      <NoWalletConnected
        description="Both wallets need to be connected to bridge your tokens."
        walletRequired="all"
      />
    );
  }

  return (
    <div className={cn("flex w-full flex-col gap-10", "p-0 py-8 xl:p-8")}>
      {currentBridgeStep === "initial" && (
        <BridgeInitialStep
          bridgeAmount={bridgeAmount}
          setBridgeAmount={setBridgeAmount}
          originNetwork={originNetwork}
          destinationNetwork={destinationNetwork}
          onSwitchDirection={switchDirection}
          onBridge={handleBridge}
          isBridging={isBridging}
          feesAmount={FEES_AMOUNT_MOCKED}
        />
      )}

      {currentBridgeStep === "successful" && (
        <BridgeSuccessStep
          originNetwork={originNetwork}
          destinationNetwork={destinationNetwork}
          amount={bridgeAmount}
          feesAmount={FEES_AMOUNT_MOCKED}
          newBridge={() => setCurrentBridgeStep("initial")}
        />
      )}
    </div>
  );
}
