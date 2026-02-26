import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { formatCompactNumber } from "@/utils/format";
const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL as string;
const WQUBIC_MINT_ADDRESS = import.meta.env.VITE_WQUBIC_MINT_ADDRESS as string;

const BALANCE_REFRESH_INTERVAL_MS = 30_000;
const WQUBIC_MINT = new PublicKey(WQUBIC_MINT_ADDRESS);
const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

interface SolanaBalanceContextValue {
  balance: string | null;
}

const SolanaBalanceContext = createContext<SolanaBalanceContextValue>({ balance: null });

export function useSolanaBalance() {
  return useContext(SolanaBalanceContext);
}

function SolanaBalanceProvider({ children }: PropsWithChildren) {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!connected || !publicKey || !WQUBIC_MINT) {
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
      } catch {
        // Balance fetch failures are transient; next interval will retry
      }
    }

    fetchBalance();
    const id = setInterval(fetchBalance, BALANCE_REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [connected, publicKey, connection]);

  return (
    <SolanaBalanceContext.Provider value={{ balance }}>{children}</SolanaBalanceContext.Provider>
  );
}

export default function SolanaWalletProvider({ children }: PropsWithChildren) {
  return (
    <ConnectionProvider endpoint={SOLANA_RPC_URL}>
      <WalletProvider wallets={[]} autoConnect>
        <SolanaBalanceProvider>{children}</SolanaBalanceProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
