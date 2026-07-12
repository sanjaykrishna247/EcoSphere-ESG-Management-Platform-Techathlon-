import { forwardRef, type InputHTMLAttributes } from "react";
import { clsx } from "@/utils/clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...props },
  ref
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={clsx(
          "rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 transition-shadow focus:outline-none focus:ring-2 focus:ring-eco-green/50 focus:border-eco-green",
          error && "border-critical-red focus:ring-critical-red",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-critical-red">{error}</span>}
    </div>
  );
});
