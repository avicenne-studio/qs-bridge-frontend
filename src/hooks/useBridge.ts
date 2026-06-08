import { useState } from "react";
import { toast } from "sonner";
import type { NetworkTagNetwork } from "@/components/network-tag/network-tag";
import type { NetworkDirectionInformationProps } from "@/components/network-direction-information/network-direction-information";
import type { Address } from "viem";
import { NETWORK } from "@/types/network";
import useSolanaWallet from "@/hooks/useSolanaWallet";
import { useQubicWallet } from "@/providers/QubicWalletProvider";
import { useBridgeOutbound } from "@/hooks/useBridgeOutbound";
import { useBridgeInbound } from "@/hooks/useBridgeInbound";
import { qubicIdentityToBytes } from "@/lib/bridge/qubicAddress";
import { displayToRaw } from "@/lib/bridge/amounts";
import { bytesToHex } from "@/lib/qubicIdentity";
import { useFeeEstimate } from "@/hooks/useFeeEstimate";
import { useOrderTracking } from "@/hooks/useOrderTracking";
import { queryGetConfig } from "@/lib/bridge/qubic/query";

export type BridgeSteps = "initial" | "successful";

export function useBridge() {
  const [currentBridgeStep, setCurrentBridgeStep] = useState<BridgeSteps>("initial");
  const [bridgeAmount, setBridgeAmount] = useState("");
  const [originNetwork, setOriginNetwork] = useState<NetworkTagNetwork>(NETWORK.Solana);
  const [localError, setLocalError] = useState<string | null>(null);

  const solanaWallet = useSolanaWallet();
  const qubicWallet = useQubicWallet();
  const bridge = useBridgeOutbound();
  const inbound = useBridgeInbound();

  const isSolanaToQubic = originNetwork === NETWORK.Solana;
  const destinationNetwork = isSolanaToQubic ? NETWORK.Qubic : NETWORK.Solana;

  let activeSourceNonce: string | null = null;

  if (isSolanaToQubic) {
    if (bridge.lastOrder) {
      activeSourceNonce = bytesToHex(bridge.lastOrder.nonce);
    }
  } else if (inbound.lastLock) {
    activeSourceNonce = "0".repeat(56) + inbound.lastLock.nonce.toString(16).padStart(8, "0");
  }

  const {
    orderStatus,
    destinationTrxHash,
    isPolling: isTrackingOrder,
    trackingError,
  } = useOrderTracking(activeSourceNonce);

  const { estimate, isEstimating, estimateError } = useFeeEstimate(
    originNetwork,
    bridgeAmount,
    solanaWallet.address ?? null,
    qubicWallet.address ?? null,
  );

  const switchDirection = () => {
    setOriginNetwork((prev) => (prev === NETWORK.Qubic ? NETWORK.Solana : NETWORK.Qubic));
  };

  const handleBridge = async () => {
    setLocalError(null);

    if (!estimate) {
      setLocalError("Fee estimation unavailable. Please try again.");
      return;
    }

    const originConnected = isSolanaToQubic ? !!solanaWallet.address : !!qubicWallet.address;
    if (!originConnected) {
      toast.error(`Please connect your ${isSolanaToQubic ? "Solana" : "Qubic"} wallet`);
      return;
    }

    const destinationConnected = isSolanaToQubic ? !!qubicWallet.address : !!solanaWallet.address;
    if (!destinationConnected) {
      toast.error(`Please connect your ${isSolanaToQubic ? "Qubic" : "Solana"} wallet`);
      return;
    }

    const amountValue = parseFloat(bridgeAmount);
    if (!amountValue || amountValue <= 0) {
      setLocalError("Enter a valid amount");
      return;
    }

    const relayerFee = estimate.relayerFee;
    const totalFees = parseFloat(totalProgramFees) + parseFloat(relayerFee);
    if (amountValue <= totalFees) {
      setLocalError(`Amount must be greater than total fees (${Math.ceil(totalFees)} QUBIC)`);
      return;
    }

    let result;

    if (isSolanaToQubic) {
      const toAddress = qubicIdentityToBytes(qubicWallet.address as string);
      const { orderEra } = await queryGetConfig();
      result = await bridge.sendOutbound({
        amount: displayToRaw(bridgeAmount),
        toAddress,
        relayerFee: displayToRaw(relayerFee),
        orderEra,
      });
    } else {
      result = await inbound.sendLock({
        amount: BigInt(Math.floor(parseFloat(bridgeAmount))),
        toSolanaAddress: solanaWallet.address as string,
        relayerFee: BigInt(Math.floor(parseFloat(relayerFee))),
      });
    }

    if (result) {
      setCurrentBridgeStep("successful");
    }
  };

  const handleNewBridge = () => {
    bridge.reset();
    inbound.reset();
    setBridgeAmount("");
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
  const relayerFee = estimate?.relayerFee ?? "0";
  const canBridge = !!estimate && !isEstimating;

  return {
    currentBridgeStep,
    bridgeAmount,
    setBridgeAmount,
    relayFeeDisplay: relayerFee,
    originNetwork,
    destinationNetwork,
    isSolanaToQubic,
    switchDirection,
    handleBridge,
    handleNewBridge,
    originWalletConfig,
    destinationWalletConfig,
    totalProgramFees,
    isBridging: bridge.isLoading || inbound.isLoading,
    isEstimating,
    canBridge,
    error:
      localError ?? bridge.outboundError ?? inbound.inboundError ?? estimateError ?? trackingError,
    txResult: isSolanaToQubic ? bridge.txResult : inbound.txResult,
    lastOrder: isSolanaToQubic ? bridge.lastOrder : inbound.lastLock,
    solanaConnected: solanaWallet.connected,
    qubicConnected: qubicWallet.connected,
    orderStatus,
    destinationTrxHash,
    isTrackingOrder,
  };
}
