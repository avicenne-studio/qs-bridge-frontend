/**
 * Builds Lock_input (88 bytes) for the QSB contract.
 *
 * Layout (little-endian):
 *   [0..7]    uint64  amount
 *   [8..15]   uint64  relayerFee
 *   [16..79]  uint8[64] toAddress (ASCII, zero-padded)
 *   [80..83]  uint32  networkOut
 *   [84..87]  uint32  nonce
 */
export function buildLockPayload(
  amount: bigint,
  relayerFee: bigint,
  toAddress: string,
  networkOut: number,
  nonce: number,
): Uint8Array {
  const buf = new ArrayBuffer(88);
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);

  view.setBigUint64(0, amount, true);
  view.setBigUint64(8, relayerFee, true);

  const addrBytes = new TextEncoder().encode(toAddress.slice(0, 64));
  bytes.set(addrBytes, 16);

  view.setUint32(80, networkOut, true);
  view.setUint32(84, nonce, true);

  return bytes;
}
