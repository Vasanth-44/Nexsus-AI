from app.services.llm import llm
from app.models.progress import ProgressUpdate

def is_progress_message(user_input: str) -> bool:

    keywords = [
        "finished",
        "completed",
        "complete",
        "learned",
        "mastered",
        "done with",
        "finished with",
        "progress",
        "percent",
        "%",
        "halfway",
        "started"
    ]

    text = user_input.lower()

    return any(keyword in text for keyword in keywords)


def detect_progress_update(user_input: str):

    prompt = f"""
You are the Progress Tracking Agent of NEXUS AI.

Determine whether the user is reporting progress on a skill or project.

User message:
{user_input}

If the user is NOT reporting progress, return exactly:

NONE

If the user IS reporting progress, return exactly in this format:

type|name|progress|status

Rules:

type must be either:
skill
project

progress must be a number from 0 to 100.

status must be one of:
not_started
in_progress
completed

Examples:

User: I finished Python
skill|Python|100|completed

User: I'm halfway through React
skill|React|50|in_progress

User: I completed my NEXUS AI project
project|NEXUS AI|100|completed

User: What should I learn next?
NONE
"""

    response = llm.invoke(prompt)

    # Gemini may return content as a list of parts — extract text safely
    raw = response.content
    if isinstance(raw, list):
        result = " ".join(
            part.get("text", "") if isinstance(part, dict) else str(part)
            for part in raw
        ).strip()
    else:
        result = str(raw).strip()

    if result == "NONE":
        return None

    try:
        update_type, name, progress, status = result.split("|")

        return ProgressUpdate(
            type=update_type.strip(),
            name=name.strip(),
            progress=int(progress),
            status=status.strip()
        )

    except Exception:
        return None
    