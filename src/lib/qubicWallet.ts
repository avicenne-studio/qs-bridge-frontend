import SignClient from "@walletconnect/sign-client";
import type { ProposalTypes, SignClientTypes } from "@walletconnect/types";

const QUBIC_METHODS = [
  "qubic_requestAccounts",
  "qubic_sendQubic",
  "qubic_signTransaction",
  "qubic_sendTransaction",
  "qubic_sign",
  "qubic_sendAsset",
] as const;

const QUBIC_EVENTS = ["accountsChanged", "amountChanged", "assetAmountChanged"] as const;

export const QUBIC_OPTIONAL_NAMESPACES: ProposalTypes.OptionalNamespaces = {
  qubic: {
    chains: ["qubic:mainnet"],
    methods: [...QUBIC_METHODS],
    events: [...QUBIC_EVENTS],
  },
};

const getMetadata = (): SignClientTypes.Metadata => ({
  name: "Qubic Bridge",
  description: "Qubic-Solana Bridge",
  url: window.location.origin,
  icons: [`${window.location.origin}/logo.png`],
});

const clientCache = new Map<string, Promise<SignClient>>();

export const getQubicSignClient = async (projectId: string): Promise<SignClient> => {
  if (!projectId) {
    throw new Error("WalletConnect project ID is required.");
  }

  if (!clientCache.has(projectId)) {
    clientCache.set(
      projectId,
      SignClient.init({
        projectId,
        metadata: getMetadata(),
        logger: "error",
      }),
    );
  }

  return clientCache.get(projectId)!;
};

export const buildQubicDeepLink = (uri: string): string => `qubic-wallet://pairwc/${uri}`;

export const parseQubicAccount = (
  wcAccount: string,
): { namespace: string; chainId: string; address: string } | null => {
  const parts = wcAccount.split(":");
  if (parts.length < 3) return null;
  const [namespace, chainId, ...rest] = parts;
  const address = rest.join(":");
  if (!namespace || !chainId || !address) return null;
  return { namespace, chainId, address };
};
