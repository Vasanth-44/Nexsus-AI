from app.services.llm import llm
from tools.web_search import web_search


# --------------------------------------------------
# 1. Register tools
# --------------------------------------------------

tools = [web_search]

llm_with_tools = llm.bind_tools(tools)


# --------------------------------------------------
# 2. User question
# --------------------------------------------------

user_message = "What are the latest LangGraph features in 2026?"


# --------------------------------------------------
# 3. Ask Gemini
# --------------------------------------------------

response = llm_with_tools.invoke(user_message)

print("\n--- GEMINI RESPONSE ---")

if response.tool_calls:
    print("Gemini wants to use a tool.")
else:
    print(response.content)


# --------------------------------------------------
# 4. Execute tool
# --------------------------------------------------

if response.tool_calls:

    tool_messages = []

    for tool_call in response.tool_calls:

        tool_name = tool_call["name"]
        tool_args = tool_call["args"]

        print("\n--- TOOL CALL ---")
        print("Tool:", tool_name)
        print("Arguments:", tool_args)

        if tool_name == "web_search":

            result = web_search.invoke(tool_args)

            print("\n--- TOOL EXECUTED ---")
            print("Search completed.")

            tool_messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call["id"],
                    "content": str(result)
                }
            )


    # --------------------------------------------------
    # 5. Send search results back to Gemini
    # --------------------------------------------------

    messages = [
        {
            "role": "user",
            "content": user_message
        },
        response
    ]

    messages.extend(tool_messages)


    # --------------------------------------------------
    # 6. Gemini creates final answer
    # --------------------------------------------------

    final_response = llm_with_tools.invoke(messages)

    print("\n--- FINAL ANSWER ---")
    print(final_response.content)