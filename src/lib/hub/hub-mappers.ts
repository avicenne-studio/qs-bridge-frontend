import { PublicKey } from "@solana/web3.js";
import type { HubOrder, HubChain, HubOrderStatus, HubOrdersQuery } from "./hub.types";
import type { ActivityRow, OrderStatus } from "@/domains/activity/activity.types";
import type { HistoryFilter } from "@/domains/history/history.types";
import { qubicIdentityToBytes } from "@/lib/bridge/qubicAddress";
import { bytesToHex, hexToBytes } from "@/lib/qubicIdentity";
import { getQubicClient } from "@/lib/qubicClient";

const HUB_TO_FRONTEND_STATUS: Record<HubOrderStatus, OrderStatus> = {
  pending: "pending",
  "ready-for-relay": "ready-for-relay",
  relayed: "in-progress",
  failed: "failed",
  finalized: "finalized",
};

export function mapHubStatus(hubStatus: HubOrderStatus): OrderStatus {
  return HUB_TO_FRONTEND_STATUS[hubStatus];
}

function mapDirection(source: HubChain, dest: HubChain): string {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return `${capitalize(source)} → ${capitalize(dest)}`;
}

export function solanaAddressToHex(address: string): string {
  return bytesToHex(new PublicKey(address).toBytes());
}

export function qubicAddressToHex(address: string): string {
  return bytesToHex(qubicIdentityToBytes(address));
}

async function formatAddress(hex: string, chain: HubChain): Promise<string> {
  try {
    const bytes = hexToBytes(hex);
    if (chain === "solana") {
      return new PublicKey(bytes).toBase58();
    }
    const qubic = getQubicClient();
    return await qubic.identity.getIdentity(bytes);
  } catch {
    return hex;
  }
}

function truncateOrderId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

export async function mapHubOrderToRow(order: HubOrder): Promise<ActivityRow> {
  const [from, to] = await Promise.all([
    formatAddress(order.from, order.source),
    formatAddress(order.to, order.dest),
  ]);

  return {
    status: mapHubStatus(order.status),
    orderId: truncateOrderId(order.id),
    fullOrderId: order.id,
    direction: mapDirection(order.source, order.dest),
    from,
    to,
    sourceChain: order.source,
    destChain: order.dest,
    amount: order.amount,
    date: order.created_at,
    originTrxHash: order.origin_trx_hash,
  };
}

const STATUS_LABEL_TO_HUB: Record<string, HubOrderStatus> = {
  Pending: "pending",
  "In Progress": "relayed",
  "Ready for relay": "ready-for-relay",
  Finalized: "finalized",
  Failed: "failed",
};

export function filtersToHubQuery(
  filters: HistoryFilter[],
  searchQuery: string,
): Partial<HubOrdersQuery> {
  const query: Partial<HubOrdersQuery> = {};

  const statuses: HubOrderStatus[] = [];

  for (const filter of filters) {
    switch (filter.category) {
      case "status": {
        const mapped = STATUS_LABEL_TO_HUB[filter.value];
        if (mapped) statuses.push(mapped);
        break;
      }
      case "direction": {
        if (filter.value === "QUBIC to Solana") {
          query.source = "qubic";
          query.dest = "solana";
        } else if (filter.value === "Solana to QUBIC") {
          query.source = "solana";
          query.dest = "qubic";
        }
        break;
      }
      case "from": {
        if (filter.value === "QUBIC") query.source = "qubic";
        else if (filter.value === "Solana") query.source = "solana";
        break;
      }
      case "to": {
        if (filter.value === "QUBIC") query.dest = "qubic";
        else if (filter.value === "Solana") query.dest = "solana";
        break;
      }
      case "date": {
        query.created_after = `${filter.value}T00:00:00.000Z`;
        query.created_before = `${filter.value}T23:59:59.999Z`;
        break;
      }
    }
  }

  if (statuses.length > 0) {
    query.status = statuses;
  }

  if (searchQuery.trim()) {
    query.id = searchQuery.trim();
  }

  return query;
}
