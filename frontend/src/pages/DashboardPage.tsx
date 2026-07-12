import { TrendAreaChart } from "@/components/charts/TrendAreaChart";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { Card } from "@/components/ui/Card";
import { useOrgOverview, useEnvironmentalDashboard, useAverageDepartmentScores } from "@/api/dashboard";
import { Wind, Trophy, Users, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  Icon: LucideIcon;
  color: string;
}

function KpiCard({ label, value, Icon, color }: KpiCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`p-2.5 rounded-md ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">{label}</p>
        <p className="text-2xl font-semibold text-neutral-900 mt-0.5">{value}</p>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useOrgOverview();
  const { data: envStats } = useEnvironmentalDashboard();
  const { data: scores } = useAverageDepartmentScores();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">Organization Overview</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Live snapshot of your ESG performance.</p>
      </div>

      {/* Top row: score ring + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-1 flex items-center justify-center py-6">
          <ScoreRing
            environmental={scores?.environmental ?? 0}
            social={scores?.social ?? 0}
            governance={scores?.governance ?? 0}
          />
        </Card>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiCard
            label="Total CO2 (YTD)"
            value={overviewLoading ? "—" : `${(overview?.total_co2_ytd ?? 0).toFixed(1)} kg`}
            Icon={Wind}
            color="text-env bg-env-muted"
          />
          <KpiCard
            label="Active Challenges"
            value={overview?.active_challenges ?? 0}
            Icon={Trophy}
            color="text-gov bg-gov-muted"
          />
          <KpiCard
            label="CSR Participants"
            value={overview?.csr_participants ?? 0}
            Icon={Users}
            color="text-social bg-social-muted"
          />
          <KpiCard
            label="Open Issues"
            value={overview?.open_compliance_issues ?? 0}
            Icon={AlertTriangle}
            color="text-warn bg-warn-muted"
          />
        </div>
      </div>

      {/* Monthly carbon chart */}
      <Card>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-4">
          Monthly Carbon Emissions
        </h2>
        <TrendAreaChart
          data={(envStats?.monthly_co2_trend ?? []).map((p) => ({
            label: new Date(p.month).toLocaleDateString(undefined, {
              month: "short",
              year: "numeric",
            }),
            value: p.co2_equivalent,
          }))}
          color="#0d9488"
          valueSuffix="kg"
        />
      </Card>
    </div>
  );
}
