import { Unlink } from "lucide-react";
import Button from "@/components/core/buttons/button/button";

interface Props {
  onDisconnect: () => void;
  variant: "desktop" | "mobile";
}

export default function DisconnectWalletButton({ variant, onDisconnect }: Props) {
  return (
    <Button
      size="small"
      variant={variant === "mobile" ? "outline" : "default"}
      label="Disconnect"
      icon={<Unlink size={14} />}
      action={onDisconnect}
    />
  );
}
