import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, KeyRound, QrCode, Wallet } from "lucide-react";
import { useQubicWallet } from "@/providers/QubicWalletProvider";
import cn from "@/utils/classnames";
import WalletModal from "./wallet-modal";
import WalletConnectPage from "./qubic/wallet-connect-page";
import MetaMaskPage from "./qubic/metamask-page";
import SeedPage from "./qubic/seed-page";

type Method = "walletconnect" | "metamask" | "seed";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface MethodDef {
  id: Method;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

export default function QubicWalletModal({ open, onClose }: Props) {
  const qubic = useQubicWallet();
  const [page, setPage] = useState<Method | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closingRef = useRef(false);

  const methods: MethodDef[] = [
    {
      id: "walletconnect",
      label: "Qubic Wallet",
      description: "Scan a QR code with the official mobile app",
      icon: <QrCode size={18} />,
      badge: "Recommended",
    },
    {
      id: "metamask",
      label: "MetaMask Snap",
      description: qubic.metamaskAvailable
        ? "Use the Qubic Snap inside MetaMask"
        : "MetaMask not detected",
      icon: <Wallet size={18} />,
      disabled: !qubic.metamaskAvailable,
    },
    {
      id: "seed",
      label: "Seed Import",
      description: "Enter your seed phrase or private key",
      icon: <KeyRound size={18} />,
    },
  ];

  useEffect(() => {
    if (open) {
      closingRef.current = false;
      setPage(null);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (qubic.connected && open) handleClose();
  }, [qubic.connected, open]);

  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    if (page === "walletconnect" && qubic.walletConnectUri && !qubic.connected) {
      qubic.cancelPairing();
    }
    onClose();
  }, [page, qubic.walletConnectUri, qubic.connected, qubic.cancelPairing, onClose]);

  function goBack() {
    if (page === "walletconnect" && qubic.walletConnectUri && !qubic.connected) {
      qubic.cancelPairing();
    }
    setPage(null);
    setError(null);
  }

  const currentLabel = methods.find((m) => m.id === page)?.label;

  return (
    <WalletModal
      open={open}
      onClose={handleClose}
      title={currentLabel ?? "Connect Qubic Wallet"}
      backButton={page !== null ? goBack : undefined}
    >
      {page === null ? (
        <MethodList
          methods={methods}
          onSelect={(id) => {
            setPage(id);
            setError(null);
          }}
        />
      ) : (
        <PageContent page={page} qubic={qubic} error={error} onError={setError} />
      )}
    </WalletModal>
  );
}

function MethodList({
  methods,
  onSelect,
}: {
  methods: MethodDef[];
  onSelect: (id: Method) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {methods.map((m) => (
        <button
          key={m.id}
          onClick={() => !m.disabled && onSelect(m.id)}
          className={cn(
            "group flex items-center gap-3.5 w-full rounded-xl px-4 py-3.5 text-left",
            "border border-transparent transition-all duration-150",
            m.disabled
              ? "bg-white/3 cursor-not-allowed"
              : "bg-white/5 hover:bg-white/8 hover:border-white/10 cursor-pointer",
          )}
        >
          <span
            className={cn(
              "shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
              m.disabled
                ? "bg-white/5 text-white/20"
                : "bg-white/8 text-white/50 group-hover:text-white/80 group-hover:bg-white/12",
            )}
          >
            {m.icon}
          </span>

          <div className="flex flex-col min-w-0 flex-1">
            <span
              className={cn(
                "text-sm font-semibold leading-snug",
                m.disabled ? "text-white/25" : "text-white/90",
              )}
            >
              {m.label}
            </span>
            <span
              className={cn(
                "text-xs leading-snug mt-0.5",
                m.disabled ? "text-white/20" : "text-white/40",
              )}
            >
              {m.description}
            </span>
          </div>

          {m.badge && (
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-highlight/80 bg-highlight/10 rounded-full px-2 py-0.5">
              {m.badge}
            </span>
          )}

          {!m.disabled && (
            <ArrowLeft
              size={14}
              className="shrink-0 text-white/20 group-hover:text-white/50 rotate-180 transition-colors"
            />
          )}
        </button>
      ))}
    </div>
  );
}

function PageContent({
  page,
  qubic,
  error,
  onError,
}: {
  page: Method;
  qubic: ReturnType<typeof useQubicWallet>;
  error: string | null;
  onError: (msg: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-xs text-red-400">
          <AlertTriangle size={13} className="shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}
      {page === "walletconnect" && <WalletConnectPage qubic={qubic} onError={onError} />}
      {page === "metamask" && <MetaMaskPage qubic={qubic} onError={onError} />}
      {page === "seed" && <SeedPage qubic={qubic} onError={onError} />}
    </div>
  );
}
