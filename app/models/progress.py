from pydantic import BaseModel, Field
from typing import List


class SkillProgress(BaseModel):
    skill: str
    status: str = "not_started"
    progress: int = 0


class ProjectProgress(BaseModel):
    project: str
    status: str = "not_started"
    progress: int = 0


class UserProgress(BaseModel):
    user_id: str
    skills: List[SkillProgress] = Field(default_factory=list)
    projects: List[ProjectProgress] = Field(default_factory=list)

class ProgressUpdate(BaseModel):
    type: str
    name: str
    progress: int
    status: str