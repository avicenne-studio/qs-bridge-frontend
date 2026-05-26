export function formatWQubic(raw: bigint): string {
  if (raw === 0n) return "0";
  const dec = 9;
  const whole = raw / BigInt(10 ** dec);
  const frac = (raw % BigInt(10 ** dec)).toString().padStart(dec, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole.toString();
}
