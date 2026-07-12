import { api } from "@/api/client";
import type { SuccessResponse } from "@/types/api";

export interface ReportTable {
  columns: string[];
  rows: (string | number | null)[][];
  total_records: number;
}

export interface EsgSummaryReport {
  environmental: ReportTable;
  social: ReportTable;
  governance: ReportTable;
}

export type ReportFormat = "json" | "csv" | "excel" | "pdf";

export type ReportModule = "environmental" | "social" | "governance";

export interface EnvironmentalReportFilters {
  department_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface SocialReportFilters {
  department_id?: string;
}

export interface GovernanceReportFilters {
  severity?: string;
}

export interface CustomReportBody {
  modules: ReportModule[];
  department_id?: string;
  start_date?: string;
  end_date?: string;
}

function cleanParams(params: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      out[key] = value;
    }
  }
  return out;
}

async function fetchReport(path: string, params: Record<string, unknown>): Promise<ReportTable> {
  const res = await api.get<SuccessResponse<ReportTable>>(path, { params: cleanParams(params) });
  return res.data.data;
}

export async function fetchEnvironmentalReport(filters: EnvironmentalReportFilters): Promise<ReportTable> {
  return fetchReport("/reports/environmental", { ...filters, format: "json" });
}

export async function fetchSocialReport(filters: SocialReportFilters): Promise<ReportTable> {
  return fetchReport("/reports/social", { ...filters, format: "json" });
}

export async function fetchGovernanceReport(filters: GovernanceReportFilters): Promise<ReportTable> {
  return fetchReport("/reports/governance", { ...filters, format: "json" });
}

export async function fetchEsgSummaryReport(): Promise<EsgSummaryReport> {
  const res = await api.get<SuccessResponse<EsgSummaryReport>>("/reports/esg-summary", {
    params: { format: "json" },
  });
  return res.data.data;
}

export async function fetchCustomReport(body: CustomReportBody): Promise<Record<string, ReportTable>> {
  const res = await api.post<SuccessResponse<Record<string, ReportTable>>>("/reports/custom", {
    ...body,
    format: "json",
  });
  return res.data.data;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

const extForFormat: Record<Exclude<ReportFormat, "json">, string> = {
  csv: "csv",
  excel: "xlsx",
  pdf: "pdf",
};

export async function exportReport(
  path: string,
  filters: Record<string, unknown>,
  format: Exclude<ReportFormat, "json">,
  filenamePrefix: string
): Promise<void> {
  const res = await api.get(path, {
    params: cleanParams({ ...filters, format }),
    responseType: "blob",
  });
  triggerDownload(res.data as Blob, `${filenamePrefix}.${extForFormat[format]}`);
}

export async function exportCustomReport(
  body: CustomReportBody,
  format: Exclude<ReportFormat, "json">
): Promise<void> {
  const res = await api.post(
    "/reports/custom",
    { ...body, format },
    { responseType: "blob" }
  );
  triggerDownload(res.data as Blob, `custom_report.${extForFormat[format]}`);
}
