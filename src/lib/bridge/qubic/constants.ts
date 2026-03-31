const rawIndex = import.meta.env.VITE_QUBIC_CONTRACT_INDEX;
if (!rawIndex) throw new Error("VITE_QUBIC_CONTRACT_INDEX is not set");

export const QSB_CONTRACT_INDEX = parseInt(rawIndex);
export const LOCK_INPUT_TYPE = 1;
export const SOLANA_NETWORK_OUT = 2;
export const TICK_OFFSET = 5;

const rawNodeRpc = import.meta.env.VITE_QUBIC_NODE_RPC_URL;
if (!rawNodeRpc) throw new Error("VITE_QUBIC_NODE_RPC_URL is not set");
export const QUBIC_NODE_RPC_URL = rawNodeRpc as string;

const rawIndexerUrl = import.meta.env.VITE_QUBIC_INDEXER_URL;
if (!rawIndexerUrl) throw new Error("VITE_QUBIC_INDEXER_URL is not set");
export const QUBIC_INDEXER_URL = rawIndexerUrl as string;

export function contractDestination(index: number): Uint8Array {
  const buf = new Uint8Array(32);
  let v = BigInt(index);
  for (let i = 0; i < 8; i++) {
    buf[i] = Number(v & 0xffn);
    v >>= 8n;
  }
  return buf;
}
