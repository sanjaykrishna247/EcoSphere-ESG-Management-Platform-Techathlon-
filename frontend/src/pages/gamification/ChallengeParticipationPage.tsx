import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Activity } from "lucide-react";
import {
  useMyParticipations,
  type ChallengeParticipation,
  type ApprovalStatus,
} from "@/api/challenges";
import { useChallenges } from "@/api/challenges";

const statusVariant: Record<ApprovalStatus, "warning" | "success" | "danger"> = {
  pending:  "warning",
  approved: "success",
  rejected: "danger",
};

export function ChallengeParticipationPage() {
  const { data: participations, isLoading } = useMyParticipations();
  const { data: challengesData } = useChallenges({ per_page: 100 });
  const challengeMap = Object.fromEntries(
    challengesData?.items?.map((c) => [c.id, c]) ?? []
  );

  const columns: Column<ChallengeParticipation>[] = [
    {
      key: "challenge",
      header: "Challenge",
      render: (row) => {
        const ch = challengeMap[row.challenge_id];
        return (
          <div>
            <p className="font-medium text-neutral-900 text-sm">{ch?.title ?? "—"}</p>
            {ch?.difficulty && (
              <p className="text-xs text-neutral-400 mt-0.5 capitalize">{ch.difficulty}</p>
            )}
          </div>
        );
      },
    },
    {
      key: "progress",
      header: "Progress",
      render: (row) => (
        <div className="flex items-center gap-2 w-32">
          <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full"
              style={{ width: `${row.progress}%` }}
            />
          </div>
          <span className="text-xs text-neutral-500 shrink-0">{row.progress}%</span>
        </div>
      ),
    },
    {
      key: "xp_awarded",
      header: "XP",
      render: (row) => (
        <span className="text-sm font-semibold text-gov">
          {row.xp_awarded > 0 ? `+${row.xp_awarded}` : "—"}
        </span>
      ),
    },
    {
      key: "approval_status",
      header: "Status",
      render: (row) => (
        <Badge variant={statusVariant[row.approval_status]}>
          {row.approval_status}
        </Badge>
      ),
    },
    {
      key: "proof_url",
      header: "Proof",
      render: (row) =>
        row.proof_url ? (
          <a
            href={row.proof_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-social underline"
          >
            View
          </a>
        ) : (
          <span className="text-neutral-300 text-xs">None</span>
        ),
    },
    {
      key: "submitted_at",
      header: "Submitted",
      render: (row) =>
        row.submitted_at ? (
          <span className="text-xs text-neutral-400">
            {new Date(row.submitted_at).toLocaleDateString()}
          </span>
        ) : (
          <span className="text-neutral-300 text-xs">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="My Challenge Participations"
        subtitle="Track your progress and submission status for joined challenges."
      />

      <Card variant="table">
        {!isLoading && (participations?.length ?? 0) === 0 ? (
          <EmptyState
            icon={<Activity className="w-10 h-10" />}
            title="No participations yet"
            description="Join a challenge from the Challenges page to start tracking your progress here."
          />
        ) : (
          <Table
            columns={columns}
            data={participations ?? []}
            keyExtractor={(row) => row.id}
            loading={isLoading}
            emptyMessage="No participations found."
          />
        )}
      </Card>
    </div>
  );
}
