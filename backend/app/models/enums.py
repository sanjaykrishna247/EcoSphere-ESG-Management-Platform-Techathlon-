import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    employee = "employee"


class ActiveStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"


class CategoryType(str, enum.Enum):
    csr_activity = "csr_activity"
    challenge = "challenge"


class SourceType(str, enum.Enum):
    purchase = "purchase"
    manufacturing = "manufacturing"
    expense = "expense"
    fleet = "fleet"


class TransactionSourceType(str, enum.Enum):
    purchase = "purchase"
    manufacturing = "manufacturing"
    expense = "expense"
    fleet = "fleet"
    manual = "manual"


class EmissionScope(str, enum.Enum):
    scope1 = "scope1"
    scope2 = "scope2"
    scope3 = "scope3"


class SustainabilityRating(str, enum.Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"
    F = "F"


class GoalStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    missed = "missed"
    paused = "paused"


class PolicyCategory(str, enum.Enum):
    environmental = "environmental"
    social = "social"
    governance = "governance"


class CsrActivityStatus(str, enum.Enum):
    upcoming = "upcoming"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class ChallengeDifficulty(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"
    expert = "expert"


class ChallengeStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    under_review = "under_review"
    completed = "completed"
    archived = "archived"


class RewardStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    out_of_stock = "out_of_stock"


class AuditType(str, enum.Enum):
    internal = "internal"
    external = "external"
    regulatory = "regulatory"


class AuditStatus(str, enum.Enum):
    scheduled = "scheduled"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class IssueSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class IssueStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    overdue = "overdue"


class RedemptionStatus(str, enum.Enum):
    pending = "pending"
    fulfilled = "fulfilled"
    cancelled = "cancelled"


class NotificationType(str, enum.Enum):
    compliance_issue = "compliance_issue"
    csr_approval = "csr_approval"
    challenge_approval = "challenge_approval"
    policy_reminder = "policy_reminder"
    badge_unlocked = "badge_unlocked"
    reward_redeemed = "reward_redeemed"
    overdue_issue = "overdue_issue"
