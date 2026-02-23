import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import cn from "@/utils/classnames";
import type { useQubicWallet } from "@/providers/QubicWalletProvider";

interface Props {
  qubic: ReturnType<typeof useQubicWallet>;
  onError: (msg: string | null) => void;
}

export default function WalletConnectPage({ qubic, onError }: Props) {
  const [copied, setCopied] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || qubic.connected || qubic.connecting || qubic.walletConnectUri) return;
    started.current = true;
    qubic.connectWalletConnect().catch((e: unknown) => {
      onError(e instanceof Error ? e.message : "WalletConnect pairing failed.");
    });
  }, []);

  async function handleCopy() {
    if (!qubic.walletConnectUri) return;
    await navigator.clipboard.writeText(qubic.walletConnectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!qubic.ready || (qubic.connecting && !qubic.walletConnectUri)) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <Loader2 size={26} className="text-highlight animate-spin" />
        <p className="text-white/50 text-sm">
          {!qubic.ready ? "Initializing..." : "Generating pairing code..."}
        </p>
      </div>
    );
  }

  if (!qubic.walletConnectUri) return null;

  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const downloadUrl = /iPhone|iPad/i.test(navigator.userAgent)
    ? "https://apps.apple.com/app/qubic-wallet/id6502265811"
    : /Android/i.test(navigator.userAgent)
      ? "https://play.google.com/store/apps/details?id=org.qubic.wallet"
      : "https://wallet.qubic.org/";

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-white/50 text-xs text-center">Scan with your Qubic wallet app</p>

      <div className="rounded-2xl bg-white p-3.5 shadow-lg shadow-black/30">
        <QRCodeSVG
          value={qubic.walletConnectUri}
          size={188}
          level="M"
          bgColor="#ffffff"
          fgColor="#0b1219"
        />
      </div>

      <div className="flex items-center gap-2 w-full">
        {isMobile && qubic.deepLink ? (
          <>
            <a
              href={qubic.deepLink}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5",
                "text-sm font-semibold bg-highlight text-primary hover:bg-highlight/90 transition-colors",
              )}
            >
              <ExternalLink size={14} />
              Open in Wallet
            </a>
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-4 py-2.5",
                "text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors border border-white/10",
              )}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </>
        ) : (
          <button
            onClick={handleCopy}
            className={cn(
              "w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5",
              "text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors border border-white/10",
            )}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy link"}
          </button>
        )}
      </div>

      <p className="text-white/35 text-xs text-center">
        Don&apos;t have the app?{" "}
        <a
          href={downloadUrl}
          target="_blank"
          rel="noreferrer"
          className="text-highlight/80 hover:text-highlight transition-colors underline underline-offset-2"
        >
          Download Qubic Wallet
        </a>
      </p>
    </div>
  );
}
