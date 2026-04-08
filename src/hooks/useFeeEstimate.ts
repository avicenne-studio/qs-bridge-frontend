import { useEffect, useState } from "react";
import { estimateFees, HubApiError } from "@/lib/hub/hub-client";
import { rawToDisplay } from "@/lib/bridge/amounts";
import { HUB_NETWORK } from "@/lib/hub/hub.types";
import type { HubNetworkId } from "@/lib/hub/hub.types";
import { NETWORK } from "@/types/network";
import type { Network } from "@/types/network";
import { displayToRaw } from "@/lib/bridge/amounts";

const DEBOUNCE_MS = 500;

function networkToHubId(network: Network): HubNetworkId {
  return network === NETWORK.Solana ? HUB_NETWORK.Solana : HUB_NETWORK.Qubic;
}

export type FeeEstimate = {
  oracleFee: string;
  protocolFee: string;
  totalBridgeFee: string;
  relayerFee: string;
  networkFee: string;
  userReceives: string;
};

export function useFeeEstimate(
  originNetwork: Network,
  amount: string,
  fromAddress: string | null,
  toAddress: string | null,
) {
  const [estimate, setEstimate] = useState<FeeEstimate | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  useEffect(() => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0 || !fromAddress || !toAddress) {
      setEstimate(null);
      setEstimateError(null);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsEstimating(true);
      setEstimateError(null);

      try {
        const networkIn = networkToHubId(originNetwork);
        const networkOut =
          originNetwork === NETWORK.Solana ? HUB_NETWORK.Qubic : HUB_NETWORK.Solana;

        const rawAmount = displayToRaw(amount).toString();

        const res = await estimateFees(
          {
            networkIn,
            networkOut,
            fromAddress,
            toAddress,
            amount: rawAmount,
          },
          controller.signal,
        );

        const d = res.data;
        setEstimate({
          oracleFee: rawToDisplay(BigInt(d.bridgeFee.oracleFee)),
          protocolFee: rawToDisplay(BigInt(d.bridgeFee.protocolFee)),
          totalBridgeFee: rawToDisplay(BigInt(d.bridgeFee.total)),
          relayerFee: rawToDisplay(BigInt(d.relayerFee)),
          networkFee: rawToDisplay(BigInt(d.networkFee)),
          userReceives: rawToDisplay(BigInt(d.userReceives)),
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof HubApiError && err.status === 503) {
          setEstimateError("Not enough oracles online to estimate fees");
        } else {
          setEstimateError(err instanceof Error ? err.message : "Fee estimation failed");
        }
        setEstimate(null);
      } finally {
        if (!controller.signal.aborted) setIsEstimating(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [originNetwork, amount, fromAddress, toAddress]);

  return { estimate, isEstimating, estimateError };
}
