export interface Eip1193Provider {
  readonly isMetaMask?: boolean;
  readonly request: (args: {
    readonly method: string;
    readonly params?: unknown[] | Record<string, unknown>;
  }) => Promise<unknown>;
}

export function getEthereumProvider(): Eip1193Provider | undefined {
  const eth = window.ethereum;
  if (!eth || typeof eth !== "object" || !("request" in eth)) return undefined;
  return eth as unknown as Eip1193Provider;
}
