import { WQUBIC_DECIMALS, BPS_FEE, PROTOCOL_FEE_BPS_OF_BPS } from "./solana/constants";

const DECIMALS_FACTOR = BigInt(10 ** WQUBIC_DECIMALS);

export function displayToRaw(display: string): bigint {
  const [whole = "0", frac = ""] = display.split(".");
  const fracPadded = frac.slice(0, WQUBIC_DECIMALS).padEnd(WQUBIC_DECIMALS, "0");
  const raw = BigInt(whole) * DECIMALS_FACTOR + BigInt(fracPadded);
  return raw < 0n ? 0n : raw;
}

export function computeProgramFees(amount: string): string {
  const amountNum = parseFloat(amount) || 0;
  const oracleFee = (amountNum * BPS_FEE) / 10_000;
  const protocolFee = (oracleFee * PROTOCOL_FEE_BPS_OF_BPS) / 10_000;
  return (oracleFee + protocolFee).toString();
}
