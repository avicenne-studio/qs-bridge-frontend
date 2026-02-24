import { Loader2, Wallet } from "lucide-react";
import cn from "@/utils/classnames";
import type { useQubicWallet } from "@/providers/QubicWalletProvider";

interface Props {
  qubic: ReturnType<typeof useQubicWallet>;
  onError: (msg: string | null) => void;
}

export default function MetaMaskPage({ qubic, onError }: Props) {
  async function handleConnect() {
    onError(null);
    try {
      await qubic.connectMetaMask();
    } catch (e) {
      onError(e instanceof Error ? e.message : "MetaMask Snap connection failed.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-white/45 text-sm leading-relaxed">
        Your keys stay inside MetaMask&apos;s secure sandbox — nothing leaves the extension.
      </p>
      <button
        onClick={handleConnect}
        disabled={qubic.connecting}
        className={cn(
          "flex items-center justify-center gap-2 w-full rounded-xl px-4 py-2.5",
          "text-sm font-semibold bg-highlight text-primary transition-colors hover:bg-highlight/90 cursor-pointer",
          "disabled:opacity-50 disabled:pointer-events-none",
        )}
      >
        {qubic.connecting ? <Loader2 size={15} className="animate-spin" /> : <Wallet size={15} />}
        {qubic.connecting ? "Requesting access..." : "Connect with MetaMask"}
      </button>
    </div>
  );
}
