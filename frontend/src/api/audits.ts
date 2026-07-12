import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { PaginatedResponse, SuccessResponse } from "@/types/api";

export type AuditType = "internal" | "external" | "regulatory";
export type AuditStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface Audit {
  id: string;
  title: string;
  auditor_id: string;
  department_id: string | null;
  audit_type: AuditType;
  scheduled_date: string;
  completed_date: string | null;
  status: AuditStatus;
  findings: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditCreateInput {
  title: string;
  auditor_id: string;
  department_id?: string | null;
  audit_type: AuditType;
  scheduled_date: string;
  completed_date?: string | null;
  status?: AuditStatus;
  findings?: string | null;
}

export interface AuditUpdateInput {
  status?: AuditStatus;
  findings?: string | null;
  completed_date?: string | null;
}

export function useAudits(filters?: { status?: AuditStatus; department_id?: string; audit_type?: AuditType }) {
  return useQuery({
    queryKey: ["audits", filters],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<PaginatedResponse<Audit>>>("/audits", {
        params: { ...filters, per_page: 100 },
      });
      return res.data.data.items;
    },
  });
}

export function useCreateAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AuditCreateInput) => {
      const res = await api.post<SuccessResponse<Audit>>("/audits", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audits"] });
    },
  });
}

export function useUpdateAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AuditUpdateInput }) => {
      const res = await api.patch<SuccessResponse<Audit>>(`/audits/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audits"] });
    },
  });
}
