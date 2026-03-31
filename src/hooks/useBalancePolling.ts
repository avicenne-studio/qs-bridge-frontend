import { useEffect, useState } from "react";
import type SignClient from "@walletconnect/sign-client";
import { requestWCAccounts } from "@/lib/qubic/connectWalletConnect";
import { fetchIdentitySnapshot, extractBalanceAmount } from "@/lib/qubicIdentity";
import { QUBIC_NODE_RPC_URL } from "@/lib/bridge/qubic/constants";
import type { QubicAccount } from "@/lib/qubic/types";

const BALANCE_REFRESH_MS = 30_000;

function balanceFromAccounts(accounts: QubicAccount[]): string | null {
  const amount = accounts[0]?.amount;

  return amount != null ? String(amount) : null;
}

export function useWCBalancePolling(getClient: () => SignClient | null, wcTopic: string | null) {
  const [accounts, setAccounts] = useState<QubicAccount[]>([]);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!wcTopic) return;
    const client = getClient();
    if (!client) return;

    let cancelled = false;

    async function poll() {
      try {
        const accs = await requestWCAccounts(client!, wcTopic!);
        if (cancelled || !accs.length) return;
        setAccounts(accs);
        setBalance(balanceFromAccounts(accs));
      } catch {
        // Balance poll failures are transient; next interval will retry
      }
    }

    poll();
    const id = setInterval(poll, BALANCE_REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [wcTopic, getClient]);

  return { accounts, balance, setAccounts, setBalance, balanceFromAccounts };
}

async function fetchBalanceFromNode(identity: string): Promise<number | null> {
  try {
    const res = await fetch(`${QUBIC_NODE_RPC_URL}/live/v1/balances/${identity}`);
    if (!res.ok) return null;
    const body = (await res.json()) as { balance?: { balance?: string | number } };
    const raw = body.balance?.balance;
    if (raw == null) return null;
    return typeof raw === "number" ? raw : Number(raw);
  } catch {
    return null;
  }
}

export function useLocalBalancePolling(localAddress: string | null) {
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!localAddress) return;

    let cancelled = false;

    async function poll() {
      try {
        // Try testnet node first (via proxy), fallback to mainnet RPC
        const nodeBalance = await fetchBalanceFromNode(localAddress!);
        if (cancelled) return;
        if (nodeBalance != null) {
          setBalance(String(nodeBalance));
          return;
        }

        const snapshot = await fetchIdentitySnapshot(localAddress!);
        if (cancelled) return;
        const amount = extractBalanceAmount(snapshot);
        if (amount != null) setBalance(String(amount));
      } catch {
        // Balance poll failures are transient; next interval will retry
      }
    }

    poll();
    const id = setInterval(poll, BALANCE_REFRESH_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [localAddress]);

  return { balance, setBalance };
}
