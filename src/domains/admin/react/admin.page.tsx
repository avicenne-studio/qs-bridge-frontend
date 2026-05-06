import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
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
    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray border-b border-gray/20 pb-2">
      {children}
    </h2>
  );
}

function AddressTable({
  addresses,
  emptyLabel,
  onRemove,
}: {
  addresses: string[];
  emptyLabel: string;
  onRemove?: (addr: string) => Promise<unknown>;
}) {
  const [removing, setRemoving] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (addresses.length === 0) {
    return <p className="text-xs text-gray italic">{emptyLabel}</p>;
  }

  async function handleRemove(addr: string) {
    if (!onRemove) return;
    setRemoving(addr);
    setErrors((prev) => ({ ...prev, [addr]: "" }));
    try {
      await onRemove(addr);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [addr]: err instanceof Error ? err.message : "Failed",
      }));
    } finally {
      setRemoving(null);
    }
  }

  return (
    <ul className="flex flex-col divide-y divide-gray/10">
      {addresses.map((addr) => (
        <li key={addr} className="flex items-center justify-between gap-2 py-1.5">
          <span className="font-mono text-xs text-primary break-all flex-1">{addr}</span>
          <div className="flex items-center gap-1.5 shrink-0">
            {errors[addr] && <span className="text-xs text-rose-500">{errors[addr]}</span>}
            {onRemove && (
              <button
                onClick={() => handleRemove(addr)}
                disabled={removing === addr}
                className="text-gray hover:text-rose-500 transition-colors disabled:opacity-40"
                title="Remove"
              >
                {removing === addr ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Trash2 size={13} />
                )}
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function SolanaAdminPanel({
  oracles,
  pausers,
  paused,
  onRolesChanged,
}: {
  oracles: string[];
  pausers: string[];
  paused: boolean;
  onRolesChanged: () => void;
}) {
  const solanaAdmin = useSolanaAdmin();

  const [oracleKey, setOracleKey] = useState("");
  const [pauserKey, setPauserKey] = useState("");

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-gray uppercase tracking-wide">
            Oracles ({oracles.length})
          </p>
          <AddressTable
            addresses={oracles}
            emptyLabel="No oracles"
            onRemove={async (addr) => {
              const r = await solanaAdmin.removeOracle(addr);
              onRolesChanged();
              return r;
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-gray uppercase tracking-wide">
            Pausers ({pausers.length})
          </p>
          <AddressTable
            addresses={pausers}
            emptyLabel="No pausers"
            onRemove={async (addr) => {
              const r = await solanaAdmin.removePauser(addr);
              onRolesChanged();
              return r;
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AdminActionForm
          title="Add Oracle"
          onSubmit={async () => {
            const r = await solanaAdmin.addOracle(oracleKey.trim());
            onRolesChanged();
            return r;
          }}
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
          title="Add Pauser"
          onSubmit={async () => {
            const r = await solanaAdmin.addPauser(pauserKey.trim());
            onRolesChanged();
            return r;
          }}
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
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AdminActionForm
          title="Pause (Solana)"
          onSubmit={async () => {
            const r = await solanaAdmin.pause();
            onRolesChanged();
            return r;
          }}
          submitLabel="Pause"
          disabled={paused}
        >
          <p className="text-xs text-gray">
            {paused ? "Bridge is already paused." : "Pauses all bridge transactions on Solana."}
          </p>
        </AdminActionForm>

        <AdminActionForm
          title="Unpause (Solana)"
          onSubmit={async () => {
            const r = await solanaAdmin.unpause();
            onRolesChanged();
            return r;
          }}
          submitLabel="Unpause"
          disabled={!paused}
        >
          <p className="text-xs text-gray">
            {!paused ? "Bridge is already active." : "Resumes bridge transactions on Solana."}
          </p>
        </AdminActionForm>
      </div>
    </div>
  );
}

function QubicAdminPanel({
  oracles,
  pausers,
  paused,
  onRolesChanged,
}: {
  oracles: string[];
  pausers: string[];
  paused: boolean;
  onRolesChanged: () => void;
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

  function RoleSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray">Role</span>
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="rounded border border-gray/30 bg-white/80 px-2.5 py-1.5 text-xs text-primary focus:outline-none focus:border-highlight/60"
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
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-gray uppercase tracking-wide">
            Oracles ({oracles.length})
          </p>
          <AddressTable addresses={oracles} emptyLabel="No oracles" />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-gray uppercase tracking-wide">
            Pausers ({pausers.length})
          </p>
          <AddressTable addresses={pausers} emptyLabel="No pausers" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AdminActionForm
          title="Add Role"
          onSubmit={async () => {
            const r = await qubicAdmin.addRole(addRoleAddr.trim(), addRoleType);
            onRolesChanged();
            return r;
          }}
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AdminActionForm
          title="Pause (Qubic)"
          onSubmit={async () => {
            const r = await qubicAdmin.pause();
            onRolesChanged();
            return r;
          }}
          submitLabel="Pause"
          disabled={paused}
        >
          <p className="text-xs text-gray">
            {paused ? "Bridge is already paused." : "Pauses all bridge transactions on Qubic."}
          </p>
        </AdminActionForm>

        <AdminActionForm
          title="Unpause (Qubic)"
          onSubmit={async () => {
            const r = await qubicAdmin.unpause();
            onRolesChanged();
            return r;
          }}
          submitLabel="Unpause"
          disabled={!paused}
        >
          <p className="text-xs text-gray">
            {!paused ? "Bridge is already active." : "Resumes bridge transactions on Qubic."}
          </p>
        </AdminActionForm>
      </div>

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
          protocolFeeRecipient.trim().length !== 60 || oracleFeeRecipient.trim().length !== 60
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
    </div>
  );
}

export default function AdminPage() {
  const { connected: solanaConnected, address: solanaAddress } = useSolanaWallet();
  const { connected: qubicConnected, address: qubicAddress } = useQubicWallet();

  const {
    solanaAdmin,
    solanaPaused,
    solanaOracles,
    solanaPausers,
    isSolanaAdmin,
    isSolanaPauser,
    isQubicAdmin,
    isQubicPauser,
    qubicOracles,
    qubicPausers,
    qubicConfig,
    loading,
    refresh,
  } = useAdminRoles();

  return (
    <div className={cn("flex w-full flex-col gap-8", "p-0 py-8 xl:p-8")}>
      <div className="flex items-center justify-between">
        <button
          onClick={refresh}
          className="text-xs text-gray hover:text-primary transition-colors"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : "Refresh"}
        </button>
      </div>

      {/* Status overview */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray/20 bg-white/3 px-5 py-4">
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
                  <RoleBadge label="Pauser" active={isQubicPauser} />
                </div>
              </>
            ) : (
              <p className="text-xs text-gray">Not connected</p>
            )}
          </div>
        </div>

        {qubicConfig && (
          <div className="mt-1 flex flex-wrap gap-4 border-t border-gray/20 pt-3">
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

      {solanaConnected && (
        <div className="flex flex-col gap-4">
          <SectionTitle>Solana</SectionTitle>
          <SolanaAdminPanel
            oracles={solanaOracles}
            pausers={solanaPausers}
            paused={solanaPaused}
            onRolesChanged={refresh}
          />
        </div>
      )}

      {qubicConnected && (
        <div className="flex flex-col gap-4">
          <SectionTitle>Qubic</SectionTitle>
          <QubicAdminPanel
            oracles={qubicOracles}
            pausers={qubicPausers}
            paused={qubicConfig?.paused ?? false}
            onRolesChanged={refresh}
          />
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
