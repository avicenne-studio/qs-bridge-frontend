import { Connection } from "@solana/web3.js";

const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL;
if (!SOLANA_RPC_URL) throw new Error("VITE_SOLANA_RPC_URL is not set");

export const solanaConnection = new Connection(SOLANA_RPC_URL);
