import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { SuccessResponse } from "@/types/api";

export interface OrgOverview {
  total_co2_ytd: number;
  active_challenges: number;
  csr_participants: number;
  open_compliance_issues: number;
  org_esg_score: number | null;
  challenge_status_breakdown: Record<string, number>;
}

export interface EnvironmentalStats {
  monthly_co2_trend: { month: string; co2_equivalent: number }[];
}

interface DepartmentScore {
  department_id: string;
  environmental_score: number;
  social_score: number;
  governance_score: number;
  total_score: number;
  period_start: string;
  period_end: string;
}

export function useOrgOverview() {
  return useQuery({
    queryKey: ["dashboard", "org-overview"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<OrgOverview>>("/dashboard/org-overview");
      return res.data.data;
    },
  });
}

export function useEnvironmentalDashboard() {
  return useQuery({
    queryKey: ["dashboard", "environmental"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<EnvironmentalStats>>("/dashboard/environmental");
      return res.data.data;
    },
  });
}

export function useAverageDepartmentScores() {
  return useQuery({
    queryKey: ["department-scores", "average"],
    queryFn: async () => {
      const res = await api.get<SuccessResponse<DepartmentScore[]>>("/department-scores");
      const items = res.data.data;
      if (items.length === 0) {
        return { environmental: 0, social: 0, governance: 0 };
      }
      const avg = (key: keyof DepartmentScore) =>
        items.reduce((sum, i) => sum + Number(i[key]), 0) / items.length;
      return {
        environmental: avg("environmental_score"),
        social: avg("social_score"),
        governance: avg("governance_score"),
      };
    },
  });
}
