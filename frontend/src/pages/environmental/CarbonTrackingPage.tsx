import { useMemo, useState } from "react";
import { TrendAreaChart } from "@/components/charts/TrendAreaChart";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clsx } from "@/utils/clsx";
import { useDepartments } from "@/api/departments";
import { useEmissionFactors } from "@/api/emissionFactors";
import {
  useCarbonTransactionSummary,
  useCarbonTransactionTrends,
  useCarbonTransactions,
  useCreateCarbonTransaction,
  useDeleteCarbonTransaction,
  type TransactionSourceType,
} from "@/api/carbonTransactions";
import type { EmissionScope } from "@/api/emissionFactors";

const SCOPES: EmissionScope[] = ["scope1", "scope2", "scope3"];
const SOURCE_TYPES: TransactionSourceType[] = ["purchase", "manufacturing", "expense", "fleet", "manual"];

interface Filters {
  department_id: string;
  start_date: string;
  end_date: string;
  scope: EmissionScope | "";
  source_type: TransactionSourceType | "";
}

const emptyForm = {
  emission_factor_id: "",
  department_id: "",
  quantity: "",
  transaction_date: new Date().toISOString().slice(0, 10),
  notes: "",
};

function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const { data: departments } = useDepartments();
  const { data: factors } = useEmissionFactors(true);
  const createTxn = useCreateCarbonTransaction();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const selectedFactor = factors?.find((f) => f.id === form.emission_factor_id);
  const preview = selectedFactor && form.quantity ? Number(form.quantity) * selectedFactor.co2_per_unit : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.emission_factor_id || !form.department_id || !form.quantity || !form.transaction_date) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      await createTxn.mutateAsync({
        emission_factor_id: form.emission_factor_id,
        department_id: form.department_id,
        quantity: Number(form.quantity),
        transaction_date: form.transaction_date,
        notes: form.notes || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-neutral-900 shadow-xl p-6 flex flex-col gap-4">
        <h2 className="text-lg font-display font-bold">Add Carbon Transaction</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Emission Factor</label>
            <select
              className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
              value={form.emission_factor_id}
              onChange={(e) => setForm({ ...form, emission_factor_id: e.target.value })}
            >
              <option value="">Select emission factor…</option>
              {factors?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.unit}, {f.scope})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Department</label>
            <select
              className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
            >
              <option value="">Select department…</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Quantity"
            type="number"
            min="0"
            step="any"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />

          <Input
            label="Transaction Date"
            type="date"
            value={form.transaction_date}
            onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
          />

          <Input
            label="Notes"
            type="text"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          {preview !== null && (
            <p className="text-sm text-neutral-500">
              Estimated CO2: <span className="font-semibold text-earth-teal">{preview.toFixed(3)}</span> kg (preview
              only, server computes authoritative value)
            </p>
          )}

          {error && <p className="text-sm text-critical-red">{error}</p>}

          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTxn.isPending}>
              {createTxn.isPending ? "Saving…" : "Save Transaction"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CarbonTrackingPage() {
  const [filters, setFilters] = useState<Filters>({
    department_id: "",
    start_date: "",
    end_date: "",
    scope: "",
    source_type: "",
  });
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const { data: departments } = useDepartments();
  const { data: summary, isLoading: summaryLoading } = useCarbonTransactionSummary(
    filters.department_id || undefined,
    filters.start_date || undefined,
    filters.end_date || undefined
  );
  const { data: trends } = useCarbonTransactionTrends(filters.department_id || undefined, new Date().getFullYear());
  const { data: txnPage, isLoading: txnLoading } = useCarbonTransactions({
    department_id: filters.department_id || undefined,
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
    scope: filters.scope || undefined,
    source_type: filters.source_type || undefined,
    page,
    per_page: 20,
  });
  const deleteTxn = useDeleteCarbonTransaction();

  const departmentNameById = useMemo(() => {
    const map = new Map<string, string>();
    departments?.forEach((d) => map.set(d.id, d.name));
    return map;
  }, [departments]);

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this transaction? This cannot be undone.")) {
      deleteTxn.mutate(id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Carbon Tracking</h1>
        <Button onClick={() => setShowModal(true)}>Add Transaction</Button>
      </div>

      <Card>
        <h2 className="font-display font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Department</label>
            <select
              className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
              value={filters.department_id}
              onChange={(e) => {
                setFilters({ ...filters, department_id: e.target.value });
                setPage(1);
              }}
            >
              <option value="">All departments</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Start Date"
            type="date"
            value={filters.start_date}
            onChange={(e) => {
              setFilters({ ...filters, start_date: e.target.value });
              setPage(1);
            }}
          />
          <Input
            label="End Date"
            type="date"
            value={filters.end_date}
            onChange={(e) => {
              setFilters({ ...filters, end_date: e.target.value });
              setPage(1);
            }}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Scope</label>
            <select
              className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
              value={filters.scope}
              onChange={(e) => {
                setFilters({ ...filters, scope: e.target.value as EmissionScope | "" });
                setPage(1);
              }}
            >
              <option value="">All scopes</option>
              {SCOPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Source Type</label>
            <select
              className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
              value={filters.source_type}
              onChange={(e) => {
                setFilters({ ...filters, source_type: e.target.value as TransactionSourceType | "" });
                setPage(1);
              }}
            >
              <option value="">All sources</option>
              {SOURCE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card accent="teal">
          <p className="text-xs uppercase tracking-wide text-neutral-400 font-medium">Total CO2</p>
          <p className="text-3xl font-display font-bold mt-1">
            {summaryLoading ? "…" : `${Number(summary?.total_co2 ?? 0).toFixed(1)} kg`}
          </p>
        </Card>
        <Card accent="blue">
          <p className="text-xs uppercase tracking-wide text-neutral-400 font-medium mb-2">By Scope</p>
          <div className="flex flex-col gap-1">
            {summary?.by_scope?.length ? (
              summary.by_scope.map((s) => (
                <div key={s.scope} className="flex justify-between text-sm">
                  <span className="capitalize text-neutral-500">{s.scope}</span>
                  <span className="font-semibold">{Number(s.total_co2).toFixed(1)} kg</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-400">No data yet</p>
            )}
          </div>
        </Card>
        <Card accent="purple">
          <p className="text-xs uppercase tracking-wide text-neutral-400 font-medium mb-2">By Department</p>
          <div className="flex flex-col gap-1">
            {summary?.by_department?.length ? (
              summary.by_department.map((d) => (
                <div key={d.department_id} className="flex justify-between text-sm">
                  <span className="text-neutral-500">{departmentNameById.get(d.department_id) ?? "Unknown"}</span>
                  <span className="font-semibold">{Number(d.total_co2).toFixed(1)} kg</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-400">No data yet</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="font-display font-semibold mb-4">Carbon Trend ({new Date().getFullYear()})</h2>
        {trends?.length ? (
          <TrendAreaChart
            data={trends.map((t) => ({ label: t.period, value: Number(t.total_co2) }))}
            color="#0d9488"
            valueSuffix="kg"
          />
        ) : (
          <p className="text-sm text-neutral-400">No data yet</p>
        )}
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Quantity</th>
                <th className="px-4 py-3 font-medium">CO2 (kg)</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {txnLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-neutral-400">
                    Loading…
                  </td>
                </tr>
              ) : txnPage?.items?.length ? (
                txnPage.items.map((t, idx) => (
                  <tr
                    key={t.id}
                    className={clsx(
                      idx % 2 === 0 ? "bg-white dark:bg-neutral-900" : "bg-neutral-50 dark:bg-neutral-800/40"
                    )}
                  >
                    <td className="px-4 py-3">{t.transaction_date}</td>
                    <td className="px-4 py-3 capitalize">{t.source_type}</td>
                    <td className="px-4 py-3">{departmentNameById.get(t.department_id) ?? "—"}</td>
                    <td className="px-4 py-3">{t.quantity}</td>
                    <td className="px-4 py-3 font-semibold">{Number(t.co2_equivalent).toFixed(3)}</td>
                    <td className="px-4 py-3 text-neutral-500">{t.notes ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Button variant="danger" size="sm" onClick={() => handleDelete(t.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-neutral-400">
                    No data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {txnPage && txnPage.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800">
            <span className="text-sm text-neutral-500">
              Page {txnPage.page} of {txnPage.total_pages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= txnPage.total_pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
