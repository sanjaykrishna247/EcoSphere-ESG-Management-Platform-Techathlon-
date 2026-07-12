import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clsx } from "@/utils/clsx";
import { useAuthStore } from "@/store/authStore";
import { useAudits } from "@/api/audits";
import {
  useComplianceIssues,
  useCreateComplianceIssue,
  type ComplianceIssue,
  type IssueSeverity,
} from "@/api/complianceIssues";

const severityAccent: Record<IssueSeverity, "red" | "amber" | "blue" | undefined> = {
  critical: "red",
  high: "amber",
  medium: "blue",
  low: undefined,
};

const severityBadgeClasses: Record<IssueSeverity, string> = {
  critical: "bg-critical-red/10 text-critical-red",
  high: "bg-amber-warning/10 text-amber-warning",
  medium: "bg-sky-blue/10 text-sky-blue",
  low: "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
};

function SeverityBadge({ severity }: { severity: IssueSeverity }) {
  return (
    <span className={clsx("text-xs font-medium px-2 py-0.5 rounded-full capitalize", severityBadgeClasses[severity])}>
      {severity}
    </span>
  );
}

function dueDateLabel(dueDate: string): { text: string; overdue: boolean } {
  const due = new Date(dueDate);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"}`, overdue: true };
  if (diffDays === 0) return { text: "Due today", overdue: false };
  return { text: `${diffDays} day${diffDays === 1 ? "" : "s"} left`, overdue: false };
}

const severityTabs: { label: string; value: IssueSeverity | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

interface CreateIssueForm {
  audit_id: string;
  severity: IssueSeverity;
  description: string;
  owner_id: string;
  due_date: string;
}

const emptyForm: CreateIssueForm = {
  audit_id: "",
  severity: "medium",
  description: "",
  owner_id: "",
  due_date: "",
};

function CreateIssueFormPanel({ onClose }: { onClose: () => void }) {
  const { data: audits } = useAudits();
  const [form, setForm] = useState<CreateIssueForm>(emptyForm);
  const createIssue = useCreateComplianceIssue();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createIssue.mutate(
      {
        audit_id: form.audit_id,
        severity: form.severity,
        description: form.description,
        owner_id: form.owner_id,
        due_date: form.due_date,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Card>
      <h2 className="font-display font-semibold mb-4">Create Compliance Issue</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Related Audit</label>
          <select
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
            value={form.audit_id}
            onChange={(e) => setForm({ ...form, audit_id: e.target.value })}
            required
          >
            <option value="">— Select audit —</option>
            {audits?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Severity</label>
          <select
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value as IssueSeverity })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
          <textarea
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green min-h-[100px]"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
        <Input
          label="Owner User ID (UUID)"
          value={form.owner_id}
          onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
          placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
          required
        />
        <p className="text-xs text-neutral-500 -mt-2">
          There is no user directory in this app yet, so paste the owner's user ID directly.
        </p>
        <Input
          label="Due Date"
          type="date"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          required
        />
        {createIssue.isError && (
          <p className="text-xs text-critical-red">Failed to create issue. Please check the fields (owner ID must be a valid user UUID).</p>
        )}
        <div className="flex gap-2 mt-2">
          <Button type="submit" disabled={createIssue.isPending}>
            {createIssue.isPending ? "Saving…" : "Save Issue"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

function IssueCard({ issue }: { issue: ComplianceIssue }) {
  const due = dueDateLabel(issue.due_date);
  return (
    <Card accent={severityAccent[issue.severity]} className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <SeverityBadge severity={issue.severity} />
        <span className={clsx("text-xs font-medium", due.overdue ? "text-critical-red" : "text-neutral-500")}>
          {due.text}
        </span>
      </div>
      <p className="text-sm">{issue.description}</p>
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>Owner: {issue.owner_id.slice(0, 8)}…</span>
        <span className="capitalize">{issue.status.replace("_", " ")}</span>
      </div>
    </Card>
  );
}

export function ComplianceIssuesPage() {
  const user = useAuthStore((s) => s.user);
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | "all">("all");
  const [showCreate, setShowCreate] = useState(false);

  const { data: issues, isLoading } = useComplianceIssues(
    severityFilter === "all" ? undefined : { severity: severityFilter }
  );

  const { overdue, rest } = useMemo(() => {
    const list = issues ?? [];
    return {
      overdue: list.filter((i) => i.status === "overdue"),
      rest: list.filter((i) => i.status !== "overdue"),
    };
  }, [issues]);

  const canCreate = user?.role === "admin" || user?.role === "manager";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Compliance Issues</h1>
        {canCreate && (
          <Button onClick={() => setShowCreate((v) => !v)}>{showCreate ? "Close Form" : "Create Issue"}</Button>
        )}
      </div>

      {showCreate && <CreateIssueFormPanel onClose={() => setShowCreate(false)} />}

      <div className="flex gap-2">
        {severityTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSeverityFilter(tab.value)}
            className={clsx(
              "px-3 py-1.5 text-sm rounded-xl font-medium transition-colors",
              severityFilter === tab.value
                ? "bg-eco-green text-white"
                : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-neutral-500">Loading...</p>}
      {!isLoading && (issues?.length ?? 0) === 0 && <p className="text-sm text-neutral-500">Nothing here yet</p>}

      {overdue.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl bg-critical-red/10 border border-critical-red/30 px-4 py-2">
            <h2 className="text-sm font-semibold text-critical-red">Overdue Issues ({overdue.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overdue.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
