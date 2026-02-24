export type OrderStatus = "pending" | "in-progress" | "ready-for-relay" | "failed" | "finalized";

export type ActivityRow = {
  status: OrderStatus;
  orderId: string;
  direction: string;
  from: string;
  to: string;
  amount: string;
  date: string;
};
