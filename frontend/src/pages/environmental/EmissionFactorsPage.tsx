import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clsx } from "@/utils/clsx";
import { useAuthStore } from "@/store/authStore";
import {
  useEmissionFactors,
  useCreateEmissionFactor,
  useUpdateEmissionFactor,
  useDeleteEmissionFactor,
  type EmissionFactor,
  type EmissionFactorSourceType,
  type EmissionScope,
} from "@/api/emissionFactors";

const SOURCE_TYPES: EmissionFactorSourceType[] = ["purchase", "manufacturing", "expense", "fleet"];
const SCOPES: EmissionScope[] = ["scope1", "scope2", "scope3"];

const emptyForm = {
  name: "",
  source_type: "purchase" as EmissionFactorSourceType,
  unit: "",
  co2_per_unit: "",
  scope: "scope1" as EmissionScope,
  description: "",
  is_active: true,
};

function FactorModal({
  factor,
  onClose,
}: {
  factor: EmissionFactor | null;
  onClose: () => void;
}) {
  const createFactor = useCreateEmissionFactor();
  const updateFactor = useUpdateEmissionFactor();
  const [form, setForm] = useState(
    factor
      ? {
          name: factor.name,
          source_type: factor.source_type,
          unit: factor.unit,
          co2_per_unit: String(factor.co2_per_unit),
          scope: factor.scope,
          description: factor.description ?? "",
          is_active: factor.is_active,
        }
      : emptyForm
  );
  const [error, setError] = useState<string | null>(null);
  const isPending = createFactor.isPending || updateFactor.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.unit || !form.co2_per_unit) {
      setError("Please fill in all required fields.");
      return;
    }
    const payload = {
      name: form.name,
      source_type: form.source_type,
      unit: form.unit,
      co2_per_unit: Number(form.co2_per_unit),
      scope: form.scope,
      description: form.description || null,
      is_active: form.is_active,
    };
    try {
      if (factor) {
        await updateFactor.mutateAsync({ id: factor.id, data: payload });
      } else {
        await createFactor.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save emission factor");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-neutral-900 shadow-xl p-6 flex flex-col gap-4">
        <h2 className="text-lg font-display font-bold">{factor ? "Edit Emission Factor" : "Add Emission Factor"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Source Type</label>
            <select
              className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
              value={form.source_type}
              disabled={!!factor}
              onChange={(e) => setForm({ ...form, source_type: e.target.value as EmissionFactorSourceType })}
            >
              {SOURCE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <Input label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />

          <Input
            label="CO2 per Unit"
            type="number"
            min="0"
            step="any"
            value={form.co2_per_unit}
            onChange={(e) => setForm({ ...form, co2_per_unit: e.target.value })}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Scope</label>
            <select
              className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value as EmissionScope })}
            >
              {SCOPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Active
          </label>

          {error && <p className="text-sm text-critical-red">{error}</p>}

          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EmissionFactorsPage() {
  const user = useAuthStore((s) => s.user);
  const canManage = user?.role === "admin";
  const { data: factors, isLoading } = useEmissionFactors();
  const deleteFactor = useDeleteEmissionFactor();
  const [modalFactor, setModalFactor] = useState<EmissionFactor | null | "new">(null);

  const handleDelete = (id: string) => {
    if (window.confirm("Deactivate this emission factor? Historical transactions will be preserved.")) {
      deleteFactor.mutate(id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Emission Factors</h1>
        {canManage && <Button onClick={() => setModalFactor("new")}>Add Emission Factor</Button>}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Source Type</th>
                <th className="px-4 py-3 font-medium">Unit</th>
                <th className="px-4 py-3 font-medium">CO2/Unit</th>
                <th className="px-4 py-3 font-medium">Scope</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {canManage && <th className="px-4 py-3 font-medium"></th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="px-4 py-6 text-center text-neutral-400">
                    Loading…
                  </td>
                </tr>
              ) : factors?.length ? (
                factors.map((f, idx) => (
                  <tr
                    key={f.id}
                    className={clsx(
                      idx % 2 === 0 ? "bg-white dark:bg-neutral-900" : "bg-neutral-50 dark:bg-neutral-800/40"
                    )}
                  >
                    <td className="px-4 py-3 font-medium">{f.name}</td>
                    <td className="px-4 py-3 capitalize">{f.source_type}</td>
                    <td className="px-4 py-3">{f.unit}</td>
                    <td className="px-4 py-3">{f.co2_per_unit}</td>
                    <td className="px-4 py-3 capitalize">{f.scope}</td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          f.is_active
                            ? "bg-eco-green/10 text-eco-green"
                            : "bg-neutral-200 text-neutral-500 dark:bg-neutral-800"
                        )}
                      >
                        {f.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setModalFactor(f)}>
                          Edit
                        </Button>
                        {f.is_active && (
                          <Button variant="danger" size="sm" onClick={() => handleDelete(f.id)}>
                            Deactivate
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="px-4 py-6 text-center text-neutral-400">
                    No data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {modalFactor !== null && (
        <FactorModal factor={modalFactor === "new" ? null : modalFactor} onClose={() => setModalFactor(null)} />
      )}
    </div>
  );
}
