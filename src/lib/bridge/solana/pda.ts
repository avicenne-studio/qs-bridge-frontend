import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./constants";

export const GLOBAL_STATE_PDA = PublicKey.findProgramAddressSync(
  [Buffer.from("global_state")],
  PROGRAM_ID,
)[0];

export function deriveOutboundOrderPda(networkOut: number, nonce: Uint8Array): PublicKey {
  const networkOutBuf = Buffer.alloc(4);
  networkOutBuf.writeUInt32LE(networkOut);

  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("outbound_order"), networkOutBuf, Buffer.from(nonce)],
    PROGRAM_ID,
  );
  return pda;
}
