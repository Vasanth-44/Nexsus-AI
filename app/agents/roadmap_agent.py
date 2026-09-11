from app.services.llm import llm, extract_text


def roadmap_agent(user_input: str, progress, rag_context: str) -> str:

    skills = [
        f"{skill.skill}: {skill.progress}% ({skill.status})"
        for skill in progress.skills
    ]

    projects = [
        f"{project.project}: {project.progress}% ({project.status})"
        for project in progress.projects
    ]

    prompt = f"""
You are the Roadmap Agent of NEXUS AI.

User request:
{user_input}

Current skills:
{chr(10).join(skills) if skills else "No skill progress recorded."}

Current projects:
{chr(10).join(projects) if projects else "No project progress recorded."}

Relevant uploaded-document context:
{rag_context if rag_context else "No relevant document context found."}

Use the user's progress and uploaded-document context when relevant.

Create a practical roadmap containing:

1. Goal
2. Current level
3. Skills to learn next
4. Recommended learning order
5. Projects to build or complete
6. Suggested timeline
7. Immediate next step

Do not invent information from the uploaded documents.
Keep the roadmap practical and concise.
"""

    response = llm.invoke(prompt)

    return extract_text(response)