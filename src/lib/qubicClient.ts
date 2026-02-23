import Qubic from "@ardata-tech/qubic-js";

type QubicClient = InstanceType<typeof Qubic>;

let instance: QubicClient | null = null;

const RPC_URL = import.meta.env.VITE_QUBIC_RPC_URL?.trim() || "https://rpc.qubic.org";

export const getQubicClient = (): QubicClient => {
  if (!instance) {
    instance = new Qubic({ providerUrl: RPC_URL, version: 1 });
  }
  return instance;
};
