from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from app.models.schemas import Roadmap

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash"
)

structured_llm = llm.with_structured_output(Roadmap)


def extract_text(response) -> str:
    """Safely extract string text from an LLM response.
    
    Gemini may return response.content as a list of parts rather than a plain
    string. This helper normalises both cases to a single stripped string.
    """
    raw = response.content
    if isinstance(raw, list):
        return " ".join(
            part.get("text", "") if isinstance(part, dict) else str(part)
            for part in raw
        ).strip()
    return str(raw).strip()