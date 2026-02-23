import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import type SignClient from "@walletconnect/sign-client";
import type { SessionTypes, SignClientTypes } from "@walletconnect/types";
import {
  getQubicSignClient,
  QUBIC_OPTIONAL_NAMESPACES,
  parseQubicAccount,
  buildQubicDeepLink,
} from "@/lib/qubicWallet";
import { formatCompactNumber } from "@/utils/format";

export type QubicAccount = {
  address: string;
  name?: string;
  amount?: number;
};

export type QubicSession = {
  topic: string;
  address: string;
  chainId: string;
  expiry?: number;
  walletName?: string;
  walletUrl?: string;
  accounts?: QubicAccount[];
};

interface QubicWalletState {
  ready: boolean;
  connected: boolean;
  connecting: boolean;
  address: string | null;
  balance: string | null;
  session: QubicSession | null;
  accounts: QubicAccount[];
  walletConnectUri: string | null;
  deepLink: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  cancelPairing: () => void;
}

const QubicWalletContext = createContext<QubicWalletState | null>(null);

export function useQubicWallet() {
  const ctx = useContext(QubicWalletContext);
  if (!ctx) throw new Error("useQubicWallet must be used within QubicWalletProvider");
  return ctx;
}

const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
if (!PROJECT_ID) throw new Error("VITE_WALLETCONNECT_PROJECT_ID is not set");

const USER_DISCONNECTED = { code: 6000, message: "User disconnected" };

const BALANCE_REFRESH_INTERVAL_MS = 30_000;

function hydrateFromSession(session: SessionTypes.Struct): QubicSession | null {
  const namespace = session.namespaces?.qubic;
  const primaryAccount = parseQubicAccount(namespace?.accounts?.[0] ?? "");
  if (!namespace || !primaryAccount) return null;

  return {
    topic: session.topic,
    address: primaryAccount.address,
    chainId: primaryAccount.chainId,
    expiry: typeof session.expiry === "number" ? session.expiry * 1000 : undefined,
    walletName: session.peer.metadata?.name,
    walletUrl: session.peer.metadata?.url,
  };
}

async function requestAccounts(client: SignClient, topic: string): Promise<QubicAccount[]> {
  const response = await client.request<QubicAccount[]>({
    topic,
    chainId: "qubic:mainnet",
    request: { method: "qubic_requestAccounts", params: [] },
  });
  return Array.isArray(response) ? (response as QubicAccount[]) : [];
}

