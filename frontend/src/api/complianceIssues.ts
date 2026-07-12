import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { PaginatedResponse, SuccessResponse } from "@/types/api";

export type IssueSeverity = "low" | "medium" | "high" | "critical";
export type IssueStatus = "open" | "in_progress" | "resolved" | "overdue";

export interface ComplianceIssue {
  id: string;
  audit_id: string;
  severity: IssueSeverity;
  description: string;
  owner_id: string;
  due_date: string;
  status: IssueStatus;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplianceIssueCreateInput {
  audit_id: string;
  severity: IssueSeverity;
  description: string;
  owner_id: string;
  due_date: string;
  status?: IssueStatus;
  resolution_notes?: string | null;
}

export interface ComplianceIssueUpdateInput {
  severity?: IssueSeverity;
  status?: IssueStatus;
  resolution_notes?: string | null;
  owner_id?: string;
  due_date?: string;
}

export function useComplianceIssues(filters?: {
  severity?: IssueSeverity;
  status?: IssueStatus;
  overdue?: boolean;
}) {
  return useQuery({
    queryKey: ["compliance-issues", filters],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<PaginatedResponse<ComplianceIssue>>>("/compliance-issues", {
        params: { ...filters, per_page: 100 },
      });
      return res.data.data.items;
    },
  });
}

export function useCreateComplianceIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ComplianceIssueCreateInput) => {
      const res = await api.post<SuccessResponse<ComplianceIssue>>("/compliance-issues", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-issues"] });
    },
  });
}

export function useUpdateComplianceIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ComplianceIssueUpdateInput }) => {
      const res = await api.patch<SuccessResponse<ComplianceIssue>>(`/compliance-issues/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-issues"] });
    },
  });
}
