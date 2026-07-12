import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { clsx } from "@/utils/clsx";
import { useBadges, useMyBadges, describeUnlockRule } from "@/api/badges";

export function BadgesPage() {
  const { data: badges, isLoading: badgesLoading } = useBadges();
  const { data: myBadges, isLoading: mineLoading } = useMyBadges();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const isLoading = badgesLoading || mineLoading;
  const earnedIds = new Set((myBadges ?? []).map((b) => b.badge_id));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-display font-bold">Badges</h1>

      {isLoading && <p className="text-sm text-neutral-500">Loading...</p>}
      {!isLoading && (badges?.length ?? 0) === 0 && <p className="text-sm text-neutral-500">Nothing here yet</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {badges?.map((badge) => {
          const earned = earnedIds.has(badge.id);
          const isTooltipOpen = activeTooltip === badge.id;
          return (
            <Card
              key={badge.id}
              className={clsx(
                "flex flex-col items-center text-center gap-2 cursor-pointer transition-all",
                earned ? "shadow-lg shadow-eco-green/30" : "opacity-40 grayscale"
              )}
              onClick={() => setActiveTooltip(isTooltipOpen ? null : badge.id)}
              onMouseEnter={() => setActiveTooltip(badge.id)}
              onMouseLeave={() => setActiveTooltip((cur) => (cur === badge.id ? null : cur))}
            >
              <div
                className={clsx(
                  "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold",
                  earned ? "bg-eco-green/15 text-eco-green" : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                )}
              >
                {badge.icon ? (
                  <img src={badge.icon} alt={badge.name} className="w-10 h-10 object-contain" />
                ) : (
                  badge.name.slice(0, 1).toUpperCase()
                )}
              </div>
              <p className="text-sm font-semibold">{badge.name}</p>
              {isTooltipOpen && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {describeUnlockRule(badge.unlock_rule)}
                </p>
              )}
              {earned && !isTooltipOpen && (
                <span className="text-xs font-medium text-eco-green">Earned</span>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
