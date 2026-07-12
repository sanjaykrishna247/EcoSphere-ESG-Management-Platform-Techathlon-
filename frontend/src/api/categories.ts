import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export interface CategoryCreate {
  name: string;
  type: CategoryType;
}

export type CategoryUpdate = Partial<CategoryCreate & { status: "active" | "inactive" }>;

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

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CategoryCreate) => {
      const res = await api.post<SuccessResponse<Category>>("/categories", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryUpdate }) => {
      const res = await api.patch<SuccessResponse<Category>>(
        `/categories/${id}`,
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
