import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

interface Props {
  addresses: string[];
  emptyLabel: string;
  onRemove?: (addr: string) => Promise<unknown>;
}

export default function AddressTable({ addresses, emptyLabel, onRemove }: Props) {
  const [removing, setRemoving] = useState<string | null>(null);
  const [optimisticRemovals, setOptimisticRemovals] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const displayed = addresses.filter((a) => !optimisticRemovals.has(a));

  if (displayed.length === 0 && !removing) {
    return <p className="text-xs text-gray italic">{emptyLabel}</p>;
  }

  async function handleRemove(addr: string) {
    if (!onRemove) return;
    setRemoving(addr);
    setOptimisticRemovals((prev) => new Set([...prev, addr]));
    setErrors((prev) => ({ ...prev, [addr]: "" }));
    try {
      await onRemove(addr);
    } catch (err) {
      setOptimisticRemovals((prev) => {
        const s = new Set(prev);
        s.delete(addr);
        return s;
      });
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
      {displayed.map((addr) => (
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
