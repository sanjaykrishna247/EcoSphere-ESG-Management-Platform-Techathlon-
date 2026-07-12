import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { SuccessResponse, PaginatedResponse } from "@/types/api";

export interface Department {
  id: string;
  name: string;
  code: string;
  head_user_id: string | null;
  parent_id: string | null;
  employee_count: number;
  status: "active" | "inactive";
  created_at: string;
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<PaginatedResponse<Department>>>("/departments", {
        params: { per_page: 100 },
      });
      return res.data.data.items;
    },
  });
}
