import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tag, Plus, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  useCategories,
  useCreateCategory,
  type Category,
  type CategoryCreate,
  type CategoryType,
} from "@/api/categories";

const emptyForm: CategoryCreate = { name: "", type: "csr_activity" };

function CreateForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<CategoryCreate>(emptyForm);
  const create = useCreateCategory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(form, { onSuccess: onClose });
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Add Category</h2>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Type</label>
          <select
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as CategoryType })}
          >
            <option value="csr_activity">CSR Activity</option>
            <option value="challenge">Challenge</option>
          </select>
        </div>
        <div className="sm:col-span-2 flex gap-2">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Save Category"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
        {create.isError && (
          <p className="sm:col-span-2 text-xs text-danger">Failed to create category.</p>
        )}
      </form>
    </Card>
  );
}

export function CategoriesSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";
  const { data: categories, isLoading } = useCategories();
  const [showCreate, setShowCreate] = useState(false);

  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => <span className="font-medium text-neutral-900">{row.name}</span>,
    },
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <Badge variant={row.type === "csr_activity" ? "teal" : "purple"}>
          {row.type === "csr_activity" ? "CSR Activity" : "Challenge"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant={row.status === "active" ? "success" : "neutral"}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (row) => (
        <span className="text-xs text-neutral-400">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <div>
        <PageHeader title="Categories" />
        <Card><p className="text-sm text-neutral-500">Admin access required.</p></Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Manage CSR activity and challenge categories."
        action={
          <Button onClick={() => setShowCreate((v) => !v)}>
            <Plus className="w-4 h-4" />
            {showCreate ? "Cancel" : "Add Category"}
          </Button>
        }
      />

      {showCreate && <CreateForm onClose={() => setShowCreate(false)} />}

      <Card variant="table">
        {!isLoading && (categories?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<Tag className="w-10 h-10" />}
            title="No categories yet"
            action={<Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Add Category</Button>}
          />
        ) : (
          <Table
            columns={columns}
            data={categories ?? []}
            keyExtractor={(row) => row.id}
            loading={isLoading}
          />
        )}
      </Card>
    </div>
  );
}
