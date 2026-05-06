import { useState, useEffect } from "react";
import { Loader2, Trash2 } from "lucide-react";
import cn from "@/utils/classnames";
import { useAdminRoles, type SolanaOracle } from "@/hooks/useAdminRoles";
import { useSolanaAdmin } from "@/hooks/useSolanaAdmin";
import { useQubicAdmin } from "@/hooks/useQubicAdmin";
import {
  QUBIC_ROLE_ORACLE,
  QUBIC_ROLE_PAUSER,
  bytesToPublicId,
} from "@/lib/bridge/qubic/admin-payloads";
import useSolanaWallet from "@/hooks/useSolanaWallet";
import { useQubicWallet } from "@/providers/QubicWalletProvider";
import AdminActionForm from "./components/admin-action-form";
import AdminInput from "./components/admin-input";
import RoleBadge from "./components/role-badge";
import type { QubicConfig } from "@/lib/bridge/qubic/query";

function formatWQubic(raw: bigint): string {
  if (raw === 0n) return "0";
  const dec = 9;
  const whole = raw / BigInt(10 ** dec);
  const frac = (raw % BigInt(10 ** dec)).toString().padStart(dec, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole.toString();
}

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

type TxLink = { signature?: string; explorerUrl?: string };

function OracleTable({
  oracles,
  connectedAddress,
  isSolanaAdmin,
  tokenMint,
  onRemove,
  onClaim,
}: {
  oracles: SolanaOracle[];
  connectedAddress: string | null;
  isSolanaAdmin: boolean;
  tokenMint: string | null;
  onRemove?: (pubkey: string) => Promise<TxLink>;
  onClaim?: (pubkey: string) => Promise<TxLink>;
}) {
  const [removing, setRemoving] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastTx, setLastTx] = useState<TxLink | null>(null);

  if (oracles.length === 0) {
    return <p className="text-xs text-gray italic">No oracles</p>;
  }

  async function handleAction(
    key: string,
    setActive: (v: string | null) => void,
    fn: () => Promise<TxLink>,
  ) {
    setActive(key);
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setLastTx(null);
    try {
      const result = await fn();
      setLastTx(result);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [key]: err instanceof Error ? err.message : "Failed",
      }));
    } finally {
      setActive(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col divide-y divide-gray/10">
        {oracles.map(({ pubkey, claimableBalance }) => {
          const canClaim =
            tokenMint !== null &&
            claimableBalance > 0n &&
            (connectedAddress === pubkey || isSolanaAdmin);

          return (
            <li key={pubkey} className="flex flex-col gap-0.5 py-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-primary break-all flex-1">{pubkey}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {errors[pubkey] && (
                    <span className="text-xs text-rose-500">{errors[pubkey]}</span>
                  )}
                  {canClaim && onClaim && (
                    <button
                      onClick={() =>
                        handleAction(pubkey + ":claim", setClaiming, () => onClaim(pubkey))
                      }
                      disabled={claiming === pubkey + ":claim"}
                      className="text-xs text-highlight hover:opacity-80 transition-opacity disabled:opacity-40 font-medium"
                    >
                      {claiming === pubkey + ":claim" ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        "Claim"
                      )}
                    </button>
                  )}
                  {onRemove && (
                    <button
                      onClick={() => handleAction(pubkey, setRemoving, () => onRemove(pubkey))}
                      disabled={removing === pubkey}
                      className="text-gray hover:text-rose-500 transition-colors disabled:opacity-40"
                      title="Remove"
                    >
                      {removing === pubkey ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray">
                Claimable:{" "}
                <span className={claimableBalance > 0n ? "text-emerald-500 font-medium" : ""}>
                  {formatWQubic(claimableBalance)} wQUBIC
                </span>
              </p>
            </li>
          );
        })}
      </ul>
      {lastTx?.explorerUrl && (
        <a
          href={lastTx.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {lastTx.signature ?? "Success"}
        </a>
      )}
    </div>
  );
}

function SolanaAdminPanel({
  oracles,
  pausers,
  paused,
  owedProtocolFee,
  protocolFeeRecipient,
  tokenMint,
  bpsFee,
  protocolFeeBpsOfBps,
  isSolanaAdmin,
  isSolanaProtocolFeeRecipient,
  onRolesChanged,
}: {
  oracles: SolanaOracle[];
  pausers: string[];
  paused: boolean;
  owedProtocolFee: bigint;
  protocolFeeRecipient: string | null;
  tokenMint: string | null;
  bpsFee: number;
  protocolFeeBpsOfBps: number;
  isSolanaAdmin: boolean;
  isSolanaProtocolFeeRecipient: boolean;
  onRolesChanged: () => void;
}) {
  const solanaAdmin = useSolanaAdmin();
  const { address: solanaAddress } = useSolanaWallet();

  const [oracleKey, setOracleKey] = useState("");
  const [pauserKey, setPauserKey] = useState("");
  const [optimisticPaused, setOptimisticPaused] = useState<boolean | null>(null);
  useEffect(() => {
    setOptimisticPaused(null);
  }, [paused]);
  const effectivePaused = optimisticPaused ?? paused;

  return (
    <div className="flex flex-col gap-5">
      {/* Fee info */}
      <div className="flex flex-wrap gap-4 rounded-lg border border-gray/20 px-4 py-3">
        <Stat label="BPS fee" value={`${bpsFee} bps`} />
        <Stat label="Protocol share" value={`${protocolFeeBpsOfBps}%`} />
        <Stat
          label="Owed protocol fee"
          value={`${formatWQubic(owedProtocolFee)} wQUBIC`}
          highlight={owedProtocolFee > 0n ? "ok" : undefined}
        />
        {protocolFeeRecipient && (
          <div className="flex flex-col gap-0.5 w-full">
            <p className="text-xs text-gray">Protocol fee recipient</p>
            <p className="font-mono text-xs text-primary break-all">{protocolFeeRecipient}</p>
          </div>
        )}
      </div>

      {/* Claim protocol fee */}
      {isSolanaProtocolFeeRecipient && (
        <AdminActionForm
          title="Claim Protocol Fee"
          onSubmit={async () => {
            const r = await solanaAdmin.claimProtocolFee(tokenMint!);
            onRolesChanged();
            return r;
          }}
          submitLabel="Claim"
          disabled={owedProtocolFee === 0n || tokenMint === null}
        >
          <p className="text-xs text-gray">
            {owedProtocolFee === 0n
              ? "Nothing to claim."
              : `Claim ${formatWQubic(owedProtocolFee)} wQUBIC to your wallet.`}
          </p>
        </AdminActionForm>
      )}

      {/* Oracle + pauser lists */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-gray uppercase tracking-wide">
            Oracles ({oracles.length})
          </p>
          <OracleTable
            oracles={oracles}
            connectedAddress={solanaAddress}
            isSolanaAdmin={isSolanaAdmin}
            tokenMint={tokenMint}
            onRemove={
              isSolanaAdmin
                ? async (pubkey) => {
                    const r = await solanaAdmin.removeOracle(pubkey);
                    onRolesChanged();
                    return r;
                  }
                : undefined
            }
            onClaim={
              tokenMint
                ? async (pubkey) => {
                    const r = await solanaAdmin.claimOracleFee(pubkey, tokenMint);
                    onRolesChanged();
                    return r;
                  }
                : undefined
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-gray uppercase tracking-wide">
            Pausers ({pausers.length})
          </p>
          <AddressTable
            addresses={pausers}
            emptyLabel="No pausers"
            onRemove={
              isSolanaAdmin
                ? async (addr) => {
                    const r = await solanaAdmin.removePauser(addr);
                    onRolesChanged();
                    return r;
                  }
                : undefined
            }
          />
        </div>
      </div>

      {isSolanaAdmin && (
        <>
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
        </>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AdminActionForm
          title="Pause (Solana)"
          onSubmit={async () => {
            const r = await solanaAdmin.pause();
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
              : "Pauses all bridge transactions on Solana."}
          </p>
        </AdminActionForm>

        <AdminActionForm
          title="Unpause (Solana)"
          onSubmit={async () => {
            const r = await solanaAdmin.unpause();
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
              : "Resumes bridge transactions on Solana."}
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
  config,
  isQubicAdmin,
  isQubicPauser,
  onRolesChanged,
}: {
  oracles: string[];
  pausers: string[];
  paused: boolean;
  config: QubicConfig | null;
  isQubicAdmin: boolean;
  isQubicPauser: boolean;
  onRolesChanged: () => void;
}) {
  const qubicAdmin = useQubicAdmin();

  const [addRoleAddr, setAddRoleAddr] = useState("");
  const [addRoleType, setAddRoleType] = useState<number>(QUBIC_ROLE_ORACLE);
  const [removeRoleAddr, setRemoveRoleAddr] = useState("");
  const [removeRoleType, setRemoveRoleType] = useState<number>(QUBIC_ROLE_ORACLE);
  const [optimisticPaused, setOptimisticPaused] = useState<boolean | null>(null);
  useEffect(() => {
    setOptimisticPaused(null);
  }, [paused]);
  const effectivePaused = optimisticPaused ?? paused;
  const [newAdmin, setNewAdmin] = useState("");
  const [threshold, setThreshold] = useState("");
  const [protocolFeeRecipient, setProtocolFeeRecipient] = useState("");
  const [oracleFeeRecipient, setOracleFeeRecipient] = useState("");
  const [bpsFee, setBpsFee] = useState("");
  const [protocolFee, setProtocolFee] = useState("");

  useEffect(() => {
    if (!config) return;
    setThreshold(String(config.oracleThreshold));
    setBpsFee(String(config.bpsFee));
    setProtocolFee(String(config.protocolFee));
  }, [config]);

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
      {/* Current fee parameters */}
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

          <AdminActionForm
            title="Transfer Admin"
            description="Transfers Qubic contract admin rights to another address."
            onSubmit={async () => {
              const r = await qubicAdmin.transferAdmin(newAdmin.trim());
              onRolesChanged();
              return r;
            }}
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

export default function AdminPage() {
  const { connected: solanaConnected, address: solanaAddress } = useSolanaWallet();
  const { connected: qubicConnected, address: qubicAddress } = useQubicWallet();

  const {
    solanaAdmin,
    solanaProtocolFeeRecipient,
    solanaTokenMint,
    solanaPaused,
    solanaOwedProtocolFee,
    solanaBpsFee,
    solanaProtocolFeeBps,
    solanaOracles,
    solanaPausers,
    isSolanaAdmin,
    isSolanaPauser,
    isSolanaProtocolFeeRecipient,
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
                  <RoleBadge label="Fee recipient" active={isSolanaProtocolFeeRecipient} />
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
            <Stat label="Order era" value={String(qubicConfig.orderEra)} />
            <Stat
              label="Qubic bridge"
              value={qubicConfig.paused ? "Paused" : "Active"}
              highlight={qubicConfig.paused ? "warn" : "ok"}
            />
            <Stat
              label="Solana bridge"
              value={solanaPaused ? "Paused" : "Active"}
              highlight={solanaPaused ? "warn" : "ok"}
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
            owedProtocolFee={solanaOwedProtocolFee}
            protocolFeeRecipient={solanaProtocolFeeRecipient}
            tokenMint={solanaTokenMint}
            bpsFee={solanaBpsFee}
            protocolFeeBpsOfBps={solanaProtocolFeeBps}
            isSolanaAdmin={isSolanaAdmin}
            isSolanaProtocolFeeRecipient={isSolanaProtocolFeeRecipient}
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
            config={qubicConfig}
            isQubicAdmin={isQubicAdmin}
            isQubicPauser={isQubicPauser}
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
