import { QSB_CONTRACT_INDEX, QUBIC_INDEXER_URL } from "./constants";
import { bytesToPublicId } from "./admin-payloads";

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

// Calls Bob's /querySmartContract — same format as oracle/scripts/qubic/utils.js queryContractFunction.
// Retries on "pending" responses (Bob may need a tick to process).
export async function queryQubicFunction(
  functionId: number,
  inputBytes: Uint8Array = new Uint8Array(0),
  maxRetries = 20,
): Promise<Uint8Array> {
  const nonce = (Math.random() * 0xffffffff) >>> 0;
  const data = bytesToHex(inputBytes);

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 300));

    const res = await fetch(`${QUBIC_INDEXER_URL}/querySmartContract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nonce, scIndex: QSB_CONTRACT_INDEX, funcNumber: functionId, data }),
    });

    if (!res.ok) throw new Error(`querySmartContract HTTP ${res.status}`);

    const body = (await res.json()) as { data?: string; error?: string };
    if (body.error === "pending") continue;
    if (typeof body.data !== "string") throw new Error(`querySmartContract: unexpected response`);
    return hexToBytes(body.data);
  }

  throw new Error(
    `querySmartContract func=${functionId}: still pending after ${maxRetries} retries`,
  );
}

export interface QubicConfig {
  adminBytes: Uint8Array;
  protocolFeeRecipientBytes: Uint8Array;
  oracleFeeRecipientBytes: Uint8Array;
  bpsFee: number;
  protocolFee: number;
  oracleCount: number;
  pauserCount: number;
  oracleThreshold: number;
  paused: boolean;
  orderEra: number;
}

export async function queryGetConfig(): Promise<QubicConfig> {
  const data = await queryQubicFunction(1);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  return {
    adminBytes: data.slice(0, 32),
    protocolFeeRecipientBytes: data.slice(32, 64),
    oracleFeeRecipientBytes: data.slice(64, 96),
    bpsFee: view.getUint32(96, true),
    protocolFee: view.getUint32(100, true),
    oracleCount: view.getUint32(104, true),
    pauserCount: view.getUint32(108, true),
    oracleThreshold: data[112],
    paused: data[113] !== 0,
    orderEra: view.getUint32(116, true),
  };
}

export async function queryIsOracle(accountBytes: Uint8Array): Promise<boolean> {
  const data = await queryQubicFunction(2, accountBytes.slice(0, 32));
  return data[0] !== 0;
}

export async function queryIsPauser(accountBytes: Uint8Array): Promise<boolean> {
  const data = await queryQubicFunction(3, accountBytes.slice(0, 32));
  return data[0] !== 0;
}

export async function queryGetOracles(): Promise<string[]> {
  const data = await queryQubicFunction(7);
  const count = new DataView(data.buffer, data.byteOffset).getUint32(0, true);
  const result: string[] = [];
  for (let i = 0; i < count && i < 64; i++) {
    result.push(bytesToPublicId(data.slice(8 + i * 32, 8 + (i + 1) * 32)));
  }
  return result;
}

export async function queryGetPausers(): Promise<string[]> {
  const data = await queryQubicFunction(8);
  const count = new DataView(data.buffer, data.byteOffset).getUint32(0, true);
  const result: string[] = [];
  for (let i = 0; i < count && i < 32; i++) {
    result.push(bytesToPublicId(data.slice(8 + i * 32, 8 + (i + 1) * 32)));
  }
  return result;
}
