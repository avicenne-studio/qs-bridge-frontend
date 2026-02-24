import * as _QubicModule from "@ardata-tech/qubic-js";

type QubicOptions = { providerUrl: string; version: number };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QubicCtor = new (opts: QubicOptions) => any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _mod = _QubicModule as any;

// Vite wraps CJS modules with double nesting: _mod.default.default is the class
const Qubic: QubicCtor =
  typeof _mod === "function"
    ? _mod
    : typeof _mod.default === "function"
      ? _mod.default
      : _mod.default?.default;

type QubicClient = InstanceType<typeof Qubic>;

let instance: QubicClient | null = null;

const RPC_URL = import.meta.env.VITE_QUBIC_RPC_URL?.trim() || "https://rpc.qubic.org";

export const getQubicClient = (): QubicClient => {
  if (!instance) {
    instance = new Qubic({ providerUrl: RPC_URL, version: 1 });
  }
  return instance;
};
