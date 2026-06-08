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
