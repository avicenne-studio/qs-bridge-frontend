import { TransactionInstruction } from "@solana/web3.js";
import type { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, SYSTEM_PROGRAM_ID } from "../constants";
import { GLOBAL_STATE_PDA, deriveOraclePda } from "../pda";

const REMOVE_ORACLE_DISCRIMINATOR = 0x08;

export function createRemoveOracleInstruction(
  admin: PublicKey,
  oracle: PublicKey,
): TransactionInstruction {
  const oraclePda = deriveOraclePda(oracle);

  const data = Buffer.alloc(1);
  data.writeUInt8(REMOVE_ORACLE_DISCRIMINATOR, 0);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: admin, isSigner: true, isWritable: true },
      { pubkey: GLOBAL_STATE_PDA, isSigner: false, isWritable: true },
      { pubkey: oraclePda, isSigner: false, isWritable: true },
      { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data,
  });
}
