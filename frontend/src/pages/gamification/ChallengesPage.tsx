import { useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { clsx } from "@/utils/clsx";
import {
  useChallenges,
  useChallengeCategories,
  useCreateChallenge,
  useUpdateChallengeStatus,
  useJoinChallenge,
  useMyParticipations,
  type Challenge,
  type ChallengeDifficulty,
  type ChallengeStatus,
} from "@/api/challenges";

// Mirrors backend ALLOWED_TRANSITIONS in app/repositories/challenge.py:
// draft -> active | archived
// active -> under_review | archived
// under_review -> completed | archived
// completed -> archived
// archived -> (none)
const ALLOWED_TRANSITIONS: Record<ChallengeStatus, ChallengeStatus[]> = {
  draft: ["active", "archived"],
  active: ["under_review", "archived"],
  under_review: ["completed", "archived"],
  completed: ["archived"],
  archived: [],
};

const TRANSITION_LABELS: Record<ChallengeStatus, string> = {
  draft: "Move to Draft",
  active: "Activate",
  under_review: "Move to Review",
  completed: "Mark Completed",
  archived: "Archive",
};

const DIFFICULTY_CLASSES: Record<ChallengeDifficulty, string> = {
  easy: "bg-eco-green/15 text-eco-green",
  medium: "bg-amber-warning/15 text-amber-warning",
  hard: "bg-critical-red/15 text-critical-red",
  expert: "bg-governance-purple/15 text-governance-purple",
};

const STATUS_CLASSES: Record<ChallengeStatus, string> = {
  draft: "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  active: "bg-eco-green/15 text-eco-green",
  under_review: "bg-amber-warning/15 text-amber-warning",
  completed: "bg-sky-blue/15 text-sky-blue",
  archived: "bg-neutral-300 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400",
};

function deadlineLabel(deadline: string): { text: string; expired: boolean } {
  const now = new Date();
  const end = new Date(deadline);
  const diffMs = end.getTime() - now.getTime();
  if (diffMs <= 0) return { text: "Expired", expired: true };
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days >= 1) return { text: `${days} day${days === 1 ? "" : "s"} left`, expired: false };
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours >= 1) return { text: `${hours} hour${hours === 1 ? "" : "s"} left`, expired: false };
  const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  return { text: `${mins} min${mins === 1 ? "" : "s"} left`, expired: false };
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role === "admin" || user?.role === "manager";
  const updateStatus = useUpdateChallengeStatus();
  const joinChallenge = useJoinChallenge();
  const { data: myParticipations } = useMyParticipations();
  const [joinError, setJoinError] = useState<string | null>(null);

  const deadline = deadlineLabel(challenge.deadline);
  const nextStatuses = ALLOWED_TRANSITIONS[challenge.status] ?? [];
  const alreadyJoined = myParticipations?.some((p) => p.challenge_id === challenge.id);

  const handleTransition = (status: ChallengeStatus) => {
    updateStatus.mutate({ id: challenge.id, status });
  };

  const handleJoin = () => {
    setJoinError(null);
    joinChallenge.mutate(challenge.id, {
      onError: (err: any) => {
        if (err?.response?.status === 409) {
          setJoinError("You already joined this challenge.");
        } else {
          setJoinError(err?.response?.data?.detail ?? "Failed to join challenge.");
        }
      },
    });
  };

  return (
    <Card accent="purple" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-semibold text-lg">{challenge.title}</h3>
        <span className="shrink-0 rounded-full bg-governance-purple/15 text-governance-purple text-xs font-semibold px-2.5 py-1">
          {challenge.xp_reward} XP
        </span>
      </div>

      {challenge.description && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-3">{challenge.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", DIFFICULTY_CLASSES[challenge.difficulty])}>
          {challenge.difficulty}
        </span>
        <span className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", STATUS_CLASSES[challenge.status])}>
          {challenge.status.replace("_", " ")}
        </span>
        {challenge.evidence_required && (
          <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-sky-blue/15 text-sky-blue">
            Evidence required
          </span>
        )}
      </div>

      <p className={clsx("text-xs font-medium", deadline.expired ? "text-critical-red" : "text-neutral-500 dark:text-neutral-400")}>
        {deadline.text}
      </p>

      <div className="flex flex-wrap gap-2 mt-1">
        {isManager &&
          nextStatuses.map((next) => (
            <Button
              key={next}
              size="sm"
              variant={next === "archived" ? "danger" : "primary"}
              disabled={updateStatus.isPending}
              onClick={() => handleTransition(next)}
            >
              {TRANSITION_LABELS[next]}
            </Button>
          ))}

        {!isManager && challenge.status === "active" && (
          <Button size="sm" variant="primary" disabled={joinChallenge.isPending || alreadyJoined} onClick={handleJoin}>
            {alreadyJoined ? "Joined" : "Join Challenge"}
          </Button>
        )}
      </div>
      {joinError && <p className="text-xs text-critical-red">{joinError}</p>}
    </Card>
  );
}

