import { Unlink } from "lucide-react";
import Button from "@/components/core/buttons/button/button";

interface Props {
  onDisconnect: () => void;
}

export default function DisconnectWalletButton({ onDisconnect }: Props) {
  return (
    <Button
      size="small"
      variant="default"
      label="Disconnect"
      icon={<Unlink size={14} />}
      action={onDisconnect}
    />
  );
}
