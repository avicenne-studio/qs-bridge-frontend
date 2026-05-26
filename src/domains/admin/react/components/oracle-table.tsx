import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { formatWQubic } from "../utils";
import type { SolanaOracle } from "@/hooks/useAdminRoles";

type TxLink = { signature?: string; explorerUrl?: string };

interface Props {
  oracles: SolanaOracle[];
  connectedAddress: string | null;
  isSolanaAdmin: boolean;
  tokenMint: string | null;
  onRemove?: (pubkey: string) => Promise<TxLink>;
  onClaim?: (pubkey: string) => Promise<TxLink>;
}

export default function OracleTable({
  oracles,
  connectedAddress,
  isSolanaAdmin,
  tokenMint,
  onRemove,
  onClaim,
}: Props) {
  const [removing, setRemoving] = useState<string | null>(null);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [optimisticRemovals, setOptimisticRemovals] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastTx, setLastTx] = useState<TxLink | null>(null);

  const displayed = oracles.filter(({ pubkey }) => !optimisticRemovals.has(pubkey));

  if (displayed.length === 0 && !removing) {
    return <p className="text-xs text-gray italic">No oracles</p>;
  }

  async function handleRemove(pubkey: string) {
    if (!onRemove) return;
    setRemoving(pubkey);
    setOptimisticRemovals((prev) => new Set([...prev, pubkey]));
    setErrors((prev) => ({ ...prev, [pubkey]: "" }));
    setLastTx(null);
    try {
      const result = await onRemove(pubkey);
      setLastTx(result);
    } catch (err) {
      setOptimisticRemovals((prev) => {
        const s = new Set(prev);
        s.delete(pubkey);
        return s;
      });
      setErrors((prev) => ({
        ...prev,
        [pubkey]: err instanceof Error ? err.message : "Failed",
      }));
    } finally {
      setRemoving(null);
    }
  }

  async function handleClaim(pubkey: string) {
    if (!onClaim) return;
    setClaiming(pubkey);
    setErrors((prev) => ({ ...prev, [pubkey]: "" }));
    setLastTx(null);
    try {
      const result = await onClaim(pubkey);
      setLastTx(result);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [pubkey]: err instanceof Error ? err.message : "Failed",
      }));
    } finally {
      setClaiming(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col divide-y divide-gray/10">
        {displayed.map(({ pubkey, claimableBalance }) => {
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
                      onClick={() => handleClaim(pubkey)}
                      disabled={claiming === pubkey}
                      className="rounded px-2.5 py-1 text-xs font-medium bg-highlight text-primary hover:bg-highlight/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {claiming === pubkey ? (
                        <span className="flex items-center gap-1">
                          <Loader2 size={11} className="animate-spin" />
                          Claiming…
                        </span>
                      ) : (
                        "Claim"
                      )}
                    </button>
                  )}
                  {onRemove && (
                    <button
                      onClick={() => handleRemove(pubkey)}
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
          className="text-xs text-highlight underline"
        >
          {lastTx.signature ?? "Success"}
        </a>
      )}
    </div>
  );
}
