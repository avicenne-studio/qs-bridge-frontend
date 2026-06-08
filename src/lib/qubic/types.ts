import type { Address } from "viem";

export type QubicAccount = {
  address: string;
  name?: string;
  amount?: number;
};

export type ConnectionMethod = "walletconnect" | "seed" | null;

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
      method: "seed";
      address: Address;
      privateKeyHex?: string;
      seed?: string;
    };
