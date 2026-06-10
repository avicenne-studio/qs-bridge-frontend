import { PublicKey } from "@solana/web3.js";

const QUBIC_IDENTITY_RE = /^[A-Z]{60}$/;

export function isValidQubicAddress(address: string): boolean {
  return QUBIC_IDENTITY_RE.test(address);
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
