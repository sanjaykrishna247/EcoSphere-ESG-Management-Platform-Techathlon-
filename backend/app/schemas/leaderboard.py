import uuid

from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: uuid.UUID
    full_name: str
    avatar_url: str | None
    department_id: uuid.UUID | None
    xp: int


class DepartmentLeaderboardEntry(BaseModel):
    rank: int
    department_id: uuid.UUID
    name: str
    code: str
    score: float
