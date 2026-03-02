import { Unlink } from "lucide-react";
import Button from "@/components/core/buttons/button/button";

interface Props {
  onDisconnect: () => void;
  variant: "desktop" | "mobile";
  isFullWidth?: boolean;
}

export default function DisconnectWalletButton({ variant, isFullWidth, onDisconnect }: Props) {
  return (
    <Button
      size="small"
      variant={variant === "mobile" ? "outline" : "default"}
      label="Disconnect"
      icon={<Unlink size={14} />}
      isFullWidth={isFullWidth}
      action={onDisconnect}
    />
  );
}
