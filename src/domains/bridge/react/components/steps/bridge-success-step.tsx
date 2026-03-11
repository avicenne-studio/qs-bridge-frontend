import { ArrowDown, Plus } from "lucide-react";
import type { NetworkTagNetwork } from "@/components/network-tag/network-tag";
import NetworkDirectionInformation from "@/components/network-direction-information/network-direction-information";
import Button from "@/components/core/buttons/button/button";
import cn from "@/utils/classnames";
import { routes } from "@/constants/routes";
import Amount from "@/components/amounts/amount-input";
import FeesDropdown from "../fees-dropdown";
import BridgeDirectionSection from "../bridge-direction-section";
import { NETWORK_CURRENCY } from "@/types/network";
import { useWalletStore } from "@/stores/wallet.store";

interface Props {
  originNetwork: NetworkTagNetwork;
  destinationNetwork: NetworkTagNetwork;
  amount: string;
  feesAmount?: string;
  relayFeesAmount?: string;
  newBridge: () => void;
}

export default function BridgeSuccessStep({
  originNetwork,
  destinationNetwork,
  amount,
  feesAmount = "0.02",
  relayFeesAmount = "0",
  newBridge,
}: Props) {
  const formattedAmount = amount === "" ? "0" : amount;
  const receivedAmount =
    parseFloat(formattedAmount) - parseFloat(feesAmount) - parseFloat(relayFeesAmount);
  const receivedAmountFormatted = receivedAmount < 0 ? "0" : receivedAmount.toString();

  const originCurrency = NETWORK_CURRENCY[originNetwork];
  const destinationCurrency = NETWORK_CURRENCY[destinationNetwork];

  const { qubic, solana } = useWalletStore();

  const originWallet = originNetwork === "Qubic" ? qubic : solana;
  const destinationWallet = destinationNetwork === "Qubic" ? qubic : solana;

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
            </div>
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
              walletAddress={originWallet.address}
              balance={originWallet.balance}
              direction="origin"
              currency={originCurrency}
              hideBalance
            />

            <ArrowDown className="text-primary shrink-0" size={16} aria-hidden strokeWidth={1.33} />

            <NetworkDirectionInformation
              network={destinationNetwork}
              walletAddress={destinationWallet.address}
              balance={destinationWallet.balance}
              direction="destination"
              currency={destinationCurrency}
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
