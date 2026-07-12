import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { PaginatedResponse, SuccessResponse } from "@/types/api";

export type PolicyCategory = "environmental" | "social" | "governance";

export interface EsgPolicy {
  id: string;
  title: string;
  content: string;
  category: PolicyCategory;
  version: string;
  effective_date: string;
  expiry_date: string | null;
  acknowledgement_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PolicyCreateInput {
  title: string;
  content: string;
  category: PolicyCategory;
  version?: string;
  effective_date: string;
  expiry_date?: string | null;
  acknowledgement_required: boolean;
  is_active?: boolean;
}

export interface PolicyAcknowledgement {
  id: string;
  policy_id: string;
  employee_id: string;
  acknowledged_at: string;
  ip_address: string | null;
}

export function usePolicies(category?: PolicyCategory) {
  return useQuery({
    queryKey: ["policies", category],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<PaginatedResponse<EsgPolicy>>>("/policies", {
        params: { category, per_page: 100 },
      });
      return res.data.data.items;
    },
  });
}

export function useMyAcknowledgements() {
  return useQuery({
    queryKey: ["policy-acknowledgements", "mine"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<PolicyAcknowledgement[]>>("/policy-acknowledgements/mine");
      return res.data.data;
    },
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PolicyCreateInput) => {
      const res = await api.post<SuccessResponse<EsgPolicy>>("/policies", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });
}

export function useAcknowledgePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (policyId: string) => {
      const res = await api.post<SuccessResponse<PolicyAcknowledgement>>(`/policy-acknowledgements/${policyId}`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policy-acknowledgements", "mine"] });
    },
  });
}
