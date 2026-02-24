import type { ReactNode } from "react";
import Button from "@/components/core/buttons/button/button";

interface Props {
  label: string;
  icon: ReactNode;
  variant: "desktop" | "mobile";
  onConnect: () => void;
}

export default function ConnectWalletButton({ label, icon, variant, onConnect }: Props) {
  return (
    <Button
      variant={variant === "mobile" ? "outline" : "default"}
      label={label}
      icon={icon}
      action={onConnect}
    />
  );
}
