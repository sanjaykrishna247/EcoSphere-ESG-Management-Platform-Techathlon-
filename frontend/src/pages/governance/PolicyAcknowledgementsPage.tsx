import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckSquare } from "lucide-react";
import { useMyAcknowledgements, usePolicies, type PolicyAcknowledgement } from "@/api/policies";

export function PolicyAcknowledgementsPage() {
  const { data: acks, isLoading } = useMyAcknowledgements();
  const { data: policies } = usePolicies();

  const policyMap = Object.fromEntries(policies?.map((p) => [p.id, p]) ?? []);

  const columns: Column<PolicyAcknowledgement>[] = [
    {
      key: "policy",
      header: "Policy",
      render: (row) => {
        const p = policyMap[row.policy_id];
        return (
          <div>
            <p className="font-medium text-neutral-900 text-sm">{p?.title ?? "—"}</p>
          </div>
        );
      },
    },
    {
      key: "category",
      header: "Category",
      render: (row) => {
        const p = policyMap[row.policy_id];
        if (!p) return <span className="text-neutral-300">—</span>;
        const variantMap = { environmental: "teal", social: "info", governance: "purple" } as const;
        return (
          <Badge variant={variantMap[p.category] ?? "default"}>
            {p.category}
          </Badge>
        );
      },
    },
    {
      key: "version",
      header: "Version",
      render: (row) => {
        const p = policyMap[row.policy_id];
        return <span className="text-xs text-neutral-400">{p ? `v${p.version}` : "—"}</span>;
      },
    },
    {
      key: "acknowledged_at",
      header: "Acknowledged",
      render: (row) => (
        <span className="text-sm text-neutral-600">
          {new Date(row.acknowledged_at).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: () => <Badge variant="success">Acknowledged</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Policy Acknowledgements"
        subtitle="All policies you have formally acknowledged."
      />

      <Card variant="table">
        {!isLoading && (acks?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<CheckSquare className="w-10 h-10" />}
            title="No acknowledgements yet"
            description="When you acknowledge a policy it will appear here."
          />
        ) : (
          <Table
            columns={columns}
            data={acks ?? []}
            keyExtractor={(row) => row.id}
            loading={isLoading}
            emptyMessage="No acknowledgements yet."
          />
        )}
      </Card>
    </div>
  );
}
