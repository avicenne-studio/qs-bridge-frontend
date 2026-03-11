const QUBIC_IDENTITY_RE = /^[A-Z]{60}$/;

export function qubicIdentityToBytes(identity: string): Uint8Array {
  if (!QUBIC_IDENTITY_RE.test(identity)) {
    throw new Error(`Invalid Qubic identity: expected 60 uppercase chars, got "${identity}"`);
  }

  const bytes = new Uint8Array(32);
  const view = new DataView(bytes.buffer);
  const charCodeA = "A".charCodeAt(0);

  for (let i = 0; i < 4; i++) {
    view.setBigUint64(i * 8, 0n, true);
    for (let j = 14; j-- > 0; ) {
      view.setBigUint64(
        i * 8,
        view.getBigUint64(i * 8, true) * 26n + BigInt(identity.charCodeAt(i * 14 + j) - charCodeA),
        true,
      );
    }
  }

  return bytes;
}
