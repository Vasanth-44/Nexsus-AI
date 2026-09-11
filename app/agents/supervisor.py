from typing import Literal

from langchain_core.messages import HumanMessage

from app.services.llm import llm


def supervisor_node(state):
    """
    Decide which specialist agent should handle the request.
    """

    messages = state["messages"]

    user_message = messages[-1].content

    prompt = f"""
You are the Supervisor of NEXUS AI.

Your job is to decide which specialist should handle the user's request.

Available specialists:

- research: Use for current information, web research,
  latest technologies, documentation, tutorials, trends,
  or questions requiring external information.

- general: Use for normal questions that do not require
  web research.

User request:
{user_message}

Return ONLY one word:

research

or

general
"""

    response = llm.invoke(
        [HumanMessage(content=prompt)]
    )

    raw = response.content
    decision = (" ".join(part.get("text", "") if isinstance(part, dict) else str(part) for part in raw) if isinstance(raw, list) else str(raw)).strip().lower()

    if "research" in decision:
        return {"next_agent": "research"}

    return {"next_agent": "general"}