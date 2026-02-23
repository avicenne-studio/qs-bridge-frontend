declare module "@qubic-lib/qubic-ts-vault-library" {
  export interface VaultSeed {
    publicId: string;
    isOnlyWatch: boolean;
    alias?: string;
  }

  export class QubicVault {
    importAndUnlock(encrypt: boolean, password: string, config: unknown, file: File): Promise<void>;
    getSeeds(): VaultSeed[];
    revealSeed(publicId: string): Promise<string>;
  }
}
