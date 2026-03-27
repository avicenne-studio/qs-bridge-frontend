import { useState } from "react";
import Button from "@/components/core/buttons/button/button";
import { useBridgeOutbound } from "@/hooks/useBridgeOutbound";
import { qubicIdentityToBytes } from "@/lib/bridge/qubicAddress";
import { displayToRaw } from "@/lib/bridge/amounts";
import { useModalStore } from "@/stores/modal-store";

interface Props {
  nonce: Uint8Array;
  networkOut: number;
}

export default function OverrideOrderModal({ nonce, networkOut }: Props) {
  const [toAddress, setToAddress] = useState("");
  const [relayerFee, setRelayerFee] = useState("");

  const { overrideOutbound, isLoading, overrideError } = useBridgeOutbound();
  const { closeModal } = useModalStore();

  const handleOverride = async () => {
    const newToAddress = toAddress ? qubicIdentityToBytes(toAddress) : null;
    const newRelayerFee = relayerFee ? displayToRaw(relayerFee) : null;

    await overrideOutbound({ networkOut, nonce, newToAddress, newRelayerFee });
  };

  return (
    <div className="flex w-full flex-col gap-5 mt-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-white">
          New Qubic destination address (optional)
        </label>
        <input
          type="text"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          placeholder="e.g. AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
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
          placeholder="e.g. 1000000"
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
          isDisabled={!toAddress.trim() && !relayerFee.trim()}
          isFullWidth
        />
      </div>
    </div>
  );
}
