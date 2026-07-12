import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { SuccessResponse } from "@/types/api";

export type RewardStatus = "active" | "inactive" | "out_of_stock";
export type RedemptionStatus = "pending" | "fulfilled" | "cancelled";

export interface Reward {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  stock: number;
  status: RewardStatus;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface RewardRedemption {
  id: string;
  employee_id: string;
  reward_id: string;
  points_spent: number;
  status: RedemptionStatus;
  redeemed_at: string;
  notes: string | null;
}

export function useRewards() {
  return useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<Reward[]>>("/rewards");
      return res.data.data;
    },
  });
}

export function useMyRedemptions() {
  return useQuery({
    queryKey: ["rewards", "redemptions", "mine"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<RewardRedemption[]>>("/rewards/redemptions/mine");
      return res.data.data;
    },
  });
}

export function useRedeemReward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rewardId: string) => {
      const res = await api.post<SuccessResponse<RewardRedemption>>(`/rewards/${rewardId}/redeem`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
