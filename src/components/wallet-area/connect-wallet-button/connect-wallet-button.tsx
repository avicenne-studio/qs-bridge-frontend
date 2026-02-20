import type { ReactNode } from "react";
import Button from "@/components/core/buttons/button/button";

interface Props {
  label: string;
  icon: ReactNode;
  onConnect: () => void;
  variant?: "desktop" | "mobile";
}

export default function ConnectWalletButton({
  label,
  icon,
  onConnect,
  variant = "desktop",
}: Props) {
  return (
    <Button
      variant={variant === "mobile" ? "outline" : "default"}
      label={label}
      icon={icon}
      action={onConnect}
    />
  );
}
