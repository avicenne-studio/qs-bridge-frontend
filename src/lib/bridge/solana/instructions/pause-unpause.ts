import { TransactionInstruction } from "@solana/web3.js";
import type { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "../constants";
import { GLOBAL_STATE_PDA, derivePauserPda } from "../pda";

const PAUSE_DISCRIMINATOR = 0x05;
const UNPAUSE_DISCRIMINATOR = 0x06;

function createPauseUnpauseInstruction(
  discriminator: number,
  pauser: PublicKey,
): TransactionInstruction {
  const pauserPda = derivePauserPda(pauser);

  const data = Buffer.alloc(1);
  data.writeUInt8(discriminator, 0);

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

export function createPauseInstruction(pauser: PublicKey): TransactionInstruction {
  return createPauseUnpauseInstruction(PAUSE_DISCRIMINATOR, pauser);
}

export function createUnpauseInstruction(pauser: PublicKey): TransactionInstruction {
  return createPauseUnpauseInstruction(UNPAUSE_DISCRIMINATOR, pauser);
}
