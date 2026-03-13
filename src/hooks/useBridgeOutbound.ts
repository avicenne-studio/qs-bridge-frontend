import { useCallback, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useAppKitAccount } from "@reown/appkit/react";
import { useSolanaProvider } from "./useSolanaProvider";
import { solanaConnection } from "@/lib/bridge/solana/connection";
import { QUBIC_NETWORK_ID, QUBIC_TOKEN_OUT } from "@/lib/bridge/solana/constants";
import { GLOBAL_STATE_PDA, deriveOutboundOrderPda } from "@/lib/bridge/solana/pda";
import { getAssociatedTokenAddress } from "@/lib/bridge/solana/token";
import {
  serializeOutboundData,
  createOutboundInstruction,
} from "@/lib/bridge/solana/instructions/outbound";
import {
  serializeOverrideOutboundData,
  createOverrideOutboundInstruction,
} from "@/lib/bridge/solana/instructions/override-outbound";
import { sendTransaction } from "@/lib/bridge/solana/send";
import type { OutboundParams, OverrideOutboundParams, TxResult } from "@/lib/bridge/types";

const WQUBIC_MINT_ADDRESS = import.meta.env.VITE_WQUBIC_MINT_ADDRESS;
if (!WQUBIC_MINT_ADDRESS) throw new Error("VITE_WQUBIC_MINT_ADDRESS is not set");

const WQUBIC_MINT = new PublicKey(WQUBIC_MINT_ADDRESS);

function generateNonce(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32));
}

export function useBridgeOutbound() {
  const provider = useSolanaProvider();
  const { address } = useAppKitAccount();

  const [isLoading, setIsLoading] = useState(false);
  const [outboundError, setOutboundError] = useState<string | null>(null);
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<TxResult | null>(null);
  const [lastOrder, setLastOrder] = useState<{
    nonce: Uint8Array;
    networkOut: number;
  } | null>(null);

  const userPubkey = address ? new PublicKey(address) : null;
  const userTokenAccount = userPubkey ? getAssociatedTokenAddress(userPubkey, WQUBIC_MINT) : null;

  const sendOutbound = useCallback(
    async (params: OutboundParams): Promise<TxResult | null> => {
      if (!provider || !userPubkey || !userTokenAccount) {
        setOutboundError("Solana wallet not connected");
        return null;
      }

      setIsLoading(true);
      setOutboundError(null);
      setTxResult(null);

      try {
        const nonce = generateNonce();
        const networkOut = QUBIC_NETWORK_ID;
        const outboundOrder = deriveOutboundOrderPda(networkOut, nonce);

        const data = serializeOutboundData({
          networkOut,
          tokenOut: QUBIC_TOKEN_OUT,
          amount: params.amount,
          toAddress: params.toAddress,
          relayerFee: params.relayerFee,
          nonce,
        });

        const instruction = createOutboundInstruction({
          user: userPubkey,
          globalState: GLOBAL_STATE_PDA,
          outboundOrder,
          userTokenAccount,
          tokenMint: WQUBIC_MINT,
          data,
        });

        const result = await sendTransaction(provider, solanaConnection, instruction, userPubkey);

        setTxResult(result);
        setLastOrder({ nonce, networkOut });
        return result;
      } catch (err) {
        setOutboundError(err instanceof Error ? err.message : "Transaction failed");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [provider, userPubkey, userTokenAccount],
  );

  const overrideOutbound = useCallback(
    async (params: OverrideOutboundParams): Promise<TxResult | null> => {
      if (!provider || !userPubkey) {
        setOverrideError("Solana wallet not connected");
        return null;
      }

      setIsLoading(true);
      setOverrideError(null);

      try {
        const outboundOrder = deriveOutboundOrderPda(params.networkOut, params.nonce);

        const data = serializeOverrideOutboundData({
          newToAddress: params.newToAddress,
          newRelayerFee: params.newRelayerFee,
        });

        const instruction = createOverrideOutboundInstruction({
          caller: userPubkey,
          globalState: GLOBAL_STATE_PDA,
          outboundOrder,
          data,
        });

        const result = await sendTransaction(provider, solanaConnection, instruction, userPubkey);

        setTxResult(result);
        return result;
      } catch (err) {
        setOverrideError(err instanceof Error ? err.message : "Override transaction failed");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [provider, userPubkey],
  );

  const reset = useCallback(() => {
    setOutboundError(null);
    setOverrideError(null);
    setTxResult(null);
    setLastOrder(null);
  }, []);

  return {
    sendOutbound,
    overrideOutbound,
    isLoading,
    outboundError,
    overrideError,
    txResult,
    lastOrder,
    reset,
  };
}
