export type TxResult = {
  signature: string;
  explorerUrl: string;
};

export type OutboundParams = {
  amount: bigint;
  toAddress: Uint8Array; // 32 bytes destination Qubic
  relayerFee: bigint;
};

export type OverrideOutboundParams = {
  networkOut: number;
  nonce: Uint8Array; // 32 bytes
  newToAddress: Uint8Array | null; // 32 bytes or null
  newRelayerFee: bigint | null;
};
