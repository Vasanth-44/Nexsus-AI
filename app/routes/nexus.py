from fastapi import APIRouter
from pydantic import BaseModel

from app.agents.nexus_graph import nexus_graph
from langchain_core.messages import HumanMessage


router = APIRouter()


class NexusRequest(BaseModel):
    user_id: str
    message: str
    thread_id: str = "default"


class NexusResponse(BaseModel):
    result: str


@router.post("/ask", response_model=NexusResponse)
def ask_nexus(request: NexusRequest):

    result = nexus_graph.invoke(
    {
        "user_id": request.user_id,
        "user_input": request.message,
        "messages": [
            HumanMessage(content=request.message)
        ],
        "rag_context": "",
        "agent_type": "",
        "result": ""
    },
    config={
        "configurable": {
            "thread_id": request.thread_id
        }
    }
)

    return {
        "result": result["result"]
    }