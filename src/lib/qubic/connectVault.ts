import { QubicVault } from "@qubic-lib/qubic-ts-vault-library";
import {
  deriveIdentityFromSeed,
  extractBalanceAmount,
  fetchIdentitySnapshot,
} from "../qubicIdentity";
import type { QubicAccount, QubicSession } from "./types";

export async function connectViaVaultFile(
  file: File,
  password: string,
): Promise<{ session: QubicSession; accounts: QubicAccount[] }> {
  if (!password.trim()) throw new Error("Password is required to unlock the vault.");

  const vault = new QubicVault();
  await vault.importAndUnlock(true, password, null, file);

  const seeds = vault.getSeeds().filter((s) => !s.isOnlyWatch);
  if (!seeds.length) throw new Error("Vault unlocked but contains no spendable seeds.");

  const derived = await Promise.all(
    seeds.map(async (seed): Promise<QubicAccount | null> => {
      try {
        const revealed = await vault.revealSeed(seed.publicId);
        const identity = await deriveIdentityFromSeed(revealed);
        const snapshot = await fetchIdentitySnapshot(identity.publicId).catch(() => null);
        return {
          address: identity.publicId,
          name: seed.alias ?? seed.publicId,
          amount: extractBalanceAmount(snapshot),
        };
      } catch (err) {
        console.error("[Qubic] vault seed derivation failed:", seed.publicId, err);
        return null;
      }
    }),
  );

  const usable = derived.filter((a): a is QubicAccount => a !== null);
  if (!usable.length) throw new Error("Unable to derive any accounts from this vault.");

  return {
    session: { kind: "local", method: "vault", address: usable[0].address },
    accounts: usable,
  };
}
