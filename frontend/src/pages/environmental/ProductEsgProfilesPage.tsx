import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Package, Plus, X } from "lucide-react";
import {
  useProductEsgProfiles,
  useCreateProductEsgProfile,
  type ProductEsgProfile,
  type ProductEsgProfileCreate,
  type SustainabilityRating,
} from "@/api/productEsgProfiles";
import { useAuthStore } from "@/store/authStore";

const ratingVariant: Record<SustainabilityRating, "success" | "info" | "warning" | "danger" | "neutral"> = {
  A: "success",
  B: "info",
  C: "warning",
  D: "danger",
  F: "neutral",
};

const emptyForm: ProductEsgProfileCreate = {
  product_name: "",
  product_code: "",
  recyclability_pct: null,
  sustainability_rating: null,
  notes: null,
};

function CreateForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<ProductEsgProfileCreate>(emptyForm);
  const create = useCreateProductEsgProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      {
        ...form,
        recyclability_pct: form.recyclability_pct ? Number(form.recyclability_pct) : null,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Add Product ESG Profile</h2>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Product Name"
          value={form.product_name}
          onChange={(e) => setForm({ ...form, product_name: e.target.value })}
          required
        />
        <Input
          label="Product Code"
          value={form.product_code}
          onChange={(e) => setForm({ ...form, product_code: e.target.value })}
          required
        />
        <Input
          label="Recyclability (%)"
          type="number"
          min={0}
          max={100}
          value={form.recyclability_pct ?? ""}
          onChange={(e) =>
            setForm({ ...form, recyclability_pct: e.target.value ? Number(e.target.value) : null })
          }
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
            Sustainability Rating
          </label>
          <select
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            value={form.sustainability_rating ?? ""}
            onChange={(e) =>
              setForm({
                ...form,
                sustainability_rating: (e.target.value as SustainabilityRating) || null,
              })
            }
          >
            <option value="">None</option>
            {(["A", "B", "C", "D", "F"] as SustainabilityRating[]).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Notes</label>
          <textarea
            className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 min-h-[80px]"
            value={form.notes ?? ""}
            onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
          />
        </div>
        <div className="sm:col-span-2 flex gap-2">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Save Profile"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
        {create.isError && (
          <p className="sm:col-span-2 text-xs text-danger">Failed to save. Check for duplicate product codes.</p>
        )}
      </form>
    </Card>
  );
}

export function ProductEsgProfilesPage() {
  const user = useAuthStore((s) => s.user);
  const canEdit = user?.role === "admin" || user?.role === "manager";
  const { data, isLoading } = useProductEsgProfiles();
  const [showCreate, setShowCreate] = useState(false);

  const columns: Column<ProductEsgProfile>[] = [
    {
      key: "product_name",
      header: "Product",
      render: (row) => <span className="font-medium text-neutral-900">{row.product_name}</span>,
    },
    {
      key: "product_code",
      header: "Code",
      render: (row) => (
        <span className="font-mono text-xs text-neutral-500">{row.product_code}</span>
      ),
    },
    {
      key: "recyclability_pct",
      header: "Recyclability",
      render: (row) =>
        row.recyclability_pct != null ? (
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-env rounded-full"
                style={{ width: `${row.recyclability_pct}%` }}
              />
            </div>
            <span className="text-xs text-neutral-600">{row.recyclability_pct}%</span>
          </div>
        ) : (
          <span className="text-neutral-300">—</span>
        ),
    },
    {
      key: "sustainability_rating",
      header: "Rating",
      render: (row) =>
        row.sustainability_rating ? (
          <Badge variant={ratingVariant[row.sustainability_rating]}>
            {row.sustainability_rating}
          </Badge>
        ) : (
          <span className="text-neutral-300">—</span>
        ),
    },
    {
      key: "notes",
      header: "Notes",
      render: (row) => (
        <span className="text-sm text-neutral-500 truncate max-w-[200px] block">
          {row.notes ?? "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Added",
      render: (row) => (
        <span className="text-xs text-neutral-400">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Product ESG Profiles"
        subtitle="Track sustainability ratings and recyclability across your product line."
        action={
          canEdit ? (
            <Button onClick={() => setShowCreate((v) => !v)}>
              <Plus className="w-4 h-4" />
              {showCreate ? "Cancel" : "Add Profile"}
            </Button>
          ) : undefined
        }
      />

      {showCreate && <CreateForm onClose={() => setShowCreate(false)} />}

      <Card variant="table">
        <Table
          columns={columns}
          data={data?.items ?? []}
          keyExtractor={(row) => row.id}
          loading={isLoading}
          emptyMessage="No product profiles yet."
        />
        {!isLoading && (data?.items.length ?? 0) === 0 && !showCreate && (
          <EmptyState
            icon={<Package className="w-10 h-10" />}
            title="No product profiles yet"
            description="Add ESG sustainability data for products in your catalogue."
            action={
              canEdit ? (
                <Button onClick={() => setShowCreate(true)}>
                  <Plus className="w-4 h-4" /> Add Profile
                </Button>
              ) : undefined
            }
          />
        )}
      </Card>
    </div>
  );
}
