import { TransactionInstruction } from "@solana/web3.js";
import type { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "../constants";
import { GLOBAL_STATE_PDA, derivePauserPda } from "../pda";

const PAUSE_DISCRIMINATOR = 0x05;
const UNPAUSE_DISCRIMINATOR = 0x06;

export function createPauseInstruction(pauser: PublicKey): TransactionInstruction {
  const pauserPda = derivePauserPda(pauser);
  const data = Buffer.alloc(1);
  data.writeUInt8(PAUSE_DISCRIMINATOR, 0);
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: pauser, isSigner: true, isWritable: true },
      { pubkey: GLOBAL_STATE_PDA, isSigner: false, isWritable: true },
      { pubkey: pauserPda, isSigner: false, isWritable: false },
    ],
    data,
  });
}

// Unpause is admin-only — no PauserPDA account.
export function createUnpauseInstruction(admin: PublicKey): TransactionInstruction {
  const data = Buffer.alloc(1);
  data.writeUInt8(UNPAUSE_DISCRIMINATOR, 0);
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: admin, isSigner: true, isWritable: true },
      { pubkey: GLOBAL_STATE_PDA, isSigner: false, isWritable: true },
    ],
    data,
  });
}
