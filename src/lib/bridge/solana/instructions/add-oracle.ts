import { TransactionInstruction } from "@solana/web3.js";
import type { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, SYSTEM_PROGRAM_ID } from "../constants";
import { GLOBAL_STATE_PDA, deriveOraclePda } from "../pda";

const ADD_ORACLE_DISCRIMINATOR = 0x07;

export function createAddOracleInstruction(
  admin: PublicKey,
  oracle: PublicKey,
): TransactionInstruction {
  const oraclePda = deriveOraclePda(oracle);

  const data = Buffer.alloc(33);
  data.writeUInt8(ADD_ORACLE_DISCRIMINATOR, 0);
  oracle.toBytes().forEach((b: number, i: number) => data.writeUInt8(b, 1 + i));

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
