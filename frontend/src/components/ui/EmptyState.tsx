import type { ReactNode } from "react";
import { clsx } from "@/utils/clsx";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      {icon && (
        <div className="w-10 h-10 mb-4 text-neutral-300 flex items-center justify-center">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-neutral-600">{title}</p>
      {description && (
        <p className="text-xs text-neutral-400 mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
