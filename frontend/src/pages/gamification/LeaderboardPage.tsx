import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { clsx } from "@/utils/clsx";
import { Trophy } from "lucide-react";
import {
  useUserLeaderboard,
  useDepartmentLeaderboard,
  type LeaderboardEntry,
  type LeaderboardPeriod,
} from "@/api/leaderboards";

const PERIOD_TABS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "week",  label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all",   label: "All Time" },
];

const RANK_LABEL: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd" };

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function RankRow({ entry, maxXp }: { entry: LeaderboardEntry; maxXp: number }) {
  const isTop3 = entry.rank <= 3;
  return (
    <div
      className={clsx(
        "flex items-center gap-3 px-4 py-3 border-b border-neutral-100 last:border-0",
        isTop3 && "bg-neutral-50"
      )}
    >
      <span
        className={clsx(
          "w-8 text-sm font-bold shrink-0",
          entry.rank === 1
            ? "text-amber-500"
            : entry.rank === 2
            ? "text-neutral-400"
            : entry.rank === 3
            ? "text-orange-400"
            : "text-neutral-400 font-medium"
        )}
      >
        {RANK_LABEL[entry.rank] ?? `#${entry.rank}`}
      </span>
      <div className="w-8 h-8 rounded-full bg-brand-muted border border-brand/20 flex items-center justify-center font-semibold text-xs text-brand shrink-0">
        {initials(entry.full_name)}
      </div>
      <span className="flex-1 text-sm font-medium text-neutral-900 truncate">{entry.full_name}</span>
      <div className="w-28 h-1.5 bg-neutral-200 rounded-full overflow-hidden hidden sm:block shrink-0">
        <div
          className="h-full bg-brand rounded-full"
          style={{ width: `${Math.min(100, (entry.xp / maxXp) * 100)}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-neutral-900 w-16 text-right shrink-0">
        {entry.xp} XP
      </span>
    </div>
  );
}

function DepartmentLeaderboard() {
  const { data, isLoading } = useDepartmentLeaderboard();

  if (isLoading) return <p className="p-4 text-sm text-neutral-400">Loading…</p>;
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Trophy className="w-10 h-10" />}
        title="No department scores yet"
        description="Department scores are calculated from individual ESG activities."
      />
    );
  }

  const maxScore = Math.max(...data.map((d) => d.score), 1);

  return (
    <div>
      {data.map((dept) => (
        <div
          key={dept.department_id}
          className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 last:border-0"
        >
          <span className="w-8 text-sm font-bold text-neutral-400 shrink-0">#{dept.rank}</span>
          <span className="flex-1 text-sm font-medium text-neutral-900 truncate">
            {dept.name}{" "}
            <span className="text-neutral-400 font-normal text-xs">({dept.code})</span>
          </span>
          <div className="w-28 h-1.5 bg-neutral-200 rounded-full overflow-hidden hidden sm:block shrink-0">
            <div
              className="h-full bg-env rounded-full"
              style={{ width: `${Math.min(100, (dept.score / maxScore) * 100)}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-neutral-900 w-20 text-right shrink-0">
            {dept.score.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");
  const [showDepartments, setShowDepartments] = useState(false);
  const { data, isLoading } = useUserLeaderboard(period);

  const maxXp = Math.max(...(data?.map((e) => e.xp) ?? []), 1);

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        subtitle="Employee and department rankings by ESG activity and XP points."
        action={
          <div className="flex border border-neutral-200 rounded-md overflow-hidden">
            {[
              { label: "Employees",   active: !showDepartments, onClick: () => setShowDepartments(false) },
              { label: "Departments", active:  showDepartments, onClick: () => setShowDepartments(true) },
            ].map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={tab.onClick}
                className={clsx(
                  "px-4 py-1.5 text-sm font-medium transition-colors",
                  tab.active
                    ? "bg-neutral-900 text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
      />

      {!showDepartments && (
        <>
          <div className="flex gap-2 mb-4">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setPeriod(tab.value)}
                className={clsx(
                  "px-3 py-1.5 rounded-md text-sm font-medium border transition-colors",
                  period === tab.value
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Card variant="table">
            {isLoading && <p className="p-4 text-sm text-neutral-400">Loading…</p>}
            {!isLoading && (data?.length ?? 0) === 0 && (
              <EmptyState
                icon={<Trophy className="w-10 h-10" />}
                title="No entries yet"
                description="Complete challenges to earn XP and appear on the leaderboard."
              />
            )}
            {!isLoading &&
              data?.map((entry) => (
                <RankRow key={entry.user_id} entry={entry} maxXp={maxXp} />
              ))}
          </Card>
        </>
      )}

      {showDepartments && (
        <Card variant="table">
          <DepartmentLeaderboard />
        </Card>
      )}
    </div>
  );
}
