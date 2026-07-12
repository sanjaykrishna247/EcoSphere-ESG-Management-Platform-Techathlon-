import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  fetchEsgSummaryReport,
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
              <td colSpan={table.columns.length} className="px-4 py-10 text-center text-neutral-400">No records found.</td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="text-xs text-neutral-400 px-4 py-2">{table.total_records} record(s)</p>
    </div>
  );
}

export function EsgSummaryPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["reports", "esg-summary"],
    queryFn: fetchEsgSummaryReport,
  });

  return (
    <div>
      <PageHeader
        title="ESG Summary"
        subtitle="Consolidated Environmental, Social, and Governance report."
        action={
          <div className="flex gap-2">
            {(["csv", "excel", "pdf"] as Exclude<ReportFormat, "json">[]).map((fmt) => (
              <Button key={fmt} variant="outline" size="sm"
                onClick={() => exportReport("/reports/esg-summary", {}, fmt, "esg_summary_report")}>
                <Download className="w-3.5 h-3.5" /> {fmt.toUpperCase()}
              </Button>
            ))}
          </div>
        }
      />

      {isLoading && <p className="text-sm text-neutral-400">Loading…</p>}
      {isError && <p className="text-sm text-danger">Failed to load report.</p>}

      {data && (
        <div className="flex flex-col gap-4">
          {(["environmental", "social", "governance"] as const).map((section) => (
            <div key={section}>
              <h2 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide mb-2 px-1">
                {section}
              </h2>
              <Card variant="table">
                <ReportTableView table={data[section]} />
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
