import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";
import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana, solanaDevnet } from "@reown/appkit/networks";
import { useAppKitAccount } from "@reown/appkit/react";
import { PublicKey } from "@solana/web3.js";
import { formatCompactNumber } from "@/utils/format";
import { solanaConnection } from "@/lib/bridge/solana/connection";
import { TOKEN_PROGRAM_ID } from "@/lib/bridge/solana/constants";

const WQUBIC_MINT_ADDRESS = import.meta.env.VITE_WQUBIC_MINT_ADDRESS as string;
const REOWN_PROJECT_ID = import.meta.env.VITE_REOWN_PROJECT_ID as string;

const BALANCE_REFRESH_INTERVAL_MS = 30_000;
const WQUBIC_MINT = new PublicKey(WQUBIC_MINT_ADDRESS);

// Initialize Reown AppKit (must be called at module level, outside React)
createAppKit({
  adapters: [new SolanaAdapter()],
  networks: [solanaDevnet, solana],
  projectId: REOWN_PROJECT_ID,
  metadata: {
    name: "Qubic Bridge",
    description: "Bridge between Qubic and Solana",
    url: typeof window !== "undefined" ? window.location.origin : "",
    icons: [],
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#23ffff",
    "--w3m-color-mix": "#0b1219",
    "--w3m-color-mix-strength": 40,
    "--w3m-border-radius-master": "4px",
    "--w3m-font-family": "Poppins, sans-serif",
  },
  features: {
    analytics: true,
    allWallets: true,
    email: false,
    socials: false,
    pay: false,
    smartSessions: false,
    legalCheckbox: false,
    collapseWallets: false,
    reownAuthentication: false,
    connectMethodsOrder: ["wallet"],
    connectorTypeOrder: ["walletConnect", "recent", "injected", "featured", "recommended"],
  },
});

interface SolanaBalanceContextValue {
  balance: string | null;
}

const SolanaBalanceContext = createContext<SolanaBalanceContextValue>({ balance: null });

export function useSolanaBalance() {
  return useContext(SolanaBalanceContext);
}

function SolanaBalanceProvider({ children }: PropsWithChildren) {
  const { isConnected, address } = useAppKitAccount();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setBalance(null);
      return;
    }

    let cancelled = false;
    const publicKey = new PublicKey(address);

    async function fetchBalance() {
      try {
        const tokenAccounts = await solanaConnection.getParsedTokenAccountsByOwner(publicKey, {
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
  }, [isConnected, address]);

  return (
    <SolanaBalanceContext.Provider value={{ balance }}>{children}</SolanaBalanceContext.Provider>
  );
}

export default function SolanaWalletProvider({ children }: PropsWithChildren) {
  return <SolanaBalanceProvider>{children}</SolanaBalanceProvider>;
}
