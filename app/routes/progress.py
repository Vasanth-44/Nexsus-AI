from fastapi import APIRouter

from app.models.progress import UserProgress
from app.services.progress_store import (
    get_progress,
    update_skill,
    update_project
)


router = APIRouter(
    prefix="/progress",
    tags=["Progress"]
)


@router.get("/{user_id}", response_model=UserProgress)
def get_user_progress(user_id: str):
    return get_progress(user_id)


@router.post("/{user_id}/skill", response_model=UserProgress)
def update_user_skill(
    user_id: str,
    skill: str,
    progress: int,
    status: str
):
    return update_skill(
        user_id=user_id,
        skill=skill,
        progress=progress,
        status=status
    )


@router.post("/{user_id}/project", response_model=UserProgress)
def update_user_project(
    user_id: str,
    project: str,
    progress: int,
    status: str
):
    return update_project(
        user_id=user_id,
        project=project,
        progress=progress,
        status=status
    )