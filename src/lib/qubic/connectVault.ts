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

  const allSeeds = vault.getSeeds();
  if (!allSeeds.length) throw new Error("Vault unlocked but contains no seeds.");

  const seeds = allSeeds.filter((s) => !s.isOnlyWatch);
  if (!seeds.length)
    throw new Error(
      "This vault only contains watch-only accounts. Import a vault with a spendable seed.",
    );

  const derived = await Promise.allSettled(
    seeds.map(async (seed): Promise<QubicAccount> => {
      const revealed = await vault.revealSeed(seed.publicId);
      const identity = await deriveIdentityFromSeed(revealed);
      const snapshot = await fetchIdentitySnapshot(identity.publicId).catch(() => null);
      return {
        address: identity.publicId,
        name: seed.alias ?? seed.publicId,
        amount: extractBalanceAmount(snapshot),
      };
    }),
  );

  const errors = derived.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  errors.forEach((r) => console.error("[Qubic] vault seed derivation failed:", r.reason));

  const usable = derived
    .filter((r): r is PromiseFulfilledResult<QubicAccount> => r.status === "fulfilled")
    .map((r) => r.value);

  if (!usable.length) {
    const reason =
      errors[0]?.reason instanceof Error
        ? errors[0].reason.message
        : String(errors[0]?.reason ?? "unknown error");
    throw new Error(`Unable to derive any accounts from this vault: ${reason}`);
  }

  return {
    session: { kind: "local", method: "vault", address: usable[0].address },
    accounts: usable,
  };
}
