import { WQUBIC_DECIMALS } from "./solana/constants";

const DECIMALS_FACTOR = BigInt(10 ** WQUBIC_DECIMALS);

export function displayToRaw(display: string): bigint {
  const [whole = "0", frac = ""] = display.split(".");
  const fracPadded = frac.slice(0, WQUBIC_DECIMALS).padEnd(WQUBIC_DECIMALS, "0");
  const raw = BigInt(whole) * DECIMALS_FACTOR + BigInt(fracPadded);
  return raw < 0n ? 0n : raw;
}

export function rawToDisplay(raw: bigint): string {
  const whole = raw / DECIMALS_FACTOR;
  const frac = raw % DECIMALS_FACTOR;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(WQUBIC_DECIMALS, "0").replace(/0+$/, "");
  return `${whole}.${fracStr}`;
}
