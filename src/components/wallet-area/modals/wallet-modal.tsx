import { type ReactNode, useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import cn from "@/utils/classnames";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  backButton?: () => void;
}

export default function WalletModal({ open, onClose, title, children, backButton }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (backButton) backButton();
        else onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, backButton]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl bg-primary p-6",
          "border border-white/10 shadow-2xl",
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center gap-2 mb-6">
          {backButton && (
            <button
              onClick={backButton}
              className="rounded-lg p-1.5 text-white/50 hover:text-white hover:bg-white/10 transition-colors -ml-1"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h2 className="text-lg font-semibold text-white flex-1">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
