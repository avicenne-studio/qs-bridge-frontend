export const HUB_NETWORK = { Qubic: 1, Solana: 2 } as const;
export type HubNetworkId = (typeof HUB_NETWORK)[keyof typeof HUB_NETWORK];

export type HubOrderStatus = "pending" | "ready-for-relay" | "relayed" | "failed" | "finalized";

export type HubChain = "qubic" | "solana";

export type HubOrder = {
  id: string;
  source: HubChain;
  dest: HubChain;
  from: string;
  to: string;
  amount: string;
  relayerFee: string;
  origin_trx_hash: string;
  destination_trx_hash?: string;
  source_nonce: string;
  source_payload: string;
  order_era: number;
  failure_reason_public?: string;
  status: HubOrderStatus;
  created_at: string;
};

export type HubPagination = {
  page: number;
  limit: number;
  total: number;
};

export type HubOrdersResponse = {
  data: HubOrder[];
  pagination: HubPagination;
};

export type HubOrderWithSignatures = HubOrder & {
  signatures: string[];
};

export type HubOrderByTrxHashResponse = {
  data: HubOrderWithSignatures;
};

export type HubEstimateBody = {
  networkIn: HubNetworkId;
  networkOut: HubNetworkId;
  fromAddress: string;
  toAddress: string;
  amount: string;
};

export type HubBridgeFee = {
  oracleFee: string;
  protocolFee: string;
  total: string;
};

export type HubEstimateResult = {
  bridgeFee: HubBridgeFee;
  relayerFee: string;
  networkFee: string;
  userReceives: string;
};

export type HubEstimateResponse = {
  data: HubEstimateResult;
};

export type HubBridgeHealth = {
  paused: boolean;
};

export type HubOracleHealth = {
  url: string;
  status: "ok" | "down";
  timestamp: string;
  relayerFeeSolana: string;
  relayerFeeQubic: string;
};

export type HubOraclesHealthResponse = {
  oracles: HubOracleHealth[];
};

export type HubOrdersQuery = {
  page?: number;
  limit?: number;
  order?: "asc" | "desc";
  source?: HubChain;
  dest?: HubChain;
  status?: HubOrderStatus[];
  from?: string;
  to?: string;
  amount_min?: string;
  amount_max?: string;
  created_after?: string;
  created_before?: string;
  id?: string;
  participant?: string[];
};
