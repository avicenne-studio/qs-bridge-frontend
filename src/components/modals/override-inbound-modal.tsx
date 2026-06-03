import { useState } from "react";
import Button from "@/components/core/buttons/button/button";
import { useBridgeInbound } from "@/hooks/useBridgeInbound";
import { displayToRaw } from "@/lib/bridge/amounts";
import { useModalStore } from "@/stores/modal-store";
import { useQubicWallet } from "@/providers/QubicWalletProvider";

interface Props {
  nonce: number;
}

export default function OverrideInboundModal({ nonce }: Props) {
  const [toAddress, setToAddress] = useState("");
  const [relayerFee, setRelayerFee] = useState("");

  const { overrideLock, isLoading, overrideError } = useBridgeInbound();
  const { closeModal } = useModalStore();
  const qubicWallet = useQubicWallet();

  const isQubicConnected = qubicWallet.connected && !!qubicWallet.session;
  const isMetaMask =
    qubicWallet.session?.kind === "local" && qubicWallet.session.method === "metamask";

  const handleOverride = async () => {
    const newToAddress = toAddress.trim() || null;
    const newRelayerFee = relayerFee ? displayToRaw(relayerFee) : null;
    await overrideLock({ nonce, newToAddress, newRelayerFee });
  };

  const isSubmitDisabled =
    (!toAddress.trim() && !relayerFee.trim()) || !isQubicConnected || isMetaMask;

  return (
    <div className="flex w-full flex-col gap-5 mt-6">
      {!isQubicConnected && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-400">
          Connect your Qubic wallet to override this order.
        </div>
      )}

      {isQubicConnected && isMetaMask && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-400">
          MetaMask cannot sign Qubic transactions — reconnect with a seed or WalletConnect.
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white">
          New Solana destination address (optional)
        </label>
        <input
          type="text"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="e.g. 7vFQkFa..."
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white">New relayer fee (optional)</label>
        <input
          type="text"
          inputMode="decimal"
          value={relayerFee}
          onChange={(e) => setRelayerFee(e.target.value)}
          placeholder="e.g. 0.001"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-colors"
        />
      </div>

      {overrideError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
          {overrideError}
        </div>
      )}

      <div className="flex gap-3 mt-1">
        <Button
          variant="outline"
          label="Close"
          action={closeModal}
          isFullWidth
          className="border-white text-white"
        />
        <Button
          variant="default"
          label="Submit override"
          action={handleOverride}
          isLoading={isLoading}
          isDisabled={isSubmitDisabled}
          isFullWidth
        />
      </div>
    </div>
  );
}
