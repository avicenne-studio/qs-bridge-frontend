type ProviderRequestArguments = {
  readonly method: string;
  readonly params?: unknown[] | Record<string, unknown>;
};

interface Eip1193Provider {
  readonly isMetaMask?: boolean;
  readonly request: (args: ProviderRequestArguments) => Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export {};
