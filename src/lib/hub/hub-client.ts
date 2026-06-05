import type {
  HubOrdersQuery,
  HubOrdersResponse,
  HubOrderBySourceNonceResponse,
  HubEstimateBody,
  HubEstimateResponse,
  HubBridgeHealth,
  HubOraclesHealthResponse,
} from "./hub.types";

const HUB_BASE_URL = import.meta.env.VITE_HUB_API_URL;
if (!HUB_BASE_URL) throw new Error("VITE_HUB_API_URL is not set");

export class HubApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`Hub API error ${status}`);
    this.name = "HubApiError";
    this.status = status;
    this.body = body;
  }
}

async function hubFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${HUB_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new HubApiError(res.status, body);
  }
  return res.json() as Promise<T>;
}

export function fetchOrders(
  query: HubOrdersQuery = {},
  signal?: AbortSignal,
): Promise<HubOrdersResponse> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, v);
    } else {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return hubFetch<HubOrdersResponse>(`/api/orders${qs ? `?${qs}` : ""}`, { signal });
}

export function fetchOrderBySourceNonce(
  nonce: string,
  signal?: AbortSignal,
): Promise<HubOrderBySourceNonceResponse> {
  return hubFetch<HubOrderBySourceNonceResponse>(
    `/api/orders/source-nonce/${encodeURIComponent(nonce)}`,
    {
      signal,
    },
  );
}

export function estimateFees(
  body: HubEstimateBody,
  signal?: AbortSignal,
): Promise<HubEstimateResponse> {
  return hubFetch<HubEstimateResponse>("/api/orders/estimate", {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });
}

export function fetchBridgeHealth(signal?: AbortSignal): Promise<HubBridgeHealth> {
  return hubFetch<HubBridgeHealth>("/api/health/bridge", { signal });
}

export function fetchOraclesHealth(signal?: AbortSignal): Promise<HubOraclesHealthResponse> {
  return hubFetch<HubOraclesHealthResponse>("/api/health/oracles", {
    signal,
  });
}
