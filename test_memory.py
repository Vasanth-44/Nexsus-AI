from app.agents.nexus_graph import memory_node

state = {
    "user_id": "vasanth",
    "user_input": "test"
}

result = memory_node(state)

print(result)