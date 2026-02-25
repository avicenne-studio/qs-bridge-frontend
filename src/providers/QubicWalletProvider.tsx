import {
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import type SignClient from "@walletconnect/sign-client";
import type { SignClientTypes } from "@walletconnect/types";
import { getQubicSignClient, QUBIC_CHAIN_ID, buildQubicDeepLink } from "@/lib/qubicWallet";
import type { QubicAccount, QubicSession, ConnectionMethod } from "@/lib/qubic/types";
import {
  connectViaWalletConnect,
  hydrateFromWCSession,
  requestWCAccounts,
  disconnectWC,
} from "@/lib/qubic/connectWalletConnect";
import { connectViaMetaMask } from "@/lib/qubic/connectMetaMask";
import { connectViaSeed } from "@/lib/qubic/connectSeed";
import { connectViaVaultFile } from "@/lib/qubic/connectVault";
import { fetchIdentitySnapshot, extractBalanceAmount } from "@/lib/qubicIdentity";
import { formatCompactNumber } from "@/utils/format";

export type { QubicAccount, QubicSession, ConnectionMethod };

export interface QubicWalletState {
  ready: boolean;
  connected: boolean;
  connecting: boolean;
  address: string | null;
  balance: string | null;
  method: ConnectionMethod;
  session: QubicSession | null;
  accounts: QubicAccount[];
  walletConnectUri: string | null;
  deepLink: string | null;
  metamaskAvailable: boolean;
  connectWalletConnect: () => Promise<void>;
  cancelPairing: () => void;
  connectMetaMask: () => Promise<void>;
  connectWithSeed: (seed: string) => Promise<void>;
  connectWithVaultFile: (file: File, password: string) => Promise<void>;
  disconnect: () => Promise<void>;
}

const QubicWalletContext = createContext<QubicWalletState | null>(null);

export function useQubicWallet() {
  const ctx = useContext(QubicWalletContext);
  if (!ctx) throw new Error("useQubicWallet must be used within QubicWalletProvider");
  return ctx;
}

const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
if (!PROJECT_ID) throw new Error("VITE_WALLETCONNECT_PROJECT_ID is not set");

const BALANCE_REFRESH_MS = 30_000;

function balanceFromAccounts(accounts: QubicAccount[]): string | null {
  const amount = accounts[0]?.amount;
  return amount != null ? formatCompactNumber(amount) : null;
}

export default function QubicWalletProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<QubicSession | null>(null);
  const [accounts, setAccounts] = useState<QubicAccount[]>([]);
  const [balance, setBalance] = useState<string | null>(null);
  const [walletConnectUri, setWalletConnectUri] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [metamaskAvailable, setMetamaskAvailable] = useState(false);

  const clientRef = useRef<SignClient | null>(null);
  const sessionRef = useRef<QubicSession | null>(null);
  sessionRef.current = session;

  const method: ConnectionMethod = session
    ? session.kind === "walletconnect"
      ? "walletconnect"
      : session.method
    : null;

  const applyConnect = useCallback(
    (result: { session: QubicSession; accounts?: QubicAccount[] }) => {
      setSession(result.session);
      if (result.accounts?.length) {
        setAccounts(result.accounts);
        setBalance(balanceFromAccounts(result.accounts));
      }
    },
    [],
  );

  const resetState = useCallback(() => {
    setSession(null);
    setAccounts([]);
    setBalance(null);
    setWalletConnectUri(null);
  }, []);

  useEffect(() => {
    setMetamaskAvailable(Boolean(window.ethereum?.request));
  }, []);

  const wcTopic = session?.kind === "walletconnect" ? session.topic : null;
  const localAddress = session?.kind === "local" ? session.address : null;

  useEffect(() => {
    if (!wcTopic) return;
    const client = clientRef.current;
    if (!client) return;

    let cancelled = false;

    async function poll() {
      try {
        const accs = await requestWCAccounts(client!, wcTopic!);
        if (cancelled || !accs.length) return;
        setAccounts(accs);
        setBalance(balanceFromAccounts(accs));
      } catch (err) {
        console.error("[Qubic] WC balance poll failed:", err);
      }
    }

    poll();
    const id = setInterval(poll, BALANCE_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [wcTopic]);

  useEffect(() => {
    if (!localAddress) return;

    let cancelled = false;

    async function poll() {
      try {
        const snapshot = await fetchIdentitySnapshot(localAddress!);
        if (cancelled) return;
        const amount = extractBalanceAmount(snapshot);
        if (amount != null) setBalance(formatCompactNumber(amount));
      } catch (err) {
        console.error("[Qubic] local balance poll failed:", err);
      }
    }

    poll();
    const id = setInterval(poll, BALANCE_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [localAddress]);

  useEffect(() => {
    let mounted = true;
    let detach: (() => void) | undefined;

    (async () => {
      try {
        const client = await getQubicSignClient(PROJECT_ID);
        clientRef.current = client;

        if (!mounted) return;
        setReady(true);

        const existing = [...client.session.getAll()]
          .reverse()
          .find((s) => Boolean(s.namespaces?.qubic));

        if (existing) {
          const hydrated = hydrateFromWCSession(existing);
          if (hydrated) setSession(hydrated);
        }

        const onDelete = ({ topic }: SignClientTypes.EventArguments["session_delete"]) => {
          const s = sessionRef.current;
          if (s?.kind === "walletconnect" && s.topic === topic) {
            resetState();
          }
        };

        const onEvent = ({ params }: SignClientTypes.EventArguments["session_event"]) => {
          if (params.chainId !== QUBIC_CHAIN_ID) return;
          const { name, data } = params.event;
          if (
            name === "accountsChanged" ||
            name === "amountChanged" ||
            name === "assetAmountChanged"
          ) {
            if (Array.isArray(data)) {
              const accs = data as QubicAccount[];
              setAccounts(accs);
              setBalance(balanceFromAccounts(accs));
            }
          }
        };

        const onUpdate = ({ topic }: SignClientTypes.EventArguments["session_update"]) => {
          const s = client.session.get(topic);
          if (s) {
            const hydrated = hydrateFromWCSession(s);
            if (hydrated) setSession(hydrated);
          }
        };

        client.on("session_delete", onDelete);
        client.on("session_event", onEvent);
        client.on("session_update", onUpdate);

        detach = () => {
          client.off("session_delete", onDelete);
          client.off("session_event", onEvent);
          client.off("session_update", onUpdate);
        };
      } catch (err) {
        console.error("[Qubic] SignClient init failed:", err);
      }
    })();

    return () => {
      mounted = false;
      detach?.();
    };
  }, []);

  const connectWalletConnect = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;
    setConnecting(true);

    try {
      const currentTopic =
        sessionRef.current?.kind === "walletconnect" ? sessionRef.current.topic : null;
      const result = await connectViaWalletConnect(client, currentTopic, setWalletConnectUri);
      applyConnect(result);
    } catch (err) {
      console.error("[Qubic] WalletConnect pairing failed:", err);
    } finally {
      setWalletConnectUri(null);
      setConnecting(false);
    }
  }, [applyConnect]);

  const cancelPairing = useCallback(() => {
    setWalletConnectUri(null);
    setConnecting(false);
  }, []);

  const connectMetaMask = useCallback(async () => {
    setConnecting(true);
    try {
      applyConnect(await connectViaMetaMask());
    } finally {
      setConnecting(false);
    }
  }, [applyConnect]);

  const connectWithSeed = useCallback(
    async (seed: string) => {
      setConnecting(true);
      try {
        applyConnect(await connectViaSeed(seed));
      } finally {
        setConnecting(false);
      }
    },
    [applyConnect],
  );

  const connectWithVaultFile = useCallback(
    async (file: File, password: string) => {
      setConnecting(true);
      try {
        applyConnect(await connectViaVaultFile(file, password));
      } finally {
        setConnecting(false);
      }
    },
    [applyConnect],
  );

  const disconnect = useCallback(async () => {
    try {
      const s = sessionRef.current;
      if (s?.kind === "walletconnect" && clientRef.current) {
        await disconnectWC(clientRef.current, s.topic).catch(() => {});
      }
    } finally {
      resetState();
    }
  }, [resetState]);

  const deepLink = useMemo(
    () => (walletConnectUri ? buildQubicDeepLink(walletConnectUri) : null),
    [walletConnectUri],
  );

  const value = useMemo<QubicWalletState>(
    () => ({
      ready,
      connected: !!session?.address,
      connecting,
      address: session?.address ?? null,
      balance,
      method,
      session,
      accounts,
      walletConnectUri,
      deepLink,
      metamaskAvailable,
      connectWalletConnect,
      cancelPairing,
      connectMetaMask,
      connectWithSeed,
      connectWithVaultFile,
      disconnect,
    }),
    [
      ready,
      session,
      connecting,
      balance,
      method,
      accounts,
      walletConnectUri,
      deepLink,
      metamaskAvailable,
      connectWalletConnect,
      cancelPairing,
      connectMetaMask,
      connectWithSeed,
      connectWithVaultFile,
      disconnect,
    ],
  );

  return <QubicWalletContext.Provider value={value}>{children}</QubicWalletContext.Provider>;
}
