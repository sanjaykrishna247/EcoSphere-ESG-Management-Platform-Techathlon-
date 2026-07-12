import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { PaginatedResponse, SuccessResponse } from "@/types/api";

export type ChallengeDifficulty = "easy" | "medium" | "hard" | "expert";
export type ChallengeStatus = "draft" | "active" | "under_review" | "completed" | "archived";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Challenge {
  id: string;
  title: string;
  category_id: string | null;
  description: string | null;
  xp_reward: number;
  difficulty: ChallengeDifficulty;
  evidence_required: boolean;
  deadline: string;
  status: ChallengeStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChallengeParticipation {
  id: string;
  challenge_id: string;
  employee_id: string;
  progress: number;
  proof_url: string | null;
  approval_status: ApprovalStatus;
  xp_awarded: number;
  submitted_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: string;
  status: string;
  created_at: string;
}

export interface ChallengeCreatePayload {
  title: string;
  category_id?: string | null;
  description?: string | null;
  xp_reward: number;
  difficulty: ChallengeDifficulty;
  evidence_required: boolean;
  deadline: string;
}

interface ChallengeListParams {
  status?: ChallengeStatus;
  difficulty?: ChallengeDifficulty;
  category_id?: string;
  page?: number;
  per_page?: number;
}

export function useChallenges(params: ChallengeListParams) {
  return useQuery({
    queryKey: ["challenges", params],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<PaginatedResponse<Challenge>>>("/challenges", {
        params,
      });
      return res.data.data;
    },
  });
}

export function useChallengeCategories() {
  return useQuery({
    queryKey: ["categories", "challenge"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<Category[]>>("/categories", {
        params: { type: "challenge" },
      });
      return res.data.data;
    },
  });
}

export function useCreateChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ChallengeCreatePayload) => {
      const res = await api.post<SuccessResponse<Challenge>>("/challenges", payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
  });
}

export function useUpdateChallengeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ChallengeStatus }) => {
      const res = await api.patch<SuccessResponse<Challenge>>(`/challenges/${id}/status`, { status });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
  });
}

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (challenge_id: string) => {
      const res = await api.post<SuccessResponse<ChallengeParticipation>>("/challenge-participations", {
        challenge_id,
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      queryClient.invalidateQueries({ queryKey: ["challenge-participations", "mine"] });
    },
  });
}

export function useMyParticipations() {
  return useQuery({
    queryKey: ["challenge-participations", "mine"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<ChallengeParticipation[]>>("/challenge-participations/mine");
      return res.data.data;
    },
  });
}
