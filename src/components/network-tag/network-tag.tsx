import QubicIcon from "@/components/core/assets/qubic-icon";
import SolanaIcon from "@/components/core/assets/solana-icon";
import { TextMorph } from "torph/react";

export type NetworkTagNetwork = "Qubic" | "Solana";

const NETWORK_CONFIG: Record<NetworkTagNetwork, { label: string; Icon: typeof QubicIcon }> = {
  Qubic: { label: "Qubic", Icon: QubicIcon },
  Solana: { label: "Solana", Icon: SolanaIcon },
};

interface Props {
  network: NetworkTagNetwork;
}

export default function NetworkTag({ network }: Props) {
  const { label, Icon } = NETWORK_CONFIG[network];

  return (
    <div className="inline-flex items-center gap-2 rounded bg-primary px-2 py-1.5">
      <Icon className="shrink-0 text-white" />
      <TextMorph className="text-base font-normal text-white">{label}</TextMorph>
    </div>
  );
}
