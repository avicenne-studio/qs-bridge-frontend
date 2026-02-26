import type SignClient from "@walletconnect/sign-client";
import type { SessionTypes } from "@walletconnect/types";
import { QUBIC_CHAIN_ID, QUBIC_OPTIONAL_NAMESPACES, parseQubicAccount } from "../qubicWallet";
import type { QubicAccount, QubicSession } from "./types";

const USER_DISCONNECTED = { code: 6000, message: "User disconnected" };

export function hydrateFromWCSession(session: SessionTypes.Struct): QubicSession | null {
  const namespace = session.namespaces?.qubic;
  const primary = parseQubicAccount(namespace?.accounts?.[0] ?? "");

  if (!namespace || !primary) return null;

  return {
    kind: "walletconnect",
    topic: session.topic,
    address: primary.address,
    chainId: primary.chainId,
    expiry: typeof session.expiry === "number" ? session.expiry * 1000 : undefined,
    walletName: session.peer.metadata?.name,
    walletUrl: session.peer.metadata?.url,
  };
}

export async function requestWCAccounts(
  client: SignClient,
  topic: string,
): Promise<QubicAccount[]> {
  const response = await client.request<QubicAccount[]>({
    topic,
    chainId: QUBIC_CHAIN_ID,
    request: { method: "qubic_requestAccounts", params: [] },
  });
  return Array.isArray(response) ? response : [];
}

export async function connectViaWalletConnect(
  client: SignClient,
  currentTopic: string | null,
  onUri: (uri: string) => void,
): Promise<{ session: QubicSession }> {
  if (currentTopic) {
    try {
      await client.disconnect({
        topic: currentTopic,
        reason: USER_DISCONNECTED,
      });
    } catch {
      // Stale session cleanup is best-effort; continue with new pairing
    }
  }

  const { uri, approval } = await client.connect({
    optionalNamespaces: QUBIC_OPTIONAL_NAMESPACES,
  });

  if (uri) onUri(uri);

  const wcSession = await approval();
  const hydrated = hydrateFromWCSession(wcSession);
  if (!hydrated) throw new Error("Could not extract account from WalletConnect session.");
  return { session: hydrated };
}

export async function disconnectWC(client: SignClient, topic: string) {
  await client.disconnect({ topic, reason: USER_DISCONNECTED });
}
