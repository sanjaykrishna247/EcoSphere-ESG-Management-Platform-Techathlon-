import { useAuthStore } from "@/store/authStore";
import { useLogout } from "@/api/auth";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { useUnreadCount } from "@/api/notifications";
import { useUiStore } from "@/store/uiStore";
import { Bell, Menu, LogOut } from "lucide-react";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  useNotificationSocket(user?.id);
  const { data: unreadCount } = useUnreadCount();

  return (
    <header className="h-14 shrink-0 border-b border-neutral-200 bg-white flex items-center justify-between gap-3 px-4 sm:px-6 sticky top-0 z-20">
      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md text-neutral-500 hover:bg-neutral-100 transition-colors"
        aria-label="Toggle navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <button
          type="button"
          className="relative w-8 h-8 flex items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {!!unreadCount && unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-danger text-white text-[9px] font-bold rounded-full min-w-3.5 h-3.5 px-0.5 flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-neutral-200 mx-1" />

        {/* User info + role switcher */}
        <div className="hidden sm:flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-brand-muted border border-brand/20 flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/favicon.svg" alt="Avatar" className="w-5 h-5 object-contain" />
          </div>
          <div className="text-sm leading-tight">
            <p className="font-medium text-neutral-900 text-[13px] leading-tight">
              {user?.full_name}
            </p>
            <select
              className="text-[11px] text-neutral-500 bg-transparent border-none p-0 focus:ring-0 cursor-pointer capitalize font-normal outline-none w-full"
              value={user?.role ?? "admin"}
              onChange={(e) => {
                if (user) {
                  const newRole = e.target.value as "admin" | "manager" | "employee";
                  useAuthStore.getState().setUser({
                    ...user,
                    role: newRole,
                    full_name:
                      newRole === "admin"
                        ? "EcoSphere Admin"
                        : newRole === "manager"
                        ? "EcoSphere Manager"
                        : "EcoSphere Employee",
                  });
                }
              }}
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-neutral-200 mx-1 hidden sm:block" />

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          title="Log out"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
