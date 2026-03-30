import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import Tooltip from "@/components/ui/tooltip";
import CellLayout from "./cell-layout";

interface Props {
  displayId: string;
  fullId: string;
}

export default function OrderIdCell({ displayId, fullId }: Props) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function handleCopy() {
    await navigator.clipboard.writeText(fullId);
    setCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1500);
  }

  return (
    <CellLayout type="td">
      <Tooltip content={fullId}>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 font-mono text-xs cursor-pointer hover:text-primary/70"
        >
          {displayId}
          {copied ? (
            <Check size={12} className="shrink-0" aria-hidden />
          ) : (
            <Copy size={12} className="shrink-0 text-primary/50" aria-hidden />
          )}
        </button>
      </Tooltip>
    </CellLayout>
  );
}