export default function QubicWalletProvider({ children }: { children: ReactNode }) {
  const [signClient, setSignClient] = useState<SignClient | null>(null);
  const [ready, setReady] = useState(false);
  const [qubicSession, setQubicSession] = useState<QubicSession | null>(null);
  const [walletConnectUri, setWalletConnectUri] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);

  const signClientRef = useRef<SignClient | null>(null);
  const sessionRef = useRef<QubicSession | null>(null);

  useEffect(() => {
    sessionRef.current = qubicSession;
  }, [qubicSession]);

  useEffect(() => {
    if (!signClient || !qubicSession) {
      setBalance(null);
      return;
    }

    const { topic } = qubicSession;
    let cancelled = false;

    async function fetchBalance() {
      try {
        const accounts = await requestAccounts(signClient!, topic);
        if (cancelled || accounts.length === 0) return;
        const amount = accounts[0]?.amount;
        setBalance(amount != null ? formatCompactNumber(amount) : null);
        setQubicSession((prev) => (prev ? { ...prev, accounts } : prev));
      } catch {
        // silent — network or wallet error
      }
    }

    fetchBalance();
    const id = setInterval(fetchBalance, BALANCE_REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [qubicSession?.topic, signClient]);

  useEffect(() => {
    let isMounted = true;
    let detach: (() => void) | undefined;

    (async () => {
      try {
        const client = await getQubicSignClient(PROJECT_ID);

        signClientRef.current = client;
        setSignClient(client);
        setReady(true);

        if (!isMounted) return;

        const activeSession = [...client.session.getAll()]
          .reverse()
          .find((s) => Boolean(s.namespaces?.qubic));

        if (activeSession) {
          const hydrated = hydrateFromSession(activeSession);
          if (hydrated) {
            setQubicSession(hydrated);
          }
        }

        const handleSessionDelete = ({
          topic,
        }: SignClientTypes.EventArguments["session_delete"]) => {
          if (sessionRef.current?.topic === topic) {
            setQubicSession(null);
            setWalletConnectUri(null);
          }
        };

        const handleSessionEvent = ({
          params,
        }: SignClientTypes.EventArguments["session_event"]) => {
          if (params.chainId !== "qubic:mainnet") return;
          const { name, data } = params.event;
          if (
            name === "accountsChanged" ||
            name === "amountChanged" ||
            name === "assetAmountChanged"
          ) {
            if (Array.isArray(data)) {
              const accounts = data as QubicAccount[];
              setQubicSession((prev) => (prev ? { ...prev, accounts } : prev));
              const amount = accounts[0]?.amount;
              setBalance(amount != null ? formatCompactNumber(amount) : null);
            }
          }
        };

        const handleSessionUpdate = ({
          topic,
        }: SignClientTypes.EventArguments["session_update"]) => {
          const session = client.session.get(topic);
          if (session) {
            const hydrated = hydrateFromSession(session);
            if (hydrated) {
              setQubicSession((prev) => ({
                ...hydrated,
                accounts: prev?.accounts,
              }));
            }
          }
        };

        client.on("session_delete", handleSessionDelete);
        client.on("session_event", handleSessionEvent);
        client.on("session_update", handleSessionUpdate);

        detach = () => {
          client.off("session_delete", handleSessionDelete);
          client.off("session_event", handleSessionEvent);
          client.off("session_update", handleSessionUpdate);
        };
      } catch {
        if (!isMounted) return;
      }
    })();

    return () => {
      isMounted = false;
      detach?.();
    };
  }, []);

  const connect = useCallback(async () => {
    const client = signClientRef.current;
    if (!client) return;

    setConnecting(true);

    try {
      if (sessionRef.current?.topic) {
        try {
          await client.disconnect({
            topic: sessionRef.current.topic,
            reason: USER_DISCONNECTED,
          });
        } catch {
          // ignore stale session errors
        }
      }

      const { uri, approval } = await client.connect({
        optionalNamespaces: QUBIC_OPTIONAL_NAMESPACES,
      });

      if (uri) setWalletConnectUri(uri);

      const session = await approval();
      setWalletConnectUri(null);

      const hydrated = hydrateFromSession(session);
      if (hydrated) {
        setQubicSession(hydrated);
      }
    } catch {
      setWalletConnectUri(null);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;

    const client = signClientRef.current;
    if (client) {
      try {
        await client.disconnect({ topic: session.topic, reason: USER_DISCONNECTED });
      } catch {
        // ignore
      }
    }

    setQubicSession(null);
    setWalletConnectUri(null);
  }, []);

  const cancelPairing = useCallback(() => {
    setWalletConnectUri(null);
    setConnecting(false);
  }, []);

  const deepLink = useMemo(
    () => (walletConnectUri ? buildQubicDeepLink(walletConnectUri) : null),
    [walletConnectUri],
  );

  const value = useMemo<QubicWalletState>(
    () => ({
      ready,
      connected: !!qubicSession?.address,
      connecting,
      address: qubicSession?.address ?? null,
      balance,
      session: qubicSession,
      accounts: qubicSession?.accounts ?? [],
      walletConnectUri,
      deepLink,
      connect,
      disconnect,
      cancelPairing,
    }),
    [
      ready,
      qubicSession,
      connecting,
      balance,
      walletConnectUri,
      deepLink,
      connect,
      disconnect,
      cancelPairing,
    ],
  );

  return <QubicWalletContext.Provider value={value}>{children}</QubicWalletContext.Provider>;
}
