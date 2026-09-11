"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ArrowRight, BarChart3, CheckCircle2, FolderKanban, Gauge, Sparkles, Target } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Spinner } from "@/components/ui/Spinner";
import { ButtonLink } from "@/components/ui/Button";
import { useProgress } from "@/hooks/useProgress";
import { averageProgress, buildRecommendation, countCompleted, getGreeting, statusLabel } from "@/lib/utils";

const cardMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.24 }
};

export function DashboardClient() {
  const { progress, loading, error } = useProgress();

  const skills = progress?.skills ?? [];
  const projects = progress?.projects ?? [];
  const averageSkillProgress = averageProgress(skills);
  const completedItems = countCompleted([...skills, ...projects]);
  const recommendations = progress ? buildRecommendation(progress) : [];

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="rounded-lg border border-border/70 bg-panel/[0.68] p-5 backdrop-blur-xl sm:p-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">{getGreeting()} 👋</h2>
            <p className="mt-2 text-muted-foreground">Here&apos;s your current progress with NEXUS AI.</p>
          </div>
          <ButtonLink href="/assistant" icon={<Sparkles className="size-4" aria-hidden="true" />}>
            Open Assistant
          </ButtonLink>
        </div>
      </motion.section>

      {error ? (
        <EmptyState
          title="Something went wrong."
          description="Please check that the NEXUS AI backend is running."
          action={
            <ButtonLink href="/settings" variant="secondary">
              Check Backend
            </ButtonLink>
          }
        />
      ) : null}

      {loading ? (
        <Card>
          <CardBody>
            <Spinner label="Loading progress" />
          </CardBody>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={<Target className="size-5" aria-hidden="true" />}
              label="Skills tracked"
              value={skills.length.toString()}
              accent="text-accent"
            />
            <MetricCard
              icon={<FolderKanban className="size-5" aria-hidden="true" />}
              label="Projects tracked"
              value={projects.length.toString()}
              accent="text-warning"
            />
            <MetricCard
              icon={<Gauge className="size-5" aria-hidden="true" />}
              label="Average skill progress"
              value={`${averageSkillProgress}%`}
              accent="text-success"
            />
            <MetricCard
              icon={<CheckCircle2 className="size-5" aria-hidden="true" />}
              label="Completed items"
              value={completedItems.toString()}
              accent="text-accent"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <BarChart3 className="size-5 text-accent" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-foreground">Skill Progress</h3>
                    <p className="text-sm text-muted-foreground">Tracked from backend progress.</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="space-y-5">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <ProgressBar key={skill.skill} label={skill.skill} value={skill.progress} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No skills tracked yet.</p>
                )}
              </CardBody>
            </Card>

            <Card className="border-accent/35">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Sparkles className="size-5 text-accent" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-foreground">NEXUS AI Recommendation</h3>
                    <p className="text-sm text-muted-foreground">Based on your current progress.</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {recommendations.map((recommendation) => (
                    <div key={recommendation} className="flex gap-3 text-sm text-foreground">
                      <ArrowRight className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span>{recommendation}</span>
                    </div>
                  ))}
                </div>
                <ButtonLink
                  href="/learning"
                  className="mt-6"
                  icon={<ArrowRight className="size-4" aria-hidden="true" />}
                >
                  Continue Learning
                </ButtonLink>
              </CardBody>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FolderKanban className="size-5 text-warning" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-foreground">Projects</h3>
                  <p className="text-sm text-muted-foreground">Execution progress across your portfolio work.</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {projects.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {projects.map((project) => (
                    <div key={project.project} className="rounded-lg border border-border bg-muted/35 p-4">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="truncate font-semibold text-foreground">{project.project}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">{statusLabel(project.status)}</p>
                        </div>
                        <span className="shrink-0 rounded-full border border-border bg-panel px-2.5 py-1 text-xs text-muted-foreground">
                          {project.progress}%
                        </span>
                      </div>
                      <ProgressBar value={project.progress} tone={project.status === "completed" ? "success" : "warning"} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No projects tracked yet.</p>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  accent
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <motion.div {...cardMotion}>
      <Card>
        <CardBody>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
            </div>
            <div className={`grid size-11 place-items-center rounded-lg border border-border bg-muted ${accent}`}>
              {icon}
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
