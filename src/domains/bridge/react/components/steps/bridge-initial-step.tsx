import { ArrowDown, ShieldCheck } from "lucide-react";
import Callout from "@/components/callout/callout";
import type { NetworkTagNetwork } from "@/components/network-tag/network-tag";
import BridgeAmountSection from "../bridge-amount-section";
import BridgeDirectionSection from "../bridge-direction-section";
import NetworkDirectionInformation from "@/components/network-direction-information/network-direction-information";
import Button from "@/components/core/buttons/button/button";
import cn from "@/utils/classnames";
import { useWalletStore } from "@/stores/wallet.store";
import { NETWORK_CURRENCY } from "@/types/network";

interface Props {
  bridgeAmount: string;
  originNetwork: NetworkTagNetwork;
  destinationNetwork: NetworkTagNetwork;
  isBridging: boolean;
  feesAmount: string;
  setBridgeAmount: (amount: string) => void;
  onSwitchDirection: () => void;
  onBridge: () => void;
}

export default function BridgeInitialStep({
  bridgeAmount,
  originNetwork,
  destinationNetwork,
  isBridging,
  feesAmount,
  setBridgeAmount,
  onSwitchDirection,
  onBridge,
}: Props) {
  const { qubic, solana } = useWalletStore();

  const originWallet = originNetwork === "Qubic" ? qubic : solana;
  const destinationWallet = destinationNetwork === "Qubic" ? qubic : solana;

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
              balance={originWallet.balance}
              originCurrency={NETWORK_CURRENCY[originNetwork]}
              destinationCurrency={NETWORK_CURRENCY[destinationNetwork]}
              feesAmount={feesAmount}
              amount={bridgeAmount}
              setAmount={setBridgeAmount}
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
              walletAddress={originWallet.address}
              balance={originWallet.balance}
              direction="origin"
              currency={NETWORK_CURRENCY[originNetwork]}
            />

            <ArrowDown className="text-primary shrink-0" size={16} aria-hidden strokeWidth={1.33} />

            <NetworkDirectionInformation
              network={destinationNetwork}
              walletAddress={destinationWallet.address}
              balance={destinationWallet.balance}
              direction="destination"
              currency={NETWORK_CURRENCY[destinationNetwork]}
            />
          </div>
        </div>
      </div>

      <Callout
        variant="information"
        description="Your QUBIC will be locked on Qubic chain and wrapped as wQUBIC on Solana. Transactions are verified by bots and Solana Guardians multisig."
        icon={ShieldCheck}
      />

      <div className="w-full grid grid-cols-2 gap-10">
        <span className="col-span-1 col-start-2">
          <Button
            variant="default"
            label="Bridge"
            action={onBridge}
            isFullWidth
            isLoading={isBridging}
          />
        </span>
      </div>
    </>
  );
}
