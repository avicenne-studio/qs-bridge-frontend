import { useState, type FormEvent, type ReactNode } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import cn from "@/utils/classnames";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit: () => Promise<{ signature?: string; txId?: string; explorerUrl?: string }>;
  submitLabel: string;
  disabled?: boolean;
}

export default function AdminActionForm({
  title,
  description,
  children,
  onSubmit,
  submitLabel,
  disabled,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    signature?: string;
    txId?: string;
    explorerUrl?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      const res = await onSubmit();
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/4 px-4 py-3"
    >
      <div>
        <h3 className="text-sm font-medium text-primary">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-gray">{description}</p>}
      </div>

      <div className="flex flex-col gap-2">{children}</div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={disabled || loading}
          className={cn(
            "rounded px-3 py-1.5 text-sm font-medium transition-colors",
            "bg-accent text-primary-dark",
            "hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 size={13} className="animate-spin" />
              Sending…
            </span>
          ) : (
            submitLabel
          )}
        </button>

        {result && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <CheckCircle size={13} />
            {result.explorerUrl ? (
              <a
                href={result.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {result.signature ?? result.txId ?? "Success"}
              </a>
            ) : (
              (result.txId ?? "Sent")
            )}
          </span>
        )}

        {error && (
          <span className="flex items-center gap-1.5 text-xs text-rose-400">
            <AlertCircle size={13} />
            {error}
          </span>
        )}
      </div>
    </form>
  );
}
