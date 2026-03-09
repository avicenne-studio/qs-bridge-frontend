import type { Address } from "viem";

export function truncateAddress(address: Address | null) {
  if (!address) return "—";

  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  }).format(value);
}

export function stringToDate(value: string) {
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date;
}

export function replaceCommaByDot(value: string) {
  if (!value.includes(",")) return value;

  return value.replace(",", ".");
}
