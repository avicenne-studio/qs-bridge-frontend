import { useEffect, useState } from "react";
import type SignClient from "@walletconnect/sign-client";
import { requestWCAccounts } from "@/lib/qubic/connectWalletConnect";
import { fetchIdentitySnapshot, extractBalanceAmount } from "@/lib/qubicIdentity";
import { formatCompactNumber } from "@/utils/format";
import type { QubicAccount } from "@/lib/qubic/types";

const BALANCE_REFRESH_MS = 30_000;

function balanceFromAccounts(accounts: QubicAccount[]): string | null {
  const amount = accounts[0]?.amount;

  return amount != null ? formatCompactNumber(amount) : null;
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

export function useLocalBalancePolling(localAddress: string | null) {
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (!localAddress) return;

    let cancelled = false;

    async function poll() {
      try {
        const snapshot = await fetchIdentitySnapshot(localAddress!);
        if (cancelled) return;
        const amount = extractBalanceAmount(snapshot);
        if (amount != null) setBalance(formatCompactNumber(amount));
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
