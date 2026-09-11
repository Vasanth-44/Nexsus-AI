from pydantic import BaseModel
from typing import List
from pydantic import BaseModel, Field


class UserInput(BaseModel):
    goal: str
    skills: list[str]
    experience: str
    available_time: str
    duration: str


class Roadmap(BaseModel):
    goal: str
    current_level: str
    skill_gaps: list[str]
    roadmap: list[str]
    projects: list[str]
    next_steps: list[str]

class GoalAnalysis(BaseModel):
    goal: str
    current_level: str

class SkillGapAnalysis(BaseModel):
    skill_gaps: list[str]

class RoadmapRequest(BaseModel):
    goal: str
    skills: list[str]
    experience: str
    available_time: str
    duration: str


class NexusResponse(BaseModel):
    goal: str
    current_level: str
    skill_gaps: list[str]
    roadmap: list[str]
    projects: list[str]
    next_steps: list[str]

class CareerAnalysis(BaseModel):
    match_score: int = Field(
        ge=0,
        le=100
    )

    strong_matches: List[str] = Field(
        default_factory=list
    )

    missing_skills: List[str] = Field(
        default_factory=list
    )

    resume_gaps: List[str] = Field(
        default_factory=list
    )

    recommended_projects: List[str] = Field(
        default_factory=list
    )

    interview_topics: List[str] = Field(
        default_factory=list
    )

    action_plan: List[str] = Field(
        default_factory=list
    ) 