from fastapi import FastAPI

from app.models.schemas import RoadmapRequest, NexusResponse
from app.agents.graph import graph
from app.routes.nexus import router as nexus_router
from app.routes.progress import router as progress_router
from app.services.database import init_db
from app.routes.documents import router as documents_router
from app.routes.career import router as career_router

app = FastAPI(
    title="NEXUS AI"
)


init_db()


app.include_router(
    nexus_router,
    prefix="/nexus"
)

app.include_router(
    progress_router
)

app.include_router(
    documents_router
)
app.include_router(
    career_router
)

@app.get("/")
def root():
    return {"message": "NEXUS AI is running"}


@app.post("/roadmap", response_model=NexusResponse)
def generate_roadmap(request: RoadmapRequest):

    result = graph.invoke({
        "goal": request.goal,
        "skills": request.skills,
        "experience": request.experience,
        "available_time": request.available_time,
        "duration": request.duration,
    })

    return NexusResponse(
        goal=result["goal"],
        current_level=result["current_level"],
        skill_gaps=result["skill_gaps"],
        roadmap=result["roadmap"],
        projects=result["projects"],
        next_steps=result["next_steps"],
    )


app.include_router(
    nexus_router,
    prefix="/nexus",
    tags=["NEXUS Agent"]
)