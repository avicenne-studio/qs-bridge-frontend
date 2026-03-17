import { WQUBIC_DECIMALS, BPS_FEE, PROTOCOL_FEE_BPS_OF_BPS } from "./solana/constants";

const DECIMALS_FACTOR = BigInt(10 ** WQUBIC_DECIMALS);

export function displayToRaw(display: string): bigint {
  const [whole = "0", frac = ""] = display.split(".");
  const fracPadded = frac.slice(0, WQUBIC_DECIMALS).padEnd(WQUBIC_DECIMALS, "0");
  const raw = BigInt(whole) * DECIMALS_FACTOR + BigInt(fracPadded);
  return raw < 0n ? 0n : raw;
}

export function computeProgramFees(amount: string): string {
  const raw = displayToRaw(amount);
  const oracleFee = (raw * BigInt(BPS_FEE)) / 10_000n;
  const protocolFee = (oracleFee * BigInt(PROTOCOL_FEE_BPS_OF_BPS)) / 10_000n;
  return rawToDisplay(oracleFee + protocolFee);
}

function rawToDisplay(raw: bigint): string {
  const whole = raw / DECIMALS_FACTOR;
  const frac = raw % DECIMALS_FACTOR;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(WQUBIC_DECIMALS, "0").replace(/0+$/, "");
  return `${whole}.${fracStr}`;
}
