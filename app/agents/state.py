from typing import TypedDict


class NexusState(TypedDict):
    messages: list
    next_agent: str
    research: str