import { TransactionInstruction } from "@solana/web3.js";
import type { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, SYSTEM_PROGRAM_ID, TOKEN_PROGRAM_ID } from "../constants";

const OUTBOUND_DISCRIMINATOR = 0x01;

interface SerializeOutboundArgs {
  networkOut: number; // u32
  tokenOut: Uint8Array; // 32 bytes
  toAddress: Uint8Array; // 32 bytes
  amount: bigint; // u64
  relayerFee: bigint; // u64
  nonce: Uint8Array; // 32 bytes
  orderEra: number; // u32
}

export function serializeOutboundData(args: SerializeOutboundArgs): Buffer {
  const buf = Buffer.alloc(121);
  let offset = 0;

  buf.writeUInt8(OUTBOUND_DISCRIMINATOR, offset);
  offset += 1;

  buf.writeUInt32LE(args.networkOut, offset);
  offset += 4;

  buf.set(args.tokenOut, offset);
  offset += 32;

  buf.set(args.toAddress, offset);
  offset += 32;

  buf.writeBigUInt64LE(args.amount, offset);
  offset += 8;

  buf.writeBigUInt64LE(args.relayerFee, offset);
  offset += 8;

  buf.set(args.nonce, offset);
  offset += 32;

  buf.writeUInt32LE(args.orderEra, offset);

  return buf;
}

interface CreateOutboundInstructionArgs {
  user: PublicKey;
  globalState: PublicKey;
  outboundOrder: PublicKey;
  userTokenAccount: PublicKey;
  tokenMint: PublicKey;
  data: Buffer;
}

export function createOutboundInstruction(
  args: CreateOutboundInstructionArgs,
): TransactionInstruction {
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: args.user, isSigner: true, isWritable: true },
      { pubkey: args.globalState, isSigner: false, isWritable: false },
      { pubkey: args.outboundOrder, isSigner: false, isWritable: true },
      { pubkey: args.userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: args.tokenMint, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: args.data,
  });
}
