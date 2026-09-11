from pydantic import BaseModel, Field

from app.services.llm import llm


class RouteDecision(BaseModel):
    route: str = Field(
        description="Choose one route: research, learning, career, or general"
    )


router_llm = llm.with_structured_output(RouteDecision)


def route_question(question: str) -> str:
    response = router_llm.invoke(
        f"""
        You are the routing system for NEXUS AI.

        Decide which specialist should handle the user's question.

        Routes:

        research:
        - latest information
        - current technologies
        - web research
        - comparisons
        - recent developments

        learning:
        - explaining concepts
        - learning programming
        - study plans
        - tutorials
        - educational questions

        career:
        - jobs
        - internships
        - resumes
        - interview preparation
        - career planning

        general:
        - casual questions
        - questions that don't clearly belong to the other categories

        User question:
        {question}

        Return exactly one route.
        """
    )

    return response.route