import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { useDepartments } from "@/api/departments";
import {
  fetchCustomReport,
  exportCustomReport,
  type ReportTable,
  type ReportModule,
  type ReportFormat,
} from "@/api/reports";
import { Download, Play } from "lucide-react";

function ReportTableView({ table }: { table: ReportTable }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50">
            {table.columns.map((col) => (
              <th key={col} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className="border-b border-neutral-100">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-neutral-800">
                  {cell === null || cell === undefined ? "—" : String(cell)}
                </td>
              ))}
            </tr>
          ))}
          {table.rows.length === 0 && (
            <tr>
              <td colSpan={table.columns.length} className="px-4 py-10 text-center text-neutral-400">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="text-xs text-neutral-400 px-4 py-2">{table.total_records} record(s)</p>
    </div>
  );
}

const MODULE_LABELS: Record<ReportModule, string> = {
  environmental: "Environmental",
  social: "Social",
  governance: "Governance",
};

export function CustomReportPage() {
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
    setModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
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
    <div>
      <PageHeader
        title="Custom Report Builder"
        subtitle="Select modules, apply filters, and generate a combined report."
      />

      <Card className="mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">Select Modules</h3>
        <div className="flex gap-3 mb-4">
          {(["environmental", "social", "governance"] as ReportModule[]).map((mod) => (
            <button
              key={mod}
              type="button"
              onClick={() => toggleModule(mod)}
              className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                modules.includes(mod)
                  ? "border-brand bg-brand-muted text-brand"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
              }`}
            >
              {MODULE_LABELS[mod]}
            </button>
          ))}
        </div>

        <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">Filters</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Department</label>
            <select
              className="w-48 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">All departments</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleGenerate} disabled={modules.length === 0 || isLoading}>
            <Play className="w-3.5 h-3.5" />
            {isLoading ? "Generating…" : "Generate Report"}
          </Button>
          {(["csv", "excel", "pdf"] as Exclude<ReportFormat, "json">[]).map((fmt) => (
            <Button
              key={fmt}
              variant="outline"
              size="sm"
              onClick={() => handleExport(fmt)}
              disabled={modules.length === 0}
            >
              <Download className="w-3.5 h-3.5" /> {fmt.toUpperCase()}
            </Button>
          ))}
        </div>

        {modules.length === 0 && (
          <p className="text-xs text-neutral-400 mt-2">Select at least one module to generate a report.</p>
        )}
        {error && <p className="text-xs text-danger mt-2">{error}</p>}
      </Card>

      {result && (
        <div className="flex flex-col gap-4">
          {Object.entries(result).map(([mod, table]) => (
            <div key={mod}>
              <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-2 px-1">
                {MODULE_LABELS[mod as ReportModule] ?? mod}
              </h2>
              <Card variant="table">
                <ReportTableView table={table} />
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
