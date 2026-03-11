import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address } from "viem";
import { NETWORK } from "@/types/network";

export interface WalletInfo {
  address: Address | null;
  balance: string | null;
}

interface WalletStoreState {
  qubic: WalletInfo;
  solana: WalletInfo;
  setQubic: (info: Partial<WalletInfo>) => void;
  setSolana: (info: Partial<WalletInfo>) => void;
}

export const useWalletStore = create<WalletStoreState>()(
  persist(
    (set) => ({
      qubic: { address: null, balance: null },
      solana: { address: null, balance: null },
      originNetwork: NETWORK.Qubic,
      setQubic: (info) => set((state) => ({ qubic: { ...state.qubic, ...info } })),
      setSolana: (info) => set((state) => ({ solana: { ...state.solana, ...info } })),
    }),
    {
      name: "wallet-store",
    },
  ),
);
