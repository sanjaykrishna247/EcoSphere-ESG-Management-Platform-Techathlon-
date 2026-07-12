import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { PaginatedResponse, SuccessResponse } from "@/types/api";

export type GoalStatus = "active" | "completed" | "missed" | "paused";

export interface EnvironmentalGoal {
  id: string;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  end_date: string;
  department_id: string | null;
  status: GoalStatus;
}

export interface EnvironmentalGoalFilters {
  department_id?: string;
  status?: GoalStatus;
  page?: number;
  per_page?: number;
}

export interface EnvironmentalGoalCreateInput {
  title: string;
  description?: string | null;
  target_value: number;
  current_value?: number;
  unit: string;
  start_date: string;
  end_date: string;
  department_id?: string | null;
  status?: GoalStatus;
}

export type EnvironmentalGoalUpdateInput = Partial<EnvironmentalGoalCreateInput>;

export function useEnvironmentalGoals(filters: EnvironmentalGoalFilters = {}) {
  return useQuery({
    queryKey: ["environmental-goals", filters],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<PaginatedResponse<EnvironmentalGoal>>>("/environmental-goals", {
        params: {
          department_id: filters.department_id,
          status: filters.status,
          page: filters.page ?? 1,
          per_page: filters.per_page ?? 50,
        },
      });
      return res.data.data;
    },
  });
}

export function useCreateEnvironmentalGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: EnvironmentalGoalCreateInput) => {
      const res = await api.post<SuccessResponse<EnvironmentalGoal>>("/environmental-goals", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environmental-goals"] });
    },
  });
}

export function useUpdateEnvironmentalGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EnvironmentalGoalUpdateInput }) => {
      const res = await api.patch<SuccessResponse<EnvironmentalGoal>>(`/environmental-goals/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environmental-goals"] });
    },
  });
}

export function useDeleteEnvironmentalGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete<SuccessResponse<null>>(`/environmental-goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environmental-goals"] });
    },
  });
}
