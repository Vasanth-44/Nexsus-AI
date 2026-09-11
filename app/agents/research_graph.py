from langgraph.graph import StateGraph, START, END

from app.agents.research_agent import (
    ResearchState,
    research_search_node,
    research_analysis_node,
)


graph_builder = StateGraph(ResearchState)

graph_builder.add_node(
    "research_search",
    research_search_node
)

graph_builder.add_node(
    "research_analysis",
    research_analysis_node
)

graph_builder.add_edge(
    START,
    "research_search"
)

graph_builder.add_edge(
    "research_search",
    "research_analysis"
)

graph_builder.add_edge(
    "research_analysis",
    END
)


research_graph = graph_builder.compile()