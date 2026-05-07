import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useQubicAdmin } from "@/hooks/useQubicAdmin";
import { useQubicWallet } from "@/providers/QubicWalletProvider";
import {
  QUBIC_ROLE_ORACLE,
  QUBIC_ROLE_PAUSER,
  bytesToPublicId,
} from "@/lib/bridge/qubic/admin-payloads";
import AdminActionForm from "./admin-action-form";
import AdminInput from "./admin-input";
import AddressTable from "./address-table";
import RoleSelect from "./role-select";
import Stat from "./stat";
import type { QubicConfig } from "@/lib/bridge/qubic/query";

interface Props {
  oracles: string[];
  pausers: string[];
  paused: boolean;
  config: QubicConfig | null;
  isQubicAdmin: boolean;
  isQubicPauser: boolean;
  onRolesChanged: () => void;
}

export default function QubicAdminPanel({
  oracles,
  pausers,
  paused,
  config,
  isQubicAdmin,
  isQubicPauser,
  onRolesChanged,
}: Props) {
  const qubicAdmin = useQubicAdmin();
  const { address: qubicAddress } = useQubicWallet();

  const [addRoleAddr, setAddRoleAddr] = useState("");
  const [addRoleType, setAddRoleType] = useState<number>(QUBIC_ROLE_ORACLE);
  const [removeRoleAddr, setRemoveRoleAddr] = useState("");
  const [removeRoleType, setRemoveRoleType] = useState<number>(QUBIC_ROLE_ORACLE);
  const [optimisticPaused, setOptimisticPaused] = useState<boolean | null>(null);

  const [optimisticOracleAdds, setOptimisticOracleAdds] = useState<string[]>([]);
  const [optimisticPauserAdds, setOptimisticPauserAdds] = useState<string[]>([]);
  const [optimisticOracleRemovals, setOptimisticOracleRemovals] = useState<Set<string>>(new Set());
  const [optimisticPauserRemovals, setOptimisticPauserRemovals] = useState<Set<string>>(new Set());

  const [newAdmin, setNewAdmin] = useState("");
  const [threshold, setThreshold] = useState("");
  const [protocolFeeRecipient, setProtocolFeeRecipient] = useState("");
  const [oracleFeeRecipient, setOracleFeeRecipient] = useState("");
  const [bpsFee, setBpsFee] = useState("");
  const [protocolFee, setProtocolFee] = useState("");

  useEffect(() => {
    setOptimisticPaused(null);
  }, [paused]);

  useEffect(() => {
    if (!config) return;
    setThreshold(String(config.oracleThreshold));
    setBpsFee(String(config.bpsFee));
    setProtocolFee(String(config.protocolFee));
  }, [config]);

  // Deduplicate optimistic adds against confirmed list (avoids duplicates after refresh)
  const displayedOracles = [
    ...oracles,
    ...optimisticOracleAdds.filter((a) => !oracles.includes(a)),
  ].filter((a) => !optimisticOracleRemovals.has(a));

  const displayedPausers = [
    ...pausers,
    ...optimisticPauserAdds.filter((a) => !pausers.includes(a)),
  ].filter((a) => !optimisticPauserRemovals.has(a));

  const effectivePaused = optimisticPaused ?? paused;

  const hasAnyRole =
    isQubicAdmin ||
    isQubicPauser ||
    (qubicAddress !== null && oracles.includes(String(qubicAddress)));

  function handleAddSuccess() {
    const addr = addRoleAddr.trim();
    if (addRoleType === QUBIC_ROLE_ORACLE) {
      setOptimisticOracleAdds((prev) => [...prev, addr]);
    } else if (addRoleType === QUBIC_ROLE_PAUSER) {
      setOptimisticPauserAdds((prev) => [...prev, addr]);
    }
    setAddRoleAddr("");
  }

  function handleRemoveSuccess() {
    const addr = removeRoleAddr.trim();
    if (removeRoleType === QUBIC_ROLE_ORACLE) {
      setOptimisticOracleRemovals((prev) => new Set([...prev, addr]));
    } else if (removeRoleType === QUBIC_ROLE_PAUSER) {
      setOptimisticPauserRemovals((prev) => new Set([...prev, addr]));
    }
    setRemoveRoleAddr("");
  }

  return (
    <div className="flex flex-col gap-5">
      {!hasAnyRole && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-400">
          <AlertTriangle size={13} className="shrink-0" />
          <span>Connected wallet has no role on this contract (not admin, pauser, or oracle).</span>
        </div>
      )}
      {config && (
        <div className="flex flex-wrap gap-4 rounded-lg border border-gray/20 px-4 py-3">
          <Stat label="BPS fee" value={`${config.bpsFee} bps`} />
          <Stat label="Protocol share" value={`${config.protocolFee}%`} />
          <Stat label="Oracle threshold" value={String(config.oracleThreshold)} />
          <div className="flex flex-col gap-0.5 w-full">
            <p className="text-xs text-gray">Protocol fee recipient</p>
            <p className="font-mono text-xs text-primary break-all">
              {bytesToPublicId(config.protocolFeeRecipientBytes)}
            </p>
          </div>
          <div className="flex flex-col gap-0.5 w-full">
            <p className="text-xs text-gray">Oracle fee recipient</p>
            <p className="font-mono text-xs text-primary break-all">
              {bytesToPublicId(config.oracleFeeRecipientBytes)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-gray uppercase tracking-wide">
            Oracles ({displayedOracles.length})
          </p>
          <AddressTable addresses={displayedOracles} emptyLabel="No oracles" />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-gray uppercase tracking-wide">
            Pausers ({displayedPausers.length})
          </p>
          <AddressTable addresses={displayedPausers} emptyLabel="No pausers" />
        </div>
      </div>

      {(isQubicAdmin || isQubicPauser) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AdminActionForm
            title="Pause (Qubic)"
            onSubmit={async () => {
              const r = await qubicAdmin.pause();
              setOptimisticPaused(true);
              onRolesChanged();
              return r;
            }}
            submitLabel="Pause"
            disabled={effectivePaused}
          >
            <p className="text-xs text-gray">
              {effectivePaused
                ? "Bridge is already paused."
                : "Pauses all bridge transactions on Qubic."}
            </p>
          </AdminActionForm>

          <AdminActionForm
            title="Unpause (Qubic)"
            onSubmit={async () => {
              const r = await qubicAdmin.unpause();
              setOptimisticPaused(false);
              onRolesChanged();
              return r;
            }}
            submitLabel="Unpause"
            disabled={!effectivePaused}
          >
            <p className="text-xs text-gray">
              {!effectivePaused
                ? "Bridge is already active."
                : "Resumes bridge transactions on Qubic."}
            </p>
          </AdminActionForm>
        </div>
      )}

      {isQubicAdmin && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AdminActionForm
              title="Add Role"
              onSubmit={async () => {
                const r = await qubicAdmin.addRole(addRoleAddr.trim(), addRoleType);
                onRolesChanged();
                return r;
              }}
              onSuccess={handleAddSuccess}
              submitLabel="Add Role"
              disabled={addRoleAddr.trim().length !== 60}
            >
              <AdminInput
                label="Account (Qubic publicId, 60 chars)"
                value={addRoleAddr}
                onChange={setAddRoleAddr}
                placeholder="AAAAAAA..."
              />
              <RoleSelect value={addRoleType} onChange={setAddRoleType} />
            </AdminActionForm>

            <AdminActionForm
              title="Remove Role"
              onSubmit={async () => {
                const r = await qubicAdmin.removeRole(removeRoleAddr.trim(), removeRoleType);
                onRolesChanged();
                return r;
              }}
              onSuccess={handleRemoveSuccess}
              submitLabel="Remove Role"
              disabled={removeRoleAddr.trim().length !== 60}
            >
              <AdminInput
                label="Account (Qubic publicId, 60 chars)"
                value={removeRoleAddr}
                onChange={setRemoveRoleAddr}
                placeholder="AAAAAAA..."
              />
              <RoleSelect value={removeRoleType} onChange={setRemoveRoleType} />
            </AdminActionForm>
          </div>

          <AdminActionForm
            title="Transfer Admin"
            description="Transfers Qubic contract admin rights to another address."
            onSubmit={async () => {
              const r = await qubicAdmin.transferAdmin(newAdmin.trim());
              onRolesChanged();
              return r;
            }}
            onSuccess={() => setNewAdmin("")}
            submitLabel="Transfer Admin"
            disabled={newAdmin.trim().length !== 60}
          >
            <AdminInput
              label="New admin (Qubic publicId, 60 chars)"
              value={newAdmin}
              onChange={setNewAdmin}
              placeholder="AAAAAAA..."
            />
          </AdminActionForm>

          <AdminActionForm
            title="Edit Oracle Threshold"
            description="Minimum number of oracle signatures required to process a transfer."
            onSubmit={async () => {
              const r = await qubicAdmin.editThreshold(Number(threshold));
              onRolesChanged();
              return r;
            }}
            submitLabel="Set Threshold"
            disabled={!threshold || Number(threshold) < 1}
          >
            <AdminInput
              label="New threshold"
              value={threshold}
              onChange={setThreshold}
              type="number"
              min={1}
              max={255}
            />
          </AdminActionForm>

          <AdminActionForm
            title="Edit Fee Parameters"
            description="Leave an address blank to keep the current recipient. Set bps/share to 0 to keep current."
            onSubmit={async () => {
              const ZERO_ID = "A".repeat(60);
              const r = await qubicAdmin.editFeeParameters(
                protocolFeeRecipient.trim() || ZERO_ID,
                oracleFeeRecipient.trim() || ZERO_ID,
                Number(bpsFee),
                Number(protocolFee),
              );
              onRolesChanged();
              return r;
            }}
            submitLabel="Update Fees"
            disabled={
              (protocolFeeRecipient.trim() !== "" && protocolFeeRecipient.trim().length !== 60) ||
              (oracleFeeRecipient.trim() !== "" && oracleFeeRecipient.trim().length !== 60) ||
              bpsFee === "" ||
              protocolFee === ""
            }
          >
            <AdminInput
              label="Protocol fee recipient (leave blank to keep current)"
              value={protocolFeeRecipient}
              onChange={setProtocolFeeRecipient}
              placeholder="AAAAAAA... (optional)"
            />
            <AdminInput
              label="Oracle fee recipient (leave blank to keep current)"
              value={oracleFeeRecipient}
              onChange={setOracleFeeRecipient}
              placeholder="AAAAAAA... (optional)"
            />
            <div className="grid grid-cols-2 gap-2">
              <AdminInput
                label="BPS fee (0–10000)"
                value={bpsFee}
                onChange={setBpsFee}
                type="number"
                min={0}
                max={10000}
              />
              <AdminInput
                label="Protocol share % (0–100)"
                value={protocolFee}
                onChange={setProtocolFee}
                type="number"
                min={0}
                max={100}
              />
            </div>
          </AdminActionForm>
        </>
      )}
    </div>
  );
}
