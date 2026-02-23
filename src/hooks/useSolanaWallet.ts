import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useState } from "react";

const BALANCE_REFRESH_INTERVAL_MS = 30_000;

export default function useSolanaWallet() {
  const { wallets, select, disconnect, connected, connecting, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!connected || !publicKey) {
      setBalance(null);
      return;
    }

    let cancelled = false;

    async function fetchBalance() {
      try {
        const lamports = await connection.getBalance(publicKey!);
        if (!cancelled) {
          setBalance((Math.floor((lamports / LAMPORTS_PER_SOL) * 100) / 100).toFixed(2));
        }
      } catch (err) {
        console.error("[Solana] getBalance failed:", err);
      }
    }

    fetchBalance();
    const id = setInterval(fetchBalance, BALANCE_REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [connected, publicKey, connection]);

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
