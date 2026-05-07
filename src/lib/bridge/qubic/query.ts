import { QSB_CONTRACT_INDEX, QUBIC_NODE_RPC_URL } from "./constants";
import { bytesToPublicId } from "./admin-payloads";

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function queryQubicFunction(
  functionId: number,
  inputBytes: Uint8Array = new Uint8Array(0),
): Promise<Uint8Array> {
  const res = await fetch(`${QUBIC_NODE_RPC_URL}/live/v1/querySmartContract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contractIndex: QSB_CONTRACT_INDEX,
      inputType: functionId,
      inputHex: bytesToHex(inputBytes),
    }),
  });

  if (!res.ok) throw new Error(`querySmartContract HTTP ${res.status}`);

  const body = (await res.json()) as { responseData: string };
  return Uint8Array.from(atob(body.responseData), (c) => c.charCodeAt(0));
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
    orderEra: view.getUint32(114, true),
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
    result.push(bytesToPublicId(data.slice(4 + i * 32, 4 + (i + 1) * 32)));
  }
  return result;
}

export async function queryGetPausers(): Promise<string[]> {
  const data = await queryQubicFunction(8);
  const count = new DataView(data.buffer, data.byteOffset).getUint32(0, true);
  const result: string[] = [];
  for (let i = 0; i < count && i < 32; i++) {
    result.push(bytesToPublicId(data.slice(4 + i * 32, 4 + (i + 1) * 32)));
  }
  return result;
}
