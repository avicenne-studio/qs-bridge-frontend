import { useCallback, useState } from "react";
import { useQubicWallet } from "@/providers/QubicWalletProvider";
import { buildLockPayload } from "@/lib/bridge/qubic/lock-payload";
import { buildOverrideLockPayload } from "@/lib/bridge/qubic/override-lock-payload";
import {
  buildAndBroadcastLockTx,
  buildAndBroadcastOverrideLockTx,
} from "@/lib/bridge/qubic/transaction";
import { SOLANA_NETWORK_OUT, QSB_CONTRACT_INDEX } from "@/lib/bridge/qubic/constants";
import type { LockParams, OverrideLockParams, TxResult } from "@/lib/bridge/types";

function generateNonce(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}

export function useBridgeInbound() {
  const qubicWallet = useQubicWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [inboundError, setInboundError] = useState<string | null>(null);
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [lastLock, setLastLock] = useState<{ nonce: number } | null>(null);

  const sendLock = useCallback(
    async (params: LockParams): Promise<TxResult | null> => {
      if (!qubicWallet.connected || !qubicWallet.session) {
        setInboundError("Qubic wallet not connected");
        return null;
      }

      setIsLoading(true);
      setInboundError(null);
      setTxResult(null);

      try {
        const nonce = generateNonce();

        const lockPayload = buildLockPayload(
          params.amount,
          params.relayerFee,
          params.toSolanaAddress,
          SOLANA_NETWORK_OUT,
          nonce,
        );

        const session = qubicWallet.session;

        if (session.kind === "local") {
          if (!session.seed) {
            throw new Error(
              "Seed not available — reconnect with a Qubic seed to use Qubic→Solana bridge",
            );
          }

          const { txId } = await buildAndBroadcastLockTx(session.seed, params.amount, lockPayload);

          const result: TxResult = {
            signature: txId,
            explorerUrl: `https://explorer.qubic.org/network/tx/${txId}`,
          };
          setTxResult(result);
          setLastLock({ nonce });
          return result;
        }

        if (session.kind === "walletconnect") {
          const txId = await qubicWallet.sendQubicTransaction({
            amount: Number(params.amount),
            contractIndex: QSB_CONTRACT_INDEX,
            inputType: 1,
            payload: lockPayload,
          });

          const result: TxResult = {
            signature: txId,
            explorerUrl: `https://explorer.qubic.org/network/tx/${txId}`,
          };
          setTxResult(result);
          setLastLock({ nonce });
          return result;
        }

        throw new Error("Unsupported wallet connection type");
      } catch (err) {
        setInboundError(err instanceof Error ? err.message : "Lock transaction failed");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [qubicWallet],
  );

  const overrideLock = useCallback(
    async (params: OverrideLockParams): Promise<TxResult | null> => {
      if (!qubicWallet.connected || !qubicWallet.session) {
        setOverrideError("Qubic wallet not connected");
        return null;
      }

      setIsLoading(true);
      setOverrideError(null);
      setTxResult(null);

      try {
        const overridePayload = buildOverrideLockPayload(
          params.newToAddress ?? "",
          params.newRelayerFee ?? 0n,
          params.nonce,
        );

        const session = qubicWallet.session;

        if (session.kind === "local") {
          if (!session.seed) {
            throw new Error("Seed not available for override");
          }

          const { txId } = await buildAndBroadcastOverrideLockTx(session.seed, overridePayload);

          const result: TxResult = {
            signature: txId,
            explorerUrl: `https://explorer.qubic.org/network/tx/${txId}`,
          };
          setTxResult(result);
          return result;
        }

        if (session.kind === "walletconnect") {
          const txId = await qubicWallet.sendQubicTransaction({
            amount: 0,
            contractIndex: QSB_CONTRACT_INDEX,
            inputType: 2,
            payload: overridePayload,
          });

          const result: TxResult = {
            signature: txId,
            explorerUrl: `https://explorer.qubic.org/network/tx/${txId}`,
          };
          setTxResult(result);
          return result;
        }

        throw new Error("Unsupported wallet connection type");
      } catch (err) {
        setOverrideError(err instanceof Error ? err.message : "Override transaction failed");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [qubicWallet],
  );

  const reset = useCallback(() => {
    setInboundError(null);
    setOverrideError(null);
    setTxResult(null);
    setLastLock(null);
  }, []);

  return {
    sendLock,
    overrideLock,
    isLoading,
    inboundError,
    overrideError,
    txResult,
    lastLock,
    reset,
  };
}
