import {
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { buildQubicDeepLink } from "@/lib/qubicWallet";
import type { QubicAccount, QubicSession, ConnectionMethod } from "@/lib/qubic/types";
import { connectViaWalletConnect, disconnectWC } from "@/lib/qubic/connectWalletConnect";
import { connectViaMetaMask } from "@/lib/qubic/connectMetaMask";
import { connectViaSeed } from "@/lib/qubic/connectSeed";
import { connectViaVaultFile } from "@/lib/qubic/connectVault";
import { useQubicSignClient } from "@/hooks/useQubicSignClient";
import { useWCBalancePolling, useLocalBalancePolling } from "@/hooks/useBalancePolling";
import type { Address } from "viem";

export type { QubicAccount, QubicSession, ConnectionMethod };

export interface QubicWalletState {
  ready: boolean;
  connected: boolean;
  connecting: boolean;
  address: Address | null;
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

const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string;

export default function QubicWalletProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<QubicSession | null>(null);
  const [accounts, setAccounts] = useState<QubicAccount[]>([]);
  const [balance, setBalance] = useState<string | null>(null);
  const [walletConnectUri, setWalletConnectUri] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [metamaskAvailable, setMetamaskAvailable] = useState(false);

  const sessionRef = useRef<QubicSession | null>(null);
  sessionRef.current = session;

  const method: ConnectionMethod = session
    ? session.kind === "walletconnect"
      ? "walletconnect"
      : session.method
    : null;

  function resetState() {
    setSession(null);
    setAccounts([]);
    setBalance(null);
    setWalletConnectUri(null);
  }

  function applyConnect(result: { session: QubicSession; accounts?: QubicAccount[] }) {
    setSession(result.session);
    if (result.accounts?.length) {
      setAccounts(result.accounts);
      const amount = result.accounts[0]?.amount;
      setBalance(amount != null ? String(amount) : null);
    }
  }

  const { ready, restoredSession, getClient } = useQubicSignClient({
    projectId: PROJECT_ID,
    onSessionDelete: (topic) => {
      const s = sessionRef.current;
      if (s?.kind === "walletconnect" && s.topic === topic) resetState();
    },
    onAccountsChanged: (accs) => {
      setAccounts(accs);
      const amount = accs[0]?.amount;
      setBalance(amount != null ? String(amount) : null);
    },
    onSessionUpdate: setSession,
  });

  useEffect(() => {
    if (restoredSession) setSession(restoredSession);
  }, [restoredSession]);

  useEffect(() => {
    setMetamaskAvailable(Boolean(window.ethereum?.request));
  }, []);

  const wcTopic = session?.kind === "walletconnect" ? session.topic : null;
  const localAddress = session?.kind === "local" ? session.address : null;

  const wcPolling = useWCBalancePolling(getClient, wcTopic);
  const localPolling = useLocalBalancePolling(localAddress);

  useEffect(() => {
    if (wcTopic) {
      setAccounts(wcPolling.accounts);
      setBalance(wcPolling.balance);
    }
  }, [wcTopic, wcPolling.accounts, wcPolling.balance]);

  useEffect(() => {
    if (localAddress) setBalance(localPolling.balance);
  }, [localAddress, localPolling.balance]);

  async function handleConnectWalletConnect() {
    const client = getClient();
    if (!client) return;
    setConnecting(true);

    try {
      const currentTopic =
        sessionRef.current?.kind === "walletconnect" ? sessionRef.current.topic : null;
      const result = await connectViaWalletConnect(client, currentTopic, setWalletConnectUri);
      applyConnect(result);
    } finally {
      setWalletConnectUri(null);
      setConnecting(false);
    }
  }

  function cancelPairing() {
    setWalletConnectUri(null);
    setConnecting(false);
  }

  async function handleConnectMetaMask() {
    setConnecting(true);
    try {
      applyConnect(await connectViaMetaMask());
    } finally {
      setConnecting(false);
    }
  }

  async function handleConnectWithSeed(seed: string) {
    setConnecting(true);
    try {
      applyConnect(await connectViaSeed(seed));
    } finally {
      setConnecting(false);
    }
  }

  async function handleConnectWithVaultFile(file: File, password: string) {
    setConnecting(true);
    try {
      applyConnect(await connectViaVaultFile(file, password));
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    try {
      const s = sessionRef.current;
      const client = getClient();
      if (s?.kind === "walletconnect" && client) {
        await disconnectWC(client, s.topic).catch(() => {});
      }
    } finally {
      resetState();
    }
  }

  const deepLink = walletConnectUri ? buildQubicDeepLink(walletConnectUri) : null;

  const value: QubicWalletState = {
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
    connectWalletConnect: handleConnectWalletConnect,
    cancelPairing,
    connectMetaMask: handleConnectMetaMask,
    connectWithSeed: handleConnectWithSeed,
    connectWithVaultFile: handleConnectWithVaultFile,
    disconnect: handleDisconnect,
  };

  return <QubicWalletContext.Provider value={value}>{children}</QubicWalletContext.Provider>;
}
