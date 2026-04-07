import type { Address } from "viem";
import {
  deriveIdentityFromSeed,
  deriveIdentityFromPrivateKey,
  extractBalanceAmount,
  fetchIdentitySnapshot,
  isQubicSeed,
  isHexPrivateKey,
} from "../qubicIdentity";
import type { QubicAccount, QubicSession } from "./types";

export async function connectViaSeed(
  rawSeed: string,
): Promise<{ session: QubicSession; accounts: QubicAccount[] }> {
  const trimmed = rawSeed.trim();
  const normalized = trimmed.toLowerCase();

  let publicId: string;
  let privateKeyHex: string;

  if (isQubicSeed(normalized)) {
    const identity = await deriveIdentityFromSeed(normalized);
    publicId = identity.publicId;
    privateKeyHex = identity.privateKeyHex;
  } else if (isHexPrivateKey(trimmed)) {
    const identity = await deriveIdentityFromPrivateKey(trimmed.replace(/^0x/, ""));
    publicId = identity.publicId;
    privateKeyHex = identity.privateKeyHex;
  } else {
    throw new Error("Invalid seed. Enter a 55+ character Qubic seed or a 64-char hex private key.");
  }

  const snapshot = await fetchIdentitySnapshot(publicId).catch(() => null);
  const amount = extractBalanceAmount(snapshot);

  const acc: QubicAccount = {
    address: publicId,
    name: "Imported seed",
    amount,
  };

  return {
    session: { kind: "local", method: "seed", address: publicId as Address, privateKeyHex },
    accounts: [acc],
  };
}
