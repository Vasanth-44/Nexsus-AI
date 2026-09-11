from fastapi import APIRouter
from pydantic import BaseModel

from app.services.rag_service import retrieve_context
from app.agents.career_analyzer import analyze_career
from app.models.schemas import CareerAnalysis


router = APIRouter(
    prefix="/career",
    tags=["Career"]
)


class CareerAnalysisRequest(BaseModel):
    user_id: str
    job_description: str


class CareerAnalysisResponse(BaseModel):
    result: CareerAnalysis


@router.post(
    "/analyze",
    response_model=CareerAnalysisResponse
)
def career_analysis(
    request: CareerAnalysisRequest
):

    resume_context = retrieve_context(
        request.job_description,
        request.user_id
    )

    result = analyze_career(
        request.job_description,
        resume_context
    )

    return {
        "result": result
    }