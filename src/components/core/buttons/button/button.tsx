import cn from "@/utils/classnames";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface Props {
  variant: "default" | "outline";
  size?: "regular" | "small";
  icon?: ReactNode;
  isDisabled?: boolean;
  isLoading?: boolean;
  label?: string;
  path?: string;
  className?: string;
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
  className,
  isDisabled = false,
  isLoading = false,
  isFullWidth = false,
  isInternalLink = false,
  action,
}: Props) {
  const disabled = isDisabled || isLoading;

  const buttonClasses = cn(
    "flex items-center justify-center text-primary !leading-none cursor-pointer",
    isFullWidth ? "w-full" : "w-fit",
    size === "regular" && "gap-2 rounded-lg py-3 px-4 text-base",
    size === "small" && "gap-2 rounded py-1 px-2 text-sm",
    {
      "bg-highlight": variant === "default",
      "bg-transparent border border-primary": variant === "outline",
      "opacity-50 pointer-events-none": disabled,
    },
    className,
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
    <button onClick={action} disabled={disabled} className={buttonClasses}>
      {isLoading ? (
        <Loader2 size={16} className="animate-spin shrink-0" aria-hidden />
      ) : (
        <>
          {label}
          {icon}
        </>
      )}
    </button>
  );
}
