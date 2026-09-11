from langchain_core.messages import HumanMessage
from app.services.llm import llm
from tools.web_search import web_search


def research_agent(query: str) -> str:
    """
    Research a topic using web search and summarize the findings.
    """

    # Step 1: Search the web
    search_results = web_search.invoke({
        "query": query
    })

    # Step 2: Ask the LLM to analyze the results
    prompt = f"""
You are the Research Agent of NEXUS AI.

Research question:
{query}

Web search results:
{search_results}

Based only on the information above:

1. Identify the most important findings.
2. Remove unnecessary information.
3. Give a concise summary.
4. Mention important sources when relevant.

Keep the response clear and concise.
"""

    response = llm.invoke(
        [HumanMessage(content=prompt)]
    )

    return response.content