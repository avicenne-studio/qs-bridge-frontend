import { ArrowDown, ExternalLink, Plus } from "lucide-react";
import type { NetworkTagNetwork } from "@/components/network-tag/network-tag";
import NetworkDirectionInformation from "@/components/network-direction-information/network-direction-information";
import type { NetworkDirectionInformationProps } from "@/components/network-direction-information/network-direction-information";
import Button from "@/components/core/buttons/button/button";
import cn from "@/utils/classnames";
import { routes } from "@/constants/routes";
import { truncateSignature } from "@/utils/format";
import { computeReceivedAmount } from "@/utils/format";
import Amount from "@/components/amounts/amount-input";
import FeesDropdown from "../fees-dropdown";
import BridgeDirectionSection from "../bridge-direction-section";
import OverrideOrderSection from "../override-order-section";

interface Props {
  originNetwork: NetworkTagNetwork;
  destinationNetwork: NetworkTagNetwork;
  originWalletConfig: NetworkDirectionInformationProps;
  destinationWalletConfig: NetworkDirectionInformationProps;
  amount: string;
  feesAmount?: string;
  relayFeesAmount?: string;
  newBridge: () => void;
  txSignature?: string;
  explorerUrl?: string;
  onOverride?: (newToAddress?: string, newFee?: string) => Promise<void>;
  isOverriding?: boolean;
  overrideError?: string | null;
}

export default function BridgeSuccessStep({
  originNetwork,
  destinationNetwork,
  originWalletConfig,
  destinationWalletConfig,
  amount,
  feesAmount = "0",
  relayFeesAmount = "0",
  newBridge,
  txSignature,
  explorerUrl,
  onOverride,
  isOverriding,
  overrideError,
}: Props) {
  const receivedAmountFormatted = computeReceivedAmount(amount, feesAmount, relayFeesAmount);

  const originCurrency = originWalletConfig.currency;
  const destinationCurrency = destinationWalletConfig.currency;

  return (
    <>
      <div className="grid grid-cols-2 gap-10">
        <BridgeDirectionSection
          originNetwork={originNetwork}
          destinationNetwork={destinationNetwork}
        />

        <div className="col-span-2 grid grid-cols-2 gap-10">
          <div
            className={cn(
              "flex flex-col gap-8 items-center",
              "col-span-2 xl:col-span-1",
              "order-2 xl:order-1",
            )}
          >
            <div className="flex size-full max-h-full flex-col gap-8 items-center justify-center bg-[#F5FAF5] rounded-xl p-6">
              <div className="flex w-fit flex-col gap-2 items-center justify-center py-6">
                <label className="text-xs font-semibold uppercase text-primary">
                  Order successfully placed
                </label>

                <Amount amount={amount} currency={originCurrency} />
              </div>

              <ArrowDown
                className="text-primary shrink-0"
                size={16}
                aria-hidden
                strokeWidth={1.33}
              />

              <div className="flex w-fit flex-col gap-2 items-center justify-center py-6">
                <Amount amount={receivedAmountFormatted} currency={destinationCurrency} />

                <FeesDropdown
                  feesAmount={feesAmount}
                  relayFeesAmount={relayFeesAmount}
                  currency={destinationCurrency}
                />
              </div>

              {txSignature && (
                <div className="flex w-full flex-col gap-2 border-t border-border pt-4">
                  <span className="text-xs text-primary">Transaction</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-primary">
                      {truncateSignature(txSignature)}
                    </span>
                    {explorerUrl && (
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                        aria-label="View transaction on explorer"
                      >
                        <ExternalLink size={14} aria-hidden />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* TODO: remove OverrideOrderSection when no longer needed */}
            {onOverride && (
              <OverrideOrderSection
                onOverride={onOverride}
                isOverriding={isOverriding}
                overrideError={overrideError}
              />
            )}
          </div>

          <div
            className={cn(
              "flex flex-col gap-8 items-center h-fit",
              "col-span-2 xl:col-span-1",
              "order-1 xl:order-2",
            )}
          >
            <NetworkDirectionInformation
              network={originNetwork}
              walletAddress={originWalletConfig.walletAddress}
              balance={originWalletConfig.balance}
              direction={originWalletConfig.direction}
              currency={originWalletConfig.currency}
              hideBalance
            />

            <ArrowDown className="text-primary shrink-0" size={16} aria-hidden strokeWidth={1.33} />

            <NetworkDirectionInformation
              network={destinationNetwork}
              walletAddress={destinationWalletConfig.walletAddress}
              balance={destinationWalletConfig.balance}
              direction={destinationWalletConfig.direction}
              currency={destinationWalletConfig.currency}
              hideBalance
            />
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-10">
        <Button
          className="col-span-1"
          variant="outline"
          label="Go to history"
          path={routes.history.path}
          isInternalLink
          isFullWidth
        />
        <Button
          className="col-span-1"
          variant="default"
          label="New Bridge"
          icon={<Plus size={16} />}
          action={newBridge}
          isFullWidth
        />
      </div>
    </>
  );
}
