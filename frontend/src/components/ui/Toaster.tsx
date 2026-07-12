import { useToastStore } from "@/store/toastStore";
import { clsx } from "@/utils/clsx";

const typeClasses = {
  success: "border-l-eco-green",
  error: "border-l-critical-red",
  warning: "border-l-amber-warning",
  info: "border-l-sky-blue",
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            "rounded-xl bg-white dark:bg-neutral-900 shadow-lg p-3 border-l-4 cursor-pointer",
            typeClasses[toast.type]
          )}
          onClick={() => remove(toast.id)}
        >
          <p className="font-medium text-sm">{toast.title}</p>
          {toast.message && <p className="text-xs text-neutral-500 mt-0.5">{toast.message}</p>}
        </div>
      ))}
    </div>
  );
}
