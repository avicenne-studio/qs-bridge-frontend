import qubicLib from "@qubic-lib/qubic-ts-library";
import { QubicHelper } from "@qubic-lib/qubic-ts-library/dist/qubicHelper.js";
import {
  QSB_CONTRACT_INDEX,
  LOCK_INPUT_TYPE,
  TICK_OFFSET,
  QUBIC_NODE_RPC_URL,
  QUBIC_INDEXER_URL,
  contractDestination,
} from "./constants";

const OVERRIDE_LOCK_INPUT_TYPE = 2;

// ESM interop: unwrap CJS default export
const mod = qubicLib as unknown as { default: typeof qubicLib };
const { QubicTransaction, DynamicPayload, PublicKey, Long } = mod.default ?? qubicLib;

export async function getCurrentTick(): Promise<number> {
  const res = await fetch(`${QUBIC_NODE_RPC_URL}/live/v1/tick-info`);
  if (!res.ok) throw new Error(`tick-info HTTP ${res.status}`);
  const body = (await res.json()) as { tick: number };
  return body.tick;
}

export async function broadcastQubicTx(txBytes: Uint8Array): Promise<{ transactionId: string }> {
  // Broadcast via indexer — it captures the Lock event AND forwards to the node
  const hex = Array.from(txBytes, (b) => b.toString(16).padStart(2, "0")).join("");

  const res = await fetch(`${QUBIC_INDEXER_URL}/broadcastTransaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: hex }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Qubic broadcast failed: HTTP ${res.status} — ${errBody}`);
  }

  return (await res.json()) as { transactionId: string };
}

export async function buildAndBroadcastLockTx(
  seed: string,
  amount: bigint,
  lockPayload: Uint8Array,
): Promise<{ txId: string }> {
  const helper = new QubicHelper();
  const { publicKey } = await helper.createIdPackage(seed);

  const tick = await getCurrentTick();
  const targetTick = tick + TICK_OFFSET;

  const dest = new PublicKey(contractDestination(QSB_CONTRACT_INDEX));
  const payload = new DynamicPayload(lockPayload.length);
  payload.setPayload(lockPayload);

  const tx = new QubicTransaction()
    .setSourcePublicKey(new PublicKey(publicKey))
    .setDestinationPublicKey(dest)
    .setAmount(new Long(amount))
    .setTick(targetTick)
    .setInputType(LOCK_INPUT_TYPE)
    .setInputSize(lockPayload.length)
    .setPayload(payload);

  const builtTx = await tx.build(seed);
  const txId = tx.getId();

  await broadcastQubicTx(new Uint8Array(builtTx));

  return { txId };
}

export async function buildAndBroadcastOverrideLockTx(
  seed: string,
  overridePayload: Uint8Array,
): Promise<{ txId: string }> {
  const helper = new QubicHelper();
  const { publicKey } = await helper.createIdPackage(seed);

  const tick = await getCurrentTick();
  const targetTick = tick + TICK_OFFSET;

  const dest = new PublicKey(contractDestination(QSB_CONTRACT_INDEX));
  const payload = new DynamicPayload(overridePayload.length);
  payload.setPayload(overridePayload);

  const tx = new QubicTransaction()
    .setSourcePublicKey(new PublicKey(publicKey))
    .setDestinationPublicKey(dest)
    .setAmount(new Long(0))
    .setTick(targetTick)
    .setInputType(OVERRIDE_LOCK_INPUT_TYPE)
    .setInputSize(overridePayload.length)
    .setPayload(payload);

  const builtTx = await tx.build(seed);
  const txId = tx.getId();

  await broadcastQubicTx(new Uint8Array(builtTx));

  return { txId };
}
