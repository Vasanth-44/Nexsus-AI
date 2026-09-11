import os

from dotenv import load_dotenv
from tavily import TavilyClient
from langchain_core.tools import tool

load_dotenv()

@tool
def web_search(query: str) -> str:
    """
    Search the web for current information.

    Use this tool when the user asks about:
    - current information
    - latest technologies
    - recent resources
    - documentation
    - tutorials
    - current trends
    """

    api_key = os.getenv("TAVILY_API_KEY")

    if not api_key:
        return "TAVILY_API_KEY is not configured."

    client = TavilyClient(api_key=api_key)

    response = client.search(
        query=query,
        search_depth="advanced",
        max_results=3
    )

    results = response.get("results", [])

    if not results:
        return "No search results found."

    formatted_results = []

    for result in results:
        title = result.get("title", "No title")
        url = result.get("url", "")
        content = result.get("content", "")[:1000]

        formatted_results.append(
            f"Title: {title}\n"
            f"URL: {url}\n"
            f"Content: {content}\n"
        )

    return "\n---\n".join(formatted_results)