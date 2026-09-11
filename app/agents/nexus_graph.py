from typing import TypedDict, Annotated

from langchain_core.messages import BaseMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import InMemorySaver
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage

from app.services.llm import llm, extract_text

from app.agents.research_agent import research_agent
from app.agents.roadmap_agent import roadmap_agent
from app.agents.learning_agent import learning_agent
from app.agents.career_agent import career_agent
from app.agents.progress_agent import detect_progress_update
from app.services.progress_store import update_skill, update_project
from app.services.rag_service import retrieve_context
from app.models.progress import UserProgress
from app.services.progress_store import get_progress


class NexusState(TypedDict):
    user_input: str
    user_id: str
    mmessages: Annotated[list[BaseMessage], add_messages]
    progress: UserProgress
    rag_context: str
    agent_type: str
    result: str


def memory_node(state: NexusState):
    progress = get_progress(state["user_id"])

    return {
        "progress": progress
    }

def get_conversation_history(state: NexusState) -> str:
    return "\n".join(
        f"{type(message).__name__}: {message.content}"
        for message in state.get("messages", [])
        if hasattr(message, "content")
    )

def progress_node(state: NexusState):

    update = detect_progress_update(
        state["user_input"]
    )

    if update is None:
        return {}

    if update.type == "skill":
        update_skill(
            user_id=state["user_id"],
            skill=update.name,
            progress=update.progress,
            status=update.status
        )

    elif update.type == "project":
        update_project(
            user_id=state["user_id"],
            project=update.name,
            progress=update.progress,
            status=update.status
        )

    return {
        "progress": get_progress(state["user_id"])
    }

def router_node(state: NexusState):
    user_input = state["user_input"]

    history = get_conversation_history(state)

    prompt = f"""
You are the routing system of NEXUS AI.

Classify the user's request into exactly ONE category:

- research → latest information, current events, documentation,
  recent technologies, web research

- career → jobs, internships, resume, interviews,
  career decisions

- learning → learning a topic, studying, practice,
  concepts, tutorials

- roadmap → creating or updating a roadmap,
  planning what to do next

Previous conversation:
{history}

Current user request:
{user_input}

Return ONLY one word:
research
career
learning
roadmap
"""

    response = llm.invoke(prompt)

    raw = response.content
    agent_type = extract_text(response).lower()

    if agent_type not in [
        "research",
        "career",
        "learning",
        "roadmap"
    ]:
        agent_type = "roadmap"

    return {
        "agent_type": agent_type
    }


def research_node(state: NexusState):

    history = get_conversation_history(state)

    query_prompt = f"""
Convert the user's current request into one clear web-search query.

Previous conversation:
{history}

Relevant uploaded-document context:
{state["rag_context"]}

Current request:
{state["user_input"]}

Return ONLY the search query.
"""

    query_response = llm.invoke(query_prompt)

    raw_query = query_response.content
    research_query = extract_text(query_response)

    research_result = research_agent.invoke({
        "query": research_query,
        "search_results": "",
        "research": ""
    })

    return {
        "result": research_result["research"],
        "messages": [
            AIMessage(
                content=research_result["research"]
            )
        ]
    }


def roadmap_node(state: NexusState):

    history = get_conversation_history(state)

    response = roadmap_agent(
    state["user_input"],
    state["progress"],
    state["rag_context"]
)

    return {
        "result": response,
        "messages": [
            AIMessage(content=response)
        ]
    }


def learning_node(state: NexusState):

    response = learning_agent(
    state["user_input"],
    state["progress"],
    state["rag_context"]
)

    return {
    "result": response,
    "messages": [response]
}


def career_node(state: NexusState):

    response = career_agent(
    state["user_input"],
    state["progress"],
    state["rag_context"]
)

    return {
    "result": response,
    "messages": [response]
}

def rag_node(state: NexusState):

    context = retrieve_context(
    state["user_input"],
    state["user_id"]
)
    return {
        "rag_context": context
    }


def route_agent(state: NexusState):
    return state["agent_type"]


graph_builder = StateGraph(NexusState)


graph_builder.add_node("memory", memory_node)
graph_builder.add_node("progress", progress_node)
graph_builder.add_node("rag", rag_node)
graph_builder.add_node("router", router_node)

graph_builder.add_node(
    "research",
    research_node
)

graph_builder.add_node(
    "roadmap",
    roadmap_node
)

graph_builder.add_node(
    "learning",
    learning_node
)

graph_builder.add_node(
    "career",
    career_node
)


graph_builder.add_edge(START, "memory")
graph_builder.add_edge("memory", "progress")
graph_builder.add_edge("progress", "rag")
graph_builder.add_edge("rag", "router")

graph_builder.add_conditional_edges(
    "router",
    route_agent,
    {
        "research": "research",
        "roadmap": "roadmap",
        "learning": "learning",
        "career": "career"
    }
)


graph_builder.add_edge(
    "research",
    END
)

graph_builder.add_edge(
    "roadmap",
    END
)

graph_builder.add_edge(
    "learning",
    END
)

graph_builder.add_edge(
    "career",
    END
)


checkpointer = InMemorySaver()

nexus_graph = graph_builder.compile(
    checkpointer=checkpointer
)