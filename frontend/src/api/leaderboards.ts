import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { SuccessResponse } from "@/types/api";

export type LeaderboardPeriod = "week" | "month" | "all";

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  department_id: string | null;
  xp: number;
}

export interface DepartmentLeaderboardEntry {
  rank: number;
  department_id: string;
  name: string;
  code: string;
  score: number;
}

export function useUserLeaderboard(period: LeaderboardPeriod) {
  return useQuery({
    queryKey: ["leaderboards", "users", period],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<LeaderboardEntry[]>>("/leaderboards", {
        params: { period },
      });
      return res.data.data;
    },
  });
}

export function useDepartmentLeaderboard() {
  return useQuery({
    queryKey: ["leaderboards", "departments"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<DepartmentLeaderboardEntry[]>>("/leaderboards/departments");
      return res.data.data;
    },
  });
}
