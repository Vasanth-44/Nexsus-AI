from app.services.llm import llm, extract_text


def learning_agent(user_input: str, progress, rag_context: str) -> str:

    prompt = f"""
You are the Learning Agent of NEXUS AI.

User request:
{user_input}

Current skills:
{chr(10).join(
    f"{skill.skill}: {skill.progress}% ({skill.status})"
    for skill in progress.skills
) if progress.skills else "No skill progress recorded."}

Current projects:
{chr(10).join(
    f"{project.project}: {project.progress}% ({project.status})"
    for project in progress.projects
) if progress.projects else "No project progress recorded."}

Relevant uploaded-document context:
{rag_context if rag_context else "No relevant document context found."}

Use the uploaded material when relevant.

Provide:

1. What to learn
2. Key concepts
3. Recommended learning order
4. Practice exercises
5. Mini projects
6. Common mistakes
7. Immediate next step

Do not invent information from the uploaded documents.
Keep the response practical and structured.
"""

    response = llm.invoke(prompt)

    return extract_text(response)