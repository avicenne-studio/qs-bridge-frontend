import { useRef, useState, type DragEvent } from "react";
import { AlertTriangle, Loader2, UploadCloud } from "lucide-react";
import cn from "@/utils/classnames";
import type { useQubicWallet } from "@/providers/QubicWalletProvider";

interface Props {
  qubic: ReturnType<typeof useQubicWallet>;
  onError: (msg: string | null) => void;
}

export default function VaultPage({ qubic, onError }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    setFile(f);
    setPassword("");
    onError(null);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  async function handleUnlock() {
    if (!file || !password.trim()) return;
    onError(null);
    try {
      await qubic.connectWithVaultFile(file, password);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Vault unlock failed.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 rounded-lg bg-amber-500/8 border border-amber-500/20 px-3 py-2.5 text-xs text-amber-400/90">
        <AlertTriangle size={13} className="shrink-0 mt-px" />
        <span className="leading-relaxed">
          Vault decryption happens locally. Use WalletConnect for maximum security.
        </span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".qubic-vault,.json,.zip"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {!file ? (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl py-8 cursor-pointer",
            "border-2 border-dashed transition-colors",
            dragging
              ? "border-highlight/50 bg-highlight/5"
              : "border-white/15 bg-white/3 hover:bg-white/6 hover:border-white/25",
          )}
        >
          <UploadCloud
            size={22}
            className={cn("transition-colors", dragging ? "text-highlight/70" : "text-white/30")}
          />
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-sm font-medium text-white/80">Drop your vault file here</p>
            <p className="text-xs text-white/35">.qubic-vault · .json · .zip</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3.5 py-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <UploadCloud size={15} className="text-highlight/70 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{file.name}</p>
                <p className="text-xs text-white/35">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setPassword("");
              }}
              className="text-xs text-white/35 hover:text-white/70 transition-colors ml-3 shrink-0 cursor-pointer"
            >
              Remove
            </button>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            placeholder="Vault password"
            className={cn(
              "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white",
              "outline-none focus:border-highlight/40 placeholder:text-white/25",
            )}
          />

          <button
            onClick={handleUnlock}
            disabled={!password.trim() || qubic.connecting}
            className={cn(
              "flex items-center justify-center gap-2 w-full rounded-xl px-4 py-2.5",
              "text-sm font-semibold bg-highlight text-primary hover:bg-highlight/90 transition-colors cursor-pointer",
              "disabled:opacity-50 disabled:pointer-events-none",
            )}
          >
            {qubic.connecting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <UploadCloud size={13} />
            )}
            {qubic.connecting ? "Unlocking..." : "Unlock vault"}
          </button>
        </>
      )}
    </div>
  );
}
