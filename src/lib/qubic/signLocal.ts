import cryptoPromise from "@ardata-tech/qubic-js/dist/crypto";
import { hexToBytes } from "../qubicIdentity";

type SchnorrQ = {
  generatePublicKey(secretKey: Uint8Array): Uint8Array;
  sign(secretKey: Uint8Array, publicKey: Uint8Array, message: Uint8Array): Uint8Array;
  verify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): number;
};

type CryptoModule = {
  schnorrq: SchnorrQ;
};

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
