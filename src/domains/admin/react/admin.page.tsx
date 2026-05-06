import { Loader2 } from "lucide-react";
import cn from "@/utils/classnames";
import { useAdminRoles } from "@/hooks/useAdminRoles";
import useSolanaWallet from "@/hooks/useSolanaWallet";
import { useQubicWallet } from "@/providers/QubicWalletProvider";
import RoleBadge from "./components/role-badge";
import SectionTitle from "./components/section-title";
import Stat from "./components/stat";
import SolanaAdminPanel from "./components/solana-admin-panel";
import QubicAdminPanel from "./components/qubic-admin-panel";

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
    <div className={cn("flex w-full flex-col gap-8", "p-0 py-8 pb-16 xl:p-8 xl:pb-16")}>
      <div className="flex items-center justify-between">
        <button
          onClick={refresh}
          className="text-xs text-gray hover:text-primary transition-colors"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : "Refresh"}
        </button>
      </div>

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
