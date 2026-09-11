from app.services.progress_store import get_progress


def generate_recommendations(user_id: str):

    progress = get_progress(user_id)

    recommendations = []

    for skill in progress.skills:

        if skill.progress < 40:
            recommendations.append(
                f"Focus more on {skill.skill}. "
                f"Your current progress is {skill.progress}%."
            )

        elif skill.progress < 80:
            recommendations.append(
                f"Continue practicing {skill.skill} "
                f"and build a small project."
            )

        else:
            recommendations.append(
                f"You are doing well with {skill.skill}. "
                f"Consider an advanced project."
            )

    for project in progress.projects:

        if project.progress < 50:
            recommendations.append(
                f"Continue working on {project.project}."
            )

        elif project.progress < 100:
            recommendations.append(
                f"Finish and deploy {project.project}."
            )

    if not recommendations:
        recommendations.append(
            "Start learning your first skill and track your progress."
        )

    return recommendations