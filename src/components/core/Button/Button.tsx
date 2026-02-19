import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[#646cff] text-white hover:bg-[#535bf2] border border-transparent",
  secondary: "bg-[#1a1a1a] text-[#646cff] hover:bg-[#2a2a2a] border border-[#646cff]",
  outline: "bg-transparent text-[#646cff] hover:bg-[#333] border border-[#646cff]",
};

// Placeholder for the Button component. Will be replaced with a better implementation
export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#646cff] focus:ring-offset-2 focus:ring-offset-[#242424] disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
