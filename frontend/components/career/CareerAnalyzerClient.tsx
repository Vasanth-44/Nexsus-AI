"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Lightbulb,
  ListChecks,
  Target,
  TriangleAlert
} from "lucide-react";
import { analyzeCareer } from "@/lib/api";
import type { CareerAnalysis, UploadedDocumentRecord } from "@/lib/types";
import { getUploadedDocuments } from "@/lib/storage";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { CircularScore } from "@/components/ui/CircularScore";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useUserId } from "@/hooks/useUserId";
import { formatFileSize } from "@/lib/utils";

export function CareerAnalyzerClient() {
  const { userId } = useUserId();
  const { showToast } = useToast();
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
  const [documents, setDocuments] = useState<UploadedDocumentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDocuments(getUploadedDocuments(userId));
  }, [userId]);

  const handleAnalyze = async () => {
    const trimmed = jobDescription.trim();
    if (!trimmed || loading) {
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await analyzeCareer(userId, trimmed);
      setAnalysis(response.result);
    } catch (analysisError) {
      const message =
        analysisError instanceof Error
          ? analysisError.message
          : "Something went wrong. Please check that the NEXUS AI backend is running.";
      setError(message);
      showToast({
        title: "Career analysis failed",
        description: "Please check that the backend is running.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="rounded-lg border border-border/70 bg-panel/[0.68] p-5 backdrop-blur-xl sm:p-6"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
              <BriefcaseBusiness className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Career Analyzer</h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Compare your uploaded knowledge base against a role and turn gaps into a concrete action plan.
              </p>
            </div>
          </div>
          <ButtonLink href="/documents" variant="secondary" icon={<FileText className="size-4" aria-hidden="true" />}>
            Open Documents
          </ButtonLink>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[23rem_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-foreground">Resume / Documents</h3>
            <p className="mt-1 text-sm text-muted-foreground">Uploaded document records from this browser.</p>
          </CardHeader>
          <CardBody>
            {documents.length > 0 ? (
              <div className="space-y-3">
                {documents.slice(0, 4).map((document) => (
                  <div key={document.id} className="rounded-lg border border-border bg-muted/35 p-3">
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{document.filename}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatFileSize(document.size)} · {document.chunks} chunks
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/35 p-4 text-sm text-muted-foreground">
                Upload a resume or notes in Knowledge Base before analyzing a role.
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-foreground">Job Description</h3>
            <p className="mt-1 text-sm text-muted-foreground">Paste the role description to analyze your fit.</p>
          </CardHeader>
          <CardBody>
            <label htmlFor="job-description" className="sr-only">
              Job Description
            </label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the job description here..."
              className="min-h-72 w-full resize-y rounded-lg border border-border bg-background/70 p-4 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {loading ? <Spinner label="Analyzing your profile..." /> : <span className="text-sm text-muted-foreground">Uses `/career/analyze`.</span>}
              <Button
                onClick={handleAnalyze}
                disabled={loading || !jobDescription.trim()}
                icon={<Target className="size-4" aria-hidden="true" />}
              >
                Analyze My Fit
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>

      {error ? (
        <EmptyState title="Something went wrong." description="Please check that the NEXUS AI backend is running." />
      ) : null}

      {analysis ? <CareerAnalysisResult analysis={analysis} /> : null}
    </div>
  );
}

function CareerAnalysisResult({ analysis }: { analysis: CareerAnalysis }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]"
    >
      <Card className="border-accent/35">
        <CardBody className="flex flex-col items-center justify-center gap-4 py-8 text-center">
          <CircularScore value={analysis.match_score} />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Role Fit</h3>
            <p className="mt-1 text-sm text-muted-foreground">Returned by the backend career analyzer.</p>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalysisList
          title="Strong Matches"
          icon={<CheckCircle2 className="size-5 text-success" aria-hidden="true" />}
          items={analysis.strong_matches}
          tone="positive"
        />
        <AnalysisList
          title="Missing Skills"
          icon={<TriangleAlert className="size-5 text-warning" aria-hidden="true" />}
          items={analysis.missing_skills}
        />
        <AnalysisList
          title="Resume Gaps"
          icon={<FileText className="size-5 text-danger" aria-hidden="true" />}
          items={analysis.resume_gaps}
        />
        <AnalysisList
          title="Recommended Projects"
          icon={<Lightbulb className="size-5 text-accent" aria-hidden="true" />}
          items={analysis.recommended_projects}
        />
        <AnalysisList
          title="Interview Topics"
          icon={<ListChecks className="size-5 text-accent" aria-hidden="true" />}
          items={analysis.interview_topics}
        />
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <ArrowRight className="size-5 text-accent" aria-hidden="true" />
              <h3 className="font-semibold text-foreground">Action Plan</h3>
            </div>
          </CardHeader>
          <CardBody>
            {analysis.action_plan.length > 0 ? (
              <div className="space-y-4">
                {analysis.action_plan.map((step, index) => (
                  <div key={`${step}-${index}`} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3">
                    <div className="text-xl font-semibold text-accent">{String(index + 1).padStart(2, "0")}</div>
                    <p className="text-sm leading-6 text-foreground">{step}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No action plan returned.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </motion.section>
  );
}

function AnalysisList({
  title,
  icon,
  items,
  tone = "default"
}: {
  title: string;
  icon: ReactNode;
  items: string[];
  tone?: "default" | "positive";
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
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={item}
                className={
                  tone === "positive"
                    ? "rounded-lg border border-success/35 bg-success/[0.12] px-3 py-2 text-sm text-success"
                    : "rounded-lg border border-border bg-muted/45 px-3 py-2 text-sm text-foreground"
                }
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No items returned.</p>
        )}
      </CardBody>
    </Card>
  );
}
