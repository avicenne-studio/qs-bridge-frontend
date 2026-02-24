import cn from "@/utils/classnames";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface Props {
  variant: "default" | "outline";
  size?: "regular" | "small";
  icon?: ReactNode;
  isDisabled?: boolean;
  label?: string;
  path?: string;
  isInternalLink?: boolean;
  isFullWidth?: boolean;
  action?: () => void;
}

export default function Button({
  variant,
  size = "regular",
  label,
  icon,
  path,
  isDisabled = false,
  isFullWidth = false,
  isInternalLink = false,
  action,
}: Props) {
  const buttonClasses = cn(
    "flex items-center justify-center text-primary !leading-none",
    isFullWidth ? "w-full" : "w-fit",
    size === "regular" && "gap-2 rounded-lg py-3 px-4 text-base",
    size === "small" && "gap-2 rounded py-1 px-2 text-sm",
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
