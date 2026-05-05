import { useEffect, useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { solanaConnection } from "@/lib/bridge/solana/connection";
import { GLOBAL_STATE_PDA } from "@/lib/bridge/solana/pda";
import { queryGetConfig, queryIsOracle, queryIsPauser, type QubicConfig } from "@/lib/bridge/qubic/query";
import { publicIdToBytes } from "@/lib/bridge/qubic/admin-payloads";
import useSolanaWallet from "./useSolanaWallet";
import { useQubicWallet } from "@/providers/QubicWalletProvider";

const POLL_INTERVAL_MS = 30_000;

// Solana GlobalState on-chain layout (Borsh):
//   [0]       u8  key (discriminator)
//   [1..32]   [u8; 32] admin pubkey
export function decodeSolanaAdmin(data: Uint8Array): string | null {
  try {
    if (data.length < 33) return null;
    return new PublicKey(data.slice(1, 33)).toBase58();
  } catch {
    return null;
  }
}

export interface AdminRoles {
  solanaAdmin: string | null;
  isSolanaAdmin: boolean;
  isSolanaPauser: boolean;
  isQubicAdmin: boolean;
  isQubicOracle: boolean;
  isQubicPauser: boolean;
  qubicConfig: QubicConfig | null;
  loading: boolean;
  refresh: () => void;
}

export function useAdminRoles(): AdminRoles {
  const { connected: solanaConnected, address: solanaAddress } = useSolanaWallet();
  const { connected: qubicConnected, address: qubicAddress } = useQubicWallet();

  const [solanaAdmin, setSolanaAdmin] = useState<string | null>(null);
  const [isSolanaPauser, setIsSolanaPauser] = useState(false);
  const [isQubicAdmin, setIsQubicAdmin] = useState(false);
  const [isQubicOracle, setIsQubicOracle] = useState(false);
  const [isQubicPauser, setIsQubicPauser] = useState(false);
  const [qubicConfig, setQubicConfig] = useState<QubicConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      try {
        const [solanaInfo, config] = await Promise.all([
          solanaConnection.getAccountInfo(GLOBAL_STATE_PDA).catch(() => null),
          queryGetConfig().catch(() => null),
        ]);

        if (cancelled) return;

        const adminPubkey = solanaInfo ? decodeSolanaAdmin(solanaInfo.data) : null;
        setSolanaAdmin(adminPubkey);
        setQubicConfig(config);

        const solanaChecks: Promise<void>[] = [];
        const qubicChecks: Promise<void>[] = [];

        if (solanaConnected && solanaAddress) {
          // Check if the connected Solana wallet is a pauser
          solanaChecks.push(
            (async () => {
              try {
                const { derivePauserPda } = await import("@/lib/bridge/solana/pda");
                const pauserPda = derivePauserPda(new PublicKey(solanaAddress));
                const pauserInfo = await solanaConnection.getAccountInfo(pauserPda);
                if (!cancelled) setIsSolanaPauser(pauserInfo !== null);
              } catch {
                if (!cancelled) setIsSolanaPauser(false);
              }
            })(),
          );
        } else {
          setIsSolanaPauser(false);
        }

        if (qubicConnected && qubicAddress && config) {
          const accountBytes = publicIdToBytes(qubicAddress as string);
          const adminBytes = config.adminBytes;

          // Check if the connected Qubic address is admin (byte-compare)
          const isAdmin = adminBytes.every((b: number, i: number) => b === accountBytes[i]);
          setIsQubicAdmin(isAdmin);

          // Check oracle/pauser roles on-chain
          qubicChecks.push(
            queryIsOracle(accountBytes)
              .then((v) => { if (!cancelled) setIsQubicOracle(v); })
              .catch(() => { if (!cancelled) setIsQubicOracle(false); }),
            queryIsPauser(accountBytes)
              .then((v) => { if (!cancelled) setIsQubicPauser(v); })
              .catch(() => { if (!cancelled) setIsQubicPauser(false); }),
          );
        } else {
          setIsQubicAdmin(false);
          setIsQubicOracle(false);
          setIsQubicPauser(false);
        }

        await Promise.all([...solanaChecks, ...qubicChecks]);
      } catch {
        // transient errors — next poll will retry
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    const id = setInterval(fetchAll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [solanaConnected, solanaAddress, qubicConnected, qubicAddress, tick]);

  const isSolanaAdmin = solanaAdmin !== null && solanaAddress === solanaAdmin;

  return {
    solanaAdmin,
    isSolanaAdmin,
    isSolanaPauser,
    isQubicAdmin,
    isQubicOracle,
    isQubicPauser,
    qubicConfig,
    loading,
    refresh,
  };
}
