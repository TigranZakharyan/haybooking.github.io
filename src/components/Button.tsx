import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "default" | "outline" | "liberty";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  children,
  variant = "default",
  size = "medium",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer";

  const variants: Record<ButtonVariant, string> = {
    default:
      "bg-[#f5eee9] border border-[#e5d9d2] hover:bg-[#eee4dd]",
    outline:
      "bg-transparent border border-[#e5d9d2] hover:bg-[#f5eee9]",
    liberty:
      "bg-liberty text-white shadow-lg hover:brightness-110 active:scale-[0.98]",
  };

  const sizes: Record<ButtonSize, string> = {
    small: "px-3 py-1.5 text-xs",
    medium: "px-5 py-2 text-sm",
    large: "px-5 py-3 text-md font-semibold",
  };

  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
