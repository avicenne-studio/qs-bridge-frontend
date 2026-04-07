import { useState } from "react";
import type { NetworkTagNetwork } from "@/components/network-tag/network-tag";
import type { NetworkDirectionInformationProps } from "@/components/network-direction-information/network-direction-information";
import type { Address } from "viem";
import { NETWORK } from "@/types/network";
import useSolanaWallet from "@/hooks/useSolanaWallet";
import { useQubicWallet } from "@/providers/QubicWalletProvider";
import { useBridgeOutbound } from "@/hooks/useBridgeOutbound";
import { qubicIdentityToBytes } from "@/lib/bridge/qubicAddress";
import { displayToRaw } from "@/lib/bridge/amounts";
import { useFeeEstimate } from "@/hooks/useFeeEstimate";
import { useOrderTracking } from "@/hooks/useOrderTracking";

export type BridgeSteps = "initial" | "successful";

const DEFAULT_RELAYER_FEE_DISPLAY = "0.001";

export function useBridge() {
  const [currentBridgeStep, setCurrentBridgeStep] = useState<BridgeSteps>("initial");
  const [bridgeAmount, setBridgeAmount] = useState("");
  const [relayFeeDisplay, setRelayFeeDisplay] = useState(DEFAULT_RELAYER_FEE_DISPLAY);
  const [originNetwork, setOriginNetwork] = useState<NetworkTagNetwork>(NETWORK.Solana);
  const [localError, setLocalError] = useState<string | null>(null);

  const solanaWallet = useSolanaWallet();
  const qubicWallet = useQubicWallet();
  const bridge = useBridgeOutbound();

  const {
    orderStatus,
    destinationTrxHash,
    isPolling: isTrackingOrder,
  } = useOrderTracking(bridge.txResult?.signature ?? null);

  const { estimate, isEstimating, estimateError } = useFeeEstimate(
    originNetwork,
    bridgeAmount,
    solanaWallet.address ?? null,
    (qubicWallet.address as string) ?? null,
  );

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
      orderEra: 0,
    });

    if (result) {
      setCurrentBridgeStep("successful");
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

  const totalProgramFees = estimate?.totalBridgeFee ?? "0";
  const estimatedRelayFee = estimate?.relayerFee ?? DEFAULT_RELAYER_FEE_DISPLAY;

  return {
    currentBridgeStep,
    bridgeAmount,
    setBridgeAmount,
    relayFeeDisplay: estimate ? estimatedRelayFee : relayFeeDisplay,
    setRelayFeeDisplay,
    originNetwork,
    destinationNetwork,
    isSolanaToQubic,
    switchDirection,
    handleBridge,
    handleNewBridge,
    originWalletConfig,
    destinationWalletConfig,
    totalProgramFees,
    isBridging: bridge.isLoading,
    isEstimating,
    error: localError ?? bridge.outboundError ?? estimateError,
    txResult: bridge.txResult,
    solanaConnected: solanaWallet.connected,
    qubicConnected: qubicWallet.connected,
    estimate,
    orderStatus,
    destinationTrxHash,
    isTrackingOrder,
  };
}
