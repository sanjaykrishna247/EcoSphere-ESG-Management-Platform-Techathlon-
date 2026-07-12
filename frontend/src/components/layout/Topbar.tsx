import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/api/auth";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { useUnreadCount } from "@/api/notifications";
import { useUiStore } from "@/store/uiStore";
import { Button } from "@/components/ui/Button";
import { Bell } from "lucide-react";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  useNotificationSocket(user?.id);
  const { data: unreadCount } = useUnreadCount();

  return (
    <header className="h-16 shrink-0 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 px-4 sm:px-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur sticky top-0 z-20">
      <button
        type="button"
        onClick={toggleSidebar}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        aria-label="Toggle navigation"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M2.5 5.5h15M2.5 10h15M2.5 14.5h15" />
        </svg>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          className="relative w-9 h-9 flex items-center justify-center rounded-full text-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
          {!!unreadCount && unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-critical-red text-white text-[10px] font-semibold rounded-full min-w-4 h-4 px-1 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-neutral-800">
          <div className="w-8 h-8 rounded-full bg-eco-green/15 text-eco-green flex items-center justify-center font-semibold text-sm shrink-0">
            {user?.full_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="text-sm leading-tight">
            <p className="font-medium leading-tight">{user?.full_name}</p>
            <p className="text-xs text-neutral-500 leading-tight capitalize">{user?.role}</p>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={logout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
