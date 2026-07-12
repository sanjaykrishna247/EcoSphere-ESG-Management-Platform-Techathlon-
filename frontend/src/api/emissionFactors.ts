import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { SuccessResponse } from "@/types/api";

export type EmissionScope = "scope1" | "scope2" | "scope3";
export type EmissionFactorSourceType = "purchase" | "manufacturing" | "expense" | "fleet";

export interface EmissionFactor {
  id: string;
  name: string;
  source_type: EmissionFactorSourceType;
  unit: string;
  co2_per_unit: number;
  scope: EmissionScope;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface EmissionFactorCreateInput {
  name: string;
  source_type: EmissionFactorSourceType;
  unit: string;
  co2_per_unit: number;
  scope: EmissionScope;
  description?: string | null;
  is_active?: boolean;
}

export type EmissionFactorUpdateInput = Partial<EmissionFactorCreateInput>;

export function useEmissionFactors(isActive?: boolean) {
  return useQuery({
    queryKey: ["emission-factors", { isActive }],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<EmissionFactor[]>>("/emission-factors", {
        params: isActive === undefined ? undefined : { is_active: isActive },
      });
      return res.data.data;
    },
  });
}

export function useCreateEmissionFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: EmissionFactorCreateInput) => {
      const res = await api.post<SuccessResponse<EmissionFactor>>("/emission-factors", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emission-factors"] });
    },
  });
}

export function useUpdateEmissionFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EmissionFactorUpdateInput }) => {
      const res = await api.patch<SuccessResponse<EmissionFactor>>(`/emission-factors/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emission-factors"] });
    },
  });
}

export function useDeleteEmissionFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete<SuccessResponse<null>>(`/emission-factors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emission-factors"] });
    },
  });
}
