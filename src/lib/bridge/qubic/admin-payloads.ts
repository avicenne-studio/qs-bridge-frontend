export const QUBIC_ROLE_ORACLE = 1;
export const QUBIC_ROLE_PAUSER = 2;

export const PROC_TRANSFER_ADMIN = 10;
export const PROC_EDIT_ORACLE_THRESHOLD = 11;
export const PROC_ADD_ROLE = 12;
export const PROC_REMOVE_ROLE = 13;
export const PROC_PAUSE = 14;
export const PROC_UNPAUSE = 15;
export const PROC_EDIT_FEE_PARAMETERS = 16;

export function buildAddRolePayload(accountBytes: Uint8Array, role: number): Uint8Array {
  const buf = new Uint8Array(33);
  buf.set(accountBytes.slice(0, 32), 0);
  buf[32] = role;
  return buf;
}

export function buildRemoveRolePayload(accountBytes: Uint8Array, role: number): Uint8Array {
  const buf = new Uint8Array(33);
  buf.set(accountBytes.slice(0, 32), 0);
  buf[32] = role;
  return buf;
}

export function buildTransferAdminPayload(newAdminBytes: Uint8Array): Uint8Array {
  const buf = new Uint8Array(32);
  buf.set(newAdminBytes.slice(0, 32), 0);
  return buf;
}

export function buildEditThresholdPayload(threshold: number): Uint8Array {
  return new Uint8Array([threshold & 0xff]);
}

export function buildEditFeeParametersPayload(
  protocolFeeRecipientBytes: Uint8Array,
  oracleFeeRecipientBytes: Uint8Array,
  bpsFee: number,
  protocolFee: number,
): Uint8Array {
  const buf = new ArrayBuffer(72);
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);

  bytes.set(protocolFeeRecipientBytes.slice(0, 32), 0);
  bytes.set(oracleFeeRecipientBytes.slice(0, 32), 32);
  view.setUint32(64, bpsFee, true);
  view.setUint32(68, protocolFee, true);

  return bytes;
}

export function bytesToPublicId(bytes: Uint8Array): string {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let result = "";
  for (let i = 0; i < 4; i++) {
    let value = view.getBigUint64(i * 8, true);
    for (let j = 0; j < 14; j++) {
      result += String.fromCharCode(Number(value % 26n) + 65);
      value /= 26n;
    }
  }
  return result;
}

export function publicIdToBytes(publicId: string): Uint8Array {
  const upper = publicId.toUpperCase();
  const bytes = new Uint8Array(32);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < 4; i++) {
    view.setBigUint64(i * 8, 0n, true);
    for (let j = 14; j-- > 0; ) {
      view.setBigUint64(
        i * 8,
        view.getBigUint64(i * 8, true) * 26n + BigInt(upper.charCodeAt(i * 14 + j)) - 65n,
        true,
      );
    }
  }
  return bytes;
}
