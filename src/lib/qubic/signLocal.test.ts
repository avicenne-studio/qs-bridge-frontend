// @vitest-environment node
import { vi, describe, it, expect } from "vitest";

// Vitest wraps module exports in Proxies for mocking — but a Proxy over a native Promise
// breaks V8's Promise.prototype.then.call() used during `await`. Fix: provide the real
// Promise via native require(), which bypasses Vitest's ESM proxy wrapping entirely.
vi.mock("@ardata-tech/qubic-js/dist/crypto", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("@ardata-tech/qubic-js/dist/crypto");
  return { default: mod.default };
});

import { signMessageLocally } from "./signLocal";
import { deriveIdentityFromSeed } from "../qubicIdentity";

// Dummy test seed — 55 lowercase characters
const TEST_SEED = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

describe("signMessageLocally", () => {
  it("returns a 64-byte signature", async () => {
    const { privateKeyHex } = await deriveIdentityFromSeed(TEST_SEED);
    const message = new Uint8Array([1, 2, 3, 4, 5]);

    const signature = await signMessageLocally(message, privateKeyHex);

    expect(signature).toBeInstanceOf(Uint8Array);
    expect(signature.length).toBe(64);
  });

  it("produces different signatures for different messages", async () => {
    const { privateKeyHex } = await deriveIdentityFromSeed(TEST_SEED);

    const sig1 = await signMessageLocally(new Uint8Array([1]), privateKeyHex);
    const sig2 = await signMessageLocally(new Uint8Array([2]), privateKeyHex);

    expect(Buffer.from(sig1).toString("hex")).not.toBe(Buffer.from(sig2).toString("hex"));
  });

  it("always produces the same signature for the same seed and message", async () => {
    const { privateKeyHex } = await deriveIdentityFromSeed(TEST_SEED);
    const message = new Uint8Array([42]);

    const sig1 = await signMessageLocally(message, privateKeyHex);
    const sig2 = await signMessageLocally(message, privateKeyHex);

    expect(Buffer.from(sig1).toString("hex")).toBe(Buffer.from(sig2).toString("hex"));
  });
});
