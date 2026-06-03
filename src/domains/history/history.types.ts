import type { ActivityRow } from "@/domains/activity/activity.types";

export type HistoryRow = ActivityRow & {
  nonce?: Uint8Array;
  networkOut?: number;
  inboundNonce?: number;
};

export type HistoryFilter = { category: string; value: string };
