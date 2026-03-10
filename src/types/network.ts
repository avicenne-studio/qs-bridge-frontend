export const NETWORK = {
  Solana: "Solana",
  Qubic: "Qubic",
} as const;

export type Network = (typeof NETWORK)[keyof typeof NETWORK];
