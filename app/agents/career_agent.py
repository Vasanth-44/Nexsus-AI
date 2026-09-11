from app.services.llm import llm, extract_text


def career_agent(user_input: str, progress, rag_context: str) -> str:

    skills = [
        f"{skill.skill}: {skill.progress}% ({skill.status})"
        for skill in progress.skills
    ]

    projects = [
        f"{project.project}: {project.progress}% ({project.status})"
        for project in progress.projects
    ]

    prompt = f"""
You are the Career Agent of NEXUS AI.

User request:
{user_input}

Current skills:
{chr(10).join(skills) if skills else "No skill progress recorded."}

Current projects:
{chr(10).join(projects) if projects else "No project progress recorded."}

Relevant uploaded-document context:
{rag_context if rag_context else "No relevant document context found."}

Use the uploaded documents when relevant, especially resumes
or job descriptions.

Provide:

1. Suitable career paths
2. Skills to improve
3. Projects to build or complete
4. Internship/job preparation
5. Resume and portfolio advice
6. Interview preparation
7. Next actionable steps

Do not invent information from uploaded documents.
Keep the advice practical and concise.
"""

    response = llm.invoke(prompt)

    return extract_text(response)