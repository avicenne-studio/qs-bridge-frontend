import { QubicVault } from "@qubic-lib/qubic-ts-vault-library";
import {
  deriveIdentityFromSeed,
  extractBalanceAmount,
  fetchIdentitySnapshot,
} from "../qubicIdentity";
import type { QubicAccount, QubicSession } from "./types";
import type { Address } from "viem";

export async function connectViaVaultFile(
  file: File,
  password: string,
): Promise<{
  session: QubicSession;
  accounts: QubicAccount[];
  warnings?: string[];
}> {
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

  const usable: QubicAccount[] = [];
  const errors: Error[] = [];

  for (const seed of seeds) {
    try {
      const revealed = await vault.revealSeed(seed.publicId);
      const identity = await deriveIdentityFromSeed(revealed);
      const snapshot = await fetchIdentitySnapshot(identity.publicId).catch(() => null);

      usable.push({
        address: identity.publicId,
        name: seed.alias ?? seed.publicId,
        amount: extractBalanceAmount(snapshot),
      });
    } catch (err) {
      errors.push(err instanceof Error ? err : new Error(String(err)));
    }
  }

  if (!usable.length) {
    throw new Error(
      `Unable to derive any accounts from this vault: ${errors[0]?.message ?? "unknown error"}`,
    );
  }

  const warnings = errors.map((e) => e.message);

  return {
    session: { kind: "local", method: "vault", address: usable[0].address as Address },
    accounts: usable,
    ...(warnings.length ? { warnings } : {}),
  };
}
