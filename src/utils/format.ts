export function truncateAddress(address: string) {
  if (address.length <= 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function formatCompactNumber(value: number): string {
  const floor2 = (n: number) => (Math.floor(n * 100) / 100).toFixed(2).replace(/\.?0+$/, "");
  if (value >= 1_000_000_000) return `${floor2(value / 1_000_000_000)}B`;
  if (value >= 1_000_000) return `${floor2(value / 1_000_000)}M`;
  if (value >= 1_000) return `${floor2(value / 1_000)}K`;
  return String(value);
}
