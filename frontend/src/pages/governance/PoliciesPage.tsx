import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clsx } from "@/utils/clsx";
import { useAuthStore } from "@/store/authStore";
import {
  usePolicies,
  useMyAcknowledgements,
  useCreatePolicy,
  useAcknowledgePolicy,
  type EsgPolicy,
  type PolicyCategory,
} from "@/api/policies";

const categoryAccent: Record<PolicyCategory, "teal" | "blue" | "purple"> = {
  environmental: "teal",
  social: "blue",
  governance: "purple",
};

const categoryBadgeClasses: Record<PolicyCategory, string> = {
  environmental: "bg-earth-teal/10 text-earth-teal",
  social: "bg-sky-blue/10 text-sky-blue",
  governance: "bg-governance-purple/10 text-governance-purple",
};

function CategoryBadge({ category }: { category: PolicyCategory }) {
  return (
    <span className={clsx("text-xs font-medium px-2 py-0.5 rounded-full capitalize", categoryBadgeClasses[category])}>
      {category}
    </span>
  );
}

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
    <Card>
      <h2 className="font-display font-semibold mb-4">Create Policy</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Content</label>
          <textarea
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green min-h-[140px]"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Category</label>
          <select
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
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
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.acknowledgement_required}
            onChange={(e) => setForm({ ...form, acknowledgement_required: e.target.checked })}
          />
          Acknowledgement required
        </label>
        {createPolicy.isError && (
          <p className="text-xs text-critical-red">Failed to create policy. Please check the fields.</p>
        )}
        <div className="flex gap-2 mt-2">
          <Button type="submit" disabled={createPolicy.isPending}>
            {createPolicy.isPending ? "Saving…" : "Save Policy"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
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
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl h-full bg-white dark:bg-neutral-900 shadow-2xl p-6 overflow-y-auto flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-display font-bold">{policy.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <CategoryBadge category={policy.category} />
              <span className="text-xs text-neutral-500">v{policy.version}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="text-sm text-neutral-500 flex flex-col gap-1">
          <span>Effective: {policy.effective_date}</span>
          {policy.expiry_date && <span>Expires: {policy.expiry_date}</span>}
        </div>

        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800 p-4 flex-1 overflow-y-auto">
          <div className="whitespace-pre-wrap text-sm">{policy.content}</div>
        </div>

        {policy.acknowledgement_required && (
          <div>
            {alreadyAcknowledged ? (
              <span className="text-sm text-eco-green font-medium">You have acknowledged this policy.</span>
            ) : (
              <Button onClick={() => acknowledge.mutate(policy.id)} disabled={acknowledge.isPending}>
                {acknowledge.isPending ? "Acknowledging…" : "Acknowledge"}
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">ESG Policies</h1>
        {user?.role === "admin" && (
          <Button onClick={() => setShowCreate((v) => !v)}>{showCreate ? "Close Form" : "Create Policy"}</Button>
        )}
      </div>

      {showCreate && <CreatePolicyFormPanel onClose={() => setShowCreate(false)} />}

      {isLoading && <p className="text-sm text-neutral-500">Loading...</p>}
      {!isLoading && (policies?.length ?? 0) === 0 && (
        <p className="text-sm text-neutral-500">Nothing here yet</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policies?.map((policy) => (
          <Card
            key={policy.id}
            accent={categoryAccent[policy.category]}
            className="cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setSelected(policy)}
          >
            <div className="flex items-center justify-between mb-2">
              <CategoryBadge category={policy.category} />
              <span className="text-xs text-neutral-400">v{policy.version}</span>
            </div>
            <h3 className="font-semibold">{policy.title}</h3>
            <p className="text-xs text-neutral-500 mt-2">Effective {policy.effective_date}</p>
            {policy.acknowledgement_required && (
              <span className="text-xs text-amber-warning font-medium">Acknowledgement required</span>
            )}
          </Card>
        ))}
      </div>

      {selected && <PolicyDetailDrawer policy={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
