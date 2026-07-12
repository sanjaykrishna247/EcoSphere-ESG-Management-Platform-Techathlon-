import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { clsx } from "@/utils/clsx";
import { useAuthStore } from "@/store/authStore";
import { useRewards, useMyRedemptions, useRedeemReward, type Reward } from "@/api/rewards";

function disabledReason(reward: Reward, totalPoints: number): string | null {
  if (reward.status !== "active") return "This reward is not currently available.";
  if (reward.stock <= 0) return "Out of stock.";
  if (totalPoints < reward.points_required) return "Not enough points.";
  return null;
}

function RewardCard({ reward, totalPoints }: { reward: Reward; totalPoints: number }) {
  const redeem = useRedeemReward();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reason = disabledReason(reward, totalPoints);

  const handleRedeem = () => {
    setError(null);
    setSuccess(false);
    redeem.mutate(reward.id, {
      onSuccess: () => setSuccess(true),
      onError: (err: any) => {
        setError(err?.response?.data?.detail ?? "Failed to redeem reward.");
      },
    });
  };

  return (
    <Card accent="amber" className="flex flex-col gap-3">
      {reward.image_url && (
        <img src={reward.image_url} alt={reward.name} className="w-full h-32 object-cover rounded-xl" />
      )}
      <h3 className="font-display font-semibold text-lg">{reward.name}</h3>
      {reward.description && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-3">{reward.description}</p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-warning/15 text-amber-warning">
          {reward.points_required} pts
        </span>
        <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-neutral-200 dark:bg-neutral-800">
          Stock: {reward.stock}
        </span>
      </div>

      <Button disabled={!!reason || redeem.isPending} onClick={handleRedeem}>
        {redeem.isPending ? "Redeeming..." : "Redeem"}
      </Button>
      {reason && <p className="text-xs text-neutral-400">{reason}</p>}
      {error && <p className="text-xs text-critical-red">{error}</p>}
      {success && <p className="text-xs text-eco-green">Redeemed successfully.</p>}
    </Card>
  );
}

function RedemptionHistory() {
  const { data, isLoading } = useMyRedemptions();

  if (isLoading) return <p className="text-sm text-neutral-500">Loading...</p>;
  if (!data || data.length === 0) return <p className="text-sm text-neutral-500">Nothing here yet</p>;

  return (
    <div className="flex flex-col gap-2">
      {data.map((r) => (
        <div key={r.id} className="flex items-center gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2">
          <span
            className={clsx(
              "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
              r.status === "fulfilled" && "bg-eco-green/15 text-eco-green",
              r.status === "pending" && "bg-amber-warning/15 text-amber-warning",
              r.status === "cancelled" && "bg-critical-red/15 text-critical-red"
            )}
          >
            {r.status}
          </span>
          <span className="flex-1 text-sm">{r.points_spent} pts spent</span>
          <span className="text-xs text-neutral-400">{new Date(r.redeemed_at).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export function RewardsPage() {
  const user = useAuthStore((s) => s.user);
  const { data: rewards, isLoading } = useRewards();
  const [tab, setTab] = useState<"catalog" | "history">("catalog");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold">Rewards</h1>
        <Card accent="green" className="flex items-center gap-2 px-4 py-2">
          <span className="text-xs uppercase tracking-wide text-neutral-400 font-medium">Your Points</span>
          <span className="text-xl font-display font-bold">{user?.total_points ?? 0}</span>
        </Card>
      </div>

      <div className="flex gap-2">
        <button
          className={clsx(
            "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
            tab === "catalog" ? "bg-eco-green text-white" : "bg-neutral-200 dark:bg-neutral-800"
          )}
          onClick={() => setTab("catalog")}
        >
          Catalog
        </button>
        <button
          className={clsx(
            "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
            tab === "history" ? "bg-eco-green text-white" : "bg-neutral-200 dark:bg-neutral-800"
          )}
          onClick={() => setTab("history")}
        >
          Redemption History
        </button>
      </div>

      {tab === "catalog" && (
        <>
          {isLoading && <p className="text-sm text-neutral-500">Loading...</p>}
          {!isLoading && (rewards?.length ?? 0) === 0 && <p className="text-sm text-neutral-500">Nothing here yet</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards?.map((reward) => (
              <RewardCard key={reward.id} reward={reward} totalPoints={user?.total_points ?? 0} />
            ))}
          </div>
        </>
      )}

      {tab === "history" && (
        <Card>
          <RedemptionHistory />
        </Card>
      )}
    </div>
  );
}
