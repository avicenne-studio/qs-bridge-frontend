import type { Currency } from "./currency";

export const NETWORK = {
  Solana: "Solana",
  Qubic: "Qubic",
} as const;

export type Network = (typeof NETWORK)[keyof typeof NETWORK];

export const NETWORK_CURRENCY: Record<Network, Currency> = {
  [NETWORK.Qubic]: "QUBIC",
  [NETWORK.Solana]: "wQUBIC",
};
