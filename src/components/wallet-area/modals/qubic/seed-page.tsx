import { useState } from "react";
import { AlertTriangle, KeyRound, Loader2 } from "lucide-react";
import cn from "@/utils/classnames";
import type { useQubicWallet } from "@/providers/QubicWalletProvider";

interface Props {
  qubic: ReturnType<typeof useQubicWallet>;
  onError: (msg: string | null) => void;
}

export default function SeedPage({ qubic, onError }: Props) {
  const [seed, setSeed] = useState("");
  const [visible, setVisible] = useState(false);

  async function handleSubmit() {
    if (!seed.trim()) return;
    onError(null);
    try {
      await qubic.connectWithSeed(seed);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Seed import failed.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 rounded-lg bg-amber-500/8 border border-amber-500/20 px-3 py-2.5 text-xs text-amber-400/90">
        <AlertTriangle size={13} className="shrink-0 mt-px" />
        <span className="leading-relaxed">
          Your seed stays in the browser. Use WalletConnect for maximum security.
        </span>
      </div>

      <div className="relative">
        <textarea
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          rows={3}
          spellCheck={false}
          autoComplete="off"
          placeholder="55+ character seed or 64-char hex private key..."
          className={cn(
            "w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white",
            "outline-none focus:border-highlight/40 resize-none font-mono",
            "placeholder:font-sans placeholder:text-white/25",
            !visible && seed && "text-transparent caret-white",
          )}
        />
        {!visible && seed && (
          <div className="pointer-events-none absolute inset-0 p-3 text-sm text-white/70 whitespace-pre-wrap break-all">
            {seed.replace(/[^\s]/g, "•")}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setVisible((v) => !v)}
          className="flex-1 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-white/50 hover:text-white hover:border-white/20 transition-colors"
        >
          {visible ? "Hide" : "Reveal"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!seed.trim() || qubic.connecting}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5",
            "text-sm font-semibold bg-highlight text-primary hover:bg-highlight/90 transition-colors",
            "disabled:opacity-50 disabled:pointer-events-none",
          )}
        >
          {qubic.connecting ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <KeyRound size={13} />
          )}
          {qubic.connecting ? "Deriving..." : "Import"}
        </button>
      </div>
    </div>
  );
}
