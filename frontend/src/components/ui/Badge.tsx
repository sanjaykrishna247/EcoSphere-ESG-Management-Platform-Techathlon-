import { clsx } from "@/utils/clsx";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "purple"
  | "teal"
  | "neutral";

const variants: Record<BadgeVariant, string> = {
  default:  "bg-neutral-100 text-neutral-600 border-neutral-200",
  neutral:  "bg-neutral-100 text-neutral-600 border-neutral-200",
  success:  "bg-brand-muted text-brand border-brand/20",
  warning:  "bg-warn-muted  text-warn  border-warn/20",
  danger:   "bg-danger-muted text-danger border-danger/20",
  info:     "bg-social-muted text-social border-social/20",
  purple:   "bg-gov-muted   text-gov   border-gov/20",
  teal:     "bg-env-muted   text-env   border-env/20",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wide border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
