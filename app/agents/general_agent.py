from langchain_core.messages import HumanMessage

from app.services.llm import llm


def general_agent(state):
    """
    Handle questions that don't require web research.
    """

    messages = state["messages"]

    user_message = messages[-1].content

    prompt = f"""
You are the General Assistant of NEXUS AI.

Answer the user's question clearly and concisely.

User question:
{user_message}

Rules:
- Be accurate.
- Keep the answer reasonably short.
- Explain technical concepts simply when needed.
- Do not perform web research.
"""

    response = llm.invoke(
        [HumanMessage(content=prompt)]
    )

    return {
        "messages": [
            response
        ]
    }