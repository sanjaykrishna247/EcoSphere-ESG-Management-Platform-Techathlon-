import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import {
  useCsrActivities,
  useCreateCsrActivity,
  type CsrActivity,
  type CsrActivityStatus,
} from "@/api/csrActivities";
import { useCategories } from "@/api/categories";
import { useDepartments } from "@/api/departments";
import { useJoinCsrActivity } from "@/api/employeeParticipations";

const columns: { key: CsrActivityStatus; label: string; accent: "blue" | "green" | "teal" }[] = [
  { key: "upcoming", label: "Upcoming", accent: "blue" },
  { key: "active", label: "Active", accent: "green" },
  { key: "completed", label: "Completed", accent: "teal" },
];

const createSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  category_id: z.string().optional(),
  department_id: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  points_value: z.coerce.number().min(0, "Must be 0 or more"),
  max_participants: z.coerce.number().min(1).optional().or(z.literal("").transform(() => undefined)),
  evidence_required: z.boolean(),
});

type CreateFormValues = z.infer<typeof createSchema>;

function ActivityCard({
  activity,
  categoryName,
  isEmployee,
}: {
  activity: CsrActivity;
  categoryName: string | undefined;
  isEmployee: boolean;
}) {
  const { data: departments } = useDepartments();
  const joinMutation = useJoinCsrActivity();
  const [joinMessage, setJoinMessage] = useState<string | null>(null);

  const department = departments?.find((d) => d.id === activity.department_id);

  const handleJoin = () => {
    setJoinMessage(null);
    joinMutation.mutate(activity.id, {
      onError: (error: unknown) => {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 409) {
          setJoinMessage("Already joined");
        } else {
          setJoinMessage("Could not join activity");
        }
      },
      onSuccess: () => {
        setJoinMessage("Joined!");
      },
    });
  };

  return (
    <Card className="flex flex-col gap-2">
      <h3 className="font-semibold text-sm">{activity.title}</h3>
      {categoryName && (
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{categoryName}</span>
      )}
      <div className="flex flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <span className="rounded-full bg-eco-green/10 text-eco-green px-2 py-0.5 font-medium">
          {activity.points_value} pts
        </span>
        {department && (
          <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">
            {department.name}
          </span>
        )}
      </div>
      {isEmployee && (
        <div className="mt-1">
          <Button size="sm" variant="secondary" onClick={handleJoin} disabled={joinMutation.isPending}>
            {joinMutation.isPending ? "Joining..." : "Join"}
          </Button>
          {joinMessage && <p className="text-xs mt-1 text-neutral-500">{joinMessage}</p>}
        </div>
      )}
    </Card>
  );
}

function CreateActivityModal({ onClose }: { onClose: () => void }) {
  const { data: categories } = useCategories("csr_activity");
  const { data: departments } = useDepartments();
  const createMutation = useCreateCsrActivity();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { points_value: 10, evidence_required: false },
  });

  const onSubmit = (values: CreateFormValues) => {
    createMutation.mutate(
      {
        title: values.title,
        description: values.description || undefined,
        category_id: values.category_id || undefined,
        department_id: values.department_id || undefined,
        start_date: values.start_date,
        end_date: values.end_date || undefined,
        points_value: values.points_value,
        max_participants: values.max_participants,
        evidence_required: values.evidence_required,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-neutral-900 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-display font-bold mb-4">Create CSR Activity</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <Input label="Title" {...register("title")} error={errors.title?.message} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
            <textarea
              {...register("description")}
              rows={3}
              className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Category</label>
            <select
              {...register("category_id")}
              className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
            >
              <option value="">None</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Department (optional)
            </label>
            <select
              {...register("department_id")}
              className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
            >
              <option value="">None</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              {...register("start_date")}
              error={errors.start_date?.message}
            />
            <Input label="End Date (optional)" type="date" {...register("end_date")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Points Value"
              type="number"
              {...register("points_value")}
              error={errors.points_value?.message}
            />
            <Input
              label="Max Participants (optional)"
              type="number"
              {...register("max_participants")}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("evidence_required")} />
            Evidence required
          </label>

          {createMutation.isError && (
            <p className="text-xs text-critical-red">Failed to create activity. Please try again.</p>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Activity"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CsrActivitiesPage() {
  const user = useAuthStore((s) => s.user);
  const { data: activities, isLoading } = useCsrActivities();
  const { data: categories } = useCategories("csr_activity");
  const [showModal, setShowModal] = useState(false);

  const canCreate = user?.role === "admin" || user?.role === "manager";
  const isEmployee = user?.role === "employee";

  const categoryName = (id: string | null) => categories?.find((c) => c.id === id)?.name;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold">CSR Activities</h1>
        {canCreate && <Button onClick={() => setShowModal(true)}>Create Activity</Button>}
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => {
            const items = activities?.filter((a) => a.status === col.key) ?? [];
            return (
              <div key={col.key} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-semibold">{col.label}</h2>
                  <span className="text-xs text-neutral-500">{items.length}</span>
                </div>
                <div className="flex flex-col gap-3 min-h-[100px]">
                  {items.length === 0 ? (
                    <p className="text-sm text-neutral-400">Nothing here yet</p>
                  ) : (
                    items.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        categoryName={categoryName(activity.category_id)}
                        isEmployee={isEmployee}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <CreateActivityModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
