import { useEffect, useRef, useState } from "react";
import type SignClient from "@walletconnect/sign-client";
import type { SignClientTypes } from "@walletconnect/types";
import { getQubicSignClient, QUBIC_CHAIN_ID } from "@/lib/qubicWallet";
import { hydrateFromWCSession } from "@/lib/qubic/connectWalletConnect";
import type { QubicAccount, QubicSession } from "@/lib/qubic/types";

interface UseQubicSignClientOptions {
  projectId: string;
  onSessionDelete: (topic: string) => void;
  onAccountsChanged: (accounts: QubicAccount[]) => void;
  onSessionUpdate: (session: QubicSession) => void;
}

export function useQubicSignClient({
  projectId,
  onSessionDelete,
  onAccountsChanged,
  onSessionUpdate,
}: UseQubicSignClientOptions) {
  const [ready, setReady] = useState(false);
  const [restoredSession, setRestoredSession] = useState<QubicSession | null>(null);
  const clientRef = useRef<SignClient | null>(null);

  const onSessionDeleteRef = useRef(onSessionDelete);
  onSessionDeleteRef.current = onSessionDelete;
  const onAccountsChangedRef = useRef(onAccountsChanged);
  onAccountsChangedRef.current = onAccountsChanged;
  const onSessionUpdateRef = useRef(onSessionUpdate);
  onSessionUpdateRef.current = onSessionUpdate;

  function getClient() {
    return clientRef.current;
  }

  useEffect(() => {
    let mounted = true;
    let detach: (() => void) | undefined;

    (async () => {
      const client = await getQubicSignClient(projectId);
      clientRef.current = client;

      if (!mounted) return;
      setReady(true);

      const existing = [...client.session.getAll()]
        .reverse()
        .find((s) => Boolean(s.namespaces?.qubic));

      if (existing) {
        const hydrated = hydrateFromWCSession(existing);
        if (hydrated) setRestoredSession(hydrated);
      }

      const onDelete = ({ topic }: SignClientTypes.EventArguments["session_delete"]) => {
        onSessionDeleteRef.current(topic);
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
            onAccountsChangedRef.current(data as QubicAccount[]);
          }
        }
      };

      const onUpdate = ({ topic }: SignClientTypes.EventArguments["session_update"]) => {
        const s = client.session.get(topic);
        if (s) {
          const hydrated = hydrateFromWCSession(s);
          if (hydrated) onSessionUpdateRef.current(hydrated);
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
    })();

    return () => {
      mounted = false;
      detach?.();
    };
  }, [projectId]);

  return { ready, restoredSession, getClient };
}
