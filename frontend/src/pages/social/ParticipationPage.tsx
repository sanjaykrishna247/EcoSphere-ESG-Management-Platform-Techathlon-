import { useRef, useState, type ChangeEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useCsrActivities } from "@/api/csrActivities";
import {
  useMyParticipations,
  useAllParticipations,
  useApproveParticipation,
  useRejectParticipation,
  useUploadParticipationProof,
  type ApprovalStatus,
  type EmployeeParticipation,
} from "@/api/employeeParticipations";

const statusClasses: Record<ApprovalStatus, string> = {
  pending: "bg-amber-warning/10 text-amber-warning",
  approved: "bg-eco-green/10 text-eco-green",
  rejected: "bg-critical-red/10 text-critical-red",
};

function StatusChip({ status }: { status: ApprovalStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusClasses[status]}`}>
      {status}
    </span>
  );
}

function UploadProofButton({ participation }: { participation: EmployeeParticipation }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadParticipationProof();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate({ id: participation.id, file });
  };

  if (participation.approval_status !== "pending") return null;

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        className="text-xs max-w-[160px]"
        disabled={uploadMutation.isPending}
      />
      {participation.proof_url && !uploadMutation.isPending && (
        <span className="text-xs text-eco-green">Uploaded</span>
      )}
      {uploadMutation.isPending && <span className="text-xs text-neutral-500">Uploading...</span>}
    </div>
  );
}

function MyParticipationsTable() {
  const { data: participations, isLoading } = useMyParticipations();
  const { data: activities } = useCsrActivities();

  const activityTitle = (id: string) => activities?.find((a) => a.id === id)?.title ?? id.slice(0, 8);

  if (isLoading) return <p className="text-sm text-neutral-500">Loading...</p>;
  if (!participations || participations.length === 0)
    return <p className="text-sm text-neutral-400">Nothing here yet</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
            <th className="py-2 pr-4">Activity</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Points Earned</th>
            <th className="py-2 pr-4">Completion Date</th>
            <th className="py-2 pr-4">Proof</th>
          </tr>
        </thead>
        <tbody>
          {participations.map((p) => (
            <tr key={p.id} className="border-b border-neutral-100 dark:border-neutral-800">
              <td className="py-2 pr-4">{activityTitle(p.activity_id)}</td>
              <td className="py-2 pr-4">
                <StatusChip status={p.approval_status} />
              </td>
              <td className="py-2 pr-4">{p.points_earned}</td>
              <td className="py-2 pr-4">{p.completion_date ?? "-"}</td>
              <td className="py-2 pr-4">
                <UploadProofButton participation={p} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AllParticipationsTable() {
  const { data: participations, isLoading } = useAllParticipations();
  const { data: activities } = useCsrActivities();
  const approveMutation = useApproveParticipation();
  const rejectMutation = useRejectParticipation();
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({});

  const activityTitle = (id: string) => activities?.find((a) => a.id === id)?.title ?? id.slice(0, 8);

  const handleApprove = (id: string) => {
    setErrorMessages((prev) => ({ ...prev, [id]: "" }));
    approveMutation.mutate(id, {
      onError: (error: unknown) => {
        const err = error as { response?: { status?: number; data?: { detail?: string } } };
        const detail =
          err.response?.status === 400
            ? err.response.data?.detail ?? "Cannot approve this participation"
            : "Failed to approve participation";
        setErrorMessages((prev) => ({ ...prev, [id]: detail }));
      },
    });
  };

  const handleReject = (id: string) => {
    setErrorMessages((prev) => ({ ...prev, [id]: "" }));
    rejectMutation.mutate(
      { id },
      {
        onError: () => {
          setErrorMessages((prev) => ({ ...prev, [id]: "Failed to reject participation" }));
        },
      }
    );
  };

  if (isLoading) return <p className="text-sm text-neutral-500">Loading...</p>;
  if (!participations || participations.length === 0)
    return <p className="text-sm text-neutral-400">Nothing here yet</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-neutral-400 border-b border-neutral-200 dark:border-neutral-800">
            <th className="py-2 pr-4">Activity</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Points Earned</th>
            <th className="py-2 pr-4">Completion Date</th>
            <th className="py-2 pr-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {participations.map((p) => (
            <tr key={p.id} className="border-b border-neutral-100 dark:border-neutral-800 align-top">
              <td className="py-2 pr-4">{activityTitle(p.activity_id)}</td>
              <td className="py-2 pr-4">
                <StatusChip status={p.approval_status} />
              </td>
              <td className="py-2 pr-4">{p.points_earned}</td>
              <td className="py-2 pr-4">{p.completion_date ?? "-"}</td>
              <td className="py-2 pr-4">
                {p.approval_status === "pending" ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(p.id)}
                        disabled={approveMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(p.id)}
                        disabled={rejectMutation.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                    {errorMessages[p.id] && (
                      <span className="text-xs text-critical-red">{errorMessages[p.id]}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-neutral-400">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ParticipationPage() {
  const user = useAuthStore((s) => s.user);
  const canViewAll = user?.role === "admin" || user?.role === "manager";
  const [tab, setTab] = useState<"mine" | "all">("mine");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-display font-bold">Participation</h1>

      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setTab("mine")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === "mine"
              ? "border-eco-green text-eco-green"
              : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          My Participations
        </button>
        {canViewAll && (
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === "all"
                ? "border-eco-green text-eco-green"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            All Participations
          </button>
        )}
      </div>

      <Card>{tab === "mine" || !canViewAll ? <MyParticipationsTable /> : <AllParticipationsTable />}</Card>
    </div>
  );
}
