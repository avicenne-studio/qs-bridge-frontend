import { useState } from "react";
import type { NetworkTagNetwork } from "@/components/network-tag/network-tag";
import type { NetworkDirectionInformationProps } from "@/components/network-direction-information/network-direction-information";
import type { Address } from "viem";
import cn from "@/utils/classnames";
import BridgeInitialStep from "./components/steps/bridge-initial-step";
import BridgeSuccessStep from "./components/steps/bridge-success-step";
import { NETWORK } from "@/types/network";
import useSolanaWallet from "@/hooks/useSolanaWallet";
import { useQubicWallet } from "@/providers/QubicWalletProvider";
import { useBridgeOutbound } from "@/hooks/useBridgeOutbound";
import { qubicIdentityToBytes } from "@/lib/bridge/qubicAddress";
import { displayToRaw, computeProgramFees } from "@/lib/bridge/amounts";

export type BridgeSteps = "initial" | "successful";

const DEFAULT_RELAYER_FEE_DISPLAY = "0.001";

export default function BridgePage() {
  const [currentBridgeStep, setCurrentBridgeStep] = useState<BridgeSteps>("initial");
  const [bridgeAmount, setBridgeAmount] = useState("");
  const [relayFeeDisplay, setRelayFeeDisplay] = useState(DEFAULT_RELAYER_FEE_DISPLAY);
  const [originNetwork, setOriginNetwork] = useState<NetworkTagNetwork>(NETWORK.Solana);
  const [localError, setLocalError] = useState<string | null>(null);

  const solanaWallet = useSolanaWallet();
  const qubicWallet = useQubicWallet();
  const bridge = useBridgeOutbound();

  const isSolanaToQubic = originNetwork === NETWORK.Solana;
  const destinationNetwork = isSolanaToQubic ? NETWORK.Qubic : NETWORK.Solana;

  const switchDirection = () => {
    setOriginNetwork((prev) => (prev === NETWORK.Qubic ? NETWORK.Solana : NETWORK.Qubic));
  };

  const handleBridge = async () => {
    setLocalError(null);

    if (!isSolanaToQubic) return;

    if (!solanaWallet.connected) {
      setLocalError("Connect your Solana wallet first");
      return;
    }

    if (!qubicWallet.address) {
      setLocalError("Connect your Qubic wallet first");
      return;
    }

    const amountValue = parseFloat(bridgeAmount);
    if (!amountValue || amountValue <= 0) {
      setLocalError("Enter a valid amount");
      return;
    }

    const toAddress = qubicIdentityToBytes(qubicWallet.address as string);

    const result = await bridge.sendOutbound({
      amount: displayToRaw(bridgeAmount),
      toAddress,
      relayerFee: displayToRaw(relayFeeDisplay),
    });

    if (result) {
      setCurrentBridgeStep("successful");
    }
  };

  const handleOverride = async (newToAddress?: string, newFee?: string) => {
    if (!bridge.lastOrder) return;

    try {
      const overrideToAddress = newToAddress ? qubicIdentityToBytes(newToAddress) : null;
      const overrideFee = newFee ? displayToRaw(newFee) : null;

      await bridge.overrideOutbound({
        networkOut: bridge.lastOrder.networkOut,
        nonce: bridge.lastOrder.nonce,
        newToAddress: overrideToAddress,
        newRelayerFee: overrideFee,
      });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Override failed");
    }
  };

  const handleNewBridge = () => {
    bridge.reset();
    setBridgeAmount("");
    setRelayFeeDisplay(DEFAULT_RELAYER_FEE_DISPLAY);
    setLocalError(null);
    setCurrentBridgeStep("initial");
  };

  const originWalletConfig: NetworkDirectionInformationProps = isSolanaToQubic
    ? {
        network: NETWORK.Solana,
        walletAddress: (solanaWallet.address ?? "Not connected") as Address,
        balance: solanaWallet.balance ?? "0",
        currency: "wQUBIC",
        direction: "origin",
      }
    : {
        network: NETWORK.Qubic,
        walletAddress: (qubicWallet.address ?? "Not connected") as Address,
        balance: qubicWallet.balance ?? "0",
        currency: "QUBIC",
        direction: "origin",
      };

  const destinationWalletConfig: NetworkDirectionInformationProps = isSolanaToQubic
    ? {
        network: NETWORK.Qubic,
        walletAddress: (qubicWallet.address ?? "Not connected") as Address,
        balance: qubicWallet.balance ?? "0",
        currency: "QUBIC",
        direction: "destination",
      }
    : {
        network: NETWORK.Solana,
        walletAddress: (solanaWallet.address ?? "Not connected") as Address,
        balance: solanaWallet.balance ?? "0",
        currency: "wQUBIC",
        direction: "destination",
      };

  const totalProgramFees = computeProgramFees(bridgeAmount);

  return (
    <div className={cn("flex w-full flex-col gap-10", "p-0 py-8 xl:p-8")}>
      {currentBridgeStep === "initial" && (
        <BridgeInitialStep
          bridgeAmount={bridgeAmount}
          setBridgeAmount={setBridgeAmount}
          relayFeeDisplay={relayFeeDisplay}
          onRelayFeeDisplayChange={setRelayFeeDisplay}
          originNetwork={originNetwork}
          destinationNetwork={destinationNetwork}
          onSwitchDirection={switchDirection}
          onBridge={handleBridge}
          isBridging={bridge.isLoading}
          originWalletConfig={originWalletConfig}
          destinationWalletConfig={destinationWalletConfig}
          feesAmount={totalProgramFees}
          error={localError ?? bridge.outboundError}
          isSolanaToQubic={isSolanaToQubic}
        />
      )}

      {currentBridgeStep === "successful" && (
        <BridgeSuccessStep
          originNetwork={originNetwork}
          destinationNetwork={destinationNetwork}
          originWalletConfig={originWalletConfig}
          destinationWalletConfig={destinationWalletConfig}
          amount={bridgeAmount}
          feesAmount={totalProgramFees}
          relayFeesAmount={relayFeeDisplay}
          newBridge={handleNewBridge}
          txSignature={bridge.txResult?.signature}
          explorerUrl={bridge.txResult?.explorerUrl}
          onOverride={bridge.lastOrder ? handleOverride : undefined}
          isOverriding={bridge.isLoading}
          overrideError={bridge.overrideError}
        />
      )}
    </div>
  );
}
