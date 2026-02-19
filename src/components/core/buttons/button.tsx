import cn from "@/utils/classnames";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface Props {
  variant: "default" | "outline";
  icon?: ReactNode;
  isDisabled?: boolean;
  label?: string;
  path?: string;
  isInternalLink?: boolean;
  isFullWidth?: boolean;
  action?: () => void;
}

export default function Button({
  variant = "default",
  label,
  icon,
  path,
  isDisabled = false,
  isFullWidth = false,
  isInternalLink = false,
  action,
}: Props) {
  const buttonClasses = cn(
    "flex items-center justify-center gap-2 rounded-lg py-3 px-4 text-primary text-base leading-none",
    isFullWidth ? "w-full" : "w-fit",
    {
      "bg-highlight": variant === "default",
      "bg-transparent": variant === "outline",
      "opacity-50 pointer-events-none": isDisabled,
    },
  );

  if (isInternalLink && path) {
    return (
      <NavLink to={path} className={buttonClasses}>
        {label}
        {icon}
      </NavLink>
    );
  }

  return (
    <button onClick={action} disabled={isDisabled} className={buttonClasses}>
      {icon}
      {label}
    </button>
  );
}
