import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useMemo } from "react";
import { useSolanaBalance } from "@/providers/SolanaWalletProvider";

export default function useSolanaWallet() {
  const { wallets, select, disconnect, connected, connecting, publicKey, wallet } = useWallet();
  const { balance } = useSolanaBalance();

  const installedWallets = useMemo(
    () => wallets.filter((w) => w.readyState === "Installed"),
    [wallets],
  );

  const notInstalledWallets = useMemo(
    () => wallets.filter((w) => w.readyState === "NotDetected"),
    [wallets],
  );

  const address = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  const connectWallet = useCallback(
    (walletName: string) => {
      const found = wallets.find((w) => w.adapter.name === walletName);
      if (found) select(found.adapter.name);
    },
    [wallets, select],
  );

  return {
    installedWallets,
    notInstalledWallets,
    connected,
    connecting,
    publicKey,
    address,
    balance,
    walletName: wallet?.adapter.name ?? null,
    walletIcon: wallet?.adapter.icon ?? null,
    connectWallet,
    disconnect,
  };
}
