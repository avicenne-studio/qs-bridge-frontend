import { useEffect, useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { solanaConnection } from "@/lib/bridge/solana/connection";
import { GLOBAL_STATE_PDA } from "@/lib/bridge/solana/pda";
import { PROGRAM_ID } from "@/lib/bridge/solana/constants";
import {
  queryGetConfig,
  queryIsPauser,
  queryGetOracles,
  queryGetPausers,
  type QubicConfig,
} from "@/lib/bridge/qubic/query";
import { publicIdToBytes } from "@/lib/bridge/qubic/admin-payloads";
import useSolanaWallet from "./useSolanaWallet";
import { useQubicWallet } from "@/providers/QubicWalletProvider";

const POLL_INTERVAL_MS = 30_000;

export function decodeSolanaAdmin(data: Uint8Array): string | null {
  try {
    if (data.length < 33) return null;
    return new PublicKey(data.slice(1, 33)).toBase58();
  } catch {
    return null;
  }
}

export function decodeSolanaPaused(data: Uint8Array): boolean {
  return data.length >= 143 && data[142] !== 0;
}

interface SolanaGlobalState {
  admin: string | null;
  protocolFeeRecipient: string | null;
  tokenMint: string | null;
  owedProtocolFee: bigint;
  bpsFee: number;
  protocolFeeBpsOfBps: number;
  paused: boolean;
}

function decodeSolanaGlobalState(data: Uint8Array): SolanaGlobalState | null {
  try {
    if (data.length < 145) return null;
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    // Layout: key(1) admin(32) pendingAdmin(33) protocolFeeRecipient(32) tokenMint(32)
    //         owedProtocolFee(8) bpsFee(2) protocolFeeBpsOfBps(2) paused(1) oracleCount(1) bump(1)
    return {
      admin: new PublicKey(data.slice(1, 33)).toBase58(),
      protocolFeeRecipient: new PublicKey(data.slice(66, 98)).toBase58(),
      tokenMint: new PublicKey(data.slice(98, 130)).toBase58(),
      owedProtocolFee: view.getBigUint64(130, true),
      bpsFee: view.getUint16(138, true),
      protocolFeeBpsOfBps: view.getUint16(140, true),
      paused: data[142] !== 0,
    };
  } catch {
    return null;
  }
}

export interface SolanaOracle {
  pubkey: string;
  claimableBalance: bigint;
}

async function fetchSolanaOracles(): Promise<SolanaOracle[]> {
  const accounts = await solanaConnection.getProgramAccounts(PROGRAM_ID, {
    filters: [{ dataSize: 42 }, { memcmp: { offset: 0, bytes: "2" } }],
  });
  return accounts.map(({ account }) => {
    const pubkey = new PublicKey(account.data.subarray(1, 33)).toBase58();
    const view = new DataView(account.data.buffer, account.data.byteOffset + 33, 8);
    return { pubkey, claimableBalance: view.getBigUint64(0, true) };
  });
}

async function fetchSolanaPausers(): Promise<string[]> {
  const accounts = await solanaConnection.getProgramAccounts(PROGRAM_ID, {
    filters: [{ dataSize: 34 }, { memcmp: { offset: 0, bytes: "3" } }],
  });
  return accounts.map(({ account }) => new PublicKey(account.data.subarray(1, 33)).toBase58());
}

export interface AdminRoles {
  solanaAdmin: string | null;
  solanaProtocolFeeRecipient: string | null;
  solanaTokenMint: string | null;
  solanaPaused: boolean;
  solanaOwedProtocolFee: bigint;
  solanaBpsFee: number;
  solanaProtocolFeeBps: number;
  solanaOracles: SolanaOracle[];
  solanaPausers: string[];
  isSolanaAdmin: boolean;
  isSolanaPauser: boolean;
  isSolanaProtocolFeeRecipient: boolean;
  isQubicAdmin: boolean;
  isQubicPauser: boolean;
  qubicOracles: string[];
  qubicPausers: string[];
  qubicConfig: QubicConfig | null;
  loading: boolean;
  refresh: () => void;
}

export function useAdminRoles(): AdminRoles {
  const { connected: solanaConnected, address: solanaAddress } = useSolanaWallet();
  const { connected: qubicConnected, address: qubicAddress } = useQubicWallet();

  const [solanaAdmin, setSolanaAdmin] = useState<string | null>(null);
  const [solanaProtocolFeeRecipient, setSolanaProtocolFeeRecipient] = useState<string | null>(null);
  const [solanaTokenMint, setSolanaTokenMint] = useState<string | null>(null);
  const [solanaPaused, setSolanaPaused] = useState(false);
  const [solanaOwedProtocolFee, setSolanaOwedProtocolFee] = useState(0n);
  const [solanaBpsFee, setSolanaBpsFee] = useState(0);
  const [solanaProtocolFeeBps, setSolanaProtocolFeeBps] = useState(0);
  const [solanaOracles, setSolanaOracles] = useState<SolanaOracle[]>([]);
  const [solanaPausers, setSolanaPausers] = useState<string[]>([]);
  const [isSolanaPauser, setIsSolanaPauser] = useState(false);
  const [solanaLoading, setSolanaLoading] = useState(true);

  const [isQubicAdmin, setIsQubicAdmin] = useState(false);
  const [isQubicPauser, setIsQubicPauser] = useState(false);
  const [qubicOracles, setQubicOracles] = useState<string[]>([]);
  const [qubicPausers, setQubicPausers] = useState<string[]>([]);
  const [qubicConfig, setQubicConfig] = useState<QubicConfig | null>(null);

  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // TODO: move to a hub relay endpoint (Helius key server-side) to avoid public RPC rate limits.
  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([fetchSolanaOracles(), fetchSolanaPausers()]).then(
      ([oracleResult, pauserResult]) => {
        if (cancelled) return;
        if (oracleResult.status === "fulfilled") setSolanaOracles(oracleResult.value);
        if (pauserResult.status === "fulfilled") setSolanaPausers(pauserResult.value);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [tick]);

  // TODO: enable when Qubic testnet is live.
  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([queryGetOracles(), queryGetPausers()]).then(
      ([oracleResult, pauserResult]) => {
        if (cancelled) return;
        if (oracleResult.status === "fulfilled") setQubicOracles(oracleResult.value);
        if (pauserResult.status === "fulfilled") setQubicPausers(pauserResult.value);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [tick]);

  // Solana: global state (admin, paused, fees) + pauser role check
  useEffect(() => {
    let cancelled = false;

    async function fetchSolana() {
      setSolanaLoading(true);
      try {
        const globalInfo = await solanaConnection.getAccountInfo(GLOBAL_STATE_PDA);
        if (cancelled) return;

        const gs = globalInfo ? decodeSolanaGlobalState(globalInfo.data) : null;
        setSolanaAdmin(gs?.admin ?? null);
        setSolanaProtocolFeeRecipient(gs?.protocolFeeRecipient ?? null);
        setSolanaTokenMint(gs?.tokenMint ?? null);
        setSolanaPaused(gs?.paused ?? false);
        setSolanaOwedProtocolFee(gs?.owedProtocolFee ?? 0n);
        setSolanaBpsFee(gs?.bpsFee ?? 0);
        setSolanaProtocolFeeBps(gs?.protocolFeeBpsOfBps ?? 0);

        if (solanaConnected && solanaAddress) {
          try {
            const { derivePauserPda } = await import("@/lib/bridge/solana/pda");
            const pauserPda = derivePauserPda(new PublicKey(solanaAddress));
            const pauserInfo = await solanaConnection.getAccountInfo(pauserPda);
            if (!cancelled) setIsSolanaPauser(pauserInfo !== null);
          } catch {
            if (!cancelled) setIsSolanaPauser(false);
          }
        } else {
          setIsSolanaPauser(false);
        }
      } catch {
        // transient — next poll will retry
      } finally {
        if (!cancelled) setSolanaLoading(false);
      }
    }

    fetchSolana();
    const id = setInterval(fetchSolana, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [solanaConnected, solanaAddress, tick]);

  // Qubic: config + admin/pauser role check. Failures are silenced — Qubic testnet may be down.
  useEffect(() => {
    let cancelled = false;

    async function fetchQubic() {
      try {
        const cfg = await queryGetConfig();
        if (cancelled) return;
        setQubicConfig(cfg);

        if (qubicConnected && qubicAddress) {
          const accountBytes = publicIdToBytes(qubicAddress as string);
          const isAdmin = cfg.adminBytes.every((b: number, i: number) => b === accountBytes[i]);
          if (!cancelled) setIsQubicAdmin(isAdmin);

          try {
            const isPauser = await queryIsPauser(accountBytes);
            if (!cancelled) setIsQubicPauser(isPauser);
          } catch {
            if (!cancelled) setIsQubicPauser(false);
          }
        } else {
          setIsQubicAdmin(false);
          setIsQubicPauser(false);
        }
      } catch {
        // Qubic node unreachable — leave existing state, next poll will retry
      }
    }

    fetchQubic();
    const id = setInterval(fetchQubic, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [qubicConnected, qubicAddress, tick]);

  const isSolanaAdmin = solanaAdmin !== null && solanaAddress === solanaAdmin;
  const isSolanaProtocolFeeRecipient =
    solanaProtocolFeeRecipient !== null && solanaAddress === solanaProtocolFeeRecipient;

  return {
    solanaAdmin,
    solanaProtocolFeeRecipient,
    solanaTokenMint,
    solanaPaused,
    solanaOwedProtocolFee,
    solanaBpsFee,
    solanaProtocolFeeBps,
    solanaOracles,
    solanaPausers,
    isSolanaAdmin,
    isSolanaPauser,
    isSolanaProtocolFeeRecipient,
    isQubicAdmin,
    isQubicPauser,
    qubicOracles,
    qubicPausers,
    qubicConfig,
    loading: solanaLoading,
    refresh,
  };
}
