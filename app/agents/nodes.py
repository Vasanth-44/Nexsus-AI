from app.services.llm import llm
from app.models.schemas import GoalAnalysis, SkillGapAnalysis, Roadmap


def goal_analyzer(state):
    prompt = f"""
    Analyze the user's career goal.

    Goal: {state["goal"]}
    Experience: {state["experience"]}

    Determine:
    1. The target career
    2. The user's current level
    """

    goal_llm = llm.with_structured_output(GoalAnalysis)

    result = goal_llm.invoke(prompt)

    return {
        "goal": result.goal,
        "current_level": result.current_level
    }

def skill_gap_analyzer(state):
    prompt = f"""
    Analyze the skill gaps for this user.

    Goal: {state["goal"]}
    Current Level: {state["current_level"]}
    Current Skills: {state["skills"]}

    Return only the important skills the user needs to learn.
    """

    structured_llm = llm.with_structured_output(SkillGapAnalysis)

    result = structured_llm.invoke(prompt)

    return {
        "skill_gaps": result.skill_gaps
    }

def roadmap_generator(state):
    prompt = f"""
    Create a personalized learning roadmap.

    Goal: {state["goal"]}
    Current Skills: {state["skills"]}
    Experience: {state["experience"]}
    Available Time: {state["available_time"]}
    Duration: {state["duration"]}
    Skill Gaps: {state["skill_gaps"]}

    Create a practical roadmap divided according to the duration.
    Include projects and immediate next steps.
    """

    structured_llm = llm.with_structured_output(Roadmap)

    result = structured_llm.invoke(prompt)

    return {
        "roadmap": result.roadmap,
        "projects": result.projects,
        "next_steps": result.next_steps
    }