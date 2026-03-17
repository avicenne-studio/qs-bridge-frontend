import { useState } from "react";
import Button from "@/components/core/buttons/button/button";

interface Props {
  onOverride: (newToAddress?: string, newFee?: string) => Promise<void>;
  isOverriding?: boolean;
  overrideError?: string | null;
}

// TODO: temporary placement and UI — only here for testing purposes
export default function OverrideOrderSection({ onOverride, isOverriding, overrideError }: Props) {
  const [show, setShow] = useState(false);
  const [toAddress, setToAddress] = useState("");
  const [relayerFee, setRelayerFee] = useState("");

  const handleOverride = async () => {
    await onOverride(toAddress || undefined, relayerFee || undefined);
  };

  if (!show) {
    return (
      <button
        type="button"
        onClick={() => setShow(true)}
        className="text-sm text-primary underline hover:text-primary/80"
      >
        Override order
      </button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-gray-300 bg-gray-50 p-4">
      <label className="text-xs font-semibold uppercase text-gray-600">Override Order</label>
      <input
        type="text"
        value={toAddress}
        onChange={(e) => setToAddress(e.target.value)}
        placeholder="New Qubic destination address (optional)"
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <input
        type="text"
        inputMode="decimal"
        value={relayerFee}
        onChange={(e) => setRelayerFee(e.target.value)}
        placeholder="New relayer fee (optional)"
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {overrideError && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{overrideError}</div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" label="Cancel" action={() => setShow(false)} isFullWidth />
        <Button
          variant="default"
          label="Override"
          action={handleOverride}
          isLoading={isOverriding}
          isDisabled={!toAddress.trim() && !relayerFee.trim()}
          isFullWidth
        />
      </div>
    </div>
  );
}
