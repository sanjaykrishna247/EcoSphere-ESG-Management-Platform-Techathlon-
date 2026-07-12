import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clsx } from "@/utils/clsx";
import { useAuthStore } from "@/store/authStore";
import { useDepartments } from "@/api/departments";
import {
  useEnvironmentalGoals,
  useCreateEnvironmentalGoal,
  useDeleteEnvironmentalGoal,
  type GoalStatus,
} from "@/api/environmentalGoals";

const STATUS_OPTIONS: GoalStatus[] = ["active", "completed", "missed", "paused"];

const statusAccent: Record<GoalStatus, "blue" | "green" | "red" | "amber"> = {
  active: "blue",
  completed: "green",
  missed: "red",
  paused: "amber",
};

const statusBadgeClasses: Record<GoalStatus, string> = {
  active: "bg-sky-blue/10 text-sky-blue",
  completed: "bg-eco-green/10 text-eco-green",
  missed: "bg-critical-red/10 text-critical-red",
  paused: "bg-amber-warning/10 text-amber-warning",
};

const emptyForm = {
  title: "",
  description: "",
  target_value: "",
  current_value: "0",
  unit: "",
  start_date: new Date().toISOString().slice(0, 10),
  end_date: "",
  department_id: "",
  status: "active" as GoalStatus,
};

function AddGoalModal({ onClose }: { onClose: () => void }) {
  const { data: departments } = useDepartments();
  const createGoal = useCreateEnvironmentalGoal();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title || !form.target_value || !form.unit || !form.start_date || !form.end_date) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.end_date < form.start_date) {
      setError("End date must not be before start date.");
      return;
    }
    try {
      await createGoal.mutateAsync({
        title: form.title,
        description: form.description || null,
        target_value: Number(form.target_value),
        current_value: Number(form.current_value || 0),
        unit: form.unit,
        start_date: form.start_date,
        end_date: form.end_date,
        department_id: form.department_id || null,
        status: form.status,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create goal");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-neutral-900 shadow-xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-display font-bold">Add Environmental Goal</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Department</label>
            <select
              className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
            >
              <option value="">Org-wide</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Value"
              type="number"
              min="0"
              step="any"
              value={form.target_value}
              onChange={(e) => setForm({ ...form, target_value: e.target.value })}
            />
            <Input
              label="Current Value"
              type="number"
              min="0"
              step="any"
              value={form.current_value}
              onChange={(e) => setForm({ ...form, current_value: e.target.value })}
            />
          </div>

          <Input label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Status</label>
            <select
              className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as GoalStatus })}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-critical-red">{error}</p>}

          <div className="flex justify-end gap-3 mt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createGoal.isPending}>
              {createGoal.isPending ? "Saving…" : "Save Goal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function GoalsPage() {
  const user = useAuthStore((s) => s.user);
  const canManage = user?.role === "admin" || user?.role === "manager";
  const { data: departments } = useDepartments();
  const { data: goalsPage, isLoading } = useEnvironmentalGoals();
  const deleteGoal = useDeleteEnvironmentalGoal();
  const [showModal, setShowModal] = useState(false);

  const departmentNameById = new Map(departments?.map((d) => [d.id, d.name]));

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this environmental goal?")) {
      deleteGoal.mutate(id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">Environmental Goals</h1>
        {canManage && <Button onClick={() => setShowModal(true)}>Add Goal</Button>}
      </div>

      {isLoading ? (
        <p className="text-neutral-400">Loading…</p>
      ) : goalsPage?.items?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goalsPage.items.map((goal) => {
            const pct = goal.target_value > 0 ? Math.min(100, (goal.current_value / goal.target_value) * 100) : 0;
            return (
              <Card key={goal.id} accent={statusAccent[goal.status]} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold">{goal.title}</h3>
                  <span className={clsx("px-2 py-0.5 rounded-full text-xs font-medium capitalize", statusBadgeClasses[goal.status])}>
                    {goal.status}
                  </span>
                </div>

                <p className="text-sm text-neutral-500">
                  {goal.department_id ? departmentNameById.get(goal.department_id) ?? "Unknown department" : "Org-wide"}
                </p>

                {goal.description && <p className="text-sm text-neutral-500">{goal.description}</p>}

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-eco-green"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Start: {goal.start_date}</span>
                  <span>End: {goal.end_date}</span>
                </div>

                {canManage && (
                  <div className="flex justify-end">
                    <Button variant="danger" size="sm" onClick={() => handleDelete(goal.id)}>
                      Delete
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-neutral-400">No data yet</p>
      )}

      {showModal && <AddGoalModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
