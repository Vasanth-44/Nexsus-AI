from app.agents.graph import graph


result = graph.invoke({
    "goal": "Become a GenAI Engineer",
    "skills": ["Python", "Basic ML", "HTML"],
    "experience": "Beginner",
    "available_time": "2 hours/day",
    "duration": "6 months",
})

print(result)