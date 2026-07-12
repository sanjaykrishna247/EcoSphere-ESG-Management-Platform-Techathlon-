import { TrendAreaChart } from "@/components/charts/TrendAreaChart";
import { ScoreRing } from "@/components/charts/ScoreRing";
import { Card } from "@/components/ui/Card";
import { useOrgOverview, useEnvironmentalDashboard, useAverageDepartmentScores } from "@/api/dashboard";

const kpiIconBg: Record<"green" | "teal" | "blue" | "purple", string> = {
  green: "bg-eco-green/10 text-eco-green",
  teal: "bg-earth-teal/10 text-earth-teal",
  blue: "bg-sky-blue/10 text-sky-blue",
  purple: "bg-governance-purple/10 text-governance-purple",
};

function KpiCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent: "green" | "teal" | "blue" | "purple";
}) {
  return (
    <Card accent={accent} className="flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${kpiIconBg[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-neutral-400 font-medium truncate">{label}</p>
        <p className="text-xl sm:text-2xl font-display font-bold mt-0.5">{value}</p>
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
        <h1 className="text-2xl font-display font-bold tracking-tight">Organization Overview</h1>
        <p className="text-sm text-neutral-500 mt-0.5">A live snapshot of your ESG performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 flex items-center justify-center py-8">
          <ScoreRing
            environmental={scores?.environmental ?? 0}
            social={scores?.social ?? 0}
            governance={scores?.governance ?? 0}
          />
        </Card>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiCard
            label="Total CO2 (YTD)"
            value={overviewLoading ? "…" : `${(overview?.total_co2_ytd ?? 0).toFixed(1)} kg`}
            icon="🌫️"
            accent="teal"
          />
          <KpiCard label="Active Challenges" value={overview?.active_challenges ?? 0} icon="🏅" accent="purple" />
          <KpiCard label="CSR Participants" value={overview?.csr_participants ?? 0} icon="🤝" accent="blue" />
          <KpiCard label="Open Issues" value={overview?.open_compliance_issues ?? 0} icon="⚠️" accent="green" />
        </div>
      </div>

      <Card>
        <h2 className="font-display font-semibold mb-4">Monthly Carbon Trend</h2>
        <TrendAreaChart
          data={(envStats?.monthly_co2_trend ?? []).map((p) => ({
            label: new Date(p.month).toLocaleDateString(undefined, { month: "short", year: "numeric" }),
            value: p.co2_equivalent,
          }))}
          color="#0d9488"
          valueSuffix="kg"
        />
      </Card>
    </div>
  );
}
