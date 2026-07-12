import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { SuccessResponse } from "@/types/api";

export interface EsgConfiguration {
  id: string;
  org_name: string;
  environmental_weight: number;
  social_weight: number;
  governance_weight: number;
  auto_emission_calculation: boolean;
  evidence_requirement: boolean;
  badge_auto_award: boolean;
  notification_in_app: boolean;
  notification_email: boolean;
  updated_at: string;
}

export type EsgConfigurationUpdate = Partial<
  Omit<EsgConfiguration, "id" | "updated_at">
>;

export function useEsgConfig() {
  return useQuery({
    queryKey: ["settings", "config"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<EsgConfiguration>>("/settings/config");
      return res.data.data;
    },
  });
}

export function useUpdateEsgConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: EsgConfigurationUpdate) => {
      const res = await api.patch<SuccessResponse<EsgConfiguration>>("/settings/config", data);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["settings", "config"], data);
    },
  });
}
