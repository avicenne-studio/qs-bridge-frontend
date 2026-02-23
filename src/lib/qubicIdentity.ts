import type { IGetBalanceByIdentity, IGetOwnedAssets } from "@ardata-tech/qubic-js/dist/types";
import { getQubicClient } from "./qubicClient";

export type DerivedIdentity = {
  publicId: string;
  publicKeyHex: string;
  privateKeyHex: string;
};

export type IdentitySnapshot = {
  balance?: IGetBalanceByIdentity["balance"];
  ownedAssets?: IGetOwnedAssets["ownedAssets"];
};

export const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.replace(/^0x/, "");
  if (clean.length % 2 !== 0) throw new Error("Hex string length must be even.");
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }
  return bytes;
};

export const isQubicSeed = (v: string) => /^[a-z]{55,}$/.test(v);
export const isHexPrivateKey = (v: string) => /^(0x)?[0-9a-fA-F]{64}$/.test(v);

export const deriveIdentityFromSeed = async (seed: string): Promise<DerivedIdentity> => {
  const qubic = getQubicClient();
  const identity = await qubic.identity.createIdentity(seed);
  return {
    publicId: identity.publicId,
    publicKeyHex: bytesToHex(identity.publicKey),
    privateKeyHex: bytesToHex(identity.privateKey),
  };
};

export const deriveIdentityFromPrivateKey = async (
  privateKeyHex: string,
): Promise<DerivedIdentity> => {
  const qubic = getQubicClient();
  const identity = await qubic.identity.loadIdentityFromPrivateKey(hexToBytes(privateKeyHex));
  return {
    publicId: identity.publicId,
    publicKeyHex: bytesToHex(identity.publicKey),
    privateKeyHex: bytesToHex(identity.privateKey),
  };
};

export const fetchIdentitySnapshot = async (publicId: string): Promise<IdentitySnapshot> => {
  const qubic = getQubicClient();
  const [balance, ownedAssets] = await Promise.all([
    qubic.identity.getBalanceByIdentity(publicId).catch(() => undefined),
    qubic.identity.getOwnedAssets(publicId).catch(() => undefined),
  ]);

  return {
    balance: balance?.balance,
    ownedAssets: ownedAssets?.ownedAssets,
  };
};

export function extractBalanceAmount(snapshot: IdentitySnapshot | null): number | undefined {
  if (!snapshot?.balance) return undefined;
  const bal = snapshot.balance as Record<string, unknown>;
  const raw = bal.balance ?? bal.amount ?? bal.value;
  return typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : undefined;
}
