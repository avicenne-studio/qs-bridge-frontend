import { extractBalanceAmount, fetchIdentitySnapshot } from "../qubicIdentity";
import type { QubicAccount, QubicSession } from "./types";

const SNAP_ID = import.meta.env.VITE_QUBIC_SNAP_ID as string;
const SNAP_VERSION = import.meta.env.VITE_QUBIC_SNAP_VERSION as string;

export async function connectViaMetaMask(): Promise<{
  session: QubicSession;
  accounts: QubicAccount[];
}> {
  const provider = window.ethereum;
  if (!provider?.request) throw new Error("MetaMask not found.");

  await provider.request({
    method: "wallet_requestSnaps",
    params: { [SNAP_ID]: { version: SNAP_VERSION } },
  });

  const snaps = (await provider.request({
    method: "wallet_getSnaps",
  })) as Record<string, { id: string }>;
  const resolvedId = Object.values(snaps ?? {}).find((s) => s.id === SNAP_ID)?.id ?? SNAP_ID;

  let accounts = await tryRequestAccounts(provider, resolvedId);

  if (!accounts?.length) {
    const publicId = (await provider.request({
      method: "wallet_invokeSnap",
      params: {
        snapId: resolvedId,
        request: {
          method: "getPublicId",
          params: { accountIdx: 0, confirm: false },
        },
      },
    })) as string;

    if (typeof publicId === "string" && publicId.length) {
      accounts = [{ address: publicId, name: "Qubic Snap" }];
    }
  }

  if (!accounts?.length) throw new Error("Qubic Snap returned no accounts.");

  const snapshot = await fetchIdentitySnapshot(accounts[0].address).catch(() => null);
  const amount = extractBalanceAmount(snapshot);

  const enriched = accounts.map((a, i) => (i === 0 && amount != null ? { ...a, amount } : a));

  return {
    session: {
      kind: "local",
      method: "metamask",
      address: enriched[0].address,
    },
    accounts: enriched,
  };
}

async function tryRequestAccounts(
  provider: NonNullable<typeof window.ethereum>,
  snapId: string,
): Promise<QubicAccount[] | undefined> {
  try {
    return (await provider.request({
      method: "wallet_invokeSnap",
      params: {
        snapId,
        request: { method: "qubic_requestAccounts", params: {} },
      },
    })) as QubicAccount[];
  } catch (e) {
    const code = (e as { code?: number }).code;
    if (code !== -32601 && code !== -32603) throw e;
    console.error("[Qubic] qubic_requestAccounts not supported by snap, falling back:", code);
    return undefined;
  }
}
