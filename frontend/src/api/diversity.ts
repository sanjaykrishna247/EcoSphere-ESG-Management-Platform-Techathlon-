import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { SuccessResponse } from "@/types/api";

export interface DeptHeadcount {
  department: string;
  headcount: number;
}

export interface CsrByDept {
  department: string;
  participations: number;
}

export interface DiversityMetrics {
  total_users: number;
  role_distribution: Record<string, number>;
  headcount_by_department: DeptHeadcount[];
  csr_participations_by_department: CsrByDept[];
  departments_with_data: number;
}

export function useDiversityMetrics() {
  return useQuery({
    queryKey: ["diversity-metrics"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<DiversityMetrics>>("/diversity-metrics");
      return res.data.data;
    },
  });
}
