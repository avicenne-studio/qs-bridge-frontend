import { useState } from "react";
import { Loader2 } from "lucide-react";
import cn from "@/utils/classnames";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import { useSolanaAdmin } from "@/hooks/useSolanaAdmin";
import { useQubicAdmin } from "@/hooks/useQubicAdmin";
import { QUBIC_ROLE_ORACLE, QUBIC_ROLE_PAUSER } from "@/lib/bridge/qubic/admin-payloads";
import useSolanaWallet from "@/hooks/useSolanaWallet";
import { useQubicWallet } from "@/providers/QubicWalletProvider";
import AdminActionForm from "./components/admin-action-form";
import AdminInput from "./components/admin-input";
import RoleBadge from "./components/role-badge";

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray border-b border-white/8 pb-2">
      {children}
    </h2>
  );
}

function SolanaAdminPanel({
  isSolanaAdmin,
  isSolanaPauser,
}: {
  isSolanaAdmin: boolean;
  isSolanaPauser: boolean;
}) {
  const solanaAdmin = useSolanaAdmin();

  const [oracleKey, setOracleKey] = useState("");
  const [removeOracleKey, setRemoveOracleKey] = useState("");
  const [pauserKey, setPauserKey] = useState("");
  const [removePauserKey, setRemovePauserKey] = useState("");

  return (
    <div className="flex flex-col gap-3">
      {isSolanaAdmin && (
        <>
          <AdminActionForm
            title="Add Oracle"
            onSubmit={() => solanaAdmin.addOracle(oracleKey.trim())}
            submitLabel="Add Oracle"
            disabled={!oracleKey.trim()}
          >
            <AdminInput
              label="Oracle Solana address (base58)"
              value={oracleKey}
              onChange={setOracleKey}
              placeholder="Pubkey..."
            />
          </AdminActionForm>

          <AdminActionForm
            title="Remove Oracle"
            description="Fails if the oracle has unclaimed fees."
            onSubmit={() => solanaAdmin.removeOracle(removeOracleKey.trim())}
            submitLabel="Remove Oracle"
            disabled={!removeOracleKey.trim()}
          >
            <AdminInput
              label="Oracle Solana address (base58)"
              value={removeOracleKey}
              onChange={setRemoveOracleKey}
              placeholder="Pubkey..."
            />
          </AdminActionForm>

          <AdminActionForm
            title="Add Pauser"
            onSubmit={() => solanaAdmin.addPauser(pauserKey.trim())}
            submitLabel="Add Pauser"
            disabled={!pauserKey.trim()}
          >
            <AdminInput
              label="Pauser Solana address (base58)"
              value={pauserKey}
              onChange={setPauserKey}
              placeholder="Pubkey..."
            />
          </AdminActionForm>

          <AdminActionForm
            title="Remove Pauser"
            onSubmit={() => solanaAdmin.removePauser(removePauserKey.trim())}
            submitLabel="Remove Pauser"
            disabled={!removePauserKey.trim()}
          >
            <AdminInput
              label="Pauser Solana address (base58)"
              value={removePauserKey}
              onChange={setRemovePauserKey}
              placeholder="Pubkey..."
            />
          </AdminActionForm>
        </>
      )}

      {isSolanaPauser && (
        <>
          <AdminActionForm
            title="Pause (Solana)"
            onSubmit={async () => solanaAdmin.pause()}
            submitLabel="Pause"
          >
            <p className="text-xs text-gray">Pauses all bridge transactions on Solana.</p>
          </AdminActionForm>

          <AdminActionForm
            title="Unpause (Solana)"
            onSubmit={async () => solanaAdmin.unpause()}
            submitLabel="Unpause"
          >
            <p className="text-xs text-gray">Resumes bridge transactions on Solana.</p>
          </AdminActionForm>
        </>
      )}
    </div>
  );
}

