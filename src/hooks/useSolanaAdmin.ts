import { useCallback, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { solanaConnection } from "@/lib/bridge/solana/connection";
import { sendTransaction } from "@/lib/bridge/solana/send";
import { createAddOracleInstruction } from "@/lib/bridge/solana/instructions/add-oracle";
import { createRemoveOracleInstruction } from "@/lib/bridge/solana/instructions/remove-oracle";
import { createAddPauserInstruction } from "@/lib/bridge/solana/instructions/add-pauser";
import { createRemovePauserInstruction } from "@/lib/bridge/solana/instructions/remove-pauser";
import { createPauseInstruction, createUnpauseInstruction } from "@/lib/bridge/solana/instructions/pause-unpause";
import { useSolanaProvider } from "./useSolanaProvider";
import useSolanaWallet from "./useSolanaWallet";
import type { TxResult } from "@/lib/bridge/types";

export interface SolanaAdminActions {
  addOracle: (oraclePubkey: string) => Promise<TxResult>;
  removeOracle: (oraclePubkey: string) => Promise<TxResult>;
  addPauser: (pauserPubkey: string) => Promise<TxResult>;
  removePauser: (pauserPubkey: string) => Promise<TxResult>;
  pause: () => Promise<TxResult>;
  unpause: () => Promise<TxResult>;
  loading: boolean;
  error: string | null;
}

export function useSolanaAdmin(): SolanaAdminActions {
  const provider = useSolanaProvider();
  const { address } = useSolanaWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<TxResult>): Promise<TxResult> {
    if (!provider) throw new Error("Solana wallet not connected");
    if (!address) throw new Error("Solana address unavailable");
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  const addOracle = useCallback(
    (oraclePubkey: string) =>
      run(async () => {
        const admin = new PublicKey(address!);
        const oracle = new PublicKey(oraclePubkey);
        const ix = createAddOracleInstruction(admin, oracle);
        return sendTransaction(provider!, solanaConnection, ix, admin);
      }),
    [provider, address],
  );

  const removeOracle = useCallback(
    (oraclePubkey: string) =>
      run(async () => {
        const admin = new PublicKey(address!);
        const oracle = new PublicKey(oraclePubkey);
        const ix = createRemoveOracleInstruction(admin, oracle);
        return sendTransaction(provider!, solanaConnection, ix, admin);
      }),
    [provider, address],
  );

  const addPauser = useCallback(
    (pauserPubkey: string) =>
      run(async () => {
        const admin = new PublicKey(address!);
        const pauser = new PublicKey(pauserPubkey);
        const ix = createAddPauserInstruction(admin, pauser);
        return sendTransaction(provider!, solanaConnection, ix, admin);
      }),
    [provider, address],
  );

  const removePauser = useCallback(
    (pauserPubkey: string) =>
      run(async () => {
        const admin = new PublicKey(address!);
        const pauser = new PublicKey(pauserPubkey);
        const ix = createRemovePauserInstruction(admin, pauser);
        return sendTransaction(provider!, solanaConnection, ix, admin);
      }),
    [provider, address],
  );

  const pause = useCallback(
    () =>
      run(async () => {
        const pauser = new PublicKey(address!);
        const ix = createPauseInstruction(pauser);
        return sendTransaction(provider!, solanaConnection, ix, pauser);
      }),
    [provider, address],
  );

  const unpause = useCallback(
    () =>
      run(async () => {
        const pauser = new PublicKey(address!);
        const ix = createUnpauseInstruction(pauser);
        return sendTransaction(provider!, solanaConnection, ix, pauser);
      }),
    [provider, address],
  );

  return { addOracle, removeOracle, addPauser, removePauser, pause, unpause, loading, error };
}
