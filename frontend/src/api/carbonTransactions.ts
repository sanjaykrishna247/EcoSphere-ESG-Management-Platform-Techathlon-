import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { PaginatedResponse, SuccessResponse } from "@/types/api";
import type { EmissionScope } from "@/api/emissionFactors";

export type TransactionSourceType = "purchase" | "manufacturing" | "expense" | "fleet" | "manual";

export interface CarbonTransaction {
  id: string;
  source_type: TransactionSourceType;
  source_ref_id: string | null;
  emission_factor_id: string;
  department_id: string;
  quantity: number;
  co2_equivalent: number;
  transaction_date: string;
  is_auto_calculated: boolean;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CarbonTransactionFilters {
  department_id?: string;
  start_date?: string;
  end_date?: string;
  scope?: EmissionScope;
  source_type?: TransactionSourceType;
  page?: number;
  per_page?: number;
}

export interface CarbonTransactionSummary {
  total_co2: number;
  by_scope: { scope: EmissionScope; total_co2: number }[];
  by_department: { department_id: string; total_co2: number }[];
}

export interface CarbonTransactionTrendPoint {
  period: string;
  total_co2: number;
}

export interface CarbonTransactionCreateInput {
  emission_factor_id: string;
  department_id: string;
  quantity: number;
  transaction_date: string;
  notes?: string | null;
}

export function useCarbonTransactions(filters: CarbonTransactionFilters) {
  return useQuery({
    queryKey: ["carbon-transactions", filters],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<PaginatedResponse<CarbonTransaction>>>("/carbon-transactions", {
        params: {
          dept: filters.department_id,
          start_date: filters.start_date,
          end_date: filters.end_date,
          scope: filters.scope,
          source_type: filters.source_type,
          page: filters.page ?? 1,
          per_page: filters.per_page ?? 20,
        },
      });
      return res.data.data;
    },
  });
}

export function useCarbonTransactionSummary(departmentId?: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ["carbon-transactions", "summary", departmentId, startDate, endDate],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<CarbonTransactionSummary>>("/carbon-transactions/summary", {
        params: { department_id: departmentId, start_date: startDate, end_date: endDate },
      });
      return res.data.data;
    },
  });
}

export function useCarbonTransactionTrends(departmentId?: string, year?: number) {
  return useQuery({
    queryKey: ["carbon-transactions", "trends", departmentId, year],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<CarbonTransactionTrendPoint[]>>("/carbon-transactions/trends", {
        params: { department_id: departmentId, year },
      });
      return res.data.data;
    },
  });
}

export function useCreateCarbonTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CarbonTransactionCreateInput) => {
      const res = await api.post<SuccessResponse<CarbonTransaction>>("/carbon-transactions", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carbon-transactions"] });
    },
  });
}

export function useDeleteCarbonTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete<SuccessResponse<null>>(`/carbon-transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carbon-transactions"] });
    },
  });
}
