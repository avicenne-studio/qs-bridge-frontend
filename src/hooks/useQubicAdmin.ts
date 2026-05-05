import { useCallback, useState } from "react";
import { useQubicWallet } from "@/providers/QubicWalletProvider";
import { buildAndBroadcastAdminTx } from "@/lib/bridge/qubic/transaction";
import {
  publicIdToBytes,
  buildAddRolePayload,
  buildRemoveRolePayload,
  buildTransferAdminPayload,
  buildEditThresholdPayload,
  buildEditFeeParametersPayload,
  PROC_TRANSFER_ADMIN,
  PROC_EDIT_ORACLE_THRESHOLD,
  PROC_ADD_ROLE,
  PROC_REMOVE_ROLE,
  PROC_PAUSE,
  PROC_UNPAUSE,
  PROC_EDIT_FEE_PARAMETERS,
} from "@/lib/bridge/qubic/admin-payloads";
import { QSB_CONTRACT_INDEX } from "@/lib/bridge/qubic/constants";

export interface QubicAdminActions {
  addRole: (account: string, role: number) => Promise<{ txId: string }>;
  removeRole: (account: string, role: number) => Promise<{ txId: string }>;
  transferAdmin: (newAdmin: string) => Promise<{ txId: string }>;
  editThreshold: (threshold: number) => Promise<{ txId: string }>;
  editFeeParameters: (
    protocolFeeRecipient: string,
    oracleFeeRecipient: string,
    bpsFee: number,
    protocolFee: number,
  ) => Promise<{ txId: string }>;
  pause: () => Promise<{ txId: string }>;
  unpause: () => Promise<{ txId: string }>;
  loading: boolean;
  error: string | null;
}

export function useQubicAdmin(): QubicAdminActions {
  const { session, sendQubicTransaction } = useQubicWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(inputType: number, payload: Uint8Array): Promise<{ txId: string }> {
    if (!session) throw new Error("Qubic wallet not connected");
    setLoading(true);
    setError(null);
    try {
      if (session.kind === "local") {
        if (!session.seed) throw new Error("Seed not available for this connection method");
        return await buildAndBroadcastAdminTx(session.seed, inputType, payload);
      }
      // WalletConnect path
      const txId = await sendQubicTransaction({
        amount: 0,
        contractIndex: QSB_CONTRACT_INDEX,
        inputType,
        payload,
      });
      return { txId };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  const addRole = useCallback(
    (account: string, role: number) =>
      send(PROC_ADD_ROLE, buildAddRolePayload(publicIdToBytes(account), role)),
    [session],
  );

  const removeRole = useCallback(
    (account: string, role: number) =>
      send(PROC_REMOVE_ROLE, buildRemoveRolePayload(publicIdToBytes(account), role)),
    [session],
  );

  const transferAdmin = useCallback(
    (newAdmin: string) =>
      send(PROC_TRANSFER_ADMIN, buildTransferAdminPayload(publicIdToBytes(newAdmin))),
    [session],
  );

  const editThreshold = useCallback(
    (threshold: number) => send(PROC_EDIT_ORACLE_THRESHOLD, buildEditThresholdPayload(threshold)),
    [session],
  );

  const editFeeParameters = useCallback(
    (
      protocolFeeRecipient: string,
      oracleFeeRecipient: string,
      bpsFee: number,
      protocolFee: number,
    ) =>
      send(
        PROC_EDIT_FEE_PARAMETERS,
        buildEditFeeParametersPayload(
          publicIdToBytes(protocolFeeRecipient),
          publicIdToBytes(oracleFeeRecipient),
          bpsFee,
          protocolFee,
        ),
      ),
    [session],
  );

  const pause = useCallback(() => send(PROC_PAUSE, new Uint8Array(0)), [session]);

  const unpause = useCallback(() => send(PROC_UNPAUSE, new Uint8Array(0)), [session]);

  return {
    addRole,
    removeRole,
    transferAdmin,
    editThreshold,
    editFeeParameters,
    pause,
    unpause,
    loading,
    error,
  };
}
