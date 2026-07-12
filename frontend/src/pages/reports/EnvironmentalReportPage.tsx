import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { useDepartments } from "@/api/departments";
import {
  fetchEnvironmentalReport,
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
              <th
                key={col}
                className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-500"
              >
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

function ExportButtons({ onExport }: { onExport: (format: Exclude<ReportFormat, "json">) => void }) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onExport("csv")}>
        <Download className="w-3.5 h-3.5" /> CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => onExport("excel")}>
        <Download className="w-3.5 h-3.5" /> Excel
      </Button>
      <Button variant="outline" size="sm" onClick={() => onExport("pdf")}>
        <Download className="w-3.5 h-3.5" /> PDF
      </Button>
    </div>
  );
}

export function EnvironmentalReportPage() {
  const { data: departments } = useDepartments();
  const [departmentId, setDepartmentId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filters = {
    department_id: departmentId || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["reports", "environmental", filters],
    queryFn: () => fetchEnvironmentalReport(filters),
  });

  return (
    <div>
      <PageHeader
        title="Environmental Report"
        subtitle="Carbon transactions and emission data filtered by department and date range."
        action={
          <ExportButtons
            onExport={(format) =>
              exportReport("/reports/environmental", filters, format, "environmental_report")
            }
          />
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Department</label>
            <select
              className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
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
      </Card>

      <Card variant="table">
        {isLoading && <p className="p-4 text-sm text-neutral-400">Loading…</p>}
        {isError && <p className="p-4 text-sm text-danger">Failed to load report.</p>}
        {data && <ReportTableView table={data} />}
      </Card>
    </div>
  );
}
