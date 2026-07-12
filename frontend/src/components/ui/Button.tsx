import type { ButtonHTMLAttributes } from "react";
import { clsx } from "@/utils/clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-eco-green text-white shadow-sm shadow-eco-green/20 hover:bg-eco-green/90 active:bg-eco-green",
  secondary:
    "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-700",
  ghost: "bg-transparent text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800",
  danger: "bg-critical-red text-white shadow-sm shadow-critical-red/20 hover:bg-critical-red/90",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-xl font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eco-green/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
