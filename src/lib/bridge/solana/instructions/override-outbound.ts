import { TransactionInstruction } from "@solana/web3.js";
import type { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "../constants";

const OVERRIDE_OUTBOUND_DISCRIMINATOR = 0x02;

interface SerializeOverrideOutboundArgs {
  newToAddress: Uint8Array | null; // Option<[u8; 32]>
  newRelayerFee: bigint | null; // Option<u64>
}

export function serializeOverrideOutboundData(args: SerializeOverrideOutboundArgs): Buffer {
  const toAddressSize = args.newToAddress ? 1 + 32 : 1;
  const relayerFeeSize = args.newRelayerFee != null ? 1 + 8 : 1;
  const totalSize = 1 + toAddressSize + relayerFeeSize;

  const buf = Buffer.alloc(totalSize);
  let offset = 0;

  buf.writeUInt8(OVERRIDE_OUTBOUND_DISCRIMINATOR, offset);
  offset += 1;

  if (args.newToAddress) {
    buf.writeUInt8(1, offset);
    offset += 1;
    buf.set(args.newToAddress, offset);
    offset += 32;
  } else {
    buf.writeUInt8(0, offset);
    offset += 1;
  }

  if (args.newRelayerFee != null) {
    buf.writeUInt8(1, offset);
    offset += 1;
    buf.writeBigUInt64LE(args.newRelayerFee, offset);
  } else {
    buf.writeUInt8(0, offset);
  }

  return buf;
}

interface CreateOverrideOutboundInstructionArgs {
  caller: PublicKey;
  globalState: PublicKey;
  outboundOrder: PublicKey;
  data: Buffer;
}

export function createOverrideOutboundInstruction(
  args: CreateOverrideOutboundInstructionArgs,
): TransactionInstruction {
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: args.caller, isSigner: true, isWritable: true },
      { pubkey: args.globalState, isSigner: false, isWritable: false },
      { pubkey: args.outboundOrder, isSigner: false, isWritable: true },
    ],
    data: args.data,
  });
}
