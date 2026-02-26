import type { Address } from "viem";

export function truncateAddress(address: Address) {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
