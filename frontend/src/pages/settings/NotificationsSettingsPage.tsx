import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { useEsgConfig, useUpdateEsgConfig } from "@/api/settings";

const NOTIFICATION_TOGGLES = [
  {
    key: "notification_in_app" as const,
    label: "In-App Notifications",
    description: "Receive notifications inside EcoSphere for compliance issues, approvals, and badge awards.",
  },
  {
    key: "notification_email" as const,
    label: "Email Notifications",
    description: "Receive email alerts for overdue compliance issues and policy reminders.",
  },
];

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-neutral-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
          checked ? "bg-brand" : "bg-neutral-200"
        }`}
      >
        <span
          className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
            checked ? "translate-x-4 ml-0.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function NotificationsSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: config, isLoading } = useEsgConfig();
  const updateMutation = useUpdateEsgConfig();
  const addToast = useToastStore((s) => s.add);
  const [form, setForm] = useState({ notification_in_app: true, notification_email: true });

  useEffect(() => {
    if (config) {
      setForm({
        notification_in_app: config.notification_in_app,
        notification_email: config.notification_email,
      });
    }
  }, [config]);

  if (user?.role !== "admin") {
    return (
      <div>
        <PageHeader title="Notifications" />
        <Card><p className="text-sm text-neutral-500">Admin access required.</p></Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Notifications" />
        <p className="text-sm text-neutral-400">Loading…</p>
      </div>
    );
  }

  async function handleSave() {
    try {
      await updateMutation.mutateAsync(form);
      addToast({ type: "success", title: "Saved", message: "Notification preferences updated." });
    } catch {
      addToast({ type: "error", title: "Error", message: "Could not save preferences." });
    }
  }

  return (
    <div>
      <PageHeader
        title="Notification Settings"
        subtitle="Control how EcoSphere delivers alerts and reminders to your organization."
        action={
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        }
      />

      <Card className="max-w-xl">
        {NOTIFICATION_TOGGLES.map(({ key, label, description }) => (
          <Toggle
            key={key}
            checked={form[key]}
            onChange={(v) => setForm((prev) => ({ ...prev, [key]: v }))}
            label={label}
            description={description}
          />
        ))}
      </Card>
    </div>
  );
}