function QubicAdminPanel({
  isQubicAdmin,
  isQubicPauser,
}: {
  isQubicAdmin: boolean;
  isQubicPauser: boolean;
}) {
  const qubicAdmin = useQubicAdmin();

  const [addRoleAddr, setAddRoleAddr] = useState("");
  const [addRoleType, setAddRoleType] = useState<number>(QUBIC_ROLE_ORACLE);
  const [removeRoleAddr, setRemoveRoleAddr] = useState("");
  const [removeRoleType, setRemoveRoleType] = useState<number>(QUBIC_ROLE_ORACLE);
  const [newAdmin, setNewAdmin] = useState("");
  const [threshold, setThreshold] = useState("1");
  const [protocolFeeRecipient, setProtocolFeeRecipient] = useState("");
  const [oracleFeeRecipient, setOracleFeeRecipient] = useState("");
  const [bpsFee, setBpsFee] = useState("100");
  const [protocolFee, setProtocolFee] = useState("1000");

  const roleOptions = [
    { value: QUBIC_ROLE_ORACLE, label: "Oracle" },
    { value: QUBIC_ROLE_PAUSER, label: "Pauser" },
  ];

  function RoleSelect({
    value,
    onChange,
  }: {
    value: number;
    onChange: (v: number) => void;
  }) {
    return (
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray">Role</span>
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="rounded border border-white/12 bg-primary-dark px-2.5 py-1.5 text-xs text-primary focus:outline-none focus:border-accent/60"
        >
          {roleOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {isQubicAdmin && (
        <>
          <AdminActionForm
            title="Add Role"
            onSubmit={() => qubicAdmin.addRole(addRoleAddr.trim(), addRoleType)}
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
            onSubmit={() => qubicAdmin.removeRole(removeRoleAddr.trim(), removeRoleType)}
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

          <AdminActionForm
            title="Transfer Admin"
            description="Transfers Qubic contract admin rights to another address."
            onSubmit={() => qubicAdmin.transferAdmin(newAdmin.trim())}
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
            onSubmit={() => qubicAdmin.editThreshold(Number(threshold))}
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
            description="Update fee recipients and basis points."
            onSubmit={() =>
              qubicAdmin.editFeeParameters(
                protocolFeeRecipient.trim(),
                oracleFeeRecipient.trim(),
                Number(bpsFee),
                Number(protocolFee),
              )
            }
            submitLabel="Update Fees"
            disabled={
              protocolFeeRecipient.trim().length !== 60 ||
              oracleFeeRecipient.trim().length !== 60
            }
          >
            <AdminInput
              label="Protocol fee recipient (Qubic publicId)"
              value={protocolFeeRecipient}
              onChange={setProtocolFeeRecipient}
              placeholder="AAAAAAA..."
            />
            <AdminInput
              label="Oracle fee recipient (Qubic publicId)"
              value={oracleFeeRecipient}
              onChange={setOracleFeeRecipient}
              placeholder="AAAAAAA..."
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
                label="Protocol fee BPS-of-BPS (0–100)"
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

      {(isQubicAdmin || isQubicPauser) && (
        <>
          <AdminActionForm
            title="Pause (Qubic)"
            onSubmit={async () => qubicAdmin.pause()}
            submitLabel="Pause"
          >
            <p className="text-xs text-gray">Pauses all bridge transactions on Qubic.</p>
          </AdminActionForm>

          <AdminActionForm
            title="Unpause (Qubic)"
            onSubmit={async () => qubicAdmin.unpause()}
            submitLabel="Unpause"
          >
            <p className="text-xs text-gray">Resumes bridge transactions on Qubic.</p>
          </AdminActionForm>
        </>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { connected: solanaConnected, address: solanaAddress } = useSolanaWallet();
  const { connected: qubicConnected, address: qubicAddress } = useQubicWallet();

  const {
    solanaAdmin,
    isSolanaAdmin,
    isSolanaPauser,
    isQubicAdmin,
    isQubicOracle,
    isQubicPauser,
    qubicConfig,
    loading,
    refresh,
  } = useAdminRoles();

  const hasSolanaAccess = isSolanaAdmin || isSolanaPauser;
  const hasQubicAccess = isQubicAdmin || isQubicPauser;

  return (
    <div className={cn("flex w-full flex-col gap-8", "p-0 py-8 xl:p-8")}>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-primary">Admin Panel</h1>
        <button
          onClick={refresh}
          className="text-xs text-gray hover:text-primary transition-colors"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : "Refresh"}
        </button>
      </div>

      {/* Status overview */}
      <div className="flex flex-col gap-4 rounded-xl border border-white/8 bg-white/3 px-5 py-4">
        <SectionTitle>Connected wallets</SectionTitle>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-gray">Solana</p>
            {solanaConnected && solanaAddress ? (
              <>
                <p className="font-mono text-xs text-primary break-all">{solanaAddress}</p>
                <div className="flex flex-wrap gap-1.5">
                  <RoleBadge label="Admin" active={isSolanaAdmin} />
                  <RoleBadge label="Pauser" active={isSolanaPauser} />
                </div>
                {solanaAdmin && (
                  <p className="text-xs text-gray">
                    Contract admin:{" "}
                    <span className="font-mono text-gray/70 break-all">{solanaAdmin}</span>
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-gray">Not connected</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-gray">Qubic</p>
            {qubicConnected && qubicAddress ? (
              <>
                <p className="font-mono text-xs text-primary break-all">{String(qubicAddress)}</p>
                <div className="flex flex-wrap gap-1.5">
                  <RoleBadge label="Admin" active={isQubicAdmin} />
                  <RoleBadge label="Oracle" active={isQubicOracle} />
                  <RoleBadge label="Pauser" active={isQubicPauser} />
                </div>
              </>
            ) : (
              <p className="text-xs text-gray">Not connected</p>
            )}
          </div>
        </div>

        {qubicConfig && (
          <div className="mt-1 flex flex-wrap gap-4 border-t border-white/8 pt-3">
            <Stat label="Oracles" value={String(qubicConfig.oracleCount)} />
            <Stat label="Pausers" value={String(qubicConfig.pauserCount)} />
            <Stat label="Oracle threshold" value={String(qubicConfig.oracleThreshold)} />
            <Stat label="BPS fee" value={String(qubicConfig.bpsFee)} />
            <Stat label="Protocol fee" value={String(qubicConfig.protocolFee)} />
            <Stat label="Order era" value={String(qubicConfig.orderEra)} />
            <Stat
              label="Qubic bridge"
              value={qubicConfig.paused ? "Paused" : "Active"}
              highlight={qubicConfig.paused ? "warn" : "ok"}
            />
          </div>
        )}
      </div>

      {/* Solana admin actions */}
      {solanaConnected && hasSolanaAccess && (
        <div className="flex flex-col gap-4">
          <SectionTitle>Solana</SectionTitle>
          <SolanaAdminPanel isSolanaAdmin={isSolanaAdmin} isSolanaPauser={isSolanaPauser} />
        </div>
      )}

      {/* Qubic admin actions */}
      {qubicConnected && hasQubicAccess && (
        <div className="flex flex-col gap-4">
          <SectionTitle>Qubic</SectionTitle>
          <QubicAdminPanel isQubicAdmin={isQubicAdmin} isQubicPauser={isQubicPauser} />
        </div>
      )}

      {/* No access */}
      {!hasSolanaAccess && !hasQubicAccess && (solanaConnected || qubicConnected) && !loading && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-sm text-gray">No admin or pauser roles detected for connected wallets.</p>
          <p className="text-xs text-gray/60">Connect the wallet that holds admin or pauser privileges.</p>
        </div>
      )}

      {!solanaConnected && !qubicConnected && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-sm text-gray">Connect a wallet to access admin controls.</p>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "ok" | "warn";
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-gray">{label}</p>
      <p
        className={cn(
          "text-sm font-medium",
          highlight === "ok" && "text-emerald-400",
          highlight === "warn" && "text-amber-400",
          !highlight && "text-primary",
        )}
      >
        {value}
      </p>
    </div>
  );
}
