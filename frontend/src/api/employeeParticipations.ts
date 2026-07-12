import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { SuccessResponse, PaginatedResponse } from "@/types/api";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface EmployeeParticipation {
  id: string;
  employee_id: string;
  activity_id: string;
  proof_url: string | null;
  approval_status: ApprovalStatus;
  points_earned: number;
  completion_date: string | null;
  reviewed_by: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useMyParticipations() {
  return useQuery({
    queryKey: ["employee-participations", "mine"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<EmployeeParticipation[]>>("/employee-participations/mine");
      return res.data.data;
    },
  });
}

export function useAllParticipations() {
  return useQuery({
    queryKey: ["employee-participations", "all"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<PaginatedResponse<EmployeeParticipation>>>(
        "/employee-participations",
        { params: { per_page: 100 } }
      );
      return res.data.data.items;
    },
  });
}

export function useJoinCsrActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activity_id: string) => {
      const res = await api.post<SuccessResponse<EmployeeParticipation>>("/employee-participations", {
        activity_id,
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-participations"] });
    },
  });
}

export function useApproveParticipation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch<SuccessResponse<EmployeeParticipation>>(
        `/employee-participations/${id}/approve`
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-participations"] });
    },
  });
}

export function useRejectParticipation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, review_notes }: { id: string; review_notes?: string }) => {
      const res = await api.patch<SuccessResponse<EmployeeParticipation>>(
        `/employee-participations/${id}/reject`,
        { review_notes }
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-participations"] });
    },
  });
}

export function useUploadParticipationProof() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post<SuccessResponse<EmployeeParticipation>>(
        `/employee-participations/${id}/upload-proof`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-participations"] });
    },
  });
}
