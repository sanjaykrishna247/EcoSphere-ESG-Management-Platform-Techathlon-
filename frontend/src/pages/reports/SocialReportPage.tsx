import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useDepartments } from "@/api/departments";
import {
  fetchSocialReport,
  exportReport,
  type ReportTable,
  type ReportFormat,
} from "@/api/reports";
import { Download } from "lucide-react";

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

export function SocialReportPage() {
  const { data: departments } = useDepartments();
  const [departmentId, setDepartmentId] = useState("");

  const filters = { department_id: departmentId || undefined };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reports", "social", filters],
    queryFn: () => fetchSocialReport(filters),
  });

  return (
    <div>
      <PageHeader
        title="Social Report"
        subtitle="CSR activities and employee participation records."
        action={
          <div className="flex gap-2">
            {(["csv", "excel", "pdf"] as Exclude<ReportFormat, "json">[]).map((fmt) => (
              <Button key={fmt} variant="outline" size="sm"
                onClick={() => exportReport("/reports/social", filters, fmt, "social_report")}>
                <Download className="w-3.5 h-3.5" /> {fmt.toUpperCase()}
              </Button>
            ))}
          </div>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Department</label>
          <select
            className="w-56 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
          >
            <option value="">All departments</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card variant="table">
        {isLoading && <p className="p-4 text-sm text-neutral-400">Loading…</p>}
        {isError && <p className="p-4 text-sm text-danger">Failed to load report.</p>}
        {data && <ReportTableView table={data} />}
      </Card>
    </div>
  );
}
