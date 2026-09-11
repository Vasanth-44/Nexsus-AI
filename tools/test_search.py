import os
from dotenv import load_dotenv
from web_search import web_search

load_dotenv()

print("API key loaded:", bool(os.getenv("TAVILY_API_KEY")))
print("API key starts with:", os.getenv("TAVILY_API_KEY", "")[:5])

result = web_search.invoke({
    "query": "latest LangGraph documentation 2026"
})

print(result)