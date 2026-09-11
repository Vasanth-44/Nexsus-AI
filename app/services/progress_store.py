from app.models.progress import (
    UserProgress,
    SkillProgress,
    ProjectProgress
)

from app.services.database import get_connection


def get_progress(user_id: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT skill, progress, status FROM skills WHERE user_id = ?",
        (user_id,)
    )

    skill_rows = cursor.fetchall()

    cursor.execute(
        "SELECT project, progress, status FROM projects WHERE user_id = ?",
        (user_id,)
    )

    project_rows = cursor.fetchall()

    conn.close()

    return UserProgress(
        user_id=user_id,
        skills=[
            SkillProgress(
                skill=row[0],
                progress=row[1],
                status=row[2]
            )
            for row in skill_rows
        ],
        projects=[
            ProjectProgress(
                project=row[0],
                progress=row[1],
                status=row[2]
            )
            for row in project_rows
        ]
    )


def update_skill(
    user_id: str,
    skill: str,
    progress: int,
    status: str
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO skills (user_id, skill, progress, status)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, skill)
        DO UPDATE SET
            progress = excluded.progress,
            status = excluded.status
    """, (
        user_id,
        skill,
        progress,
        status
    ))

    conn.commit()
    conn.close()

    return get_progress(user_id)


def update_project(
    user_id: str,
    project: str,
    progress: int,
    status: str
):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO projects (user_id, project, progress, status)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, project)
        DO UPDATE SET
            progress = excluded.progress,
            status = excluded.status
    """, (
        user_id,
        project,
        progress,
        status
    ))

    conn.commit()
    conn.close()

    return get_progress(user_id)