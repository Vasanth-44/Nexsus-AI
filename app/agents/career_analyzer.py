from app.services.llm import llm
from app.models.schemas import CareerAnalysis


structured_llm = llm.with_structured_output(
    CareerAnalysis
)


def analyze_career(
    job_description: str,
    resume_context: str
) -> CareerAnalysis:

    prompt = f"""
You are the Career Analysis Agent of NEXUS AI.

Analyze the user's resume against the provided job description.

JOB DESCRIPTION:
{job_description}

RESUME CONTEXT:
{resume_context}

Return a structured career analysis.

Rules:

1. match_score must be between 0 and 100.
2. strong_matches must contain skills, experience, or projects
   clearly supported by the resume context.
3. missing_skills must contain important job requirements that
   are not clearly present in the resume.
4. resume_gaps must identify weaknesses or missing information.
5. recommended_projects must strengthen the candidate for this role.
6. interview_topics must contain important technical topics.
7. action_plan must contain the most useful next actions.
8. Never invent experience or skills.
9. If information is missing, say so rather than assuming it.
"""

    response = structured_llm.invoke(
        prompt
    )

    return response