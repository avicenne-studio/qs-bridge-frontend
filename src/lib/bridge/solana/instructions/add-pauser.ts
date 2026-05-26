import { TransactionInstruction } from "@solana/web3.js";
import type { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, SYSTEM_PROGRAM_ID } from "../constants";
import { GLOBAL_STATE_PDA, derivePauserPda } from "../pda";

const ADD_PAUSER_DISCRIMINATOR = 0x03;

export function createAddPauserInstruction(
  admin: PublicKey,
  pauser: PublicKey,
): TransactionInstruction {
  const pauserPda = derivePauserPda(pauser);

  const data = Buffer.alloc(33);
  data.writeUInt8(ADD_PAUSER_DISCRIMINATOR, 0);
  pauser.toBytes().forEach((b: number, i: number) => data.writeUInt8(b, 1 + i));

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: admin, isSigner: true, isWritable: true },
      { pubkey: GLOBAL_STATE_PDA, isSigner: false, isWritable: false },
      { pubkey: pauserPda, isSigner: false, isWritable: true },
      { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data,
  });
}
