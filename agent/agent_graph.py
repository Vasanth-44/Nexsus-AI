from typing import Annotated, TypedDict
from langgraph.graph.message import add_messages

from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import InMemorySaver

from app.services.llm import llm
from tools.web_search import web_search


# --------------------------------------------------
# 1. State definition
# --------------------------------------------------

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]


# --------------------------------------------------
# 2. Agent node
# --------------------------------------------------

tools = [web_search]
llm_with_tools = llm.bind_tools(tools)


def agent_node(state: AgentState):
    response = llm_with_tools.invoke(
        state["messages"]
    )

    return {
        "messages": [response]
    }


# --------------------------------------------------
# 3. Conditional routing
# --------------------------------------------------

def should_continue(state):
    last_message = state["messages"][-1]

    if last_message.tool_calls:
        return "tools"

    return END


# --------------------------------------------------
# 4. Tool node
# --------------------------------------------------

tool_node = ToolNode([web_search])


# --------------------------------------------------
# 5. Build graph
# --------------------------------------------------

graph_builder = StateGraph(AgentState)

graph_builder.add_node("agent", agent_node)
graph_builder.add_node("tools", tool_node)

graph_builder.add_edge(START, "agent")
graph_builder.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tools": "tools",
        END: END
    }
)
graph_builder.add_edge("tools", "agent")
checkpointer = InMemorySaver()

graph = graph_builder.compile(
    checkpointer=checkpointer
)


# --------------------------------------------------
# 6. Temporary validation
# --------------------------------------------------

if __name__ == "__main__":
    print("NEXUS AI Agent Graph")
    print("Graph compiled successfully!")
