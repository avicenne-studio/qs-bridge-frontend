import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("@/providers/QubicWalletProvider", () => ({
  useQubicWallet: vi.fn(),
}));

vi.mock("@/lib/bridge/qubic/transaction", () => ({
  buildAndBroadcastLockTx: vi.fn(),
  buildAndBroadcastOverrideLockTx: vi.fn(),
}));

import { useQubicWallet } from "@/providers/QubicWalletProvider";
import { useBridgeInbound } from "./useBridgeInbound";

const mockUseQubicWallet = vi.mocked(useQubicWallet);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useBridgeInbound.overrideLock — wallet guards", () => {
  it("returns null and sets overrideError when Qubic wallet is not connected", async () => {
    mockUseQubicWallet.mockReturnValue({
      connected: false,
      session: null,
      address: null,
      balance: null,
    } as ReturnType<typeof useQubicWallet>);

    const { result } = renderHook(() => useBridgeInbound());

    let returnValue: Awaited<ReturnType<typeof result.current.overrideLock>>;
    await act(async () => {
      returnValue = await result.current.overrideLock({
        nonce: 12345,
        newToAddress: null,
        newRelayerFee: null,
      });
    });

    expect(returnValue!).toBeNull();
    expect(result.current.overrideError).toBe("Qubic wallet not connected");
  });

  it("returns null and sets overrideError when session is MetaMask (no seed)", async () => {
    mockUseQubicWallet.mockReturnValue({
      connected: true,
      session: {
        kind: "local",
        method: "metamask",
        address: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" as `0x${string}`,
        privateKeyHex: "0xdeadbeef",
      },
      address: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" as `0x${string}`,
      balance: "0",
    } as ReturnType<typeof useQubicWallet>);

    const { result } = renderHook(() => useBridgeInbound());

    let returnValue: Awaited<ReturnType<typeof result.current.overrideLock>>;
    await act(async () => {
      returnValue = await result.current.overrideLock({
        nonce: 12345,
        newToAddress: null,
        newRelayerFee: null,
      });
    });

    expect(returnValue!).toBeNull();
    expect(result.current.overrideError).toMatch(/seed not available/i);
  });

  it("returns null and sets overrideError when wallet session exists but has no seed (vault without seed)", async () => {
    mockUseQubicWallet.mockReturnValue({
      connected: true,
      session: {
        kind: "local",
        method: "vault",
        address: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" as `0x${string}`,
        // no seed property
      },
      address: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" as `0x${string}`,
      balance: "0",
    } as ReturnType<typeof useQubicWallet>);

    const { result } = renderHook(() => useBridgeInbound());

    let returnValue: Awaited<ReturnType<typeof result.current.overrideLock>>;
    await act(async () => {
      returnValue = await result.current.overrideLock({
        nonce: 12345,
        newToAddress: null,
        newRelayerFee: null,
      });
    });

    expect(returnValue!).toBeNull();
    expect(result.current.overrideError).toBeTruthy();
  });
});
