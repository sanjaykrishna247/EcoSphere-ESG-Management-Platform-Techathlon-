import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Scale, Plus, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  usePolicies,
  useMyAcknowledgements,
  useCreatePolicy,
  useAcknowledgePolicy,
  type EsgPolicy,
  type PolicyCategory,
} from "@/api/policies";

const categoryVariant: Record<PolicyCategory, BadgeVariant> = {
  environmental: "teal",
  social:        "info",
  governance:    "purple",
};

interface CreatePolicyForm {
  title: string;
  content: string;
  category: PolicyCategory;
  effective_date: string;
  expiry_date: string;
  acknowledgement_required: boolean;
}

const emptyForm: CreatePolicyForm = {
  title: "",
  content: "",
  category: "environmental",
  effective_date: "",
  expiry_date: "",
  acknowledgement_required: true,
};

function CreatePolicyFormPanel({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<CreatePolicyForm>(emptyForm);
  const createPolicy = useCreatePolicy();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPolicy.mutate(
      {
        title: form.title,
        content: form.content,
        category: form.category,
        effective_date: form.effective_date,
        expiry_date: form.expiry_date || null,
        acknowledgement_required: form.acknowledgement_required,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Create Policy</h2>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Category</label>
          <select
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as PolicyCategory })}
          >
            <option value="environmental">Environmental</option>
            <option value="social">Social</option>
            <option value="governance">Governance</option>
          </select>
        </div>
        <Input
          label="Effective Date"
          type="date"
          value={form.effective_date}
          onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
          required
        />
        <Input
          label="Expiry Date (optional)"
          type="date"
          value={form.expiry_date}
          onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
        />
        <div className="sm:col-span-2 flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Content</label>
          <textarea
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 min-h-[120px]"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <input
            type="checkbox"
            id="ack-required"
            checked={form.acknowledgement_required}
            onChange={(e) => setForm({ ...form, acknowledgement_required: e.target.checked })}
            className="rounded border-neutral-300"
          />
          <label htmlFor="ack-required" className="text-sm text-neutral-700">
            Acknowledgement required from employees
          </label>
        </div>
        {createPolicy.isError && (
          <p className="sm:col-span-2 text-xs text-danger">Failed to create policy. Please check all fields.</p>
        )}
        <div className="sm:col-span-2 flex gap-2">
          <Button type="submit" disabled={createPolicy.isPending}>
            {createPolicy.isPending ? "Saving…" : "Save Policy"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Card>
  );
}

function PolicyDetailDrawer({ policy, onClose }: { policy: EsgPolicy; onClose: () => void }) {
  const { data: myAcks } = useMyAcknowledgements();
  const acknowledge = useAcknowledgePolicy();
  const alreadyAcknowledged = myAcks?.some((a) => a.policy_id === policy.id) ?? false;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full bg-white shadow-xl p-6 overflow-y-auto flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant={categoryVariant[policy.category]} className="mb-2">{policy.category}</Badge>
            <h2 className="text-lg font-semibold text-neutral-900">{policy.title}</h2>
            <p className="text-xs text-neutral-400 mt-1">Version {policy.version}</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 shrink-0 ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4 text-xs text-neutral-500 border-y border-neutral-100 py-3">
          <span>Effective: <strong className="text-neutral-700">{policy.effective_date}</strong></span>
          {policy.expiry_date && (
            <span>Expires: <strong className="text-neutral-700">{policy.expiry_date}</strong></span>
          )}
        </div>

        <div className="flex-1 rounded-md bg-neutral-50 border border-neutral-200 p-4 text-sm text-neutral-700 whitespace-pre-wrap overflow-y-auto">
          {policy.content}
        </div>

        {policy.acknowledgement_required && (
          <div className="pt-2">
            {alreadyAcknowledged ? (
              <p className="text-sm font-medium text-brand">Acknowledged</p>
            ) : (
              <Button onClick={() => acknowledge.mutate(policy.id)} disabled={acknowledge.isPending}>
                {acknowledge.isPending ? "Acknowledging…" : "Acknowledge Policy"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function PoliciesPage() {
  const user = useAuthStore((s) => s.user);
  const { data: policies, isLoading } = usePolicies();
  const [selected, setSelected] = useState<EsgPolicy | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const columns: Column<EsgPolicy>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => <span className="font-medium text-neutral-900">{row.title}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (row) => (
        <Badge variant={categoryVariant[row.category]}>{row.category}</Badge>
      ),
    },
    {
      key: "version",
      header: "Version",
      render: (row) => <span className="text-xs text-neutral-400">v{row.version}</span>,
    },
    {
      key: "effective_date",
      header: "Effective",
      render: (row) => <span className="text-sm text-neutral-600">{row.effective_date}</span>,
    },
    {
      key: "acknowledgement_required",
      header: "Ack Required",
      render: (row) =>
        row.acknowledgement_required ? (
          <Badge variant="warning">Required</Badge>
        ) : (
          <span className="text-neutral-300 text-xs">—</span>
        ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (row) => (
        <Badge variant={row.is_active ? "success" : "neutral"}>
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="ESG Policies"
        subtitle="Manage and acknowledge organizational policies across Environmental, Social, and Governance areas."
        action={
          user?.role === "admin" ? (
            <Button onClick={() => setShowCreate((v) => !v)}>
              <Plus className="w-4 h-4" />
              {showCreate ? "Cancel" : "Create Policy"}
            </Button>
          ) : undefined
        }
      />

      {showCreate && <CreatePolicyFormPanel onClose={() => setShowCreate(false)} />}

      <Card variant="table">
        {!isLoading && (policies?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<Scale className="w-10 h-10" />}
            title="No policies yet"
            description="Create the first policy to get started."
          />
        ) : (
          <Table
            columns={columns}
            data={policies ?? []}
            keyExtractor={(row) => row.id}
            loading={isLoading}
            onRowClick={setSelected}
          />
        )}
      </Card>

      {selected && (
        <PolicyDetailDrawer policy={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
