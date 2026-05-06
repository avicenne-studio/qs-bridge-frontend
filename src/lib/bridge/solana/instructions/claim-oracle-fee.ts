import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
} from "../constants";
import { GLOBAL_STATE_PDA, deriveOraclePda } from "../pda";

const CLAIM_ORACLE_FEE_DISCRIMINATOR = 0x0b;

function deriveAta(owner: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBytes(), TOKEN_PROGRAM_ID.toBytes(), mint.toBytes()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0];
}

// claimer can be the oracle owner or the admin.
// oracleOwner is always the oracle's pubkey (whose PDA and ATA we target).
export function createClaimOracleFeeInstruction(
  claimer: PublicKey,
  oracleOwner: PublicKey,
  tokenMint: PublicKey,
): TransactionInstruction {
  const oraclePda = deriveOraclePda(oracleOwner);
  const oracleAta = deriveAta(oracleOwner, tokenMint);

  const data = Buffer.alloc(1);
  data.writeUInt8(CLAIM_ORACLE_FEE_DISCRIMINATOR, 0);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: claimer, isSigner: true, isWritable: true },
      { pubkey: GLOBAL_STATE_PDA, isSigner: false, isWritable: false },
      { pubkey: oraclePda, isSigner: false, isWritable: true },
      { pubkey: oracleOwner, isSigner: false, isWritable: false },
      { pubkey: tokenMint, isSigner: false, isWritable: true },
      { pubkey: oracleAta, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data,
  });
}
