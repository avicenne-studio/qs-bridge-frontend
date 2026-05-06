// Role constants — match the Role enum in QubicSolanaBridge.h
export const QUBIC_ROLE_ORACLE = 1;
export const QUBIC_ROLE_PAUSER = 2;

// Procedure input types — match REGISTER_USER_PROCEDURE indices
export const PROC_TRANSFER_ADMIN = 10;
export const PROC_EDIT_ORACLE_THRESHOLD = 11;
export const PROC_ADD_ROLE = 12;
export const PROC_REMOVE_ROLE = 13;
export const PROC_PAUSE = 14;
export const PROC_UNPAUSE = 15;
export const PROC_EDIT_FEE_PARAMETERS = 16;

// AddRole_input: id account (32B) + uint8 role (1B) = 33 bytes
export function buildAddRolePayload(accountBytes: Uint8Array, role: number): Uint8Array {
  const buf = new Uint8Array(33);
  buf.set(accountBytes.slice(0, 32), 0);
  buf[32] = role;
  return buf;
}

// RemoveRole_input: id account (32B) + uint8 role (1B) = 33 bytes
export function buildRemoveRolePayload(accountBytes: Uint8Array, role: number): Uint8Array {
  const buf = new Uint8Array(33);
  buf.set(accountBytes.slice(0, 32), 0);
  buf[32] = role;
  return buf;
}

// TransferAdmin_input: id newAdmin (32B)
export function buildTransferAdminPayload(newAdminBytes: Uint8Array): Uint8Array {
  const buf = new Uint8Array(32);
  buf.set(newAdminBytes.slice(0, 32), 0);
  return buf;
}

// EditOracleThreshold_input: uint8 newThreshold (1B)
export function buildEditThresholdPayload(threshold: number): Uint8Array {
  return new Uint8Array([threshold & 0xff]);
}

// EditFeeParameters_input:
//   id protocolFeeRecipient (32B) + id oracleFeeRecipient (32B)
//   + uint32 bpsFee (4B LE) + uint32 protocolFee (4B LE) = 72 bytes
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

// Converts 32 raw bytes to a 60-char Qubic publicId string (base-26 LE, uppercase).
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

// Converts a Qubic publicId string (60 chars, upper or lower case) to 32-byte public key.
// Implements the same base-26 decoding as QubicHelper.getIdentityBytes.
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