function CreateChallengeForm({ onClose }: { onClose: () => void }) {
  const { data: categories } = useChallengeCategories();
  const createChallenge = useCreateChallenge();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [xpReward, setXpReward] = useState(100);
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty>("easy");
  const [evidenceRequired, setEvidenceRequired] = useState(true);
  const [deadline, setDeadline] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || title.trim().length < 3) {
      setFormError("Title must be at least 3 characters.");
      return;
    }
    if (!deadline) {
      setFormError("Deadline is required.");
      return;
    }
    const deadlineDate = new Date(deadline);
    if (deadlineDate.getTime() <= Date.now()) {
      setFormError("Deadline must be in the future.");
      return;
    }
    if (xpReward < 1 || xpReward > 10000) {
      setFormError("XP reward must be between 1 and 10000.");
      return;
    }

    createChallenge.mutate(
      {
        title: title.trim(),
        description: description.trim() || null,
        category_id: categoryId || null,
        xp_reward: xpReward,
        difficulty,
        evidence_required: evidenceRequired,
        deadline: deadlineDate.toISOString(),
      },
      {
        onSuccess: () => onClose(),
        onError: (err: any) => {
          setFormError(err?.response?.data?.detail ?? "Failed to create challenge.");
        },
      }
    );
  };

  return (
    <Card accent="green" className="flex flex-col gap-4">
      <h3 className="font-display font-semibold text-lg">Create Challenge</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
          <textarea
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Category</label>
            <select
              className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">None</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="XP Reward"
            type="number"
            min={1}
            max={10000}
            value={xpReward}
            onChange={(e) => setXpReward(Number(e.target.value))}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Difficulty</label>
            <select
              className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-eco-green"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as ChallengeDifficulty)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <Input
            label="Deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={evidenceRequired}
            onChange={(e) => setEvidenceRequired(e.target.checked)}
          />
          Evidence required
        </label>

        {formError && <p className="text-xs text-critical-red">{formError}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={createChallenge.isPending}>
            {createChallenge.isPending ? "Creating..." : "Create Challenge"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function ChallengesPage() {
  const user = useAuthStore((s) => s.user);
  const isManager = user?.role === "admin" || user?.role === "manager";

  const [status, setStatus] = useState<ChallengeStatus | "">("");
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: categories } = useChallengeCategories();
  const { data, isLoading } = useChallenges({
    status: status || undefined,
    difficulty: difficulty || undefined,
    category_id: categoryId || undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-display font-bold">Challenges</h1>
        {isManager && (
          <Button onClick={() => setShowCreateForm((v) => !v)}>
            {showCreateForm ? "Close" : "Create Challenge"}
          </Button>
        )}
      </div>

      {showCreateForm && <CreateChallengeForm onClose={() => setShowCreateForm(false)} />}

      <Card className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-500">Status</label>
          <select
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            value={status}
            onChange={(e) => setStatus(e.target.value as ChallengeStatus | "")}
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="under_review">Under Review</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-500">Difficulty</label>
          <select
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as ChallengeDifficulty | "")}
          >
            <option value="">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-500">Category</label>
          <select
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">All</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {isLoading && <p className="text-sm text-neutral-500">Loading...</p>}
      {!isLoading && (data?.items.length ?? 0) === 0 && (
        <p className="text-sm text-neutral-500">Nothing here yet</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.items.map((challenge) => (
          <motion.div key={challenge.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ChallengeCard challenge={challenge} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
