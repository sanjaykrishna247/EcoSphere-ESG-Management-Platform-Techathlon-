import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDiversityMetrics } from "@/api/diversity";
import { Users, Building2, TrendingUp } from "lucide-react";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card className="flex items-start gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
        <p className="text-2xl font-semibold text-neutral-900">{value}</p>
        {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}

function SimpleBar({
  label,
  value,
  max,
  color = "bg-social",
}: {
  label: string;
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-neutral-600 w-36 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-medium text-neutral-900 w-8 text-right shrink-0">{value}</span>
    </div>
  );
}

export function DiversityPage() {
  const { data, isLoading } = useDiversityMetrics();

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Diversity Dashboard" subtitle="Workforce distribution and CSR engagement metrics." />
        <EmptyState icon={<Users className="w-10 h-10" />} title="Loading metrics…" />
      </div>
    );
  }

  const roles = data?.role_distribution ?? {};
  const depts = data?.headcount_by_department ?? [];
  const csr = data?.csr_participations_by_department ?? [];
  const maxHeadcount = Math.max(...depts.map((d) => d.headcount), 1);
  const maxCsr = Math.max(...csr.map((c) => c.participations), 1);

  return (
    <div>
      <PageHeader
        title="Diversity Dashboard"
        subtitle="Workforce distribution and CSR engagement by department."
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Employees" value={data?.total_users ?? 0} />
        <StatCard label="Departments" value={data?.departments_with_data ?? 0} />
        <StatCard label="Admins" value={roles["admin"] ?? 0} sub="org-level roles" />
        <StatCard label="Managers" value={roles["manager"] ?? 0} sub="department leads" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role distribution */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-neutral-400" />
            <h2 className="text-sm font-semibold text-neutral-800">Role Distribution</h2>
          </div>
          <div className="flex flex-col gap-3">
            {Object.entries(roles).map(([role, count]) => (
              <SimpleBar
                key={role}
                label={role.charAt(0).toUpperCase() + role.slice(1)}
                value={count}
                max={data?.total_users ?? 1}
                color="bg-gov"
              />
            ))}
            {Object.keys(roles).length === 0 && (
              <p className="text-sm text-neutral-400">No role data available.</p>
            )}
          </div>
        </Card>

        {/* Headcount by department */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-neutral-400" />
            <h2 className="text-sm font-semibold text-neutral-800">Headcount by Department</h2>
          </div>
          <div className="flex flex-col gap-3">
            {depts.slice(0, 8).map((d) => (
              <SimpleBar
                key={d.department}
                label={d.department}
                value={d.headcount}
                max={maxHeadcount}
                color="bg-social"
              />
            ))}
            {depts.length === 0 && (
              <p className="text-sm text-neutral-400">No department data available.</p>
            )}
          </div>
        </Card>

        {/* CSR participation by department */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-neutral-400" />
            <h2 className="text-sm font-semibold text-neutral-800">CSR Participation by Department</h2>
          </div>
          {csr.length === 0 ? (
            <p className="text-sm text-neutral-400">No CSR participation data yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {csr.map((c) => (
                <SimpleBar
                  key={c.department}
                  label={c.department}
                  value={c.participations}
                  max={maxCsr}
                  color="bg-env"
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
