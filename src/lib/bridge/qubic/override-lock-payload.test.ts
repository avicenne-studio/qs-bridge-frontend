import { describe, it, expect } from "vitest";
import { buildOverrideLockPayload } from "./override-lock-payload";

describe("buildOverrideLockPayload", () => {
  it("produces a 76-byte payload", () => {
    const payload = buildOverrideLockPayload("", 0n, 0);
    expect(payload.byteLength).toBe(76);
  });

  it("writes the address as ASCII at bytes [0..63], zero-padded", () => {
    const address = "ABCDEFGHIJKLMNOPQRSTUVWXYZ012345678901234567890123456789012345";
    const payload = buildOverrideLockPayload(address, 0n, 0);
    const addressBytes = payload.slice(0, 64);
    const expected = new Uint8Array(64);
    new TextEncoder().encodeInto(address.slice(0, 64), expected);
    expect(addressBytes).toEqual(expected);
  });

  it("writes relayerFee as uint64 LE at bytes [64..71]", () => {
    const fee = 1_000_000_000n;
    const payload = buildOverrideLockPayload("", fee, 0);
    const view = new DataView(payload.buffer, payload.byteOffset);
    expect(view.getBigUint64(64, true)).toBe(fee);
  });

  it("writes nonce as uint32 LE at bytes [72..75]", () => {
    const nonce = 0xdeadbeef;
    const payload = buildOverrideLockPayload("", 0n, nonce);
    const view = new DataView(payload.buffer, payload.byteOffset);
    expect(view.getUint32(72, true)).toBe(nonce);
  });

  it("handles empty address with 64 zero bytes", () => {
    const payload = buildOverrideLockPayload("", 0n, 0);
    expect(payload.slice(0, 64)).toEqual(new Uint8Array(64));
  });

  it("truncates address longer than 64 characters", () => {
    const longAddress = "A".repeat(80);
    const payload = buildOverrideLockPayload(longAddress, 0n, 0);
    const addressBytes = payload.slice(0, 64);
    expect(Array.from(addressBytes).every((b) => b === 0x41)).toBe(true);
  });
});
