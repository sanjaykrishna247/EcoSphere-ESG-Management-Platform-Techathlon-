import { forwardRef, type InputHTMLAttributes } from "react";
import { clsx } from "@/utils/clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-neutral-600 uppercase tracking-wide"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={clsx(
          "rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400",
          "transition-colors duration-150",
          "focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className
        )}
        {...props}
      />
      {hint && !error && <span className="text-xs text-neutral-400">{hint}</span>}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
});
