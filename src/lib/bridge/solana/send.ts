import { ComputeBudgetProgram, Connection, PublicKey, Transaction } from "@solana/web3.js";
import type { TransactionInstruction } from "@solana/web3.js";
import type { TxResult } from "../types";

export interface SolanaWalletProvider {
  signAndSendTransaction(
    transaction: Transaction,
    sendOptions?: { skipPreflight?: boolean },
  ): Promise<string>;
}

const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK;
if (!SOLANA_NETWORK) throw new Error("VITE_SOLANA_NETWORK is not set");

const DEFAULT_COMPUTE_UNITS = 200_000;
const FALLBACK_PRIORITY_FEE = 50_000; // microlamports per CU

function getExplorerUrl(signature: string): string {
  const cluster = SOLANA_NETWORK === "mainnet-beta" ? "" : `?cluster=${SOLANA_NETWORK}`;
  return `https://solscan.io/tx/${signature}${cluster}`;
}

async function estimatePriorityFee(connection: Connection): Promise<number> {
  try {
    const fees = await connection.getRecentPrioritizationFees();
    if (fees.length === 0) return FALLBACK_PRIORITY_FEE;

    const sorted = fees.map((f) => f.prioritizationFee).sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    return Math.max(median, FALLBACK_PRIORITY_FEE);
  } catch {
    return FALLBACK_PRIORITY_FEE;
  }
}

export async function sendTransaction(
  provider: SolanaWalletProvider,
  connection: Connection,
  instruction: TransactionInstruction,
  feePayer: PublicKey,
): Promise<TxResult> {
  const priorityFee = await estimatePriorityFee(connection);

  const transaction = new Transaction();
  transaction.add(ComputeBudgetProgram.setComputeUnitLimit({ units: DEFAULT_COMPUTE_UNITS }));
  transaction.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee }));
  transaction.add(instruction);

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = feePayer;

  const signature = await provider.signAndSendTransaction(transaction);

  if (!signature) {
    throw new Error("Transaction was rejected");
  }

  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");

  return {
    signature,
    explorerUrl: getExplorerUrl(signature),
  };
}
