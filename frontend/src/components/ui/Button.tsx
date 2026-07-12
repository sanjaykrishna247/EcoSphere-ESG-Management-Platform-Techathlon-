import type { ButtonHTMLAttributes } from "react";
import { clsx } from "@/utils/clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-brand text-white hover:bg-brand/90 active:bg-brand border border-transparent",
  secondary:
    "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 active:bg-neutral-300 border border-transparent",
  outline:
    "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400",
  ghost:
    "bg-transparent text-neutral-600 hover:bg-neutral-100 border border-transparent",
  danger:
    "bg-danger text-white hover:bg-danger/90 border border-transparent",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs font-medium rounded-md",
  md: "px-4 py-2 text-sm font-medium rounded-md",
  lg: "px-5 py-2.5 text-sm font-semibold rounded-md",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 transition-all duration-150",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
