import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export interface DepartmentCreate {
  name: string;
  code: string;
  head_user_id?: string | null;
  parent_id?: string | null;
}

export type DepartmentUpdate = Partial<DepartmentCreate & { status: "active" | "inactive" }>;

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<PaginatedResponse<Department>>>(
        "/departments",
        { params: { per_page: 100 } }
      );
      return res.data.data.items;
    },
  });
}

export function useDepartmentsPaginated(page = 1, per_page = 20) {
  return useQuery({
    queryKey: ["departments", "paginated", page, per_page],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<PaginatedResponse<Department>>>(
        "/departments",
        { params: { page, per_page } }
      );
      return res.data.data;
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: DepartmentCreate) => {
      const res = await api.post<SuccessResponse<Department>>("/departments", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DepartmentUpdate }) => {
      const res = await api.patch<SuccessResponse<Department>>(
        `/departments/${id}`,
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
}
