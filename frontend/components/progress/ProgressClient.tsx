"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, FolderKanban, Plus, Target } from "lucide-react";
import { updateProject, updateSkill } from "@/lib/api";
import type { ProgressStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useProgress } from "@/hooks/useProgress";
import { clampProgress, statusLabel } from "@/lib/utils";

const statuses: ProgressStatus[] = ["not_started", "in_progress", "completed"];

export function ProgressClient() {
  const { userId, progress, loading, error, setProgress } = useProgress();
  const { showToast } = useToast();
  const [skillName, setSkillName] = useState("");
  const [skillProgress, setSkillProgress] = useState(0);
  const [skillStatus, setSkillStatus] = useState<ProgressStatus>("in_progress");
  const [projectName, setProjectName] = useState("");
  const [projectProgress, setProjectProgress] = useState(0);
  const [projectStatus, setProjectStatus] = useState<ProgressStatus>("in_progress");
  const [savingSkill, setSavingSkill] = useState(false);
  const [savingProject, setSavingProject] = useState(false);

  const saveSkill = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!skillName.trim() || savingSkill) {
      return;
    }

    setSavingSkill(true);

    try {
      const result = await updateSkill(userId, skillName.trim(), clampProgress(skillProgress), skillStatus);
      setProgress(result);
      setSkillName("");
      setSkillProgress(0);
      setSkillStatus("in_progress");
      showToast({
        title: "Progress updated",
        description: "Skill progress has been saved.",
        type: "success"
      });
    } catch {
      showToast({
        title: "API failure",
        description: "Please check that the NEXUS AI backend is running.",
        type: "error"
      });
    } finally {
      setSavingSkill(false);
    }
  };

  const saveProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!projectName.trim() || savingProject) {
      return;
    }

    setSavingProject(true);

    try {
      const result = await updateProject(userId, projectName.trim(), clampProgress(projectProgress), projectStatus);
      setProgress(result);
      setProjectName("");
      setProjectProgress(0);
      setProjectStatus("in_progress");
      showToast({
        title: "Progress updated",
        description: "Project progress has been saved.",
        type: "success"
      });
    } catch {
      showToast({
        title: "API failure",
        description: "Please check that the NEXUS AI backend is running.",
        type: "error"
      });
    } finally {
      setSavingProject(false);
    }
  };

  const skills = progress?.skills ?? [];
  const projects = progress?.projects ?? [];

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="rounded-lg border border-border/70 bg-panel/[0.68] p-5 backdrop-blur-xl sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
            <BarChart3 className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Progress Dashboard</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Track the skills and projects NEXUS AI uses for guidance, learning, and career analysis.
            </p>
          </div>
        </div>
      </motion.section>

      {error ? (
        <EmptyState title="Something went wrong." description="Please check that the NEXUS AI backend is running." />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <ProgressForm
          title="Add/update skill"
          icon={<Target className="size-5 text-accent" aria-hidden="true" />}
          nameLabel="Skill"
          nameValue={skillName}
          onNameChange={setSkillName}
          progressValue={skillProgress}
          onProgressChange={setSkillProgress}
          statusValue={skillStatus}
          onStatusChange={setSkillStatus}
          saving={savingSkill}
          onSubmit={saveSkill}
        />
        <ProgressForm
          title="Add/update project"
          icon={<FolderKanban className="size-5 text-warning" aria-hidden="true" />}
          nameLabel="Project"
          nameValue={projectName}
          onNameChange={setProjectName}
          progressValue={projectProgress}
          onProgressChange={setProjectProgress}
          statusValue={projectStatus}
          onStatusChange={setProjectStatus}
          saving={savingProject}
          onSubmit={saveProject}
        />
      </section>

      {loading ? (
        <Card>
          <CardBody>
            <Spinner label="Loading progress" />
          </CardBody>
        </Card>
      ) : (
        <section className="grid gap-6 xl:grid-cols-2">
          <ProgressList
            title="Skills"
            icon={<Target className="size-5 text-accent" aria-hidden="true" />}
            emptyText="No skills tracked yet."
            items={skills.map((skill) => ({
              key: skill.skill,
              name: skill.skill,
              progress: skill.progress,
              status: skill.status
            }))}
          />
          <ProgressList
            title="Projects"
            icon={<FolderKanban className="size-5 text-warning" aria-hidden="true" />}
            emptyText="No projects tracked yet."
            items={projects.map((project) => ({
              key: project.project,
              name: project.project,
              progress: project.progress,
              status: project.status
            }))}
          />
        </section>
      )}
    </div>
  );
}

function ProgressForm({
  title,
  icon,
  nameLabel,
  nameValue,
  onNameChange,
  progressValue,
  onProgressChange,
  statusValue,
  onStatusChange,
  saving,
  onSubmit
}: {
  title: string;
  icon: ReactNode;
  nameLabel: string;
  nameValue: string;
  onNameChange: (value: string) => void;
  progressValue: number;
  onProgressChange: (value: number) => void;
  statusValue: ProgressStatus;
  onStatusChange: (value: ProgressStatus) => void;
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
      </CardHeader>
      <CardBody>
        <form className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem_10rem_auto]" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor={`${nameLabel}-name`}>
              {nameLabel}
            </label>
            <input
              id={`${nameLabel}-name`}
              value={nameValue}
              onChange={(event) => onNameChange(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-border bg-background/70 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              placeholder={nameLabel}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor={`${nameLabel}-progress`}>
              Progress
            </label>
            <input
              id={`${nameLabel}-progress`}
              type="number"
              min={0}
              max={100}
              value={progressValue}
              onChange={(event) => onProgressChange(Number(event.target.value))}
              className="mt-2 h-11 w-full rounded-lg border border-border bg-background/70 px-3 text-sm text-foreground outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor={`${nameLabel}-status`}>
              Status
            </label>
            <select
              id={`${nameLabel}-status`}
              value={statusValue}
              onChange={(event) => onStatusChange(event.target.value as ProgressStatus)}
              className="mt-2 h-11 w-full rounded-lg border border-border bg-background/70 px-3 text-sm text-foreground outline-none"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={saving || !nameValue.trim()}
              icon={saving ? <CheckCircle2 className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
            >
              {saving ? "Saving" : "Save"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

function ProgressList({
  title,
  icon,
  emptyText,
  items
}: {
  title: string;
  icon: ReactNode;
  emptyText: string;
  items: Array<{ key: string; name: string; progress: number; status: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
      </CardHeader>
      <CardBody>
        {items.length > 0 ? (
          <div className="space-y-5">
            {items.map((item) => (
              <div key={item.key}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate font-medium text-foreground">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{statusLabel(item.status)}</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">{clampProgress(item.progress)}%</span>
                </div>
                <ProgressBar value={item.progress} tone={item.status === "completed" ? "success" : "accent"} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        )}
      </CardBody>
    </Card>
  );
}
