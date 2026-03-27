import type { Address } from "viem";

export type QubicAccount = {
  address: string;
  name?: string;
  amount?: number;
};

export type ConnectionMethod = "walletconnect" | "metamask" | "seed" | "vault" | null;

export type QubicSession =
  | {
      kind: "walletconnect";
      topic: string;
      address: Address;
      chainId: string;
      expiry?: number;
      walletName?: string;
      walletUrl?: string;
    }
  | {
      kind: "local";
      method: "metamask" | "seed" | "vault";
      address: Address;
      privateKeyHex?: string;
    };
