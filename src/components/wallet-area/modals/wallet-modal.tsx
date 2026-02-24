import { type ReactNode, useEffect, useRef, useState } from "react";
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
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const frozenChildren = useRef<ReactNode>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      frozenChildren.current = null;
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        setMounted(false);
        frozenChildren.current = null;
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (open) {
    frozenChildren.current = children;
  }

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

  if (!mounted) return null;

  const isClosing = !open;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={isClosing ? undefined : onClose}
        aria-hidden
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl bg-primary p-5 sm:p-6",
          "border border-white/10 shadow-2xl",
          "max-h-[80dvh] overflow-y-auto overscroll-contain",
          "transition-all duration-200",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        {...(isClosing ? { inert: true } : {})}
      >
        <div className="flex items-center gap-2 mb-6">
          {backButton && !isClosing && (
            <button
              onClick={backButton}
              className="rounded-lg p-1.5 text-white/50 hover:text-white hover:bg-white/10 transition-colors -ml-1 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h2 className="text-base sm:text-lg font-semibold text-white flex-1">{title}</h2>
          {!isClosing && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {frozenChildren.current}
      </div>
    </div>
  );
}
