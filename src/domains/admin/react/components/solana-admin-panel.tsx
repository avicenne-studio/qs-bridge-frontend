import { useState, useEffect } from "react";
import { useSolanaAdmin } from "@/hooks/useSolanaAdmin";
import useSolanaWallet from "@/hooks/useSolanaWallet";
import { formatWQubic } from "../utils";
import AdminActionForm from "./admin-action-form";
import AdminInput from "./admin-input";
import AddressTable from "./address-table";
import OracleTable from "./oracle-table";
import Stat from "./stat";
import type { SolanaOracle } from "@/hooks/useAdminRoles";

interface Props {
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
}

export default function SolanaAdminPanel({
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
}: Props) {
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
      <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray/20 px-4 py-3 sm:grid-cols-2">
        <div className="flex flex-wrap gap-4">
          <Stat label="BPS fee" value={`${bpsFee} bps`} />
          <Stat label="Protocol share" value={`${protocolFeeBpsOfBps / 100}%`} />
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
      </div>

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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AdminActionForm
            title="Add Oracle"
            onSubmit={async () => {
              const r = await solanaAdmin.addOracle(oracleKey.trim());
              onRolesChanged();
              return r;
            }}
            onSuccess={() => setOracleKey("")}
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
            onSuccess={() => setPauserKey("")}
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
