import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatCompactNumber } from "@/utils/format";

const BALANCE_REFRESH_INTERVAL_MS = 30_000;
const WQUBIC_MINT = new PublicKey(import.meta.env.VITE_WQUBIC_MINT as string);
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

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
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey!, {
          mint: WQUBIC_MINT,
          programId: TOKEN_PROGRAM_ID,
        });
        if (cancelled) return;
        const amount = tokenAccounts.value[0]?.account.data.parsed.info.tokenAmount.uiAmount ?? 0;
        setBalance(formatCompactNumber(Math.floor(amount)));
      } catch (err) {
        console.error("[Solana] wQubic balance fetch failed:", err);
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
