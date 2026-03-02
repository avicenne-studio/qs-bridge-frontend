import { useAppKitAccount, useAppKit, useDisconnect } from "@reown/appkit/react";
import { useSolanaBalance } from "@/providers/SolanaWalletProvider";
import type { Address } from "viem";

export default function useSolanaWallet() {
  const { isConnected, address: rawAddress } = useAppKitAccount();
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { balance } = useSolanaBalance();

  return {
    connected: isConnected,
    address: (rawAddress as Address) ?? null,
    balance,
    disconnect,
    openModal: () => open(),
  };
}
