import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToastStore } from "@/store/toastStore";

export function useNotificationSocket(userId: string | undefined) {
  const addToast = useToastStore((s) => s.add);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const wsUrl = import.meta.env.VITE_WS_URL ?? "ws://localhost:8000";
    const ws = new WebSocket(`${wsUrl}/ws/${userId}`);

    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      addToast({
        type: payload.type === "overdue_issue" || payload.type === "compliance_issue" ? "warning" : "info",
        title: payload.title ?? "Notification",
        message: payload.message,
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    return () => ws.close();
  }, [userId, addToast, queryClient]);
}
