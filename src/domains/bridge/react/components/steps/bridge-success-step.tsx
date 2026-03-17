import { ArrowDown, ExternalLink, Plus } from "lucide-react";
import NetworkDirectionInformation from "@/components/network-direction-information/network-direction-information";
import Button from "@/components/core/buttons/button/button";
import cn from "@/utils/classnames";
import { routes } from "@/constants/routes";
import { truncateSignature } from "@/utils/format";
import { computeReceivedAmount } from "@/utils/format";
import Amount from "@/components/amounts/amount-input";
import FeesDropdown from "../fees-dropdown";
import BridgeDirectionSection from "../bridge-direction-section";
import OverrideOrderSection from "../override-order-section";
import { useBridgeContext } from "@/domains/bridge/bridge.context";

export default function BridgeSuccessStep() {
  const {
    originNetwork,
    destinationNetwork,
    originWalletConfig,
    destinationWalletConfig,
    bridgeAmount,
    totalProgramFees: feesAmount,
    relayFeeDisplay: relayFeesAmount,
    handleNewBridge,
    txResult,
    lastOrder,
    handleOverride,
    isOverriding,
    overrideError,
  } = useBridgeContext();

  const receivedAmountFormatted = computeReceivedAmount(bridgeAmount, feesAmount, relayFeesAmount);
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

                <Amount amount={bridgeAmount} currency={originCurrency} />
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

              {txResult?.signature && (
                <div className="flex w-full flex-col gap-2 border-t border-border pt-4">
                  <span className="text-xs text-primary">Transaction</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-primary">
                      {truncateSignature(txResult.signature)}
                    </span>
                    {txResult.explorerUrl && (
                      <a
                        href={txResult.explorerUrl}
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
            {lastOrder && (
              <OverrideOrderSection
                onOverride={handleOverride}
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
          action={handleNewBridge}
          isFullWidth
        />
      </div>
    </>
  );
}
