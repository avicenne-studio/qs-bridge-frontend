import { vi, describe, it, expect, beforeEach } from "vitest";
import { queryGetConfig, queryGetOracles, queryGetPausers } from "./query";
import { bytesToPublicId } from "./admin-payloads";

function mockFetch(bytes: Uint8Array) {
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: hex }),
  } as Response);
}

// GetConfig_output layout (from oracle/scripts/qubic/utils.js):
//   [0..31]    id     admin
//   [32..63]   id     protocolFeeRecipient
//   [64..95]   id     oracleFeeRecipient
//   [96..99]   u32    bpsFee
//   [100..103] u32    protocolFee
//   [104..107] u32    oracleCount
//   [108..111] u32    pauserCount
//   [112]      u8     oracleThreshold
//   [113]      u8     paused
//   [114..115] pad    (2 bytes — C++ alignment)
//   [116..119] u32    orderEra
function makeConfigFixture({
  bpsFee = 100,
  protocolFee = 200,
  oracleCount = 3,
  pauserCount = 2,
  oracleThreshold = 2,
  paused = true,
  orderEra = 5,
} = {}): Uint8Array {
  const buf = new Uint8Array(120);
  buf.fill(0xaa, 0, 32); // admin
  buf.fill(0xbb, 32, 64); // protocolFeeRecipient
  buf.fill(0xcc, 64, 96); // oracleFeeRecipient
  const view = new DataView(buf.buffer);
  view.setUint32(96, bpsFee, true);
  view.setUint32(100, protocolFee, true);
  view.setUint32(104, oracleCount, true);
  view.setUint32(108, pauserCount, true);
  buf[112] = oracleThreshold;
  buf[113] = paused ? 1 : 0;
  // bytes 114-115: padding — intentionally set to 0xff to detect wrong offset
  buf[114] = 0xff;
  buf[115] = 0xff;
  view.setUint32(116, orderEra, true);
  return buf;
}

// GetOracles_output layout (from oracle/scripts/qubic/utils.js):
//   [0..3]   u32   count
//   [4..7]   pad   (4 bytes — id is 8-byte aligned)
//   [8..]    id[]  entries (32 bytes each)
// Bytes 4..7 are set to 0xff so that reading from offset 4 (old bug) would produce a wrong address.
function makeOraclesFixture(addresses: Uint8Array[]): Uint8Array {
  const count = addresses.length;
  const buf = new Uint8Array(8 + count * 32);
  new DataView(buf.buffer).setUint32(0, count, true);
  buf.fill(0xff, 4, 8); // padding — trap for the old offset-4 bug
  for (let i = 0; i < count; i++) {
    buf.set(addresses[i].slice(0, 32), 8 + i * 32);
  }
  return buf;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("queryGetConfig", () => {
  it("decodes all fields from correct offsets", async () => {
    mockFetch(
      makeConfigFixture({
        bpsFee: 150,
        protocolFee: 300,
        oracleCount: 4,
        pauserCount: 1,
        oracleThreshold: 3,
        paused: false,
        orderEra: 7,
      }),
    );
    const cfg = await queryGetConfig();
    expect(cfg.bpsFee).toBe(150);
    expect(cfg.protocolFee).toBe(300);
    expect(cfg.oracleCount).toBe(4);
    expect(cfg.pauserCount).toBe(1);
    expect(cfg.oracleThreshold).toBe(3);
    expect(cfg.paused).toBe(false);
    expect(cfg.orderEra).toBe(7);
  });

  it("reads orderEra from offset 116, not 114", async () => {
    // padding bytes at 114-115 are 0xff — old code (offset 114) would read 0x0007ffff ≠ 7
    mockFetch(makeConfigFixture({ orderEra: 7 }));
    const cfg = await queryGetConfig();
    expect(cfg.orderEra).toBe(7);
  });

  it("reads paused flag correctly", async () => {
    mockFetch(makeConfigFixture({ paused: true }));
    expect((await queryGetConfig()).paused).toBe(true);

    mockFetch(makeConfigFixture({ paused: false }));
    expect((await queryGetConfig()).paused).toBe(false);
  });

  it("decodes admin and fee recipient bytes", async () => {
    mockFetch(makeConfigFixture());
    const cfg = await queryGetConfig();
    expect(cfg.adminBytes).toEqual(new Uint8Array(32).fill(0xaa));
    expect(cfg.protocolFeeRecipientBytes).toEqual(new Uint8Array(32).fill(0xbb));
    expect(cfg.oracleFeeRecipientBytes).toEqual(new Uint8Array(32).fill(0xcc));
  });
});

describe("queryGetOracles", () => {
  it("returns the correct addresses starting at offset 8", async () => {
    const addr1 = new Uint8Array(32).fill(0x11);
    const addr2 = new Uint8Array(32).fill(0x22);
    mockFetch(makeOraclesFixture([addr1, addr2]));
    const oracles = await queryGetOracles();
    expect(oracles).toHaveLength(2);
    expect(oracles[0]).toBe(bytesToPublicId(addr1));
    expect(oracles[1]).toBe(bytesToPublicId(addr2));
  });

  it("old offset 4 would produce a wrong address (guard test)", () => {
    // Bytes 4-7 are 0xff in the fixture — reading from offset 4 gives a different address
    const addr = new Uint8Array(32).fill(0x11);
    const fixture = makeOraclesFixture([addr]);
    // Simulate what old code would do: slice from offset 4
    const wrongSlice = fixture.slice(4, 36);
    const correctSlice = fixture.slice(8, 40);
    expect(bytesToPublicId(wrongSlice)).not.toBe(bytesToPublicId(correctSlice));
  });

  it("returns empty array when count is 0", async () => {
    mockFetch(makeOraclesFixture([]));
    expect(await queryGetOracles()).toEqual([]);
  });
});

describe("queryGetPausers", () => {
  it("returns the correct addresses starting at offset 8", async () => {
    const addr = new Uint8Array(32).fill(0x33);
    mockFetch(makeOraclesFixture([addr]));
    const pausers = await queryGetPausers();
    expect(pausers).toHaveLength(1);
    expect(pausers[0]).toBe(bytesToPublicId(addr));
  });

  it("returns empty array when count is 0", async () => {
    mockFetch(makeOraclesFixture([]));
    expect(await queryGetPausers()).toEqual([]);
  });
});
