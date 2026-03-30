export type OrderStatus = "pending" | "in-progress" | "ready-for-relay" | "failed" | "finalized";

export type Chain = "solana" | "qubic";

export type ActivityRow = {
  status: OrderStatus;
  orderId: string;
  fullOrderId: string;
  direction: string;
  from: string;
  to: string;
  sourceChain: Chain;
  destChain: Chain;
  amount: string;
  date: string;
  originTrxHash?: string;
};
