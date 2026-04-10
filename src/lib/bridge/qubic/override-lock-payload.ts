/**
 * Builds OverrideLock_input (76 bytes) for the QSB contract.
 *
 * Layout (little-endian):
 *   [0..63]   uint8[64] toAddress (ASCII, zero-padded)
 *   [64..71]  uint64    relayerFee
 *   [72..75]  uint32    nonce
 */
export function buildOverrideLockPayload(
  toAddress: string,
  relayerFee: bigint,
  nonce: number,
): Uint8Array {
  const buf = new ArrayBuffer(76);
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);

  const addrBytes = new TextEncoder().encode(toAddress.slice(0, 64));
  bytes.set(addrBytes, 0);

  view.setBigUint64(64, relayerFee, true);
  view.setUint32(72, nonce, true);

  return bytes;
}
