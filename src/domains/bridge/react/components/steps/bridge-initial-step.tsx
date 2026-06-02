import { ArrowDown, ShieldCheck } from "lucide-react";
import Callout from "@/components/callout/callout";
import type { NetworkTagNetwork } from "@/components/network-tag/network-tag";
import BridgeAmountSection from "../bridge-amount-section";
import BridgeDirectionSection from "../bridge-direction-section";
import NetworkDirectionInformation from "@/components/network-direction-information/network-direction-information";
import type { NetworkDirectionInformationProps } from "@/components/network-direction-information/network-direction-information";
import Button from "@/components/core/buttons/button/button";
import cn from "@/utils/classnames";

interface Props {
  bridgeAmount: string;
  setBridgeAmount: (amount: string) => void;
  relayFeeDisplay: string;
  originNetwork: NetworkTagNetwork;
  destinationNetwork: NetworkTagNetwork;
  onSwitchDirection: () => void;
  onBridge: () => void;
  isBridging: boolean;
  canBridge: boolean;
  isEstimating: boolean;
  originWalletConfig: NetworkDirectionInformationProps;
  destinationWalletConfig: NetworkDirectionInformationProps;
  feesAmount: string;
  error: string | null;
  isSolanaToQubic?: boolean;
  isPaused?: boolean;
}

export default function BridgeInitialStep({
  bridgeAmount,
  setBridgeAmount,
  relayFeeDisplay,
  originNetwork,
  destinationNetwork,
  onSwitchDirection,
  onBridge,
  isBridging,
  canBridge,
  isEstimating,
  originWalletConfig,
  destinationWalletConfig,
  feesAmount,
  error,
  isPaused,
}: Props) {
  const isBridgeDisabled = isPaused || !canBridge || isBridging;

  return (
    <>
      <div className="grid grid-cols-2 gap-10">
        <BridgeDirectionSection
          originNetwork={originNetwork}
          destinationNetwork={destinationNetwork}
          onSwitchDirection={onSwitchDirection}
        />

        <div className="col-span-2 grid grid-cols-2 gap-10">
          <div
            className={cn(
              "flex flex-col gap-8 items-center",
              "col-span-2 xl:col-span-1",
              "order-2 xl:order-1",
            )}
          >
            <BridgeAmountSection
              balance={originWalletConfig.balance}
              originCurrency={originWalletConfig.currency}
              destinationCurrency={destinationWalletConfig.currency}
              feesAmount={feesAmount}
              relayFeesDisplay={relayFeeDisplay}
              amount={bridgeAmount}
              setAmount={setBridgeAmount}
              isLoadingFees={isEstimating}
            />
          </div>

          <div
            className={cn(
              "flex flex-col gap-8 items-center",
              "col-span-2 xl:col-span-1",
              "order-1 xl:order-2",
            )}
          >
            <NetworkDirectionInformation
              network={originNetwork}
              walletAddress={originWalletConfig.walletAddress}
              balance={originWalletConfig.balance}
              direction="origin"
              currency={originWalletConfig.currency}
            />

            <ArrowDown className="text-primary shrink-0" size={16} aria-hidden strokeWidth={1.33} />

            <NetworkDirectionInformation
              network={destinationNetwork}
              walletAddress={destinationWalletConfig.walletAddress}
              balance={destinationWalletConfig.balance}
              direction="destination"
              currency={destinationWalletConfig.currency}
            />
          </div>
        </div>
      </div>

      <Callout
        variant="information"
        description="Your QUBIC will be locked on Qubic chain and wrapped as wQUBIC on Solana. Transactions are verified by bots and Solana Guardians multisig."
        icon={ShieldCheck}
      />

      {error && (
        <div className="w-full rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="w-full grid grid-cols-2 gap-10">
        <span className="col-span-1 col-start-2">
          <Button
            variant="default"
            label={isPaused ? "Bridge (paused)" : isEstimating ? "Calculating fees…" : "Bridge"}
            action={onBridge}
            isFullWidth
            isLoading={isBridging}
            isDisabled={isBridgeDisabled}
          />
        </span>
      </div>
    </>
  );
}
