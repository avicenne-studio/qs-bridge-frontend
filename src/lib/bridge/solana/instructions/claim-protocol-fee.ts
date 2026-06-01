import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
} from "../constants";
import { GLOBAL_STATE_PDA } from "../pda";

const CLAIM_PROTOCOL_FEE_DISCRIMINATOR = 0x0c;

function deriveAta(owner: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBytes(), TOKEN_PROGRAM_ID.toBytes(), mint.toBytes()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0];
}

export function createClaimProtocolFeeInstruction(
  protocolFeeRecipient: PublicKey,
  tokenMint: PublicKey,
): TransactionInstruction {
  const recipientAta = deriveAta(protocolFeeRecipient, tokenMint);

  const data = Buffer.alloc(1);
  data.writeUInt8(CLAIM_PROTOCOL_FEE_DISCRIMINATOR, 0);

  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: protocolFeeRecipient, isSigner: true, isWritable: true },
      { pubkey: GLOBAL_STATE_PDA, isSigner: false, isWritable: true },
      { pubkey: tokenMint, isSigner: false, isWritable: true },
      { pubkey: recipientAta, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data,
  });
}
