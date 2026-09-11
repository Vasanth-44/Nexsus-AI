import type { ProjectProgress, SkillProgress, UserProgress } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function clampProgress(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

export function averageProgress(items: Array<SkillProgress | ProjectProgress>) {
  if (items.length === 0) {
    return 0;
  }

  const total = items.reduce((sum, item) => sum + clampProgress(item.progress), 0);
  return Math.round(total / items.length);
}

export function countCompleted(items: Array<SkillProgress | ProjectProgress>) {
  return items.filter((item) => item.status === "completed" || clampProgress(item.progress) >= 100).length;
}

export function statusLabel(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

export function buildRecommendation(progress: UserProgress) {
  const skills = [...progress.skills].sort((a, b) => a.progress - b.progress);
  const projects = [...progress.projects].sort((a, b) => a.progress - b.progress);
  const recommendations: string[] = [];

  const lowestSkill = skills.find((skill) => skill.progress < 75);
  const activeProject = projects.find((project) => project.status !== "completed" && project.progress < 100);

  if (lowestSkill) {
    recommendations.push(`Bring ${lowestSkill.skill} to the next visible milestone.`);
  }

  if (activeProject) {
    recommendations.push(`Move ${activeProject.project} closer to a demo-ready checkpoint.`);
  }

  if (skills.length > 0 && projects.length > 0) {
    recommendations.push("Turn one learning topic into a production-quality project artifact.");
  }

  if (recommendations.length === 0 && (skills.length > 0 || projects.length > 0)) {
    recommendations.push("Document your strongest recent progress and prepare an interview story around it.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Add your first tracked skill or project to unlock a focused recommendation.");
  }

  return recommendations.slice(0, 3);
}
