import { QSB_CONTRACT_INDEX, QUBIC_NODE_RPC_URL } from "./constants";

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

// GetConfig_output layout (118 bytes, all little-endian):
//   [0..31]   id admin
//   [32..63]  id protocolFeeRecipient
//   [64..95]  id oracleFeeRecipient
//   [96..99]  uint32 bpsFee
//   [100..103] uint32 protocolFee
//   [104..107] uint32 oracleCount
//   [108..111] uint32 pauserCount
//   [112]     uint8 oracleThreshold
//   [113]     bit paused (1 byte)
//   [114..117] uint32 orderEra
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

// IsOracle_input: id account (32B) → IsOracle_output: bit isOracle (1B)
export async function queryIsOracle(accountBytes: Uint8Array): Promise<boolean> {
  const data = await queryQubicFunction(2, accountBytes.slice(0, 32));
  return data[0] !== 0;
}

// IsPauser_input: id account (32B) → IsPauser_output: bit isPauser (1B)
export async function queryIsPauser(accountBytes: Uint8Array): Promise<boolean> {
  const data = await queryQubicFunction(3, accountBytes.slice(0, 32));
  return data[0] !== 0;
}
