import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { clsx } from "@/utils/clsx";
import {
  useUserLeaderboard,
  useDepartmentLeaderboard,
  type LeaderboardEntry,
  type LeaderboardPeriod,
} from "@/api/leaderboards";

const PERIOD_TABS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

const PODIUM_STYLES: Record<number, string> = {
  1: "order-2 h-40 bg-gradient-to-b from-amber-warning/30 to-amber-warning/10 border-amber-warning",
  2: "order-1 h-28 bg-gradient-to-b from-neutral-300/40 to-neutral-300/10 border-neutral-400",
  3: "order-3 h-20 bg-gradient-to-b from-orange-500/25 to-orange-500/5 border-orange-500",
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const top3 = entries.slice(0, 3);
  if (top3.length === 0) return null;

  return (
    <div className="flex items-end justify-center gap-4 mb-6">
      {top3.map((entry) => (
        <div
          key={entry.user_id}
          className={clsx(
            "flex flex-col items-center justify-end gap-2 rounded-xl border-2 px-4 pb-3 pt-4 w-32",
            PODIUM_STYLES[entry.rank] ?? "order-4 h-16 border-neutral-300"
          )}
        >
          <div className="w-12 h-12 rounded-full bg-eco-green text-white flex items-center justify-center font-bold text-sm">
            {initials(entry.full_name)}
          </div>
          <p className="text-xs font-semibold text-center truncate w-full">{entry.full_name}</p>
          <p className="text-xs text-neutral-500">{entry.xp} XP</p>
          <span className="text-lg font-display font-bold">#{entry.rank}</span>
        </div>
      ))}
    </div>
  );
}

function RankedList({ entries }: { entries: LeaderboardEntry[] }) {
  const rest = entries.slice(3);
  if (rest.length === 0) return null;
  const maxXp = Math.max(...entries.map((e) => e.xp), 1);

  return (
    <div className="flex flex-col gap-2">
      {rest.map((entry) => (
        <div key={entry.user_id} className="flex items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2">
          <span className="w-8 text-sm font-semibold text-neutral-500">#{entry.rank}</span>
          <div className="w-8 h-8 rounded-full bg-earth-teal text-white flex items-center justify-center font-semibold text-xs shrink-0">
            {initials(entry.full_name)}
          </div>
          <span className="flex-1 text-sm truncate">{entry.full_name}</span>
          <div className="w-24 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden hidden sm:block">
            <div
              className="h-full bg-eco-green rounded-full"
              style={{ width: `${Math.min(100, (entry.xp / maxXp) * 100)}%` }}
            />
          </div>
          <span className="text-sm font-semibold w-16 text-right">{entry.xp} XP</span>
        </div>
      ))}
    </div>
  );
}

function DepartmentLeaderboard() {
  const { data, isLoading } = useDepartmentLeaderboard();

  if (isLoading) return <p className="text-sm text-neutral-500">Loading...</p>;
  if (!data || data.length === 0) return <p className="text-sm text-neutral-500">Nothing here yet</p>;

  const maxScore = Math.max(...data.map((d) => d.score), 1);

  return (
    <div className="flex flex-col gap-2">
      {data.map((dept) => (
        <div key={dept.department_id} className="flex items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2">
          <span className="w-8 text-sm font-semibold text-neutral-500">#{dept.rank}</span>
          <span className="flex-1 text-sm font-medium truncate">
            {dept.name} <span className="text-neutral-400 font-normal">({dept.code})</span>
          </span>
          <div className="w-24 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden hidden sm:block">
            <div
              className="h-full bg-earth-teal rounded-full"
              style={{ width: `${Math.min(100, (dept.score / maxScore) * 100)}%` }}
            />
          </div>
          <span className="text-sm font-semibold w-20 text-right">{dept.score.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");
  const [showDepartments, setShowDepartments] = useState(false);
  const { data, isLoading } = useUserLeaderboard(period);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold">Leaderboard</h1>
        <div className="flex gap-2">
          <button
            className={clsx(
              "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              !showDepartments ? "bg-eco-green text-white" : "bg-neutral-200 dark:bg-neutral-800"
            )}
            onClick={() => setShowDepartments(false)}
          >
            Employees
          </button>
          <button
            className={clsx(
              "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              showDepartments ? "bg-eco-green text-white" : "bg-neutral-200 dark:bg-neutral-800"
            )}
            onClick={() => setShowDepartments(true)}
          >
            Departments
          </button>
        </div>
      </div>

      {!showDepartments && (
        <>
          <div className="flex gap-2">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.value}
                className={clsx(
                  "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  period === tab.value ? "bg-governance-purple text-white" : "bg-neutral-200 dark:bg-neutral-800"
                )}
                onClick={() => setPeriod(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Card>
            {isLoading && <p className="text-sm text-neutral-500">Loading...</p>}
            {!isLoading && (data?.length ?? 0) === 0 && <p className="text-sm text-neutral-500">Nothing here yet</p>}
            {!isLoading && data && data.length > 0 && (
              <>
                <Podium entries={data} />
                <RankedList entries={data} />
              </>
            )}
          </Card>
        </>
      )}

      {showDepartments && (
        <Card>
          <h2 className="font-display font-semibold mb-4">Department Rankings</h2>
          <DepartmentLeaderboard />
        </Card>
      )}
    </div>
  );
}
