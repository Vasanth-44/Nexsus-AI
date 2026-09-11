from typing import TypedDict

from langchain_core.messages import HumanMessage
from langgraph.graph import StateGraph, START, END

from app.services.llm import llm, extract_text
from tools.web_search import web_search


class ResearchState(TypedDict):
    query: str
    search_results: str
    research: str


def research_search_node(state: ResearchState):
    """Search the web for the user's research question."""

    results = web_search.invoke({
        "query": state["query"]
    })

    return {
        "search_results": results
    }


def research_analysis_node(state: ResearchState):
    """Analyze search results and create a source-aware research answer."""

    prompt = f"""
You are the Research Agent of NEXUS AI.

Research question:
{state["query"]}

Web search results:
{state["search_results"]}

Analyze the search results and create a reliable research answer.

Structure the answer as:

## Research Summary

Give a concise overview of the answer.

## Key Findings

- Important finding
- Important finding
- Important finding

## Important Details

Explain the most relevant technical or practical details.

## Sources

List the most relevant sources from the search results.

For each source include:
- Title
- URL

IMPORTANT RULES:

1. Use only information supported by the search results.
2. Do not invent sources or URLs.
3. Prefer official documentation and primary sources when available.
4. Clearly distinguish facts from uncertainty.
5. Keep the answer concise and useful.
"""

    response = llm.invoke(
        [HumanMessage(content=prompt)]
    )

    return {
        "research": extract_text(response)
    }


research_builder = StateGraph(ResearchState)


research_builder.add_node(
    "search",
    research_search_node
)

research_builder.add_node(
    "analyze",
    research_analysis_node
)


research_builder.add_edge(
    START,
    "search"
)

research_builder.add_edge(
    "search",
    "analyze"
)

research_builder.add_edge(
    "analyze",
    END
)


research_agent = research_builder.compile()