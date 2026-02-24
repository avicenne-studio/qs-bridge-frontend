import type { Address } from "viem";

export type OrderStatus = "pending" | "in-progress" | "ready-for-relay" | "failed" | "finalized";

export type ActivityRow = {
  status: OrderStatus;
  orderId: string;
  direction: string;
  from: Address;
  to: Address;
  amount: string;
  date: string;
};
