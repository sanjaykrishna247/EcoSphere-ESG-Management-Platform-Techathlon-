import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clsx } from "@/utils/clsx";
import { useAuthStore } from "@/store/authStore";
import { useDepartments } from "@/api/departments";
import {
  useAudits,
  useCreateAudit,
  useUpdateAudit,
  type Audit,
  type AuditStatus,
  type AuditType,
} from "@/api/audits";

const statusDotClasses: Record<AuditStatus, string> = {
  scheduled: "bg-sky-blue",
  in_progress: "bg-amber-warning",
  completed: "bg-eco-green",
  cancelled: "bg-critical-red",
};

const statusLabel: Record<AuditStatus, string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function StatusBadge({ status }: { status: AuditStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={clsx("w-2 h-2 rounded-full", statusDotClasses[status])} />
      {statusLabel[status]}
    </span>
  );
}

interface CreateAuditForm {
  title: string;
  department_id: string;
  audit_type: AuditType;
  scheduled_date: string;
}

const emptyForm: CreateAuditForm = {
  title: "",
  department_id: "",
  audit_type: "internal",
  scheduled_date: "",
};

function CreateAuditFormPanel({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const { data: departments } = useDepartments();
  const [form, setForm] = useState<CreateAuditForm>(emptyForm);
  const createAudit = useCreateAudit();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    createAudit.mutate(
      {
        title: form.title,
        auditor_id: user.id,
        department_id: form.department_id || null,
        audit_type: form.audit_type,
        scheduled_date: form.scheduled_date,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Card>
      <h2 className="font-display font-semibold mb-4">Create Audit</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Department</label>
          <select
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
            value={form.department_id}
            onChange={(e) => setForm({ ...form, department_id: e.target.value })}
          >
            <option value="">— None —</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Audit Type</label>
          <select
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
            value={form.audit_type}
            onChange={(e) => setForm({ ...form, audit_type: e.target.value as AuditType })}
          >
            <option value="internal">Internal</option>
            <option value="external">External</option>
            <option value="regulatory">Regulatory</option>
          </select>
        </div>
        <Input
          label="Scheduled Date"
          type="date"
          value={form.scheduled_date}
          onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
          required
        />
        {createAudit.isError && (
          <p className="text-xs text-critical-red">Failed to create audit. Please check the fields.</p>
        )}
        <div className="flex gap-2 mt-2">
          <Button type="submit" disabled={createAudit.isPending}>
            {createAudit.isPending ? "Saving…" : "Save Audit"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

function AuditRow({ audit, departmentName }: { audit: Audit; departmentName: string }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<AuditStatus>(audit.status);
  const [findings, setFindings] = useState(audit.findings ?? "");
  const updateAudit = useUpdateAudit();
  const user = useAuthStore((s) => s.user);
  const canEdit = user?.role === "admin" || user?.role === "manager";

  const handleSave = () => {
    updateAudit.mutate({ id: audit.id, data: { status, findings: findings || null } }, { onSuccess: () => setEditing(false) });
  };

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{audit.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
            <span className="capitalize px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
              {audit.audit_type}
            </span>
            <span>{departmentName}</span>
            <span>Scheduled {audit.scheduled_date}</span>
          </div>
        </div>
        <StatusBadge status={audit.status} />
      </div>

      {audit.status === "completed" && audit.findings && !editing && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">{audit.findings}</p>
      )}

      {canEdit && !editing && (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setEditing(true)}>
          Update Status
        </Button>
      )}

      {canEdit && editing && (
        <div className="flex flex-col gap-2 mt-2">
          <select
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            value={status}
            onChange={(e) => setStatus(e.target.value as AuditStatus)}
          >
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <textarea
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            placeholder="Findings"
            value={findings}
            onChange={(e) => setFindings(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={updateAudit.isPending}>
              Save
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function AuditsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: audits, isLoading } = useAudits();
  const { data: departments } = useDepartments();
  const [showCreate, setShowCreate] = useState(false);

  const departmentName = (id: string | null) =>
    departments?.find((d) => d.id === id)?.name ?? (id ? "Unknown department" : "—");

  const sorted = [...(audits ?? [])].sort(
    (a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
  );

  const canCreate = user?.role === "admin" || user?.role === "manager";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Audits</h1>
        {canCreate && (
          <Button onClick={() => setShowCreate((v) => !v)}>{showCreate ? "Close Form" : "Create Audit"}</Button>
        )}
      </div>

      {showCreate && <CreateAuditFormPanel onClose={() => setShowCreate(false)} />}

      {isLoading && <p className="text-sm text-neutral-500">Loading...</p>}
      {!isLoading && sorted.length === 0 && <p className="text-sm text-neutral-500">Nothing here yet</p>}

      <div className="flex flex-col gap-4">
        {sorted.map((audit) => (
          <AuditRow key={audit.id} audit={audit} departmentName={departmentName(audit.department_id)} />
        ))}
      </div>
    </div>
  );
}
