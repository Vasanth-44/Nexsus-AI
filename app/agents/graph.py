from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from app.agents.nodes import goal_analyzer, skill_gap_analyzer, roadmap_generator


class NexusState(TypedDict):
    goal: str
    skills: list[str]
    experience: str
    available_time: str
    duration: str
    current_level: str
    skill_gaps: list[str]
    roadmap: list[str]
    projects: list[str]
    next_steps: list[str]


graph_builder = StateGraph(NexusState)

graph_builder.add_node("goal_analyzer", goal_analyzer)
graph_builder.add_node("skill_gap_analyzer", skill_gap_analyzer)
graph_builder.add_node("roadmap_generator", roadmap_generator)

graph_builder.add_edge(START, "goal_analyzer")
graph_builder.add_edge("goal_analyzer", "skill_gap_analyzer")
graph_builder.add_edge("skill_gap_analyzer", "roadmap_generator")
graph_builder.add_edge("roadmap_generator", END)

graph = graph_builder.compile()
