import type { ReactNode } from "react";
import Button from "@/components/core/buttons/button/button";

interface Props {
  label: string;
  icon: ReactNode;
  onConnect: () => void;
}

export default function ConnectWalletButton({ label, icon, onConnect }: Props) {
  return <Button variant="default" label={label} icon={icon} action={onConnect} />;
}
