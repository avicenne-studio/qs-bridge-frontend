import { useState, type ComponentProps } from "react";
import type { NetworkTagNetwork } from "@/components/network-tag/network-tag";
import NetworkDirectionInformation from "@/components/network-direction-information/network-direction-information";
import type { Address } from "viem";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import cn from "@/utils/classnames";
import BridgeInitialStep from "./components/steps/bridge-initial-step";
import BridgeSuccessStep from "./components/steps/bridge-success-step";
import { NETWORK } from "@/types/network";

type WalletConfig = ComponentProps<typeof NetworkDirectionInformation>;

export type BridgeSteps = "initial" | "successful";

export default function BridgePage() {
  const [currentBridgeStep, setCurrentBridgeStep] = useState<BridgeSteps>("initial");
  const [bridgeAmount, setBridgeAmount] = useState("");
  const [originNetwork, setOriginNetwork] = useState<NetworkTagNetwork>(NETWORK.Qubic);
  const [destinationNetwork, setDestinationNetwork] = useState<NetworkTagNetwork>(NETWORK.Solana);

  const { isLoading: isBridging, start: handleBridge } = useFakeLoading({
    delayMs: 2500,
    succeeds: true,
    onSuccess: () => setCurrentBridgeStep("successful"),
  });

  const FEES_AMOUNT_MOCKED = "0.02";

  const switchDirection = () => {
    setOriginNetwork((prev) => (prev === NETWORK.Qubic ? NETWORK.Solana : NETWORK.Qubic));
    setDestinationNetwork((prev) => (prev === NETWORK.Solana ? NETWORK.Qubic : NETWORK.Solana));
  };

  const QUBIC_WALLET_CONFIG: WalletConfig = {
    network: NETWORK.Qubic,
    walletAddress: "0x9xA4b2c3d4e5f6K8Lm00000000000000000000" as Address,
    balance: "122",
    currency: "QUBIC",
    direction: "origin",
  };

  const SOLANA_WALLET_CONFIG: WalletConfig = {
    network: NETWORK.Solana,
    walletAddress: "0xDQJQp4k2m8nYAHN0000000000000000000000" as Address,
    balance: "450",
    currency: "wQUBIC",
    direction: "destination",
  };

  const ORIGIN_WALLET_CONFIG: WalletConfig =
    originNetwork === NETWORK.Qubic ? SOLANA_WALLET_CONFIG : QUBIC_WALLET_CONFIG;
  const DESTINATION_WALLET_CONFIG: WalletConfig =
    originNetwork === NETWORK.Qubic ? QUBIC_WALLET_CONFIG : SOLANA_WALLET_CONFIG;

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
          originWalletConfig={ORIGIN_WALLET_CONFIG}
          destinationWalletConfig={DESTINATION_WALLET_CONFIG}
          feesAmount={FEES_AMOUNT_MOCKED}
        />
      )}

      {currentBridgeStep === "successful" && (
        <BridgeSuccessStep
          originNetwork={originNetwork}
          destinationNetwork={destinationNetwork}
          originWalletConfig={ORIGIN_WALLET_CONFIG}
          destinationWalletConfig={DESTINATION_WALLET_CONFIG}
          amount={bridgeAmount}
          feesAmount={FEES_AMOUNT_MOCKED}
          newBridge={() => setCurrentBridgeStep("initial")}
        />
      )}
    </div>
  );
}
