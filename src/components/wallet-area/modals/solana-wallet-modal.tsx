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
  const { installedWallets, notInstalledWallets, connectWallet } = useSolanaWallet();

  const hasAnyWallet = installedWallets.length > 0 || notInstalledWallets.length > 0;

  function handleSelect(walletName: string) {
    connectWallet(walletName);
    onClose();
  }

  return (
    <WalletModal
      open={open}
      onClose={onClose}
      title={hasAnyWallet ? "Connect Solana Wallet" : "No wallet detected"}
    >
      {/* Detected (installed) wallets */}
      {installedWallets.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wide text-white/40 mb-2">Detected</p>
          <div className="flex flex-col gap-1">
            {installedWallets.map((w) => (
              <button
                key={w.adapter.name}
                onClick={() => handleSelect(w.adapter.name)}
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg px-4 py-3",
                  "text-white hover:bg-white/10 transition-colors text-left",
                )}
              >
                <img
                  src={w.adapter.icon}
                  alt={w.adapter.name}
                  width={28}
                  height={28}
                  className="rounded-md"
                />
                <span className="text-base font-medium">{w.adapter.name}</span>
                <span className="ml-auto text-xs text-highlight">Detected</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Not installed but detected by Wallet Standard */}
      {notInstalledWallets.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-white/40 mb-2">
            More wallets
          </p>
          <div className="flex flex-col gap-1">
            {notInstalledWallets.slice(0, 5).map((w) => (
              <button
                key={w.adapter.name}
                onClick={() => window.open(w.adapter.url, "_blank")}
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg px-4 py-3",
                  "text-white/60 hover:bg-white/10 transition-colors text-left",
                )}
              >
                <img
                  src={w.adapter.icon}
                  alt={w.adapter.name}
                  width={28}
                  height={28}
                  className="rounded-md opacity-60"
                />
                <span className="text-base">{w.adapter.name}</span>
                <span className="ml-auto text-xs text-white/40">Install →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state — no wallets detected at all */}
      {!hasAnyWallet && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold uppercase tracking-wide text-white/40 mb-1">
              Get started
            </p>
            {SUGGESTED_WALLETS.map((w) => (
              <a
                key={w.name}
                href={w.url}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "flex items-center gap-3 w-full rounded-lg px-4 py-3",
                  "text-white hover:bg-white/10 transition-colors",
                  "group",
                )}
              >
                <img
                  src={w.icon}
                  alt={w.name}
                  width={36}
                  height={36}
                  className="rounded-xl shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold leading-tight">{w.name}</span>
                  <span className="text-xs text-white/40 leading-tight">{w.description}</span>
                </div>
                <span className="ml-auto text-xs text-highlight shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  Install →
                </span>
              </a>
            ))}
          </div>

          <p className="text-center text-xs text-white/30 mt-1">
            Refresh the page after installing.
          </p>
        </div>
      )}
    </WalletModal>
  );
}
