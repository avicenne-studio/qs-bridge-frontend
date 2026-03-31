export type TxResult = {
  signature: string;
  explorerUrl: string;
};

export type OutboundParams = {
  amount: bigint;
  toAddress: Uint8Array; // 32 bytes destination Qubic
  relayerFee: bigint;
  orderEra: number;
};

export type LockParams = {
  amount: bigint;
  toSolanaAddress: string;
  relayerFee: bigint;
};

export type OverrideOutboundParams = {
  networkOut: number;
  nonce: Uint8Array; // 32 bytes
  newToAddress: Uint8Array | null; // 32 bytes or null
  newRelayerFee: bigint | null;
};

export type OverrideLockParams = {
  nonce: number;
  newToAddress: string | null;
  newRelayerFee: bigint | null;
};
