import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clsx } from "@/utils/clsx";
import { useDepartments } from "@/api/departments";
import {
  fetchEnvironmentalReport,
  fetchSocialReport,
  fetchGovernanceReport,
  fetchEsgSummaryReport,
  fetchCustomReport,
  exportReport,
  exportCustomReport,
  type ReportTable,
  type ReportModule,
  type ReportFormat,
} from "@/api/reports";

type TabKey = "environmental" | "social" | "governance" | "summary";

const TABS: { key: TabKey; label: string }[] = [
  { key: "environmental", label: "Environmental" },
  { key: "social", label: "Social" },
  { key: "governance", label: "Governance" },
  { key: "summary", label: "ESG Summary" },
];

function ReportTableView({ table }: { table: ReportTable }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            {table.columns.map((col) => (
              <th key={col} className="text-left py-2 px-3 font-medium text-neutral-500 uppercase text-xs tracking-wide">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className="border-b border-neutral-100 dark:border-neutral-900">
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-3">
                  {cell === null || cell === undefined ? "-" : String(cell)}
                </td>
              ))}
            </tr>
          ))}
          {table.rows.length === 0 && (
            <tr>
              <td colSpan={table.columns.length} className="py-4 px-3 text-center text-neutral-400">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="text-xs text-neutral-400 mt-2">{table.total_records} record(s)</p>
    </div>
  );
}

function ExportButtons({ onExport }: { onExport: (format: Exclude<ReportFormat, "json">) => void }) {
  return (
    <div className="flex gap-2">
      <Button variant="secondary" size="sm" onClick={() => onExport("csv")}>
        Export CSV
      </Button>
      <Button variant="secondary" size="sm" onClick={() => onExport("excel")}>
        Export Excel
      </Button>
      <Button variant="secondary" size="sm" onClick={() => onExport("pdf")}>
        Export PDF
      </Button>
    </div>
  );
}

function EnvironmentalTab() {
  const { data: departments } = useDepartments();
  const [departmentId, setDepartmentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filters = { department_id: departmentId || undefined, start_date: startDate || undefined, end_date: endDate || undefined };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reports", "environmental", filters],
    queryFn: () => fetchEnvironmentalReport(filters),
  });

  return (
    <Card>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Department</label>
          <select
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
          >
            <option value="">All departments</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="End date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <ExportButtons onExport={(format) => exportReport("/reports/environmental", filters, format, "environmental_report")} />
      </div>
      {isLoading && <p>Loading...</p>}
      {isError && <p className="text-critical-red">Failed to load report.</p>}
      {data && <ReportTableView table={data} />}
    </Card>
  );
}

function SocialTab() {
  const { data: departments } = useDepartments();
  const [departmentId, setDepartmentId] = useState("");

  const filters = { department_id: departmentId || undefined };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reports", "social", filters],
    queryFn: () => fetchSocialReport(filters),
  });

  return (
    <Card>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Department</label>
          <select
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
          >
            <option value="">All departments</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <ExportButtons onExport={(format) => exportReport("/reports/social", filters, format, "social_report")} />
      </div>
      {isLoading && <p>Loading...</p>}
      {isError && <p className="text-critical-red">Failed to load report.</p>}
      {data && <ReportTableView table={data} />}
    </Card>
  );
}

function GovernanceTab() {
  const [severity, setSeverity] = useState("");

  const filters = { severity: severity || undefined };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reports", "governance", filters],
    queryFn: () => fetchGovernanceReport(filters),
  });

  return (
    <Card>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Severity</label>
          <select
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="">All severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <ExportButtons onExport={(format) => exportReport("/reports/governance", filters, format, "governance_report")} />
      </div>
      {isLoading && <p>Loading...</p>}
      {isError && <p className="text-critical-red">Failed to load report.</p>}
      {data && <ReportTableView table={data} />}
    </Card>
  );
}

function SummaryTab() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["reports", "esg-summary"],
    queryFn: fetchEsgSummaryReport,
  });

  return (
    <Card>
      <div className="flex justify-end mb-4">
        <ExportButtons onExport={(format) => exportReport("/reports/esg-summary", {}, format, "esg_summary_report")} />
      </div>
      {isLoading && <p>Loading...</p>}
      {isError && <p className="text-critical-red">Failed to load report.</p>}
      {data && (
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="font-display font-semibold mb-2">Environmental</h3>
            <ReportTableView table={data.environmental} />
          </div>
          <div>
            <h3 className="font-display font-semibold mb-2">Social</h3>
            <ReportTableView table={data.social} />
          </div>
          <div>
            <h3 className="font-display font-semibold mb-2">Governance</h3>
            <ReportTableView table={data.governance} />
          </div>
        </div>
      )}
    </Card>
  );
}

function CustomReportBuilder() {
  const { data: departments } = useDepartments();
  const [modules, setModules] = useState<ReportModule[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [result, setResult] = useState<Record<string, ReportTable> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const body = {
    modules,
    department_id: departmentId || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  };

  function toggleModule(mod: ReportModule) {
    setModules((prev) => (prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]));
  }

  async function handleGenerate() {
    if (modules.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCustomReport(body);
      setResult(data);
    } catch {
      setError("Failed to generate custom report.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleExport(format: Exclude<ReportFormat, "json">) {
    if (modules.length === 0) return;
    await exportCustomReport(body, format);
  }

  return (
    <Card accent="purple">
      <h2 className="font-display font-semibold mb-4">Custom Report Builder</h2>
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <div className="flex gap-4">
          {(["environmental", "social", "governance"] as ReportModule[]).map((mod) => (
            <label key={mod} className="flex items-center gap-2 text-sm capitalize">
              <input type="checkbox" checked={modules.includes(mod)} onChange={() => toggleModule(mod)} />
              {mod}
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Department</label>
          <select
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
          >
            <option value="">All departments</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="End date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button onClick={handleGenerate} disabled={modules.length === 0 || isLoading}>
          {isLoading ? "Generating..." : "Generate"}
        </Button>
        <ExportButtons onExport={handleExport} />
      </div>
      {modules.length === 0 && <p className="text-xs text-neutral-400 mb-2">Select at least one module.</p>}
      {error && <p className="text-critical-red text-sm mb-2">{error}</p>}
      {result && (
        <div className="flex flex-col gap-6">
          {Object.entries(result).map(([mod, table]) => (
            <div key={mod}>
              <h3 className="font-display font-semibold mb-2 capitalize">{mod}</h3>
              <ReportTableView table={table} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function ReportsPage() {
  const [tab, setTab] = useState<TabKey>("environmental");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-display font-bold">Reports</h1>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-eco-green text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "environmental" && <EnvironmentalTab />}
      {tab === "social" && <SocialTab />}
      {tab === "governance" && <GovernanceTab />}
      {tab === "summary" && <SummaryTab />}

      <CustomReportBuilder />
    </div>
  );
}
