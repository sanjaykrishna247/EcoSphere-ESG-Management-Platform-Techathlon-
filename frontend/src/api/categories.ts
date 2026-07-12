import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { SuccessResponse } from "@/types/api";

export type CategoryType = "csr_activity" | "challenge";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  status: "active" | "inactive";
  created_at: string;
}

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: ["categories", type ?? "all"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<Category[]>>("/categories", {
        params: type ? { type } : undefined,
      });
      return res.data.data;
    },
  });
}
