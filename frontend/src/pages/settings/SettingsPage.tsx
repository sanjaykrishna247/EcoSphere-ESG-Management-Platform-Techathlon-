import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { useEsgConfig, useUpdateEsgConfig, type EsgConfigurationUpdate } from "@/api/settings";

interface FormState {
  org_name: string;
  environmental_weight: string;
  social_weight: string;
  governance_weight: string;
  auto_emission_calculation: boolean;
  evidence_requirement: boolean;
  badge_auto_award: boolean;
  notification_in_app: boolean;
  notification_email: boolean;
}

const TOGGLES: { key: keyof FormState; label: string }[] = [
  { key: "auto_emission_calculation", label: "Auto Emission Calculation" },
  { key: "evidence_requirement", label: "Evidence Requirement" },
  { key: "badge_auto_award", label: "Badge Auto-Award" },
  { key: "notification_in_app", label: "In-App Notifications" },
  { key: "notification_email", label: "Email Notifications" },
];

function SettingsForm() {
  const { data: config, isLoading } = useEsgConfig();
  const updateMutation = useUpdateEsgConfig();
  const addToast = useToastStore((s) => s.add);

  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    if (config) {
      setForm({
        org_name: config.org_name,
        environmental_weight: String(config.environmental_weight),
        social_weight: String(config.social_weight),
        governance_weight: String(config.governance_weight),
        auto_emission_calculation: config.auto_emission_calculation,
        evidence_requirement: config.evidence_requirement,
        badge_auto_award: config.badge_auto_award,
        notification_in_app: config.notification_in_app,
        notification_email: config.notification_email,
      });
    }
  }, [config]);

  if (isLoading || !form) {
    return <p>Loading...</p>;
  }

  const envWeight = Number(form.environmental_weight) || 0;
  const socWeight = Number(form.social_weight) || 0;
  const govWeight = Number(form.governance_weight) || 0;
  const weightSum = envWeight + socWeight + govWeight;
  const weightsValid = Math.abs(weightSum - 100) < 0.01;

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!form || !weightsValid) return;

    const payload: EsgConfigurationUpdate = {
      org_name: form.org_name,
      environmental_weight: envWeight,
      social_weight: socWeight,
      governance_weight: govWeight,
      auto_emission_calculation: form.auto_emission_calculation,
      evidence_requirement: form.evidence_requirement,
      badge_auto_award: form.badge_auto_award,
      notification_in_app: form.notification_in_app,
      notification_email: form.notification_email,
    };

    try {
      await updateMutation.mutateAsync(payload);
      addToast({ type: "success", title: "Settings saved", message: "ESG configuration updated successfully." });
    } catch {
      addToast({ type: "error", title: "Save failed", message: "Could not update ESG configuration." });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="font-display font-semibold mb-4">Organization</h2>
        <Input
          label="Organization Name"
          value={form.org_name}
          onChange={(e) => updateField("org_name", e.target.value)}
        />
      </Card>

      <Card>
        <h2 className="font-display font-semibold mb-4">ESG Score Weights</h2>
        <div className="flex flex-wrap gap-4">
          <Input
            label="Environmental Weight (%)"
            type="number"
            value={form.environmental_weight}
            onChange={(e) => updateField("environmental_weight", e.target.value)}
          />
          <Input
            label="Social Weight (%)"
            type="number"
            value={form.social_weight}
            onChange={(e) => updateField("social_weight", e.target.value)}
          />
          <Input
            label="Governance Weight (%)"
            type="number"
            value={form.governance_weight}
            onChange={(e) => updateField("governance_weight", e.target.value)}
          />
        </div>
        <p className={`text-sm mt-3 ${weightsValid ? "text-neutral-400" : "text-critical-red"}`}>
          Total: {weightSum}% {weightsValid ? "" : "(weights must sum to exactly 100%)"}
        </p>
      </Card>

      <Card>
        <h2 className="font-display font-semibold mb-4">Feature Toggles</h2>
        <div className="flex flex-col gap-3">
          {TOGGLES.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form[key] as boolean}
                onChange={(e) => updateField(key, e.target.checked as FormState[typeof key])}
              />
              {label}
            </label>
          ))}
        </div>
      </Card>

      <div>
        <Button onClick={handleSave} disabled={!weightsValid || updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <Card>
          <p className="text-neutral-500">Admins only. You do not have permission to view this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-display font-bold">Settings</h1>
      <SettingsForm />
    </div>
  );
}
