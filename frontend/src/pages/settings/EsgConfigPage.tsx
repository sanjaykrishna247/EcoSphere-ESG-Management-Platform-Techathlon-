import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
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
}

const TOGGLES: { key: keyof FormState; label: string; description: string }[] = [
  {
    key: "auto_emission_calculation",
    label: "Auto Emission Calculation",
    description: "Automatically calculate CO2 equivalent from quantity and emission factor.",
  },
  {
    key: "evidence_requirement",
    label: "Evidence Requirement",
    description: "Require employees to upload proof for challenge submissions.",
  },
  {
    key: "badge_auto_award",
    label: "Badge Auto-Award",
    description: "Automatically award badges when eligibility criteria are met.",
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
    <div className="flex items-start justify-between gap-4 py-3 border-b border-neutral-100 last:border-0">
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

export function EsgConfigPage() {
  const user = useAuthStore((s) => s.user);
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
      });
    }
  }, [config]);

  if (user?.role !== "admin") {
    return (
      <div>
        <PageHeader title="ESG Configuration" />
        <Card><p className="text-sm text-neutral-500">Admin access required.</p></Card>
      </div>
    );
  }

  if (isLoading || !form) {
    return (
      <div>
        <PageHeader title="ESG Configuration" />
        <p className="text-sm text-neutral-400">Loading…</p>
      </div>
    );
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
    };
    try {
      await updateMutation.mutateAsync(payload);
      addToast({ type: "success", title: "Saved", message: "ESG configuration updated." });
    } catch {
      addToast({ type: "error", title: "Error", message: "Could not update configuration." });
    }
  }

  return (
    <div>
      <PageHeader
        title="ESG Configuration"
        subtitle="Manage organization name, scoring weights, and feature settings."
        action={
          <Button onClick={handleSave} disabled={!weightsValid || updateMutation.isPending}>
            {updateMutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <Card>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-4">Organization</h2>
          <div className="max-w-sm">
            <Input
              label="Organization Name"
              value={form.org_name}
              onChange={(e) => updateField("org_name", e.target.value)}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-4">ESG Score Weights</h2>
          <div className="flex flex-wrap gap-4 mb-3">
            <Input
              label="Environmental (%)"
              type="number"
              value={form.environmental_weight}
              onChange={(e) => updateField("environmental_weight", e.target.value)}
              className="w-36"
            />
            <Input
              label="Social (%)"
              type="number"
              value={form.social_weight}
              onChange={(e) => updateField("social_weight", e.target.value)}
              className="w-36"
            />
            <Input
              label="Governance (%)"
              type="number"
              value={form.governance_weight}
              onChange={(e) => updateField("governance_weight", e.target.value)}
              className="w-36"
            />
          </div>
          <p className={`text-xs ${weightsValid ? "text-neutral-400" : "text-danger"}`}>
            Total: {weightSum}%{!weightsValid && " — must sum to exactly 100%"}
          </p>
        </Card>

        <Card>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">Feature Toggles</h2>
          <div>
            {TOGGLES.map(({ key, label, description }) => (
              <Toggle
                key={key}
                checked={form[key] as boolean}
                onChange={(v) => updateField(key, v as FormState[typeof key])}
                label={label}
                description={description}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
