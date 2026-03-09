import type { ActivityRow } from "@/domains/activity/activity.types";

export type HistoryRow = ActivityRow;

export type HistoryFilter = { category: string; value: string };
