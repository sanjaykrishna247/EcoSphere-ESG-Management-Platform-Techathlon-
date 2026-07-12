import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Building2, Plus, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import {
  useDepartmentsPaginated,
  useCreateDepartment,
  type Department,
  type DepartmentCreate,
} from "@/api/departments";

const emptyForm: DepartmentCreate = { name: "", code: "" };

function CreateForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<DepartmentCreate>(emptyForm);
  const create = useCreateDepartment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(form, { onSuccess: onClose });
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Add Department</h2>
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
        <Input
          label="Code"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
          required
        />
        <div className="sm:col-span-2 flex gap-2">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Save Department"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
        {create.isError && (
          <p className="sm:col-span-2 text-xs text-danger">Failed to create. Check for duplicate codes.</p>
        )}
      </form>
    </Card>
  );
}

export function DepartmentsSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";
  const { data, isLoading } = useDepartmentsPaginated();
  const [showCreate, setShowCreate] = useState(false);

  const columns: Column<Department>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => <span className="font-medium text-neutral-900">{row.name}</span>,
    },
    {
      key: "code",
      header: "Code",
      render: (row) => <span className="font-mono text-xs text-neutral-500">{row.code}</span>,
    },
    {
      key: "employee_count",
      header: "Employees",
      render: (row) => <span className="text-neutral-700">{row.employee_count}</span>,
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
        <PageHeader title="Departments" />
        <Card>
          <p className="text-sm text-neutral-500">Admin access required.</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Manage organizational departments and reporting units."
        action={
          <Button onClick={() => setShowCreate((v) => !v)}>
            <Plus className="w-4 h-4" />
            {showCreate ? "Cancel" : "Add Department"}
          </Button>
        }
      />

      {showCreate && <CreateForm onClose={() => setShowCreate(false)} />}

      <Card variant="table">
        {!isLoading && (data?.items.length ?? 0) === 0 ? (
          <EmptyState
            icon={<Building2 className="w-10 h-10" />}
            title="No departments yet"
            action={<Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Add Department</Button>}
          />
        ) : (
          <Table
            columns={columns}
            data={data?.items ?? []}
            keyExtractor={(row) => row.id}
            loading={isLoading}
          />
        )}
      </Card>
    </div>
  );
}
