import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import useSolanaWallet from "@/hooks/useSolanaWallet";
import cn from "@/utils/classnames";
import WalletModal from "./wallet-modal";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SUGGESTED_WALLETS = [
  {
    name: "Phantom",
    icon: "/phantom.png",
    url: "https://phantom.app/",
    description: "The most popular Solana wallet",
  },
  {
    name: "Solflare",
    icon: "/solflare.png",
    url: "https://solflare.com/",
    description: "Non-custodial Solana wallet",
  },
] as const;

export default function SolanaWalletModal({ open, onClose }: Props) {
  const {
    installedWallets,
    notInstalledWallets,
    connectWallet,
    connecting,
    connected,
    walletName,
    walletIcon,
  } = useSolanaWallet();
  const [pendingWallet, setPendingWallet] = useState<{ name: string; icon: string } | null>(null);

  const hasAnyWallet = installedWallets.length > 0 || notInstalledWallets.length > 0;

  useEffect(() => {
    if (!open) {
      setPendingWallet(null);
    }
  }, [open]);

  useEffect(() => {
    if (connected && open) onClose();
  }, [connected, open, onClose]);

  function handleSelect(name: string, icon: string) {
    setPendingWallet({ name, icon });
    connectWallet(name);
  }

  const isConnecting = connecting && pendingWallet !== null;
  const displayIcon = pendingWallet?.icon ?? walletIcon ?? null;
  const displayName = pendingWallet?.name ?? walletName ?? "wallet";

  return (
    <WalletModal
      open={open}
      onClose={onClose}
      title={
        isConnecting
          ? `Connecting to ${displayName}`
          : hasAnyWallet
            ? "Connect Solana Wallet"
            : "No Solana wallet detected"
      }
    >
      {isConnecting ? (
        <ConnectingState icon={displayIcon} name={displayName} />
      ) : (
        <div className="flex flex-col gap-4">
          {installedWallets.length > 0 && (
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">
                Detected
              </p>
              <div className="flex flex-col gap-1.5">
                {installedWallets.map((w) => (
                  <button
                    key={w.adapter.name}
                    onClick={() => handleSelect(w.adapter.name, w.adapter.icon)}
                    className={cn(
                      "group flex items-center gap-3.5 w-full rounded-xl px-4 py-3.5 text-left",
                      "border border-transparent bg-white/5 hover:bg-white/8 hover:border-white/10 transition-all duration-150",
                    )}
                  >
                    <img
                      src={w.adapter.icon}
                      alt={w.adapter.name}
                      width={32}
                      height={32}
                      className="shrink-0 rounded-xl"
                    />
                    <span className="text-sm font-semibold text-white/90 flex-1">
                      {w.adapter.name}
                    </span>
                    <ArrowLeft
                      size={14}
                      className="shrink-0 text-white/20 group-hover:text-white/50 rotate-180 transition-colors"
                    />
                  </button>
                ))}
              </div>
            </section>
          )}

          {notInstalledWallets.length > 0 && (
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">
                More wallets
              </p>
              <div className="flex flex-col gap-1.5">
                {notInstalledWallets.slice(0, 5).map((w) => (
                  <button
                    key={w.adapter.name}
                    onClick={() => window.open(w.adapter.url, "_blank")}
                    className={cn(
                      "group flex items-center gap-3.5 w-full rounded-xl px-4 py-3.5 text-left",
                      "border border-transparent bg-white/5 hover:bg-white/8 hover:border-white/10 transition-all duration-150",
                    )}
                  >
                    <img
                      src={w.adapter.icon}
                      alt={w.adapter.name}
                      width={32}
                      height={32}
                      className="shrink-0 rounded-xl opacity-50"
                    />
                    <span className="text-sm font-semibold text-white/60 flex-1">
                      {w.adapter.name}
                    </span>
                    <span className="shrink-0 text-xs text-white/35 group-hover:text-white/60 transition-colors">
                      Install →
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {!hasAnyWallet && (
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-2 px-1">
                Get started
              </p>
              <div className="flex flex-col gap-1.5">
                {SUGGESTED_WALLETS.map((w) => (
                  <a
                    key={w.name}
                    href={w.url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "group flex items-center gap-3.5 w-full rounded-xl px-4 py-3.5",
                      "border border-transparent bg-white/5 hover:bg-white/8 hover:border-white/10 transition-all duration-150",
                    )}
                  >
                    <img
                      src={w.icon}
                      alt={w.name}
                      width={32}
                      height={32}
                      className="shrink-0 rounded-xl"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold text-white/90 leading-snug">
                        {w.name}
                      </span>
                      <span className="text-xs text-white/40 leading-snug mt-0.5">
                        {w.description}
                      </span>
                    </div>
                    <ArrowLeft
                      size={14}
                      className="shrink-0 text-white/20 group-hover:text-white/50 rotate-180 transition-colors"
                    />
                  </a>
                ))}
              </div>
              <p className="text-center text-xs text-white/25 mt-4">
                Refresh the page after installing.
              </p>
            </section>
          )}
        </div>
      )}
    </WalletModal>
  );
}

function ConnectingState({ icon, name }: { icon: string | null; name: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl overflow-hidden">
          {icon ? (
            <img src={icon} alt={name} width={64} height={64} className="w-full h-full" />
          ) : (
            <div className="w-full h-full bg-white/10 rounded-2xl" />
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Loader2 size={13} className="text-highlight animate-spin" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <p className="text-sm font-semibold text-white">Approve in {name}</p>
        <p className="text-xs text-white/40 text-center">
          Check your wallet extension and approve the connection request.
        </p>
      </div>
    </div>
  );
}
