import type { ReactNode } from "react";
import Button from "@/components/core/buttons/button/button";

interface Props {
  label: string;
  icon: ReactNode;
  variant: "desktop" | "mobile";
  isFullWidth?: boolean;
  onConnect: () => void;
}

export default function ConnectWalletButton({
  label,
  icon,
  variant,
  isFullWidth,
  onConnect,
}: Props) {
  return (
    <Button
      variant={variant === "mobile" ? "outline" : "default"}
      label={label}
      icon={icon}
      isFullWidth={isFullWidth}
      action={onConnect}
    />
  );
}
