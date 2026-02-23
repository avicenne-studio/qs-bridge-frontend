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
  const normalized = rawSeed.trim().toLowerCase();

  let publicId: string;

  if (isQubicSeed(normalized)) {
    const identity = await deriveIdentityFromSeed(normalized);
    publicId = identity.publicId;
  } else if (isHexPrivateKey(rawSeed.trim())) {
    const identity = await deriveIdentityFromPrivateKey(rawSeed.trim().replace(/^0x/, ""));
    publicId = identity.publicId;
  } else {
    throw new Error("Invalid seed. Enter a 55+ character Qubic seed or a 64-char hex private key.");
  }

  const snapshot = await fetchIdentitySnapshot(publicId).catch(() => null);
  const amount = extractBalanceAmount(snapshot);

  const acc: QubicAccount = { address: publicId, name: "Imported seed", amount };

  return {
    session: { kind: "local", method: "seed", address: publicId },
    accounts: [acc],
  };
}
