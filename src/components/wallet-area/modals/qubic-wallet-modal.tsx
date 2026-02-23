import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useQubicWallet } from "@/providers/QubicWalletProvider";
import { Loader2, Copy, Check, ExternalLink } from "lucide-react";
import cn from "@/utils/classnames";
import WalletModal from "./wallet-modal";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function QubicWalletModal({ open, onClose }: Props) {
  const { ready, connect, cancelPairing, connecting, connected, walletConnectUri, deepLink } =
    useQubicWallet();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || connected || connecting || walletConnectUri) return;
    if (ready) connect();
  }, [open, ready, connected, connecting, walletConnectUri, connect]);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  useEffect(() => {
    if (connected && open) onClose();
  }, [connected, open, onClose]);

  function handleClose() {
    if (walletConnectUri && !connected) {
      cancelPairing();
    }
    onClose();
  }

  async function handleCopy() {
    if (!walletConnectUri) return;
    await navigator.clipboard.writeText(walletConnectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <WalletModal open={open} onClose={handleClose} title="Connect Qubic Wallet">
      <div className="flex flex-col items-center gap-4">
        {/* Loading — SignClient initializing or waiting for URI */}
        {(!ready || (connecting && !walletConnectUri)) && !connected && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 size={32} className="text-highlight animate-spin" />
            <p className="text-white/60 text-sm">
              {!ready ? "Initializing..." : "Generating pairing code..."}
            </p>
          </div>
        )}

        {/* QR Code */}
        {walletConnectUri && !connected && (
          <>
            <p className="text-white/60 text-sm text-center">Scan with your Qubic wallet app</p>
            <div className="rounded-xl bg-white p-4">
              <QRCodeSVG
                value={walletConnectUri}
                size={220}
                level="M"
                bgColor="#ffffff"
                fgColor="#0b1219"
              />
            </div>

            <div className="flex items-center gap-3 w-full">
              {deepLink && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? (
                <>
                  <a
                    href={deepLink}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5",
                      "text-sm font-medium bg-highlight text-primary hover:bg-highlight/90 transition-colors",
                    )}
                  >
                    <ExternalLink size={14} />
                    Open in Wallet
                  </a>
                  <button
                    onClick={handleCopy}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5",
                      "text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors",
                      "border border-white/10",
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
                    "w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5",
                    "text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors",
                    "border border-white/10",
                  )}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy link"}
                </button>
              )}
            </div>

            <p className="text-white/40 text-xs text-center">
              Don&apos;t have the wallet?{" "}
              <a
                href={
                  /iPhone|iPad/i.test(navigator.userAgent)
                    ? "https://apps.apple.com/app/qubic-wallet/id6502265811"
                    : /Android/i.test(navigator.userAgent)
                      ? "https://play.google.com/store/apps/details?id=org.qubic.wallet"
                      : "https://wallet.qubic.org/"
                }
                target="_blank"
                rel="noreferrer"
                className="text-highlight hover:underline"
              >
                Download Qubic Wallet
              </a>
            </p>
          </>
        )}

        {/* Success */}
        {connected && (
          <div className="flex flex-col items-center gap-2 py-8">
            <Check size={32} className="text-highlight" />
            <p className="text-white text-sm">Connected!</p>
          </div>
        )}
      </div>
    </WalletModal>
  );
}
