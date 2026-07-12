import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { SuccessResponse } from "@/types/api";

export interface UnlockRule {
  type: "xp_threshold" | "challenge_count" | "csr_count";
  value: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  unlock_rule: UnlockRule;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeBadge {
  id: string;
  badge_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  awarded_at: string;
}

export function useBadges() {
  return useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<Badge[]>>("/badges");
      return res.data.data;
    },
  });
}

export function useMyBadges() {
  return useQuery({
    queryKey: ["badges", "mine"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<EmployeeBadge[]>>("/badges/mine");
      return res.data.data;
    },
  });
}

export function describeUnlockRule(rule: UnlockRule): string {
  switch (rule.type) {
    case "xp_threshold":
      return `Earn ${rule.value} XP`;
    case "challenge_count":
      return `Complete ${rule.value} challenge${rule.value === 1 ? "" : "s"}`;
    case "csr_count":
      return `Complete ${rule.value} CSR activit${rule.value === 1 ? "y" : "ies"}`;
    default:
      return "Unlock criteria unknown";
  }
}
