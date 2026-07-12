import type { HTMLAttributes } from "react";
import { clsx } from "@/utils/clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Use "table" for zero-padding cards wrapping a Table component */
  variant?: "default" | "table";
  interactive?: boolean;
  /** @deprecated no-op, kept for backward compat during migration */
  accent?: string;
}

export function Card({
  variant = "default",
  interactive,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  accent: _accent,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "bg-white border border-neutral-200 rounded-lg shadow-none",
        variant === "default" && "p-5",
        variant === "table"   && "overflow-hidden",
        interactive && "hover:border-neutral-300 hover:shadow-sm cursor-pointer transition-all duration-150",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
