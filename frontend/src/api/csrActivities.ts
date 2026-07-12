import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { SuccessResponse, PaginatedResponse } from "@/types/api";

export type CsrActivityStatus = "upcoming" | "active" | "completed" | "cancelled";

export interface CsrActivity {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  department_id: string | null;
  start_date: string;
  end_date: string | null;
  points_value: number;
  max_participants: number | null;
  evidence_required: boolean;
  status: CsrActivityStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CsrActivityCreateInput {
  title: string;
  description?: string;
  category_id?: string;
  department_id?: string;
  start_date: string;
  end_date?: string;
  points_value: number;
  max_participants?: number;
  evidence_required: boolean;
}

export function useCsrActivities() {
  return useQuery({
    queryKey: ["csr-activities"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<PaginatedResponse<CsrActivity>>>("/csr-activities", {
        params: { per_page: 100 },
      });
      return res.data.data.items;
    },
  });
}

export function useCreateCsrActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CsrActivityCreateInput) => {
      const res = await api.post<SuccessResponse<CsrActivity>>("/csr-activities", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["csr-activities"] });
    },
  });
}
