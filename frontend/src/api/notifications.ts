import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { SuccessResponse } from "@/types/api";

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<number>>("/notifications/unread-count");
      return res.data.data;
    },
    refetchInterval: 30_000,
  });
}
