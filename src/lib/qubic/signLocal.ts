import cryptoPromise from "@ardata-tech/qubic-js/dist/crypto";
import { hexToBytes } from "../qubicIdentity";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CryptoModule = { schnorrq: any };

let resolvedCrypto: CryptoModule | null = null;

async function getCrypto(): Promise<CryptoModule> {
  if (!resolvedCrypto) {
    resolvedCrypto = await cryptoPromise;
  }
  return resolvedCrypto!;
}

export async function signMessageLocally(
  message: Uint8Array,
  privateKeyHex: string,
): Promise<Uint8Array> {
  const { schnorrq } = await getCrypto();
  const privateKey = hexToBytes(privateKeyHex);
  const publicKey = schnorrq.generatePublicKey(privateKey);
  return schnorrq.sign(privateKey, publicKey, message);
}
